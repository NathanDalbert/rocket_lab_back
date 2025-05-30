import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CartItem } from '../cart-item.entity/cart-item.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;


   @Column({ nullable: true })
    userId?: string;

  @OneToMany(() => CartItem, item => item.cart, { cascade: true, eager: true }) 
  items: CartItem[];

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  totalAmount: number;
}