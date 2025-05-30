// src/order/order.service.ts
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm'; // Import EntityManager
import { CartService } from '../cart/cart.service';
import { OrderItem } from '../order/order-item.entity/order-item.entity';
import { Order, OrderStatus } from '../order/order.entity/order.entity';
import { Product } from '../product/product-entity/product.entity';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './DTO/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private cartService: CartService,
    private productService: ProductService,
    private entityManager: EntityManager, // Injete o EntityManager
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {

    return this.entityManager.transaction(async transactionalEntityManager => {
      const cart = await this.cartService.getCart(createOrderDto.cartId);
      if (!cart.items || cart.items.length === 0) {
        throw new BadRequestException('Cannot create order from an empty cart.');
      }

      const orderItems: OrderItem[] = [];
      let totalAmount = 0;

      for (const cartItem of cart.items) {
        const product = await transactionalEntityManager.findOne(Product, { where: { id: cartItem.product.id }}); // Usar transactionalEntityManager
        if (!product) {
            throw new NotFoundException(`Product with ID ${cartItem.product.id} not found.`);
        }
        if (product.stockQuantity < cartItem.quantity) {
          throw new BadRequestException(`Not enough stock for product "${product.name}". Available: ${product.stockQuantity}, Requested: ${cartItem.quantity}`);
        }

        // Diminuir o estoque
        product.stockQuantity -= cartItem.quantity;
        await transactionalEntityManager.save(Product, product); // Salvar produto dentro da transação

        const orderItem = new OrderItem(); // Criar instância diretamente
        orderItem.product = product;
        orderItem.productId = product.id;
        orderItem.quantity = cartItem.quantity;
        orderItem.pricePerUnit = cartItem.priceAtTimeOfAddition; // Usar o preço do carrinho no momento da adição
        orderItems.push(orderItem);

        totalAmount += orderItem.quantity * orderItem.pricePerUnit;
      }

      const newOrder = transactionalEntityManager.create(Order, { // Usar transactionalEntityManager
        items: orderItems,
        totalAmount: totalAmount,
        status: OrderStatus.PENDING, // Status inicial
        shippingAddress: createOrderDto.shippingAddress,
        // userId: ... // Se tiver usuários
      });

      // Salvar os OrderItems primeiro se eles não forem salvos automaticamente por cascade (depende da configuração)
      // ou se você precisa dos IDs deles antes de salvar o pedido.
      // Com cascade: true em Order.items, eles serão salvos com o pedido.
      // No entanto, para maior controle, especialmente com transações, salvar explicitamente pode ser melhor.
      for (const item of orderItems) {
        item.order = newOrder; // Associar ao novo pedido (importante se não estiver usando cascade para essa direção)
      }
      // Reatribuir os items com a referência ao pedido já preenchida (se necessário, dependendo da configuração do cascade)
      newOrder.items = await transactionalEntityManager.save(OrderItem, orderItems);

      const savedOrder = await transactionalEntityManager.save(Order, newOrder); // Salvar o pedido dentro da transação

      // Limpar o carrinho após o pedido ser criado com sucesso
      await this.cartService.clearCart(createOrderDto.cartId); // Este método também precisa ser transacional ou chamado com cuidado.
                                                              // Por simplicidade, chamamos aqui. Para robustez, o clearCart também poderia usar o transactionalEntityManager.

      return savedOrder;
    }).catch(error => {
        // Logar o erro
        console.error("Transaction failed:", error);
        // Relançar uma exceção mais genérica ou específica dependendo da política de tratamento de erros
        throw new InternalServerErrorException("Order creation failed due to an internal error.");
    });
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find({ relations: ['items', 'items.product'] });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['items', 'items.product'], // Garante que os itens e seus produtos sejam carregados
    });
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }
    return order;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.findOne(id);
    // Adicionar lógica aqui para validar transições de status, se necessário
    // Ex: um pedido entregue não pode voltar para pendente.
    order.status = status;
    return this.orderRepository.save(order);
  }

  // Outros métodos (cancelar pedido, etc.)
}

export { OrderStatus };
