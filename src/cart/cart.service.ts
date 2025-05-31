import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartItem } from '../cart/cart-item.entity/cart-item.entity';
import { ProductService } from '../product/product.service';
import { AddToCartDto } from './DTO/add-to-cart.dto';
import { SmartAddToCartDto } from './DTO/smart-add-to-cart.dto';
import { UpdateCartItemDto } from './DTO/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    private productService: ProductService,
  ) {}

  async createCart(): Promise<Cart> {
    const newCart = this.cartRepository.create({ items: [], totalAmount: 0 });
    return this.cartRepository.save(newCart);
  }

  async getCart(cartId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items', 'items.product'],
    });
    if (!cart) {
      throw new NotFoundException(`Cart with ID "${cartId}" not found`);
    }
    this.recalculateCartTotal(cart);
    return cart;
  }

  async addItemToCart(cartId: string, addToCartDto: AddToCartDto): Promise<Cart> {
    const cart = await this.getCart(cartId);
    const product = await this.productService.findOne(addToCartDto.productId);

    if (product.stockQuantity < addToCartDto.quantity) {
      throw new BadRequestException(`Not enough stock for product "${product.name}". Available: ${product.stockQuantity}, Requested: ${addToCartDto.quantity}`);
    }

    let cartItem = cart.items.find(item => item.product.id === addToCartDto.productId);

    if (cartItem) {
      cartItem.quantity += addToCartDto.quantity;
      cartItem.priceAtTimeOfAddition = product.price;
    } else {
      const newCartItem = this.cartItemRepository.create({
        product: product,
        quantity: addToCartDto.quantity,
        cart: cart,
        priceAtTimeOfAddition: product.price,
      });
  
      if (!Array.isArray(cart.items)) {
        cart.items = [];
      }
      cart.items.push(newCartItem);
      cartItem = newCartItem; 
    }

    await this.cartItemRepository.save(cartItem);
    this.recalculateCartTotal(cart);
    return this.cartRepository.save(cart);
  }

  async smartAddItem(smartAddToCartDto: SmartAddToCartDto): Promise<Cart> {
    let targetCartId: string;

    if (smartAddToCartDto.cartId) {
      await this.getCart(smartAddToCartDto.cartId);
      targetCartId = smartAddToCartDto.cartId;
    } else {
      const newCart = await this.createCart();
      targetCartId = newCart.id;
    }

    const itemDetails: AddToCartDto = {
      productId: smartAddToCartDto.productId,
      quantity: smartAddToCartDto.quantity,
    };

    return this.addItemToCart(targetCartId, itemDetails);
  }

  async updateCartItem(cartId: string, cartItemId: string, updateCartItemDto: UpdateCartItemDto): Promise<Cart> {
    const cart = await this.getCart(cartId);
    const cartItem = cart.items.find(item => item.id === cartItemId);

    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID "${cartItemId}" not found in cart "${cartId}"`);
    }

    const product = await this.productService.findOne(cartItem.product.id);
    if (product.stockQuantity < updateCartItemDto.quantity) {
      throw new BadRequestException(`Not enough stock for product "${product.name}". Available: ${product.stockQuantity}, Requested: ${updateCartItemDto.quantity}`);
    }

    cartItem.quantity = updateCartItemDto.quantity;
    await this.cartItemRepository.save(cartItem);
    this.recalculateCartTotal(cart);
    return this.cartRepository.save(cart);
  }

  async removeItemFromCart(cartId: string, cartItemId: string): Promise<Cart> {
    const cart = await this.getCart(cartId);
    const itemIndex = cart.items.findIndex(item => item.id === cartItemId);

    if (itemIndex === -1) {
      throw new NotFoundException(`Cart item with ID "${cartItemId}" not found in cart "${cartId}"`);
    }
    const itemToRemove = cart.items[itemIndex];
    await this.cartItemRepository.remove(itemToRemove);
    
    cart.items.splice(itemIndex, 1);
    this.recalculateCartTotal(cart);
    return this.cartRepository.save(cart);
  }

  private recalculateCartTotal(cart: Cart): void {
    cart.totalAmount = cart.items.reduce((total, item) => {
      return total + (item.priceAtTimeOfAddition * item.quantity);
    }, 0);
    
    cart.totalAmount = parseFloat(cart.totalAmount.toFixed(2));
  }

  async clearCart(cartId: string): Promise<Cart> {
    const cart = await this.getCart(cartId);
    if (cart.items && cart.items.length > 0) {
        await this.cartItemRepository.remove(cart.items); 
    }
    cart.items = [];
    this.recalculateCartTotal(cart);
    return this.cartRepository.save(cart);
  }
  async getAllCarts(): Promise<Cart[]> {
 return this.cartRepository.find({ relations: ['items', 'items.product'] });

}

}