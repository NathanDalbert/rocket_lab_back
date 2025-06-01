import { CartItem } from '../cart-item.entity/cart-item.entity';
export declare class Cart {
    cartId: string;
    items: CartItem[];
    totalAmount: number;
}
