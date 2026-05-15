# Technical Requirements Document (TRD): Time-Off Sync Microservice

## 1. Product Context & Goals
The objective of this microservice is to manage the lifecycle of time-off requests within the **ReadyOn** ecosystem while treating the external Human Capital Management (HCM) system as the absolute "Source of Truth" for employment data. 
The system must guarantee data integrity, preventing scenarios where an employee's requested time off exceeds their actual balance, even in high-concurrency environments or when the HCM is temporarily down.

## 2. Core Challenges
* **Distributed State Synchronization**: Balances can be altered externally (e.g., work anniversaries, start of the year refreshes). ReadyOn must sync these appropriately.
* **Network Reliability & Idempotency**: The HCM API may experience timeouts, dropped packets, or partial failures. The microservice must be defensive to prevent double-deduction.
* **Concurrency (The "Double Spend" Problem)**: An employee might double-click the submit button or submit on two different devices simultaneously, creating a race condition where the local balance is queried twice before it is decremented.

## 3. Proposed Solution Architecture
We propose a **NestJS** microservice using **TypeORM** with **SQLite** (or PostgreSQL in production). 

### 3.1 Data Model
* **Balance**: Represents the localized cache of the HCM balance. Contains `employee_id`, `location_id`, `available_days`, and crucial OCC components (`version`, `last_synced_at`).
* **TimeOffRequest**: Represents an immutable ledger entry of a request. Statuses track the lifecycle (`PENDING_HCM`, `APPROVED`, `REJECTED`, `HCM_SYNC_FAILED`, `REFUNDED`).

### 3.2 Concurrency Control & Distributed Transactions (The Saga Pattern)
To safely deduct balances across both our local database and the external HCM, we implement the **Saga Pattern** driven by **Optimistic Concurrency Control (OCC)**:
1. **Local Reservation First**: When a request comes in, the system attempts to update the local `Balance` row (e.g., `WHERE version = 1`), decrementing the `available_days` and incrementing the version to `2`. 
   - *Conflict Prevention*: If a concurrent request already updated the row to version 2, TypeORM throws an `OptimisticLockVersionMismatchError`, rejecting the second request instantly without ever calling the HCM.
2. **State Tracking**: A `TimeOffRequest` is created with status `PENDING_HCM`.
3. **External Call**: We execute the HTTP `POST` to the HCM API.
4. **Finalize or Compensate**:
   - *Success*: If the HCM returns 200, we finalize the request as `APPROVED`.
   - *Failure*: If the HCM times out or rejects the request, we execute a **Compensating Transaction** to refund the days back to the local `Balance`, and mark the request as `REFUNDED` or `REJECTED`.

### 3.3 Idempotency
To prevent "Ghost Deductions" where a network timeout causes a retry that accidentally deducts the balance twice in the HCM, we pass the local `TimeOffRequest.id` as a `requestId` parameter in the payload to the HCM. The HCM must use this key to guarantee idempotency.

### 3.4 In-Doubt States & Reconciliation
If the Node.js server crashes immediately after the HCM API returns success but before the local database can mark the request as `APPROVED`, the request remains `PENDING_HCM`.
* **Reconciliation Worker**: A background cron job should be scheduled to sweep for `PENDING_HCM` requests older than 5 minutes. It will query the HCM API to check if the specific `requestId` was processed, and manually resolve the local state to either `APPROVED` or trigger a refund.

## 4. Alternatives Considered

### 4.1 Pessimistic Locking (Row-Level Locks)
* **Description**: Using database locks (e.g., `SELECT ... FOR UPDATE`) to lock the balance row until the HCM API call finishes.
* **Why it was rejected**: Pessimistic locking holds database resources hostage during external network calls. If the HCM takes 5 seconds to respond, the database row is locked for 5 seconds, severely degrading performance and risking connection pool exhaustion.

### 4.2 Distributed Locking (Redis Mutex)
* **Description**: Using Redis (e.g., Redlock) to acquire a lock on the `employeeId` before proceeding.
* **Why it was rejected**: Introduces a new infrastructure dependency (Redis). The Saga Pattern with native database OCC handles this much more elegantly without extra infrastructure.

### 4.3 Event-Driven Architecture (Message Queue)
* **Description**: Placing all requests into a queue (RabbitMQ/Kafka) and having a single worker process them linearly per employee.
* **Why it was rejected**: Over-engineering for the current scope. It introduces eventual consistency to the UI, meaning the user won't get instant feedback.

## 5. Defense Mechanisms
* **Chaos Testing Backdoor**: We integrated specific conditions into the mock HCM (`days === 999` for 503 timeouts, `days === 998` for 400 Insufficient Balance) to simulate and verify our compensating transactions in our E2E tests.
* **Batch Syncing**: The `admin/batch-sync` endpoint is designed to be hit by a cron job or webhook to perform bulk upserts, ensuring that external "work anniversary" updates in the HCM propagate to ReadyOn efficiently.
