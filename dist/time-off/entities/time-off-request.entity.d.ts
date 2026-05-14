export declare enum TimeOffRequestStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    HCM_SYNC_FAILED = "HCM_SYNC_FAILED"
}
export declare class TimeOffRequest {
    id: string;
    employeeId: string;
    locationId: string;
    requestedDays: number;
    status: TimeOffRequestStatus;
    createdAt: Date;
}
