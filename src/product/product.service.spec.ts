import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CreateProductDto } from './DTO/create-product.dto';
import { UpdateProductDto } from './DTO/update-product.dto';
import { Product } from './product-entity/product.entity';
import { ProductService } from './product.service';

const mockProductRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  preload: jest.fn(),
  delete: jest.fn(),
});

type MockRepository<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('ProductService', () => {
  let service: ProductService;
  let repository: MockRepository<Product>;

  const mockProductId = uuidv4();

  const mockProduct: Product = {
    productId: mockProductId,
    name: 'Produto Teste',
    price: 10.99,
    stockQuantity: 100,
    description: 'Descrição Teste',
  };

  const mockCreateProductDto: CreateProductDto = {
    name: 'Produto Teste',
    price: 10.99,
    stockQuantity: 100,
    description: 'Descrição Teste',
  };

  const mockUpdateProductDto: UpdateProductDto = {
    name: 'Produto Teste Atualizado',
    price: 12.50,
  };

  const mockProductsArray: Product[] = [mockProduct];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useFactory: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get<MockRepository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('create (criar)', () => {
    it('deve criar e retornar um produto', async () => {
     
      const newProductEntity = { ...mockCreateProductDto };
      repository.create!.mockReturnValue(newProductEntity as unknown as Product); 
      repository.save!.mockResolvedValue(mockProduct);

      const result = await service.create(mockCreateProductDto);

      expect(repository.create!).toHaveBeenCalledWith(mockCreateProductDto);
      expect(repository.save!).toHaveBeenCalledWith(newProductEntity);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll (buscarTodos)', () => {
    it('deve retornar um array de produtos', async () => {
      repository.find!.mockResolvedValue(mockProductsArray);
      const result = await service.findAll();
      expect(repository.find!).toHaveBeenCalled();
      expect(result).toEqual(mockProductsArray);
    });
  });

  describe('findOne (buscarUm)', () => {
    it('deve retornar um único produto se encontrado', async () => {
      repository.findOneBy!.mockResolvedValue(mockProduct);
      const result = await service.findOne(mockProductId);
      expect(repository.findOneBy!).toHaveBeenCalledWith({ productId: mockProductId });
      expect(result).toEqual(mockProduct);
    });

    it('deve lançar NotFoundException se o produto não for encontrado', async () => {
      repository.findOneBy!.mockResolvedValue(null);
      const unknownId = uuidv4();
      await expect(service.findOne(unknownId)).rejects.toThrow(NotFoundException);
      expect(repository.findOneBy!).toHaveBeenCalledWith({ productId: unknownId });
    });
  });

  describe('update (atualizar)', () => {
    it('deve atualizar e retornar o produto', async () => {
      const preloadedProductData = { ...mockProduct, ...mockUpdateProductDto, productId: mockProductId };
      repository.preload!.mockResolvedValue(preloadedProductData as Product);
      repository.save!.mockResolvedValue(preloadedProductData as Product);

      const result = await service.update(mockProductId, mockUpdateProductDto);

      expect(repository.preload!).toHaveBeenCalledWith({
        productId: mockProductId,
        ...mockUpdateProductDto,
      });
      expect(repository.save!).toHaveBeenCalledWith(preloadedProductData);
      expect(result).toEqual(preloadedProductData);
    });

    it('deve lançar NotFoundException se o produto para atualizar não for encontrado (preload retorna null)', async () => {
      repository.preload!.mockResolvedValue(null);
      const unknownId = uuidv4();

      await expect(service.update(unknownId, mockUpdateProductDto)).rejects.toThrow(NotFoundException);
      expect(repository.preload!).toHaveBeenCalledWith({
        productId: unknownId,
        ...mockUpdateProductDto,
      });
      expect(repository.save!).not.toHaveBeenCalled();
    });
  });

  describe('remove (remover)', () => {
    it('deve remover o produto com sucesso (void)', async () => {
      repository.delete!.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(mockProductId)).resolves.toBeUndefined();
      expect(repository.delete!).toHaveBeenCalledWith(mockProductId);
    });

    it('deve lançar NotFoundException se o produto para remover não for encontrado (affected é 0)', async () => {
      repository.delete!.mockResolvedValue({ affected: 0, raw: [] });
      const unknownId = uuidv4();

      await expect(service.remove(unknownId)).rejects.toThrow(NotFoundException);
      expect(repository.delete!).toHaveBeenCalledWith(unknownId);
    });
  });
});