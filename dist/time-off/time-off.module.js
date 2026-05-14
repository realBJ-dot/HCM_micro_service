"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeOffModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const axios_1 = require("@nestjs/axios");
const balance_entity_1 = require("./entities/balance.entity");
const time_off_request_entity_1 = require("./entities/time-off-request.entity");
const balances_service_1 = require("./balances.service");
const balances_controller_1 = require("./balances.controller");
let TimeOffModule = class TimeOffModule {
};
exports.TimeOffModule = TimeOffModule;
exports.TimeOffModule = TimeOffModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([balance_entity_1.Balance, time_off_request_entity_1.TimeOffRequest]),
            axios_1.HttpModule,
        ],
        controllers: [balances_controller_1.BalancesController],
        providers: [balances_service_1.BalancesService],
        exports: [balances_service_1.BalancesService],
    })
], TimeOffModule);
//# sourceMappingURL=time-off.module.js.map