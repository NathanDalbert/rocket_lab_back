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
exports.Cart = void 0;
const typeorm_1 = require("typeorm");
const cart_item_entity_1 = require("../cart-item.entity/cart-item.entity");
let Cart = class Cart {
    cartId;
    items;
    totalAmount;
};
exports.Cart = Cart;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Cart.prototype, "cartId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => cart_item_entity_1.CartItem, item => item.cart, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], Cart.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 10, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Cart.prototype, "totalAmount", void 0);
exports.Cart = Cart = __decorate([
    (0, typeorm_1.Entity)()
], Cart);
//# sourceMappingURL=cart.entity.js.map