import { Repository } from 'typeorm';
import { Cart, CartItem } from '../cart/cart-item.entity/cart-item.entity';
import { ProductService } from '../product/product.service';
import { AddToCartDto } from './DTO/add-to-cart.dto';
import { SmartAddToCartDto } from './DTO/smart-add-to-cart.dto';
import { UpdateCartItemDto } from './DTO/update-cart-item.dto';
export declare class CartService {
    private cartRepository;
    private cartItemRepository;
    private productService;
    constructor(cartRepository: Repository<Cart>, cartItemRepository: Repository<CartItem>, productService: ProductService);
    createCart(): Promise<Cart>;
    getCart(cartId: string): Promise<Cart>;
    addItemToCart(cartId: string, addToCartDto: AddToCartDto): Promise<Cart>;
    smartAddItem(smartAddToCartDto: SmartAddToCartDto): Promise<Cart>;
    updateCartItem(cartId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart>;
    removeItemFromCart(cartId: string, cartItemId: string): Promise<Cart>;
    private recalculateCartTotal;
    clearCart(cartId: string): Promise<Cart>;
}
