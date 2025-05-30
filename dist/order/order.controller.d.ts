import { Order, OrderStatus } from '../order/order.entity/order.entity';
import { CreateOrderDto } from './DTO/create-order.dto';
import { OrderService } from './order.service';
export declare class OrderController {
    private readonly orderService;
    constructor(orderService: OrderService);
    create(createOrderDto: CreateOrderDto): Promise<Order>;
    findAll(): Promise<Order[]>;
    findOne(id: string): Promise<Order>;
    updateStatus(id: string, status: OrderStatus): Promise<Order>;
}
