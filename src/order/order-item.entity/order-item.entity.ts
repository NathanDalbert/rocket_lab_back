import { Exclude } from 'class-transformer';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../product/product-entity/product.entity';
import { Order } from '../order.entity/order.entity';

@Entity('order_items') 
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  orderItemId: string;

  @ManyToOne(() => Product, { eager: true, nullable: false })
  @JoinColumn({ name: 'product_id' }) 
  product: Product;

  @Column({ name: 'product_id' })
  productId: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerUnit: number; 

  @ManyToOne(() => Order, order => order.items)
  @Exclude() 
  order: Order;
}
