// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CartModule } from './cart/cart.module'; // <<--- VERIFIQUE ESTE CAMINHO
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
// ... outras importações de entidade se você as colocou aqui

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ProductModule,
    CartModule, // <<--- E AQUI
    OrderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}