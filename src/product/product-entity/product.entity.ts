import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid') 
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true }) // 'text' para descrições mais longas
  description?: string;

  @Column('decimal', { precision: 10, scale: 2 }) // 'decimal' para preços precisos
  price: number;

  @Column({ default: 0 }) // Padrão para 0 se não especificado
  stockQuantity: number;
}