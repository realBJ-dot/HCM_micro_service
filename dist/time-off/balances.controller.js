"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalancesController = exports.BatchSyncDto = exports.BatchSyncBalanceDto = exports.RequestTimeOffDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const balances_service_1 = require("./balances.service");
class RequestTimeOffDto {
}
exports.RequestTimeOffDto = RequestTimeOffDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'emp-123', description: 'The unique ID of the employee' }),
    __metadata("design:type", String)
], RequestTimeOffDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'loc-ny', description: 'The unique ID of the location' }),
    __metadata("design:type", String)
], RequestTimeOffDto.prototype, "locationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2.5, description: 'Number of days requested for time off' }),
    __metadata("design:type", Number)
], RequestTimeOffDto.prototype, "days", void 0);
class BatchSyncBalanceDto {
}
exports.BatchSyncBalanceDto = BatchSyncBalanceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'emp-123', description: 'The unique ID of the employee' }),
    __metadata("design:type", String)
], BatchSyncBalanceDto.prototype, "employeeId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'loc-ny', description: 'The unique ID of the location' }),
    __metadata("design:type", String)
], BatchSyncBalanceDto.prototype, "locationId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15.0, description: 'Available days balance for the employee' }),
    __metadata("design:type", Number)
], BatchSyncBalanceDto.prototype, "availableDays", void 0);
class BatchSyncDto {
}
exports.BatchSyncDto = BatchSyncDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [BatchSyncBalanceDto], description: 'List of balances to synchronize' }),
    __metadata("design:type", Array)
], BatchSyncDto.prototype, "balances", void 0);
let BalancesController = class BalancesController {
    constructor(balancesService) {
        this.balancesService = balancesService;
    }
    async requestTimeOff(body) {
        return this.balancesService.requestTimeOff(body.employeeId, body.locationId, body.days);
    }
    async batchSync(body) {
        return this.balancesService.batchSync(body.balances);
    }
};
exports.BalancesController = BalancesController;
__decorate([
    (0, common_1.Post)('request'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Request time off for an employee' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Time off request created and processed successfully.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request (e.g., insufficient balance or invalid input).' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'External HCM Sync Failed.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RequestTimeOffDto]),
    __metadata("design:returntype", Promise)
], BalancesController.prototype, "requestTimeOff", null);
__decorate([
    (0, common_1.Post)('admin/batch-sync'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Admin bulk sync of employee balances from HCM' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Balances successfully synchronized.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [BatchSyncDto]),
    __metadata("design:returntype", Promise)
], BalancesController.prototype, "batchSync", null);
exports.BalancesController = BalancesController = __decorate([
    (0, swagger_1.ApiTags)('Balances'),
    (0, common_1.Controller)('api/v1/balances'),
    __metadata("design:paramtypes", [balances_service_1.BalancesService])
], BalancesController);
//# sourceMappingURL=balances.controller.js.map