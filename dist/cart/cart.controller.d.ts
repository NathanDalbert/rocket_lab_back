import { Cart } from '../cart/cart.entity/cart.entity';
import { CartService } from './cart.service';
import { AddToCartDto } from './DTO/add-to-cart.dto';
import { SmartAddToCartDto } from './DTO/smart-add-to-cart.dto';
import { UpdateCartItemDto } from './DTO/update-cart-item.dto';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    createCart(): Promise<Cart>;
    smartAddItemToCart(smartAddToCartDto: SmartAddToCartDto): Promise<Cart>;
    getCart(cartId: string): Promise<Cart>;
    addItemToCart(cartId: string, addToCartDto: AddToCartDto): Promise<Cart>;
    updateCartItem(cartId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart>;
    removeItemFromCart(cartId: string, cartItemId: string): Promise<Cart>;
    clearCart(cartId: string): Promise<Cart>;
}
