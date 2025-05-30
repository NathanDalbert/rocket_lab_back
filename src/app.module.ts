import { Module } from '@nestjs/common';
import { CartController } from '../src/cart/cart.controller';
import { OrderController } from '../src/order/order.controller';
import { OrderService } from '../src/order/order.service';
import { ProductController } from '../src/product/product.controller';
import { ProductService } from '../src/product/product.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [ProductModule, CartModule, OrderModule],
  controllers: [AppController, ProductController, CartController, OrderController],
  providers: [AppService, ProductService, OrderService],
})
export class AppModule {}
