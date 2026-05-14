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

    let timeOffRequest = this.timeOffRequestRepository.create({
      employeeId,
      locationId,
      requestedDays: days,
      status: TimeOffRequestStatus.PENDING,
    });
    timeOffRequest = await this.timeOffRequestRepository.save(timeOffRequest);

    let response;
    try {
      const hcmUrl = process.env.HCM_URL || 'http://127.0.0.1:3000';
      response = await firstValueFrom(
        this.httpService.post(`${hcmUrl}/mock-hcm/deduct`, {
          employeeId,
          locationId,
          days,
        }),
      );
    } catch (error) {
      this.logger.error(`HCM Sync failed for request ${timeOffRequest.id}`, error.message);
      timeOffRequest.status = TimeOffRequestStatus.HCM_SYNC_FAILED;
      await this.timeOffRequestRepository.save(timeOffRequest);
      return timeOffRequest;
    }

    if (response && response.status === 200) {
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

      timeOffRequest.status = TimeOffRequestStatus.APPROVED;
      await this.timeOffRequestRepository.save(timeOffRequest);
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
