import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Cart } from '../cart/cart.entity/cart.entity';
import { CartService } from './cart.service';
import { AddToCartDto } from './DTO/add-to-cart.dto';
import { UpdateCartItemDto } from './DTO/update-cart-item.dto';


@ApiTags('cart')
@Controller('carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo carrinho de compras' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Carrinho criado com sucesso.', type: Cart })
  @HttpCode(HttpStatus.CREATED)
  createCart(): Promise<Cart> {
    return this.cartService.createCart();
  }

  
  @Get("/list")
  @ApiOperation({ summary: 'Listar todos os carrinhos de compras' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de carrinhos retornada com sucesso.', type: [Cart] })
  getAllCarts(): Promise<Cart[]> {
    return this.cartService.getAllCarts();
  }

  
  @Get(':cartId')
  @ApiOperation({ summary: 'Obter um carrinho de compras pelo ID' })
  @ApiParam({ name: 'cartId', description: 'ID do carrinho (UUID)', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Carrinho encontrado.', type: Cart })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Carrinho não encontrado.' })
  getCart(@Param('cartId', ParseUUIDPipe) cartId: string): Promise<Cart> {
    return this.cartService.getCart(cartId);
  }

  @Post(':cartId/items')
  @ApiOperation({ summary: 'Adicionar um item a um carrinho existente' })
  @ApiParam({ name: 'cartId', description: 'ID do carrinho (UUID)', type: 'string', format: 'uuid' })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Item adicionado ao carrinho com sucesso.', type: Cart })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Carrinho ou Produto não encontrado.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos ou estoque insuficiente.' })
  addItemToCart(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<Cart> {
    return this.cartService.addItemToCart(cartId, addToCartDto);
  }

  @Patch(':cartId/items/:cartItemId')
  @ApiOperation({ summary: 'Atualizar a quantidade de um item no carrinho' })
  @ApiParam({ name: 'cartId', description: 'ID do carrinho (UUID)', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'cartItemId', description: 'ID do item do carrinho (UUID)', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Item do carrinho atualizado com sucesso.', type: Cart })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Carrinho ou item do carrinho não encontrado.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos ou estoque insuficiente.' })
  updateCartItem(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Param('cartItemId', ParseUUIDPipe) cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ): Promise<Cart> {
    return this.cartService.updateCartItem(cartId, cartItemId, updateCartItemDto);
  }

  @Delete(':cartId/items/:cartItemId')
  @ApiOperation({ summary: 'Remover um item do carrinho' })
  @ApiParam({ name: 'cartId', description: 'ID do carrinho (UUID)', type: 'string', format: 'uuid' })
  @ApiParam({ name: 'cartItemId', description: 'ID do item do carrinho a ser removido (UUID)', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Item removido do carrinho com sucesso.', type: Cart })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Carrinho ou item do carrinho não encontrado.' })
  removeItemFromCart(
    @Param('cartId', ParseUUIDPipe) cartId: string,
    @Param('cartItemId', ParseUUIDPipe) cartItemId: string,
  ): Promise<Cart> {
    return this.cartService.removeItemFromCart(cartId, cartItemId);
  }

  @Delete(':cartId')
  @ApiOperation({ summary: 'Limpar todos os itens do carrinho' })
  @ApiParam({ name: 'cartId', description: 'ID do carrinho (UUID) a ser limpo', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Carrinho limpo com sucesso.', type: Cart })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Carrinho não encontrado.' })
  clearCart(@Param('cartId', ParseUUIDPipe) cartId: string): Promise<Cart> {
      return this.cartService.clearCart(cartId);
  }
}