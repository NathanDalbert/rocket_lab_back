import { EntityManager, Repository } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './DTO/create-order.dto';
import { OrderItem } from './order-item.entity/order-item.entity';
import { Order, OrderStatus } from './order.entity/order.entity';
export declare class OrderService {
    private orderRepository;
    private orderItemRepository;
    private cartService;
    private productService;
    private entityManager;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, cartService: CartService, productService: ProductService, entityManager: EntityManager);
    createOrder(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(): Promise<Order[]>;
    findOne(orderid: string): Promise<Order>;
    updateOrderStatus(orderid: string, status: OrderStatus): Promise<Order>;
}
export { OrderStatus };
