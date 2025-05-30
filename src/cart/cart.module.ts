import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItem } from '../cart/cart-item.entity/cart-item.entity';
import { Cart } from '../cart/cart.entity/cart.entity';
import { ProductModule } from '../product/product.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    ProductModule, 
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService], 
})
export class CartModule {}