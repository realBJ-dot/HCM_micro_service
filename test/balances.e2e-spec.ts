import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { TimeOffModule } from '../src/time-off/time-off.module';
import { MockHcmModule } from '../src/mock-hcm/mock-hcm.module';
import { Balance } from '../src/time-off/entities/balance.entity';
import { TimeOffRequest, TimeOffRequestStatus } from '../src/time-off/entities/time-off-request.entity';
import { Repository } from 'typeorm';

describe('BalancesController (e2e)', () => {
  let app: INestApplication;
  let balanceRepo: Repository<Balance>;
  let requestRepo: Repository<TimeOffRequest>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
          synchronize: true,
          logging: true,
        }),
        TimeOffModule,
        MockHcmModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(0); // Bind to random dynamic port to avoid EADDRINUSE
    const port = app.getHttpServer().address().port;
    process.env.HCM_URL = `http://127.0.0.1:${port}`;

    balanceRepo = moduleFixture.get<Repository<Balance>>(getRepositoryToken(Balance));
    requestRepo = moduleFixture.get<Repository<TimeOffRequest>>(getRepositoryToken(TimeOffRequest));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear database tables before each test
    await requestRepo.clear();
    await balanceRepo.clear();

    // Seed initial balance
    const newBalance = balanceRepo.create({
      employeeId: 'emp-1',
      locationId: 'loc-1',
      availableDays: 10,
    });
    await balanceRepo.save(newBalance);
  });

  it('Overdraw Test: Attempt to request 15 days when the seeded balance is 10. Expect a 400 Bad Request.', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/balances/request')
      .send({ employeeId: 'emp-1', locationId: 'loc-1', days: 15 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Insufficient balance');
  });

  it('Happy Path: Request 2 days, expect a 200, and verify the local balance is now 8.', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/balances/request')
      .send({ employeeId: 'emp-1', locationId: 'loc-1', days: 2 });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(TimeOffRequestStatus.APPROVED);

    const balance = await balanceRepo.findOne({
      where: { employeeId: 'emp-1', locationId: 'loc-1' },
    });
    expect(balance.availableDays).toBe(8);
  });

  it('Resilience Test: Send a request for 999 days to trigger 503 error. Verify API returns HCM_SYNC_FAILED and balance untouched.', async () => {
    // Seed a specific balance just for this test to bypass the local "insufficient balance" check
    const resilienceBalance = balanceRepo.create({ employeeId: 'emp-999', locationId: 'loc-1', availableDays: 1000 });
    await balanceRepo.save(resilienceBalance);

    // The request for 999 days triggers the mock HCM backend to throw a 503 Service Unavailable timeout error
    const response = await request(app.getHttpServer())
      .post('/api/v1/balances/request')
      .send({ employeeId: 'emp-999', locationId: 'loc-1', days: 999 });

    // The service handles the error gracefully, saving the request as failed.
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(TimeOffRequestStatus.HCM_SYNC_FAILED);

    const balance = await balanceRepo.findOne({
      where: { employeeId: 'emp-999', locationId: 'loc-1' },
    });
    expect(balance.availableDays).toBe(1000); // Untouched
  });

  it('Race Condition Test: Concurrent requests trigger OptimisticLockVersionMismatchError.', async () => {
    const req1 = request(app.getHttpServer())
      .post('/api/v1/balances/request')
      .send({ employeeId: 'emp-1', locationId: 'loc-1', days: 2 });

    const req2 = request(app.getHttpServer())
      .post('/api/v1/balances/request')
      .send({ employeeId: 'emp-1', locationId: 'loc-1', days: 3 });

    const [res1, res2] = await Promise.all([req1, req2]);

    const statuses = [res1.status, res2.status];
    console.log('Statuses:', statuses);
    console.log('Body 1:', res1.body);
    console.log('Body 2:', res2.body);

    const balance = await balanceRepo.findOne({
      where: { employeeId: 'emp-1', locationId: 'loc-1' },
    });
    console.log('Final Balance:', balance.availableDays);

    // One succeeds, one gets caught by the @VersionColumn and TypeORM throws an error (handled as 500)
    expect(statuses).toContain(200);
    expect(statuses).toContain(500);

    // We started with 10. Depending on which one succeeded, the balance will be either 8 or 7.
    // It will NEVER be 5 (which would happen if both succeeded and overwrote each other).
    expect([7, 8]).toContain(balance.availableDays);
  });
});
