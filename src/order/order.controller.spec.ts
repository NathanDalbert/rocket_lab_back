import { BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { Order, OrderStatus } from '../order/order.entity/order.entity';
import { CreateOrderDto } from './DTO/create-order.dto';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

const mockOrderService = {
  createOrder: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  updateOrderStatus: jest.fn(),
};

describe('OrderController', () => {
  let controller: OrderController;
  let service: typeof mockOrderService;

  const mockOrderId = uuidv4();
  const mockCartId = uuidv4();
  const mockShippingAddress = 'Rua das Flores, 101';

  const mockCreateOrderDto: CreateOrderDto = {
    cartId: mockCartId,
    shippingAddress: mockShippingAddress,
  };

  const mockOrder: Order = {
    orderId: mockOrderId,
    items: [],
    totalAmount: 150.75,
    status: OrderStatus.PENDING,
    shippingAddress: mockShippingAddress,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrdersArray: Order[] = [
    mockOrder,
    { ...mockOrder, orderId: uuidv4(), status: OrderStatus.PAID },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<typeof mockOrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create (criar)', () => {
    it('deve chamar orderService.createOrder e retornar o pedido criado', async () => {
      mockOrderService.createOrder.mockResolvedValue(mockOrder);
      const result = await controller.create(mockCreateOrderDto);
      expect(service.createOrder).toHaveBeenCalledWith(mockCreateOrderDto);
      expect(result).toEqual(mockOrder);
    });

    it('deve propagar BadRequestException se orderService.createOrder lançar', async () => {
      mockOrderService.createOrder.mockRejectedValue(new BadRequestException('Carrinho vazio.'));
      await expect(controller.create(mockCreateOrderDto)).rejects.toThrow(BadRequestException);
    });

    it('deve propagar NotFoundException se orderService.createOrder lançar', async () => {
      mockOrderService.createOrder.mockRejectedValue(new NotFoundException('Carrinho não encontrado.'));
      await expect(controller.create(mockCreateOrderDto)).rejects.toThrow(NotFoundException);
    });
    
    it('deve propagar InternalServerErrorException se orderService.createOrder lançar (ex: falha na transação)', async () => {
        mockOrderService.createOrder.mockRejectedValue(new InternalServerErrorException('Falha na transação.'));
        await expect(controller.create(mockCreateOrderDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll (buscarTodos)', () => {
    it('deve chamar orderService.findAll e retornar um array de pedidos', async () => {
      mockOrderService.findAll.mockResolvedValue(mockOrdersArray);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockOrdersArray);
    });
  });

  describe('findOne (buscarUm)', () => {
    it('deve chamar orderService.findOne e retornar um pedido se encontrado', async () => {
      mockOrderService.findOne.mockResolvedValue(mockOrder);
      const result = await controller.findOne(mockOrderId);
      expect(service.findOne).toHaveBeenCalledWith(mockOrderId);
      expect(result).toEqual(mockOrder);
    });

    it('deve propagar NotFoundException se orderService.findOne lançar', async () => {
      mockOrderService.findOne.mockRejectedValue(new NotFoundException('Pedido não encontrado.'));
      const unknownId = uuidv4();
      await expect(controller.findOne(unknownId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(unknownId);
    });
  });

  describe('updateStatus (atualizarStatus)', () => {
    const newStatus = OrderStatus.SHIPPED;

    it('deve chamar orderService.updateOrderStatus e retornar o pedido atualizado', async () => {
      const updatedOrder = { ...mockOrder, status: newStatus };
      mockOrderService.updateOrderStatus.mockResolvedValue(updatedOrder);
      const result = await controller.updateStatus(mockOrderId, newStatus);
      expect(service.updateOrderStatus).toHaveBeenCalledWith(mockOrderId, newStatus);
      expect(result).toEqual(updatedOrder);
    });

    it('deve propagar NotFoundException se orderService.updateOrderStatus lançar (pedido não encontrado)', async () => {
      mockOrderService.updateOrderStatus.mockRejectedValue(new NotFoundException('Pedido não encontrado.'));
      const unknownId = uuidv4();
      await expect(controller.updateStatus(unknownId, newStatus)).rejects.toThrow(NotFoundException);
      expect(service.updateOrderStatus).toHaveBeenCalledWith(unknownId, newStatus);
    });

    it('deve propagar BadRequestException se orderService.updateOrderStatus lançar (status inválido)', async () => {
      mockOrderService.updateOrderStatus.mockRejectedValue(new BadRequestException('Status inválido.'));
      await expect(controller.updateStatus(mockOrderId, 'INVALID_STATUS' as OrderStatus)).rejects.toThrow(BadRequestException);
      expect(service.updateOrderStatus).toHaveBeenCalledWith(mockOrderId, 'INVALID_STATUS' as OrderStatus);
    });
  });
});