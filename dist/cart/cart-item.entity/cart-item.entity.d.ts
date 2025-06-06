import { Product } from '../../product/product-entity/product.entity';
import { Cart } from '../cart.entity/cart.entity';
export declare class CartItem {
    cartItemId: string;
    product: Product;
    quantity: number;
    cart: Cart;
    priceAtTimeOfAddition: number;
}
export { Cart };
