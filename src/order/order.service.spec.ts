import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, ObjectLiteral, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CartItem as CartItemEntity } from '../cart/cart-item.entity/cart-item.entity';
import { Cart } from '../cart/cart.entity/cart.entity';
import { CartService } from '../cart/cart.service';
import { Product } from '../product/product-entity/product.entity';
import { ProductService } from '../product/product.service';
import { CreateOrderDto } from './DTO/create-order.dto';
import { OrderItem } from './order-item.entity/order-item.entity';
import { Order } from './order.entity/order.entity';
import { OrderService, OrderStatus } from './order.service';

type MockRepository<T extends ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockEntityManager = Partial<Record<keyof EntityManager, jest.Mock>>;
type MockCartService = Partial<Record<keyof CartService, jest.Mock>>;
type MockProductService = Partial<Record<keyof ProductService, jest.Mock>>;


const mockRepositoryFactory = <T extends ObjectLiteral>(): MockRepository<T> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
});

const mockEntityManagerFactory = (): MockEntityManager => ({
  transaction: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
});

const mockCartServiceFactory = (): MockCartService => ({
  getCart: jest.fn(),
});

const mockProductServiceFactory = (): MockProductService => ({
});


describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: MockRepository<Order>;
  let orderItemRepository: MockRepository<OrderItem>;
  let cartService: MockCartService;
  let entityManager: MockEntityManager;
  let mockTransactionalEntityManager: MockEntityManager;
  let consoleErrorSpy: jest.SpyInstance;


  const mockCartId = uuidv4();
  const mockOrderId = uuidv4();
  const mockProductId1 = uuidv4();
  const mockProductId2 = uuidv4();
  const mockShippingAddress = 'Rua Teste, 123';

  const mockCreateOrderDto: CreateOrderDto = {
    cartId: mockCartId,
    shippingAddress: mockShippingAddress,
  };

  let mockProduct1: Product;
  let mockProduct2: Product;
  let mockCartItem1: CartItemEntity;
  let mockCartItem2: CartItemEntity;
  let mockCart: Cart;
  let mockOrder: Order;
  
  beforeEach(async () => {
    mockTransactionalEntityManager = {
        findOne: jest.fn(),
        save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useFactory: mockRepositoryFactory },
        { provide: getRepositoryToken(OrderItem), useFactory: mockRepositoryFactory },
        { provide: CartService, useFactory: mockCartServiceFactory },
        { provide: ProductService, useFactory: mockProductServiceFactory },
        { provide: EntityManager, useFactory: mockEntityManagerFactory },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    orderRepository = module.get(getRepositoryToken(Order));
    orderItemRepository = module.get(getRepositoryToken(OrderItem));
    cartService = module.get(CartService);
    entityManager = module.get(EntityManager);

    entityManager.transaction!.mockImplementation(async (cb) => cb(mockTransactionalEntityManager));

    mockProduct1 = { productId: mockProductId1, name: 'Produto 1', price: 10, stockQuantity: 5, description:'' };
    mockProduct2 = { productId: mockProductId2, name: 'Produto 2', price: 20, stockQuantity: 3, description:'' };

    mockCartItem1 = { cartItemId: uuidv4(), product: mockProduct1, quantity: 2, priceAtTimeOfAddition: 10, cart: null as any };
    mockCartItem2 = { cartItemId: uuidv4(), product: mockProduct2, quantity: 1, priceAtTimeOfAddition: 20, cart: null as any };
    
    mockCart = {
      cartId: mockCartId,
      items: [mockCartItem1, mockCartItem2],
      totalAmount: (mockCartItem1.quantity * mockCartItem1.priceAtTimeOfAddition) + (mockCartItem2.quantity * mockCartItem2.priceAtTimeOfAddition),
  
    };

    mockOrder = {
      orderId: mockOrderId,
      items: [],
      totalAmount: mockCart.totalAmount,
      status: OrderStatus.PENDING,
      shippingAddress: mockShippingAddress,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    if(consoleErrorSpy) {
        consoleErrorSpy.mockRestore();
    }
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    
    it('deve criar um pedido com sucesso', async () => {
      cartService.getCart!.mockResolvedValue(mockCart);
      
      mockTransactionalEntityManager.findOne!
        .mockResolvedValueOnce({ ...mockProduct1 })
        .mockResolvedValueOnce({ ...mockProduct2 });

      const expectedSavedOrderInitial = { orderId: mockOrderId, items:[], totalAmount: mockCart.totalAmount, status: OrderStatus.PENDING, shippingAddress: mockShippingAddress, createdAt: expect.any(Date), updatedAt: expect.any(Date) };
      const savedProduct1 = { ...mockProduct1, stockQuantity: mockProduct1.stockQuantity - mockCartItem1.quantity };
      const savedProduct2 = { ...mockProduct2, stockQuantity: mockProduct2.stockQuantity - mockCartItem2.quantity };
      
      const mockSavedOrderItems: OrderItem[] = mockCart.items.map(ci => ({
        orderItemId: expect.any(String),
        product: ci.product === mockProduct1 ? savedProduct1 : savedProduct2,
        productId: ci.product.productId,
        quantity: ci.quantity,
        pricePerUnit: ci.priceAtTimeOfAddition,
        order: expect.objectContaining({ orderId: mockOrderId }) as Order,
      }));

      const finalOrderWithItems = { ...expectedSavedOrderInitial, items: mockSavedOrderItems };


      mockTransactionalEntityManager.save!
        .mockImplementationOnce(async (entityType, orderData) => ({ ...orderData, orderId: mockOrderId, items:[], createdAt: new Date(), updatedAt: new Date() } as Order))
        .mockImplementationOnce(async (entityType, productData) => productData as Product) 
        .mockImplementationOnce(async (entityType, productData) => productData as Product) 
        .mockImplementationOnce(async (entityType, orderItemsData) => mockSavedOrderItems as OrderItem[])
        .mockImplementationOnce(async (entityType, finalOrderData) => finalOrderWithItems as Order);

      const result = await service.createOrder(mockCreateOrderDto);

      expect(cartService.getCart!).toHaveBeenCalledWith(mockCartId);
      expect(mockTransactionalEntityManager.findOne).toHaveBeenCalledTimes(2);
      expect(mockTransactionalEntityManager.findOne).toHaveBeenCalledWith(Product, { where: { productId: mockProductId1 } });
      expect(mockTransactionalEntityManager.findOne).toHaveBeenCalledWith(Product, { where: { productId: mockProductId2 } });
      
      expect(mockTransactionalEntityManager.save).toHaveBeenCalledTimes(5);
      expect(mockTransactionalEntityManager.save).toHaveBeenCalledWith(Product, expect.objectContaining({ productId: mockProductId1, stockQuantity: savedProduct1.stockQuantity }));
      expect(mockTransactionalEntityManager.save).toHaveBeenCalledWith(Product, expect.objectContaining({ productId: mockProductId2, stockQuantity: savedProduct2.stockQuantity }));
      
      expect(result.orderId).toBe(mockOrderId);
      expect(result.items.length).toBe(mockCart.items.length);
      expect(result.totalAmount).toBe(mockCart.totalAmount);
      expect(result.status).toBe(OrderStatus.PENDING);
    });
    
    it('deve lançar InternalServerErrorException se o carrinho estiver vazio (verificação dentro da transação)', async () => {
        entityManager.transaction!.mockImplementation(async (cb) => {
            cartService.getCart!.mockResolvedValue({ ...mockCart, items: [] });
            return cb(mockTransactionalEntityManager);
        });
    
        await expect(service.createOrder(mockCreateOrderDto)).rejects.toThrow(InternalServerErrorException);
        expect(cartService.getCart!).toHaveBeenCalledWith(mockCartId);
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException se um produto no carrinho não for encontrado', async () => {
      cartService.getCart!.mockResolvedValue(mockCart);
      mockTransactionalEntityManager.findOne!.mockResolvedValueOnce({ ...mockProduct1 }).mockResolvedValueOnce(null);

      await expect(service.createOrder(mockCreateOrderDto)).rejects.toThrow(InternalServerErrorException);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException se o estoque for insuficiente', async () => {
      cartService.getCart!.mockResolvedValue(mockCart);
      mockTransactionalEntityManager.findOne!.mockResolvedValueOnce({ ...mockProduct1, stockQuantity: 1 });

      await expect(service.createOrder(mockCreateOrderDto)).rejects.toThrow(InternalServerErrorException);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
    
    it('deve lançar InternalServerErrorException se a transação falhar por outro motivo (ex: save falha)', async () => {
        cartService.getCart!.mockResolvedValue(mockCart);
        mockTransactionalEntityManager.findOne!.mockResolvedValue({ ...mockProduct1 });
        mockTransactionalEntityManager.save!.mockRejectedValueOnce(new Error("DB save error"));
  
        await expect(service.createOrder(mockCreateOrderDto)).rejects.toThrow(InternalServerErrorException);
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
  });

  describe('findAll', () => {
    it('deve retornar um array de pedidos com relações', async () => {
      const ordersArray = [mockOrder, { ...mockOrder, orderId: uuidv4() }];
      orderRepository.find!.mockResolvedValue(ordersArray);

      const result = await service.findAll();

      expect(orderRepository.find!).toHaveBeenCalledWith({ relations: ['items', 'items.product'] });
      expect(result).toEqual(ordersArray);
    });
  });

  describe('findOne', () => {
    it('deve retornar um pedido se encontrado com relações', async () => {
      orderRepository.findOne!.mockResolvedValue(mockOrder);
      const result = await service.findOne(mockOrderId);
      expect(orderRepository.findOne!).toHaveBeenCalledWith({
        where: { orderId: mockOrderId },
        relations: ['items', 'items.product'],
      });
      expect(result).toEqual(mockOrder);
    });

    it('deve lançar NotFoundException se o pedido não for encontrado', async () => {
      orderRepository.findOne!.mockResolvedValue(null);
      await expect(service.findOne(mockOrderId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOrderStatus', () => {
    const newStatus = OrderStatus.SHIPPED;
    it('deve atualizar o status do pedido e retorná-lo', async () => {
      const orderToUpdate = { ...mockOrder, status: OrderStatus.PENDING };
      orderRepository.findOne!.mockResolvedValue(orderToUpdate); 
      orderRepository.save!.mockResolvedValue({ ...orderToUpdate, status: newStatus });

      const result = await service.updateOrderStatus(mockOrderId, newStatus);

      expect(orderRepository.findOne!).toHaveBeenCalledWith({
        where: { orderId: mockOrderId },
        relations: ['items', 'items.product']
      });
      expect(orderRepository.save!).toHaveBeenCalledWith(expect.objectContaining({ orderId: mockOrderId, status: newStatus }));
      expect(result.status).toBe(newStatus);
    });

    it('deve propagar NotFoundException se findOne lançar (pedido não encontrado)', async () => {
      orderRepository.findOne!.mockResolvedValue(null);
      await expect(service.updateOrderStatus(mockOrderId, newStatus)).rejects.toThrow(NotFoundException);
    });
  });
});