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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_item_entity_1 = require("../cart/cart-item.entity/cart-item.entity");
const product_service_1 = require("../product/product.service");
let CartService = class CartService {
    cartRepository;
    cartItemRepository;
    productService;
    constructor(cartRepository, cartItemRepository, productService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productService = productService;
    }
    async createCart() {
        const newCart = this.cartRepository.create({ items: [], totalAmount: 0 });
        return this.cartRepository.save(newCart);
    }
    async getCart(cartId) {
        const cart = await this.cartRepository.findOne({
            where: { cartId: cartId },
            relations: ['items', 'items.product'],
        });
        if (!cart) {
            throw new common_1.NotFoundException(`Cart with ID "${cartId}" not found`);
        }
        this.recalculateCartTotal(cart);
        return cart;
    }
    async addItemToCart(cartId, addToCartDto) {
        const cart = await this.getCart(cartId);
        const product = await this.productService.findOne(addToCartDto.productId);
        if (product.stockQuantity < addToCartDto.quantity) {
            throw new common_1.BadRequestException(`Not enough stock for product "${product.name}". Available: ${product.stockQuantity}, Requested: ${addToCartDto.quantity}`);
        }
        let cartItem = cart.items.find(item => item.product.productId === addToCartDto.productId);
        if (cartItem) {
            cartItem.quantity += addToCartDto.quantity;
            cartItem.priceAtTimeOfAddition = product.price;
        }
        else {
            const newCartItem = this.cartItemRepository.create({
                product: product,
                quantity: addToCartDto.quantity,
                cart: cart,
                priceAtTimeOfAddition: product.price,
            });
            if (!Array.isArray(cart.items)) {
                cart.items = [];
            }
            cart.items.push(newCartItem);
            cartItem = newCartItem;
        }
        await this.cartItemRepository.save(cartItem);
        this.recalculateCartTotal(cart);
        return this.cartRepository.save(cart);
    }
    async smartAddItem(smartAddToCartDto) {
        let targetCartId;
        if (smartAddToCartDto.cartId) {
            await this.getCart(smartAddToCartDto.cartId);
            targetCartId = smartAddToCartDto.cartId;
        }
        else {
            const newCart = await this.createCart();
            targetCartId = newCart.cartId;
        }
        const itemDetails = {
            productId: smartAddToCartDto.productId,
            quantity: smartAddToCartDto.quantity,
        };
        return this.addItemToCart(targetCartId, itemDetails);
    }
    async updateCartItem(cartId, cartItemId, updateCartItemDto) {
        const cart = await this.getCart(cartId);
        const cartItem = cart.items.find(item => item.cartItemId === cartItemId);
        if (!cartItem) {
            throw new common_1.NotFoundException(`Cart item with ID "${cartItemId}" not found in cart "${cartId}"`);
        }
        const product = await this.productService.findOne(cartItem.product.productId);
        if (product.stockQuantity < updateCartItemDto.quantity) {
            throw new common_1.BadRequestException(`Not enough stock for product "${product.name}". Available: ${product.stockQuantity}, Requested: ${updateCartItemDto.quantity}`);
        }
        cartItem.quantity = updateCartItemDto.quantity;
        await this.cartItemRepository.save(cartItem);
        this.recalculateCartTotal(cart);
        return this.cartRepository.save(cart);
    }
    async removeItemFromCart(cartId, cartItemId) {
        const cart = await this.getCart(cartId);
        const itemIndex = cart.items.findIndex(item => item.cartItemId === cartItemId);
        if (itemIndex === -1) {
            throw new common_1.NotFoundException(`Cart item with ID "${cartItemId}" not found in cart "${cartId}"`);
        }
        const itemToRemove = cart.items[itemIndex];
        await this.cartItemRepository.remove(itemToRemove);
        cart.items.splice(itemIndex, 1);
        this.recalculateCartTotal(cart);
        return this.cartRepository.save(cart);
    }
    recalculateCartTotal(cart) {
        cart.totalAmount = cart.items.reduce((total, item) => {
            return total + (item.priceAtTimeOfAddition * item.quantity);
        }, 0);
        cart.totalAmount = parseFloat(cart.totalAmount.toFixed(2));
    }
    async clearCart(cartId) {
        const cart = await this.getCart(cartId);
        if (cart.items && cart.items.length > 0) {
            await this.cartItemRepository.remove(cart.items);
        }
        cart.items = [];
        this.recalculateCartTotal(cart);
        return this.cartRepository.save(cart);
    }
    async getAllCarts() {
        return this.cartRepository.find({ relations: ['items', 'items.product'] });
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_item_entity_1.Cart)),
    __param(1, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        product_service_1.ProductService])
], CartService);
//# sourceMappingURL=cart.service.js.map