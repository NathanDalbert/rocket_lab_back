// src/product/product.service.spec.ts
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
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

  const mockProduct = { id: 'uuid1', name: 'Test Product', price: 10.99, stockQuantity: 100, description: 'Test Desc' };
  const mockCreateProductDto = { name: 'Test Product', price: 10.99, stockQuantity: 100, description: 'Test Desc' };

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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a product', async () => {
      repository.create?.mockReturnValue(mockProduct); // Simula o que o TypeORM create faria (geralmente retorna a entidade com os dados do DTO)
      repository.save?.mockResolvedValue(mockProduct); // Simula o save no banco

      const result = await service.create(mockCreateProductDto);
      expect(repository.create).toHaveBeenCalledWith(mockCreateProductDto);
      expect(repository.save).toHaveBeenCalledWith(mockProduct); // Verifica se o save foi chamado com o objeto criado
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      repository.find?.mockResolvedValue([mockProduct]);
      const result = await service.findAll();
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('should return a single product if found', async () => {
      repository.findOneBy?.mockResolvedValue(mockProduct);
      const result = await service.findOne('uuid1');
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'uuid1' });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      repository.findOneBy?.mockResolvedValue(null);
      await expect(service.findOne('unknown-id')).rejects.toThrow(NotFoundException);
    });
  });

  // Adicione testes para update e remove
});