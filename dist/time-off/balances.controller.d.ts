import { BalancesService } from './balances.service';
export declare class RequestTimeOffDto {
    employeeId: string;
    locationId: string;
    days: number;
}
export declare class BatchSyncBalanceDto {
    employeeId: string;
    locationId: string;
    availableDays: number;
}
export declare class BatchSyncDto {
    balances: BatchSyncBalanceDto[];
}
export declare class BalancesController {
    private readonly balancesService;
    constructor(balancesService: BalancesService);
    requestTimeOff(body: RequestTimeOffDto): Promise<import("./entities/time-off-request.entity").TimeOffRequest>;
    batchSync(body: BatchSyncDto): Promise<{
        success: boolean;
        count: number;
    }>;
}
