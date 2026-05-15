import { Body, Controller, HttpCode, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export class DeductDto {
  requestId: string;
  employeeId: string;
  locationId: string;
  days: number;
}

@ApiTags('Mock HCM')
@Controller('mock-hcm')
export class MockHcmController {
  @Post('deduct')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simulate time-off deduction in external HCM' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 400, description: 'Insufficient balance in HCM' })
  @ApiResponse({ status: 503, description: 'HCM Database Timeout' })
  async deduct(@Body() body: DeductDto) {
    if (body.days === 999) {
      throw new HttpException({ error: 'HCM Database Timeout' }, HttpStatus.SERVICE_UNAVAILABLE);
    }
    
    // Simulate an HCM rejection due to insufficient balance on their end
    if (body.days === 998) {
      throw new HttpException({ error: 'Insufficient balance in HCM' }, HttpStatus.BAD_REQUEST);
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    // In a real system, we would store body.requestId to guarantee idempotency.
    return { success: true };
  }
}
