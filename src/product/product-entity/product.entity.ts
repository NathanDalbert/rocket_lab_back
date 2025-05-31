import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid') 
  productId: string;

  @Column()
  name: string;

  @Column('text', { nullable: true }) 
  description?: string;

  @Column('decimal', { precision: 10, scale: 2 }) 
  price: number;

  @Column({ default: 0 }) 
  stockQuantity: number;
}