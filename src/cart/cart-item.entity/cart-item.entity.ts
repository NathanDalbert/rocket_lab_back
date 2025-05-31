import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../product/product-entity/product.entity';
import { Cart } from '../cart.entity/cart.entity';
@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  cartItemId: string;

  @ManyToOne(() => Product, { eager: true }) 
  product: Product;

  @Column()
  quantity: number;

  @ManyToOne(() => Cart, cart => cart.items)
  cart: Cart;

  @Column('decimal', { precision: 10, scale: 2 })
  priceAtTimeOfAddition: number; 
}

export { Cart };

