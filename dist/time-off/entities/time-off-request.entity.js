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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeOffRequest = exports.TimeOffRequestStatus = void 0;
const typeorm_1 = require("typeorm");
var TimeOffRequestStatus;
(function (TimeOffRequestStatus) {
    TimeOffRequestStatus["PENDING"] = "PENDING";
    TimeOffRequestStatus["APPROVED"] = "APPROVED";
    TimeOffRequestStatus["REJECTED"] = "REJECTED";
    TimeOffRequestStatus["HCM_SYNC_FAILED"] = "HCM_SYNC_FAILED";
})(TimeOffRequestStatus || (exports.TimeOffRequestStatus = TimeOffRequestStatus = {}));
let TimeOffRequest = class TimeOffRequest {
};
exports.TimeOffRequest = TimeOffRequest;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TimeOffRequest.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'employee_id' }),
    __metadata("design:type", String)
], TimeOffRequest.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'location_id' }),
    __metadata("design:type", String)
], TimeOffRequest.prototype, "locationId", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { name: 'requested_days' }),
    __metadata("design:type", Number)
], TimeOffRequest.prototype, "requestedDays", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        enum: TimeOffRequestStatus,
        default: TimeOffRequestStatus.PENDING,
    }),
    __metadata("design:type", String)
], TimeOffRequest.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], TimeOffRequest.prototype, "createdAt", void 0);
exports.TimeOffRequest = TimeOffRequest = __decorate([
    (0, typeorm_1.Entity)('time_off_requests')
], TimeOffRequest);
//# sourceMappingURL=time-off-request.entity.js.map