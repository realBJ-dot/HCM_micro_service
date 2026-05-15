import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, OptimisticLockVersionMismatchError } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Balance } from './entities/balance.entity';
import { TimeOffRequest, TimeOffRequestStatus } from './entities/time-off-request.entity';

@Injectable()
export class BalancesService {
  private readonly logger = new Logger(BalancesService.name);

  constructor(
    @InjectRepository(Balance)
    private readonly balanceRepository: Repository<Balance>,
    @InjectRepository(TimeOffRequest)
    private readonly timeOffRequestRepository: Repository<TimeOffRequest>,
    private readonly httpService: HttpService,
  ) {}

  async requestTimeOff(employeeId: string, locationId: string, days: number) {
    const balance = await this.balanceRepository.findOne({
      where: { employeeId, locationId },
    });

    if (!balance) {
      throw new BadRequestException('Balance not found for employee at this location');
    }

    if (balance.availableDays < days) {
      throw new BadRequestException('Insufficient balance');
    }

    // 1. Local-First Reservation (Saga Pattern: Step 1)
    const updateResult = await this.balanceRepository.update(
      { id: balance.id, version: balance.version },
      { 
        availableDays: balance.availableDays - days,
        version: balance.version + 1,
        lastSyncedAt: new Date()
      }
    );

    if (updateResult.affected === 0) {
      throw new OptimisticLockVersionMismatchError('Balance', balance.version, balance.id as any);
    }

    let timeOffRequest = this.timeOffRequestRepository.create({
      employeeId,
      locationId,
      requestedDays: days,
      status: TimeOffRequestStatus.PENDING_HCM,
    });
    timeOffRequest = await this.timeOffRequestRepository.save(timeOffRequest);

    // 2. Execute External API Call with Idempotency Key
    try {
      const hcmUrl = process.env.HCM_URL || 'http://127.0.0.1:3000';
      const response = await firstValueFrom(
        this.httpService.post(`${hcmUrl}/mock-hcm/deduct`, {
          requestId: timeOffRequest.id, // Idempotency key
          employeeId,
          locationId,
          days,
        }),
      );

      // 3. Finalize
      if (response && response.status === 200) {
        timeOffRequest.status = TimeOffRequestStatus.APPROVED;
        await this.timeOffRequestRepository.save(timeOffRequest);
      }
    } catch (error) {
      this.logger.error(`HCM Sync failed for request ${timeOffRequest.id}`, error.message);
      
      // 4. Compensating Transaction (Saga Pattern: Rollback local reservation)
      // In a robust system, if this increment fails, a background reconciliation cron would catch it.
      await this.balanceRepository.increment(
        { id: balance.id },
        'availableDays',
        days
      );

      // Determine the failure state
      const isHcmRejection = error.response?.status === 400;
      timeOffRequest.status = isHcmRejection 
        ? TimeOffRequestStatus.REJECTED 
        : TimeOffRequestStatus.REFUNDED;
        
      await this.timeOffRequestRepository.save(timeOffRequest);
      
      return timeOffRequest;
    }

    return timeOffRequest;
  }

  async batchSync(balances: { employeeId: string; locationId: string; availableDays: number }[]) {
    for (const data of balances) {
      let balance = await this.balanceRepository.findOne({
        where: { employeeId: data.employeeId, locationId: data.locationId },
      });

      if (balance) {
        balance.availableDays = data.availableDays;
        balance.lastSyncedAt = new Date();
      } else {
        balance = this.balanceRepository.create({
          employeeId: data.employeeId,
          locationId: data.locationId,
          availableDays: data.availableDays,
          lastSyncedAt: new Date(),
        });
      }
      await this.balanceRepository.save(balance);
    }
    return { success: true, count: balances.length };
  }
}
