import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { BalancesService } from './balances.service';

export class RequestTimeOffDto {
  @ApiProperty({ example: 'emp-123', description: 'The unique ID of the employee' })
  employeeId: string;

  @ApiProperty({ example: 'loc-ny', description: 'The unique ID of the location' })
  locationId: string;

  @ApiProperty({ example: 2.5, description: 'Number of days requested for time off' })
  days: number;
}

export class BatchSyncBalanceDto {
  @ApiProperty({ example: 'emp-123', description: 'The unique ID of the employee' })
  employeeId: string;

  @ApiProperty({ example: 'loc-ny', description: 'The unique ID of the location' })
  locationId: string;

  @ApiProperty({ example: 15.0, description: 'Available days balance for the employee' })
  availableDays: number;
}

export class BatchSyncDto {
  @ApiProperty({ type: [BatchSyncBalanceDto], description: 'List of balances to synchronize' })
  balances: BatchSyncBalanceDto[];
}

@ApiTags('Balances')
@Controller('api/v1/balances')
export class BalancesController {
  constructor(private readonly balancesService: BalancesService) {}

  @Post('request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request time off for an employee' })
  @ApiResponse({ status: 200, description: 'Time off request created and processed successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request (e.g., insufficient balance or invalid input).' })
  @ApiResponse({ status: 503, description: 'External HCM Sync Failed.' })
  async requestTimeOff(@Body() body: RequestTimeOffDto) {
    return this.balancesService.requestTimeOff(body.employeeId, body.locationId, body.days);
  }

  @Post('admin/batch-sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin bulk sync of employee balances from HCM' })
  @ApiResponse({ status: 200, description: 'Balances successfully synchronized.' })
  async batchSync(@Body() body: BatchSyncDto) {
    return this.balancesService.batchSync(body.balances);
  }
}
