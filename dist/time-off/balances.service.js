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
var BalancesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalancesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const balance_entity_1 = require("./entities/balance.entity");
const time_off_request_entity_1 = require("./entities/time-off-request.entity");
let BalancesService = BalancesService_1 = class BalancesService {
    constructor(balanceRepository, timeOffRequestRepository, httpService) {
        this.balanceRepository = balanceRepository;
        this.timeOffRequestRepository = timeOffRequestRepository;
        this.httpService = httpService;
        this.logger = new common_1.Logger(BalancesService_1.name);
    }
    async requestTimeOff(employeeId, locationId, days) {
        const balance = await this.balanceRepository.findOne({
            where: { employeeId, locationId },
        });
        if (!balance) {
            throw new common_1.BadRequestException('Balance not found for employee at this location');
        }
        if (balance.availableDays < days) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        let timeOffRequest = this.timeOffRequestRepository.create({
            employeeId,
            locationId,
            requestedDays: days,
            status: time_off_request_entity_1.TimeOffRequestStatus.PENDING,
        });
        timeOffRequest = await this.timeOffRequestRepository.save(timeOffRequest);
        let response;
        try {
            const hcmUrl = process.env.HCM_URL || 'http://127.0.0.1:3000';
            response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`${hcmUrl}/mock-hcm/deduct`, {
                employeeId,
                locationId,
                days,
            }));
        }
        catch (error) {
            this.logger.error(`HCM Sync failed for request ${timeOffRequest.id}`, error.message);
            timeOffRequest.status = time_off_request_entity_1.TimeOffRequestStatus.HCM_SYNC_FAILED;
            await this.timeOffRequestRepository.save(timeOffRequest);
            return timeOffRequest;
        }
        if (response && response.status === 200) {
            const updateResult = await this.balanceRepository.update({ id: balance.id, version: balance.version }, {
                availableDays: balance.availableDays - days,
                version: balance.version + 1,
                lastSyncedAt: new Date()
            });
            if (updateResult.affected === 0) {
                throw new typeorm_2.OptimisticLockVersionMismatchError('Balance', balance.version, balance.id);
            }
            timeOffRequest.status = time_off_request_entity_1.TimeOffRequestStatus.APPROVED;
            await this.timeOffRequestRepository.save(timeOffRequest);
        }
        return timeOffRequest;
    }
    async batchSync(balances) {
        for (const data of balances) {
            let balance = await this.balanceRepository.findOne({
                where: { employeeId: data.employeeId, locationId: data.locationId },
            });
            if (balance) {
                balance.availableDays = data.availableDays;
                balance.lastSyncedAt = new Date();
            }
            else {
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
};
exports.BalancesService = BalancesService;
exports.BalancesService = BalancesService = BalancesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(balance_entity_1.Balance)),
    __param(1, (0, typeorm_1.InjectRepository)(time_off_request_entity_1.TimeOffRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        axios_1.HttpService])
], BalancesService);
//# sourceMappingURL=balances.service.js.map