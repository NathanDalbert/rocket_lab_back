import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../product/product-entity/product.entity';
import { CreateProductDto } from './DTO/create-product.dto';
import { UpdateProductDto } from './DTO/update-product.dto';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

const mockProductService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ProductController', () => {
  let controller: ProductController;
  let service: typeof mockProductService;

  const mockProductId = uuidv4();

  const mockCreateProductDto: CreateProductDto = {
    name: 'Produto Teste Controller',
    description: 'Descrição Teste Controller',
    price: 20.99,
    stockQuantity: 50,
  };

  const mockUpdateProductDto: UpdateProductDto = {
    name: 'Produto Teste Controller Atualizado',
    price: 22.50,
  };

  const mockProduct: Product = {
    productId: mockProductId,
    name: 'Produto Mock Controller',
    description: 'Descrição Mock Controller',
    price: 20.99,
    stockQuantity: 50,
  };

  const mockProductsArray: Product[] = [
    mockProduct,
    {
      productId: uuidv4(),
      name: 'Outro Produto Mock',
      description: 'Outra Descrição',
      price: 30.00,
      stockQuantity: 25,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<typeof mockProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create (criar)', () => {
    it('deve chamar productService.create e retornar o produto criado', async () => {
      mockProductService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(mockCreateProductDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateProductDto);
      expect(result).toEqual(mockProduct);
    });

    it('deve propagar BadRequestException se productService.create lançar', async () => {
      mockProductService.create.mockRejectedValue(new BadRequestException('Dados inválidos.'));
      
      await expect(controller.create(mockCreateProductDto)).rejects.toThrow(BadRequestException);
      expect(service.create).toHaveBeenCalledWith(mockCreateProductDto);
    });
  });

  describe('findAll (buscarTodos)', () => {
    it('deve chamar productService.findAll e retornar um array de produtos', async () => {
      mockProductService.findAll.mockResolvedValue(mockProductsArray);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockProductsArray);
    });
  });

  describe('findOne (buscarUm)', () => {
    it('deve chamar productService.findOne e retornar um produto se encontrado', async () => {
      mockProductService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne(mockProductId);

      expect(service.findOne).toHaveBeenCalledWith(mockProductId);
      expect(result).toEqual(mockProduct);
    });

    it('deve propagar NotFoundException se productService.findOne lançar', async () => {
      const unknownId = uuidv4();
      mockProductService.findOne.mockRejectedValue(new NotFoundException(`Produto não encontrado.`));

      await expect(controller.findOne(unknownId)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(unknownId);
    });
  });

  describe('update (atualizar)', () => {
    it('deve chamar productService.update e retornar o produto atualizado', async () => {
      const updatedProduct = { ...mockProduct, ...mockUpdateProductDto };
      mockProductService.update.mockResolvedValue(updatedProduct);

      const result = await controller.update(mockProductId, mockUpdateProductDto);

      expect(service.update).toHaveBeenCalledWith(mockProductId, mockUpdateProductDto);
      expect(result).toEqual(updatedProduct);
    });

    it('deve propagar NotFoundException se productService.update lançar para produto não encontrado', async () => {
      const unknownId = uuidv4();
      mockProductService.update.mockRejectedValue(new NotFoundException('Produto não encontrado para atualização.'));

      await expect(controller.update(unknownId, mockUpdateProductDto)).rejects.toThrow(NotFoundException);
      expect(service.update).toHaveBeenCalledWith(unknownId, mockUpdateProductDto);
    });

    it('deve propagar BadRequestException se productService.update lançar para dados inválidos', async () => {
        mockProductService.update.mockRejectedValue(new BadRequestException('Dados de entrada inválidos para atualização.'));
  
        await expect(controller.update(mockProductId, mockUpdateProductDto)).rejects.toThrow(BadRequestException);
        expect(service.update).toHaveBeenCalledWith(mockProductId, mockUpdateProductDto);
      });
  });

  describe('remove (remover)', () => {
    it('deve chamar productService.remove e não retornar conteúdo (void)', async () => {
      mockProductService.remove.mockResolvedValue(undefined); // O método do serviço retorna Promise<void>

      await expect(controller.remove(mockProductId)).resolves.toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(mockProductId);
    });

    it('deve propagar NotFoundException se productService.remove lançar', async () => {
      const unknownId = uuidv4();
      mockProductService.remove.mockRejectedValue(new NotFoundException('Produto não encontrado para remoção.'));

      await expect(controller.remove(unknownId)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(unknownId);
    });
  });
});