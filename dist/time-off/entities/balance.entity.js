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
exports.Balance = void 0;
const typeorm_1 = require("typeorm");
let Balance = class Balance {
};
exports.Balance = Balance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Balance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'employee_id' }),
    __metadata("design:type", String)
], Balance.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'location_id' }),
    __metadata("design:type", String)
], Balance.prototype, "locationId", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { name: 'available_days' }),
    __metadata("design:type", Number)
], Balance.prototype, "availableDays", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'last_synced_at' }),
    __metadata("design:type", Date)
], Balance.prototype, "lastSyncedAt", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)({ default: 1 }),
    __metadata("design:type", Number)
], Balance.prototype, "version", void 0);
exports.Balance = Balance = __decorate([
    (0, typeorm_1.Entity)('balances')
], Balance);
//# sourceMappingURL=balance.entity.js.map