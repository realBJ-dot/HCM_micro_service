export declare class DeductDto {
    employeeId: string;
    locationId: string;
    days: number;
}
export declare class MockHcmController {
    deduct(body: DeductDto): Promise<{
        success: boolean;
    }>;
}
