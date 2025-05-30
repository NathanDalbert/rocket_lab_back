// src/order/order-item.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../product/product-entity/product.entity'; // Certifique-se que o caminho está correto
import { Order } from '../order.entity/order.entity'; // Certifique-se que o caminho está correto

@Entity('order_items') // É uma boa prática nomear explicitamente a tabela
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relação com a entidade Product
  @ManyToOne(() => Product, /* product => product.orderItems, // Opcional: lado inverso da relação */ { eager: true, nullable: false })
  @JoinColumn({ name: 'product_id' }) // Especifica que a coluna 'product_id' nesta tabela é a FK
  product: Product; // Esta é a propriedade da relação que armazena o objeto Product

  // Coluna da Chave Estrangeira (FK)
  @Column({ name: 'product_id' }) // Esta é a coluna no banco de dados que armazena o ID do produto
  productId: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerUnit: number; // Preço do produto no momento da compra

  @ManyToOne(() => Order, order => order.items)
  order: Order;
}