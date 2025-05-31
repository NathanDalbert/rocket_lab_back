import { Product } from '../../product/product-entity/product.entity';
import { Order } from '../order.entity/order.entity';
export declare class OrderItem {
    orderItemId: string;
    product: Product;
    productId: string;
    quantity: number;
    pricePerUnit: number;
    order: Order;
}
