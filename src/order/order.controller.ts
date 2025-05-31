import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Order, OrderStatus } from '../order/order.entity/order.entity';
import { CreateOrderDto } from './DTO/create-order.dto';
import { OrderService } from './order.service';

@ApiTags('orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo pedido (finalizar compra)' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Pedido criado com sucesso.', type: Order })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos, carrinho vazio ou estoque insuficiente.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Carrinho não encontrado.' })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.orderService.createOrder(createOrderDto);
  }





  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de pedidos retornada com sucesso.', type: [Order] })
  
  findAll(): Promise<Order[]> {
    return this.orderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um pedido específico pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do pedido (UUID)', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Pedido encontrado.', type: Order })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pedido não encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Order> {
    return this.orderService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar o status de um pedido' })
  @ApiParam({ name: 'id', description: 'ID do pedido (UUID)', type: 'string', format: 'uuid' })
  @ApiBody({
    description: 'Novo status para o pedido',
    schema: { type: 'object', properties: { status: { type: 'string', enum: Object.values(OrderStatus) } } },

  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Status do pedido atualizado com sucesso.', type: Order })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Pedido não encontrado.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Status inválido fornecido.' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: OrderStatus, 
  ): Promise<Order> {
    
    return this.orderService.updateOrderStatus(id, status);
  }
}