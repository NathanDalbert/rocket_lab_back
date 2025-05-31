import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { Product } from '../product/product-entity/product.entity';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './DTO/create-order.dto';
import { OrderItem } from './order-item.entity/order-item.entity';
import { Order, OrderStatus } from './order.entity/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,

    private cartService: CartService,
    private productService: ProductService,
    private entityManager: EntityManager
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
  return this.entityManager.transaction(async transactionalEntityManager => {
    const cart = await this.cartService.getCart(createOrderDto.cartId);

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot create order from an empty cart.');
    }

    // Use o totalAmount vindo do carrinho diretamente
    const totalAmount = cart.totalAmount;

    const newOrder = new Order();
    newOrder.status = OrderStatus.PENDING;
    newOrder.shippingAddress = createOrderDto.shippingAddress;
    newOrder.totalAmount = totalAmount; // aqui usa o valor do cart

    // Salva a ordem inicialmente
    const savedOrder = await transactionalEntityManager.save(Order, newOrder);

    const orderItems: OrderItem[] = [];

    for (const cartItem of cart.items) {
      const product = await transactionalEntityManager.findOne(Product, {
        where: { id: cartItem.product.id }
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${cartItem.product.id} not found.`);
      }

      if (product.stockQuantity < cartItem.quantity) {
        throw new BadRequestException(
          `Not enough stock for product "${product.name}". Available: ${product.stockQuantity}, Requested: ${cartItem.quantity}`
        );
      }

      product.stockQuantity -= cartItem.quantity;
      await transactionalEntityManager.save(Product, product);

      const orderItem = new OrderItem();
      orderItem.product = product;
      orderItem.productId = product.id;
      orderItem.quantity = cartItem.quantity;
      orderItem.pricePerUnit = cartItem.priceAtTimeOfAddition;
      orderItem.order = savedOrder;

      orderItems.push(orderItem);
    }

    const savedOrderItems = await transactionalEntityManager.save(OrderItem, orderItems);
    savedOrder.items = savedOrderItems;

    // Atualiza a ordem com os itens (opcional, só se quiser garantir o relacionamento)
    return transactionalEntityManager.save(Order, savedOrder);
  }).catch(error => {
    console.error('Transaction failed:', error);
    throw new InternalServerErrorException('Order creation failed due to an internal error.');
  });
}

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: ['items', 'items.product']
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product']
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.orderRepository.save(order);
  }
}

export { OrderStatus };

