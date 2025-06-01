import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CartItem } from '../cart/cart-item.entity/cart-item.entity';
import { Cart } from '../cart/cart.entity/cart.entity';
import { Product } from '../product/product-entity/product.entity';
import { ProductService } from '../product/product.service';
import { CartService } from './cart.service';
import { AddToCartDto } from './DTO/add-to-cart.dto';
import { SmartAddToCartDto } from './DTO/smart-add-to-cart.dto';
import { UpdateCartItemDto } from './DTO/update-cart-item.dto';

type MockRepository<T extends ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockRepositoryFactory = (): MockRepository<any> => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  remove: jest.fn(),
});

const mockProductServiceFactory = (): Partial<Record<keyof ProductService, jest.Mock>> => ({
  findOne: jest.fn(),
});

describe('CartService', () => {
  let service: CartService;
  let cartRepository: MockRepository<Cart>;
  let cartItemRepository: MockRepository<CartItem>;
  let productService: Partial<Record<keyof ProductService, jest.Mock>>;

  const mockCartId = uuidv4();
  const mockProductId = uuidv4();
  const mockProductName = 'Produto Teste';
  const mockProductPrice = 10.00;
  const mockProductStock = 10;
  const mockCartItemId = uuidv4();

  const mockProduct: Product = {
    productId: mockProductId,
    name: mockProductName,
    price: mockProductPrice,
    stockQuantity: mockProductStock,
    description: 'Descrição Produto',
  };

  let mockCartItem: CartItem;
  let mockEmptyCart: Cart;
  let mockCartWithItem: Cart;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useFactory: mockRepositoryFactory },
        { provide: getRepositoryToken(CartItem), useFactory: mockRepositoryFactory },
        { provide: ProductService, useFactory: mockProductServiceFactory },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get(getRepositoryToken(Cart));
    cartItemRepository = module.get(getRepositoryToken(CartItem));
    productService = module.get(ProductService);

    mockEmptyCart = {
      cartId: mockCartId,
      userId: undefined,
      items: [],
      totalAmount: 0,
    };
  
    mockCartItem = {
      cartItemId: mockCartItemId,
      product: mockProduct,
      quantity: 1,
      priceAtTimeOfAddition: mockProductPrice,
      cart: null as any,
    };
    
    mockCartWithItem = {
      cartId: mockCartId,
      userId: undefined,
      items: [mockCartItem],
      totalAmount: mockProductPrice * mockCartItem.quantity,
    };
    mockCartItem.cart = mockCartWithItem;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('createCart', () => {
    it('deve criar e retornar um novo carrinho vazio', async () => {
      const createdCartData = { items: [], totalAmount: 0, userId: undefined };
      const expectedSavedCart = { cartId: mockCartId, ...createdCartData };
      
      cartRepository.create!.mockReturnValue(createdCartData as unknown as Cart);
      cartRepository.save!.mockResolvedValue(expectedSavedCart as Cart);

      const result = await service.createCart();

      expect(cartRepository.create!).toHaveBeenCalledWith({ items: [], totalAmount: 0 });
      expect(cartRepository.save!).toHaveBeenCalledWith(createdCartData);
      expect(result).toEqual(expectedSavedCart);
    });
  });

  describe('getCart', () => {
    it('deve retornar um carrinho se encontrado e recalcular o total', async () => {
      const item1: CartItem = { ...mockCartItem, cartItemId: uuidv4(), quantity: 2, priceAtTimeOfAddition: 10 };
      const item2: CartItem = { ...mockCartItem, cartItemId: uuidv4(), product: {...mockProduct, productId: uuidv4()}, quantity: 1, priceAtTimeOfAddition: 5 };
      const cartToReturn: Cart = { ...mockEmptyCart, items: [item1, item2] };
      
      cartRepository.findOne!.mockResolvedValue(cartToReturn);
      
      const result = await service.getCart(mockCartId);
      
      expect(cartRepository.findOne!).toHaveBeenCalledWith({
        where: { cartId: mockCartId },
        relations: ['items', 'items.product'],
      });
      expect(result.totalAmount).toBe(25.00);
      expect(result).toEqual(expect.objectContaining({items: cartToReturn.items, totalAmount: 25.00}));
    });

    it('deve lançar NotFoundException se o carrinho não for encontrado', async () => {
      cartRepository.findOne!.mockResolvedValue(null);
      await expect(service.getCart(mockCartId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addItemToCart', () => {
    const addToCartDto: AddToCartDto = { productId: mockProductId, quantity: 1 };

    it('deve adicionar um novo item a um carrinho existente', async () => {
      cartRepository.findOne!.mockResolvedValue({ ...mockEmptyCart });
      productService.findOne!.mockResolvedValue(mockProduct);
      cartItemRepository.create!.mockImplementation(item => item as CartItem);
      cartItemRepository.save!.mockImplementation(item => Promise.resolve(item as CartItem));
      cartRepository.save!.mockImplementation(cart => Promise.resolve(cart as Cart));
      
      const result = await service.addItemToCart(mockCartId, addToCartDto);

      expect(productService.findOne!).toHaveBeenCalledWith(mockProductId);
      expect(cartItemRepository.create!).toHaveBeenCalledWith(expect.objectContaining({
        product: mockProduct,
        quantity: addToCartDto.quantity,
        priceAtTimeOfAddition: mockProduct.price,
      }));
      expect(cartItemRepository.save!).toHaveBeenCalledTimes(1);
      expect(cartRepository.save!).toHaveBeenCalledTimes(1);
      expect(result.items.length).toBe(1);
      expect(result.items[0].product.productId).toBe(mockProductId);
      expect(result.totalAmount).toBe(mockProductPrice * addToCartDto.quantity);
    });

    it('deve incrementar a quantidade de um item existente no carrinho', async () => {
      const existingCartItem: CartItem = { ...mockCartItem, quantity: 1 };
      const cartWithExistingItem: Cart = { ...mockEmptyCart, items: [existingCartItem] };
      
      cartRepository.findOne!.mockResolvedValue(cartWithExistingItem);
      productService.findOne!.mockResolvedValue(mockProduct);
      cartItemRepository.save!.mockImplementation(item => Promise.resolve(item as CartItem));
      cartRepository.save!.mockImplementation(cart => Promise.resolve(cart as Cart));

      const result = await service.addItemToCart(mockCartId, { ...addToCartDto, quantity: 2 });

      expect(cartItemRepository.save!).toHaveBeenCalledTimes(1);
      expect(cartRepository.save!).toHaveBeenCalledTimes(1);
      expect(result.items[0].quantity).toBe(3);
      expect(result.totalAmount).toBe(mockProductPrice * 3);
    });

    it('deve lançar BadRequestException se o estoque do produto for insuficiente', async () => {
      cartRepository.findOne!.mockResolvedValue({ ...mockEmptyCart });
      productService.findOne!.mockResolvedValue({ ...mockProduct, stockQuantity: 0 });

      await expect(service.addItemToCart(mockCartId, addToCartDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('smartAddItem', () => {
    const smartDto: SmartAddToCartDto = { productId: mockProductId, quantity: 1 };

    it('deve criar um novo carrinho e adicionar o item se cartId não for fornecido', async () => {
      const newCartId = uuidv4();
      const createdCartData = { cartId: newCartId, items: [], totalAmount: 0, userId: undefined };
      cartRepository.create!.mockReturnValue(createdCartData as unknown as Cart);
      cartRepository.save!.mockResolvedValueOnce(createdCartData as Cart);

      cartRepository.findOne!.mockResolvedValue(createdCartData as Cart);
      productService.findOne!.mockResolvedValue(mockProduct);
      cartItemRepository.create!.mockImplementation(item => item as CartItem);
      cartItemRepository.save!.mockImplementation(item => Promise.resolve(item as CartItem));
      const finalCartData = { 
        ...createdCartData, 
        items: [{ product: mockProduct, quantity: smartDto.quantity, priceAtTimeOfAddition: mockProductPrice } as CartItem], 
        totalAmount: mockProductPrice * smartDto.quantity 
      };
      cartRepository.save!.mockResolvedValueOnce(finalCartData as Cart);
      
      const result = await service.smartAddItem(smartDto);

      expect(cartRepository.create!).toHaveBeenCalled();
      expect(cartRepository.save!).toHaveBeenCalledTimes(2);
      expect(result.cartId).toBe(newCartId);
      expect(result.items.length).toBe(1);
    });

    it('deve adicionar item a um carrinho existente se cartId for fornecido', async () => {
      const smartDtoWithId: SmartAddToCartDto = { ...smartDto, cartId: mockCartId };
      cartRepository.findOne!.mockResolvedValue(mockEmptyCart);
      productService.findOne!.mockResolvedValue(mockProduct);
      cartItemRepository.create!.mockImplementation(item => item as CartItem);
      cartItemRepository.save!.mockImplementation(item => Promise.resolve(item as CartItem));
      cartRepository.save!.mockImplementation(cart => Promise.resolve(cart as Cart));

      const result = await service.smartAddItem(smartDtoWithId);

      expect(cartRepository.findOne!).toHaveBeenCalledWith(expect.objectContaining({ where: { cartId: mockCartId } }));
      expect(result.items.length).toBe(1);
    });
  });

  describe('updateCartItem', () => {
    const updateDto: UpdateCartItemDto = { quantity: 3 };

    it('deve atualizar a quantidade de um item do carrinho', async () => {
      const cartWithItemToUpdate: Cart = { ...mockEmptyCart, items: [{ ...mockCartItem, quantity: 1 }] };
      cartRepository.findOne!.mockResolvedValue(cartWithItemToUpdate);
      productService.findOne!.mockResolvedValue(mockProduct);
      cartItemRepository.save!.mockImplementation(item => Promise.resolve(item as CartItem));
      cartRepository.save!.mockImplementation(cart => Promise.resolve(cart as Cart));

      const result = await service.updateCartItem(mockCartId, mockCartItemId, updateDto);
      
      expect(productService.findOne!).toHaveBeenCalledWith(mockProduct.productId);
      expect(cartItemRepository.save!).toHaveBeenCalledWith(expect.objectContaining({ cartItemId: mockCartItemId, quantity: updateDto.quantity }));
      expect(result.items[0].quantity).toBe(updateDto.quantity);
      expect(result.totalAmount).toBe(mockProductPrice * updateDto.quantity);
    });

    it('deve lançar NotFoundException se o item do carrinho não for encontrado', async () => {
      cartRepository.findOne!.mockResolvedValue(mockEmptyCart);
      await expect(service.updateCartItem(mockCartId, mockCartItemId, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se o estoque for insuficiente para a nova quantidade', async () => {
      const cartWithItemToUpdate: Cart = { ...mockEmptyCart, items: [{ ...mockCartItem, quantity: 1 }] };
      cartRepository.findOne!.mockResolvedValue(cartWithItemToUpdate);
      productService.findOne!.mockResolvedValue({ ...mockProduct, stockQuantity: updateDto.quantity - 1 });

      await expect(service.updateCartItem(mockCartId, mockCartItemId, updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeItemFromCart', () => {
    it('deve remover um item do carrinho', async () => {
      const cartWithItemToRemove: Cart = { ...mockEmptyCart, items: [{ ...mockCartItem }] };
      cartRepository.findOne!.mockResolvedValue(cartWithItemToRemove);
      cartItemRepository.remove!.mockResolvedValue({} as any);
      cartRepository.save!.mockImplementation(cart => Promise.resolve(cart as Cart));

      const result = await service.removeItemFromCart(mockCartId, mockCartItemId);

      expect(cartItemRepository.remove!).toHaveBeenCalledWith(expect.objectContaining({ cartItemId: mockCartItemId }));
      expect(result.items.length).toBe(0);
      expect(result.totalAmount).toBe(0);
    });

    it('deve lançar NotFoundException se o item do carrinho não for encontrado para remoção', async () => {
      cartRepository.findOne!.mockResolvedValue(mockEmptyCart);
      await expect(service.removeItemFromCart(mockCartId, mockCartItemId)).rejects.toThrow(NotFoundException);
    });
  });
  
  describe('clearCart', () => {
    it('deve remover todos os itens de um carrinho', async () => {
      const item1 = {...mockCartItem};
      const item2 = {...mockCartItem, cartItemId: uuidv4()};
      const cartToClear: Cart = { ...mockEmptyCart, items: [item1, item2] };
      
      cartRepository.findOne!.mockResolvedValue(cartToClear);
      cartItemRepository.remove!.mockResolvedValue({} as any);
      cartRepository.save!.mockImplementation(cart => Promise.resolve(cart as Cart));

      const result = await service.clearCart(mockCartId);

      expect(cartItemRepository.remove!).toHaveBeenCalledWith(cartToClear.items);
      expect(result.items.length).toBe(0);
      expect(result.totalAmount).toBe(0);
    });

    it('deve funcionar corretamente se o carrinho já estiver vazio', async () => {
        cartRepository.findOne!.mockResolvedValue({ ...mockEmptyCart, items: [] });
        cartRepository.save!.mockImplementation(cart => Promise.resolve(cart as Cart));

        const result = await service.clearCart(mockCartId);
        expect(cartItemRepository.remove!).not.toHaveBeenCalled();
        expect(result.items.length).toBe(0);
        expect(result.totalAmount).toBe(0);
      });
  });
  
  describe('getAllCarts', () => {
    it('deve retornar um array de todos os carrinhos', async () => {
      const cartsArray = [mockCartWithItem, { ...mockEmptyCart, cartId: uuidv4() }];
      cartRepository.find!.mockResolvedValue(cartsArray);
      
      const result = await service.getAllCarts();
      
      expect(cartRepository.find!).toHaveBeenCalledWith({ relations: ['items', 'items.product'] });
      expect(result).toEqual(cartsArray);
    });
  });
});