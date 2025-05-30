import { CartItem } from '../cart-item.entity/cart-item.entity';
export declare class Cart {
    id: string;
    userId?: string;
    items: CartItem[];
    totalAmount: number;
}
