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
exports.SmartAddToCartDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class SmartAddToCartDto {
    cartId;
    productId;
    quantity;
}
exports.SmartAddToCartDto = SmartAddToCartDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'ID do carrinho existente (UUID). Se não fornecido, um novo carrinho será criado.',
        example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        format: 'uuid',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SmartAddToCartDto.prototype, "cartId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID do produto a ser adicionado (UUID)',
        example: 'b1c2d3e4-f5g6-7890-1234-567890abcdef',
        format: 'uuid',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SmartAddToCartDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Quantidade do produto a ser adicionada',
        example: 1,
        type: 'integer',
        minimum: 1,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SmartAddToCartDto.prototype, "quantity", void 0);
//# sourceMappingURL=smart-add-to-cart.dto.js.map