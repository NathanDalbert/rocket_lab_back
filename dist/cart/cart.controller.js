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
exports.CartController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cart_entity_1 = require("../cart/cart.entity/cart.entity");
const cart_service_1 = require("./cart.service");
const add_to_cart_dto_1 = require("./DTO/add-to-cart.dto");
const smart_add_to_cart_dto_1 = require("./DTO/smart-add-to-cart.dto");
const update_cart_item_dto_1 = require("./DTO/update-cart-item.dto");
let CartController = class CartController {
    cartService;
    constructor(cartService) {
        this.cartService = cartService;
    }
    createCart() {
        return this.cartService.createCart();
    }
    async smartAddItemToCart(smartAddToCartDto) {
        return this.cartService.smartAddItem(smartAddToCartDto);
    }
    getCart(cartId) {
        return this.cartService.getCart(cartId);
    }
    addItemToCart(cartId, addToCartDto) {
        return this.cartService.addItemToCart(cartId, addToCartDto);
    }
    updateCartItem(cartId, cartItemId, updateCartItemDto) {
        return this.cartService.updateCartItem(cartId, cartItemId, updateCartItemDto);
    }
    removeItemFromCart(cartId, cartItemId) {
        return this.cartService.removeItemFromCart(cartId, cartItemId);
    }
    clearCart(cartId) {
        return this.cartService.clearCart(cartId);
    }
    getAllCarts() {
        return this.cartService.getAllCarts();
    }
};
exports.CartController = CartController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Criar um novo carrinho de compras' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Carrinho criado com sucesso.', type: cart_entity_1.Cart }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CartController.prototype, "createCart", null);
__decorate([
    (0, common_1.Post)('smart-add'),
    (0, swagger_1.ApiOperation)({ summary: 'Adicionar um item ao carrinho, criando um carrinho se necessário ou usando um existente.' }),
    (0, swagger_1.ApiBody)({ type: smart_add_to_cart_dto_1.SmartAddToCartDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Item adicionado e carrinho retornado.', type: cart_entity_1.Cart }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Produto não encontrado, ou cartId fornecido mas não encontrado.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Dados inválidos ou estoque insuficiente.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [smart_add_to_cart_dto_1.SmartAddToCartDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "smartAddItemToCart", null);
__decorate([
    (0, common_1.Get)(':cartId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obter um carrinho de compras pelo ID' }),
    (0, swagger_1.ApiParam)({ name: 'cartId', description: 'ID do carrinho (UUID)', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Carrinho encontrado.', type: cart_entity_1.Cart }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Carrinho não encontrado.' }),
    __param(0, (0, common_1.Param)('cartId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "getCart", null);
__decorate([
    (0, common_1.Post)(':cartId/items'),
    (0, swagger_1.ApiOperation)({ summary: 'Adicionar um item a um carrinho existente' }),
    (0, swagger_1.ApiParam)({ name: 'cartId', description: 'ID do carrinho (UUID)', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiBody)({ type: add_to_cart_dto_1.AddToCartDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Item adicionado ao carrinho com sucesso.', type: cart_entity_1.Cart }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Carrinho ou Produto não encontrado.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Dados inválidos ou estoque insuficiente.' }),
    __param(0, (0, common_1.Param)('cartId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, add_to_cart_dto_1.AddToCartDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "addItemToCart", null);
__decorate([
    (0, common_1.Patch)(':cartId/items/:cartItemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar a quantidade de um item no carrinho' }),
    (0, swagger_1.ApiParam)({ name: 'cartId', description: 'ID do carrinho (UUID)', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiParam)({ name: 'cartItemId', description: 'ID do item do carrinho (UUID)', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiBody)({ type: update_cart_item_dto_1.UpdateCartItemDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Item do carrinho atualizado com sucesso.', type: cart_entity_1.Cart }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Carrinho ou item do carrinho não encontrado.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Dados inválidos ou estoque insuficiente.' }),
    __param(0, (0, common_1.Param)('cartId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('cartItemId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_cart_item_dto_1.UpdateCartItemDto]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "updateCartItem", null);
__decorate([
    (0, common_1.Delete)(':cartId/items/:cartItemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remover um item do carrinho' }),
    (0, swagger_1.ApiParam)({ name: 'cartId', description: 'ID do carrinho (UUID)', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiParam)({ name: 'cartItemId', description: 'ID do item do carrinho a ser removido (UUID)', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Item removido do carrinho com sucesso.', type: cart_entity_1.Cart }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Carrinho ou item do carrinho não encontrado.' }),
    __param(0, (0, common_1.Param)('cartId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('cartItemId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "removeItemFromCart", null);
__decorate([
    (0, common_1.Delete)(':cartId'),
    (0, swagger_1.ApiOperation)({ summary: 'Limpar todos os itens do carrinho' }),
    (0, swagger_1.ApiParam)({ name: 'cartId', description: 'ID do carrinho (UUID) a ser limpo', type: 'string', format: 'uuid' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Carrinho limpo com sucesso.', type: cart_entity_1.Cart }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Carrinho não encontrado.' }),
    __param(0, (0, common_1.Param)('cartId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartController.prototype, "clearCart", null);
__decorate([
    (0, common_1.Get)("/list"),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todos os carrinhos de compras' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Lista de carrinhos retornada com sucesso.', type: [cart_entity_1.Cart] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CartController.prototype, "getAllCarts", null);
exports.CartController = CartController = __decorate([
    (0, swagger_1.ApiTags)('cart'),
    (0, common_1.Controller)('carts'),
    __metadata("design:paramtypes", [cart_service_1.CartService])
], CartController);
//# sourceMappingURL=cart.controller.js.map