import { EntityManager, Repository } from 'typeorm';
import { CartService } from '../cart/cart.service';
import { OrderItem } from '../order/order-item.entity/order-item.entity';
import { Order, OrderStatus } from '../order/order.entity/order.entity';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './DTO/create-order.dto';
export declare class OrderService {
    private orderRepository;
    private orderItemRepository;
    private cartService;
    private productService;
    private entityManager;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, cartService: CartService, productService: ProductService, entityManager: EntityManager);
    createOrder(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<Order>;
}
export { OrderStatus };
