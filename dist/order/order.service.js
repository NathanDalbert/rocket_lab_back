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
exports.OrderStatus = exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_service_1 = require("../cart/cart.service");
const order_item_entity_1 = require("../order/order-item.entity/order-item.entity");
const order_entity_1 = require("../order/order.entity/order.entity");
Object.defineProperty(exports, "OrderStatus", { enumerable: true, get: function () { return order_entity_1.OrderStatus; } });
const product_entity_1 = require("../product/product-entity/product.entity");
const product_service_1 = require("../product/product.service");
let OrderService = class OrderService {
    orderRepository;
    orderItemRepository;
    cartService;
    productService;
    entityManager;
    constructor(orderRepository, orderItemRepository, cartService, productService, entityManager) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.cartService = cartService;
        this.productService = productService;
        this.entityManager = entityManager;
    }
    async createOrder(createOrderDto) {
        return this.entityManager.transaction(async (transactionalEntityManager) => {
            const cart = await this.cartService.getCart(createOrderDto.cartId);
            if (!cart.items || cart.items.length === 0) {
                throw new common_1.BadRequestException('Cannot create order from an empty cart.');
            }
            const orderItems = [];
            let totalAmount = 0;
            for (const cartItem of cart.items) {
                const product = await transactionalEntityManager.findOne(product_entity_1.Product, { where: { id: cartItem.product.id } });
                if (!product) {
                    throw new common_1.NotFoundException(`Product with ID ${cartItem.product.id} not found.`);
                }
                if (product.stockQuantity < cartItem.quantity) {
                    throw new common_1.BadRequestException(`Not enough stock for product "${product.name}". Available: ${product.stockQuantity}, Requested: ${cartItem.quantity}`);
                }
                product.stockQuantity -= cartItem.quantity;
                await transactionalEntityManager.save(product_entity_1.Product, product);
                const orderItem = new order_item_entity_1.OrderItem();
                orderItem.product = product;
                orderItem.productId = product.id;
                orderItem.quantity = cartItem.quantity;
                orderItem.pricePerUnit = cartItem.priceAtTimeOfAddition;
                orderItems.push(orderItem);
                totalAmount += orderItem.quantity * orderItem.pricePerUnit;
            }
            const newOrder = transactionalEntityManager.create(order_entity_1.Order, {
                items: orderItems,
                totalAmount: totalAmount,
                status: order_entity_1.OrderStatus.PENDING,
                shippingAddress: createOrderDto.shippingAddress,
            });
            for (const item of orderItems) {
                item.order = newOrder;
            }
            newOrder.items = await transactionalEntityManager.save(order_item_entity_1.OrderItem, orderItems);
            const savedOrder = await transactionalEntityManager.save(order_entity_1.Order, newOrder);
            await this.cartService.clearCart(createOrderDto.cartId);
            return savedOrder;
        }).catch(error => {
            console.error("Transaction failed:", error);
            throw new common_1.InternalServerErrorException("Order creation failed due to an internal error.");
        });
    }
    async findAll() {
        return this.orderRepository.find({ relations: ['items', 'items.product'] });
    }
    async findOne(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['items', 'items.product'],
        });
        if (!order) {
            throw new common_1.NotFoundException(`Order with ID "${id}" not found`);
        }
        return order;
    }
    async updateOrderStatus(id, status) {
        const order = await this.findOne(id);
        order.status = status;
        return this.orderRepository.save(order);
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        cart_service_1.CartService,
        product_service_1.ProductService,
        typeorm_2.EntityManager])
], OrderService);
//# sourceMappingURL=order.service.js.map