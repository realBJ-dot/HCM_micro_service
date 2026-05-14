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
exports.MockHcmController = exports.DeductDto = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
class DeductDto {
}
exports.DeductDto = DeductDto;
let MockHcmController = class MockHcmController {
    async deduct(body) {
        if (body.days === 999) {
            throw new common_1.HttpException({ error: 'HCM Database Timeout' }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true };
    }
};
exports.MockHcmController = MockHcmController;
__decorate([
    (0, common_1.Post)('deduct'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Simulate time-off deduction in external HCM' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Success' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'HCM Database Timeout' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [DeductDto]),
    __metadata("design:returntype", Promise)
], MockHcmController.prototype, "deduct", null);
exports.MockHcmController = MockHcmController = __decorate([
    (0, swagger_1.ApiTags)('Mock HCM'),
    (0, common_1.Controller)('mock-hcm')
], MockHcmController);
//# sourceMappingURL=mock-hcm.controller.js.map