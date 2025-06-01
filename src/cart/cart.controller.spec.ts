import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { CartItem } from '../cart/cart-item.entity/cart-item.entity';
import { Cart } from '../cart/cart.entity/cart.entity';
import { Product } from '../product/product-entity/product.entity';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AddToCartDto } from './DTO/add-to-cart.dto';
import { SmartAddToCartDto } from './DTO/smart-add-to-cart.dto';
import { UpdateCartItemDto } from './DTO/update-cart-item.dto';

const mockCartService = {
  createCart: jest.fn(),
  smartAddItem: jest.fn(),
  getCart: jest.fn(),
  addItemToCart: jest.fn(),
  updateCartItem: jest.fn(),
  removeItemFromCart: jest.fn(),
  clearCart: jest.fn(),
  getAllCarts: jest.fn(),
};

describe('CartController', () => {
  let controller: CartController;
  let service: typeof mockCartService;

  const mockCartId = uuidv4();
  const mockProductId = uuidv4();
  const mockCartItemId = uuidv4();
  const mockUserId = uuidv4();

  const mockProduct: Product = {
    productId: mockProductId,
    name: 'Produto para Carrinho',
    price: 15.75,
    stockQuantity: 20,
    description: 'Um produto de teste para o carrinho',
  };

  const mockCartItem: CartItem = {
    cartItemId: mockCartItemId,
    product: mockProduct,
    quantity: 1,
    priceAtTimeOfAddition: mockProduct.price,
    cart: null as any,
  };

  const mockEmptyCart: Cart = {
    cartId: mockCartId,
 
    items: [],
    totalAmount: 0,
  };

  const mockCartWithItem: Cart = {
    cartId: mockCartId,
  
    items: [mockCartItem],
    totalAmount: mockProduct.price * mockCartItem.quantity,
  };
  mockCartItem.cart = mockCartWithItem; 

  const mockCartsArray: Cart[] = [mockCartWithItem, { ...mockEmptyCart, cartId: uuidv4() }];

  const mockAddToCartDto: AddToCartDto = {
    productId: mockProductId,
    quantity: 1,
  };

  const mockSmartAddToCartDto: SmartAddToCartDto = {
    productId: mockProductId,
    quantity: 1,
    cartId: undefined, 
  };
  
  const mockSmartAddToCartDtoWithCartId: SmartAddToCartDto = {
    productId: mockProductId,
    quantity: 1,
    cartId: mockCartId,
  };

  const mockUpdateCartItemDto: UpdateCartItemDto = {
    quantity: 2,
  };


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get<typeof mockCartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('createCart (criarCarrinho)', () => {
    it('deve chamar cartService.createCart e retornar o carrinho criado', async () => {
      mockCartService.createCart.mockResolvedValue(mockEmptyCart);
      const result = await controller.createCart();
      expect(service.createCart).toHaveBeenCalled();
      expect(result).toEqual(mockEmptyCart);
    });
  });


  describe('getCart (obterCarrinho)', () => {
    it('deve chamar cartService.getCart e retornar o carrinho encontrado', async () => {
      mockCartService.getCart.mockResolvedValue(mockCartWithItem);
      const result = await controller.getCart(mockCartId);
      expect(service.getCart).toHaveBeenCalledWith(mockCartId);
      expect(result).toEqual(mockCartWithItem);
    });

    it('deve propagar NotFoundException se o carrinho não for encontrado', async () => {
      mockCartService.getCart.mockRejectedValue(new NotFoundException());
      await expect(controller.getCart(mockCartId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addItemToCart (adicionarItemAoCarrinho)', () => {
    it('deve chamar cartService.addItemToCart e retornar o carrinho atualizado', async () => {
      mockCartService.addItemToCart.mockResolvedValue(mockCartWithItem);
      const result = await controller.addItemToCart(mockCartId, mockAddToCartDto);
      expect(service.addItemToCart).toHaveBeenCalledWith(mockCartId, mockAddToCartDto);
      expect(result).toEqual(mockCartWithItem);
    });

    it('deve propagar NotFoundException do serviço', async () => {
      mockCartService.addItemToCart.mockRejectedValue(new NotFoundException('Carrinho ou Produto não encontrado.'));
      await expect(controller.addItemToCart(mockCartId, mockAddToCartDto)).rejects.toThrow(NotFoundException);
    });

    it('deve propagar BadRequestException do serviço', async () => {
      mockCartService.addItemToCart.mockRejectedValue(new BadRequestException('Estoque insuficiente.'));
      await expect(controller.addItemToCart(mockCartId, mockAddToCartDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateCartItem (atualizarItemDoCarrinho)', () => {
    it('deve chamar cartService.updateCartItem e retornar o carrinho atualizado', async () => {
      const updatedCart = { ...mockCartWithItem, items: [{ ...mockCartItem, quantity: mockUpdateCartItemDto.quantity }] };
      mockCartService.updateCartItem.mockResolvedValue(updatedCart);
      const result = await controller.updateCartItem(mockCartId, mockCartItemId, mockUpdateCartItemDto);
      expect(service.updateCartItem).toHaveBeenCalledWith(mockCartId, mockCartItemId, mockUpdateCartItemDto);
      expect(result).toEqual(updatedCart);
    });

    it('deve propagar NotFoundException do serviço', async () => {
      mockCartService.updateCartItem.mockRejectedValue(new NotFoundException('Item não encontrado.'));
      await expect(controller.updateCartItem(mockCartId, mockCartItemId, mockUpdateCartItemDto)).rejects.toThrow(NotFoundException);
    });

    it('deve propagar BadRequestException do serviço', async () => {
      mockCartService.updateCartItem.mockRejectedValue(new BadRequestException('Estoque insuficiente.'));
      await expect(controller.updateCartItem(mockCartId, mockCartItemId, mockUpdateCartItemDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeItemFromCart (removerItemDoCarrinho)', () => {
    it('deve chamar cartService.removeItemFromCart e retornar o carrinho atualizado', async () => {
      mockCartService.removeItemFromCart.mockResolvedValue(mockEmptyCart);
      const result = await controller.removeItemFromCart(mockCartId, mockCartItemId);
      expect(service.removeItemFromCart).toHaveBeenCalledWith(mockCartId, mockCartItemId);
      expect(result).toEqual(mockEmptyCart);
    });

    it('deve propagar NotFoundException do serviço', async () => {
      mockCartService.removeItemFromCart.mockRejectedValue(new NotFoundException('Item não encontrado.'));
      await expect(controller.removeItemFromCart(mockCartId, mockCartItemId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('clearCart (limparCarrinho)', () => {
    it('deve chamar cartService.clearCart e retornar o carrinho limpo', async () => {
      const clearedCart = { ...mockEmptyCart, items: [] };
      mockCartService.clearCart.mockResolvedValue(clearedCart);
      const result = await controller.clearCart(mockCartId);
      expect(service.clearCart).toHaveBeenCalledWith(mockCartId);
      expect(result).toEqual(clearedCart);
    });

    it('deve propagar NotFoundException se o carrinho não for encontrado', async () => {
      mockCartService.clearCart.mockRejectedValue(new NotFoundException());
      await expect(controller.clearCart(mockCartId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllCarts (obterTodosOsCarrinhos)', () => {
    it('deve chamar cartService.getAllCarts e retornar um array de carrinhos', async () => {
      mockCartService.getAllCarts.mockResolvedValue(mockCartsArray);
      const result = await controller.getAllCarts();
      expect(service.getAllCarts).toHaveBeenCalled();
      expect(result).toEqual(mockCartsArray);
    });
  });
});