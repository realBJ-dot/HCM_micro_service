import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { Balance } from './entities/balance.entity';
import { TimeOffRequest } from './entities/time-off-request.entity';
export declare class BalancesService {
    private readonly balanceRepository;
    private readonly timeOffRequestRepository;
    private readonly httpService;
    private readonly logger;
    constructor(balanceRepository: Repository<Balance>, timeOffRequestRepository: Repository<TimeOffRequest>, httpService: HttpService);
    requestTimeOff(employeeId: string, locationId: string, days: number): Promise<TimeOffRequest>;
    batchSync(balances: {
        employeeId: string;
        locationId: string;
        availableDays: number;
    }[]): Promise<{
        success: boolean;
        count: number;
    }>;
}
