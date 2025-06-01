import { ArgumentMetadata, ParseUUIDPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
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

  const mockProduct = { id: 'uuid1', name: 'Test Product', price: 10.99, stockQuantity: 100, description: 'Test Desc' };


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
    service = module.get(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call productService.create and return the result', async () => {
      const createProductDto: CreateProductDto = { name: 'New Product', price: 20, stockQuantity: 50 };
      mockProductService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(createProductDto);
      expect(service.create).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should call productService.findAll and return the result', async () => {
      mockProductService.findAll.mockResolvedValue([mockProduct]);
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('should call productService.findOne with id and return the result', async () => {
      const id = 'uuid1';
      mockProductService.findOne.mockResolvedValue(mockProduct);
      const result = await controller.findOne(id);
      expect(service.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockProduct);
    });
  });

   describe('update', () => {
    it('should call productService.update with id and dto, and return the result', async () => {
        const id = 'uuid1';
        const updateDto: UpdateProductDto = { name: 'Updated Name' };
        const updatedProduct = { ...mockProduct, ...updateDto };
        mockProductService.update.mockResolvedValue(updatedProduct);

        const result = await controller.update(id, updateDto);

        expect(service.update).toHaveBeenCalledWith(id, updateDto);
        expect(result).toEqual(updatedProduct);
    });
});

describe('remove', () => {
    it('should call productService.remove with id and return the result', async () => {
        const id = 'uuid1';
        
        mockProductService.remove.mockResolvedValue({ affected: 1 });

        const result = await controller.remove(id);

        expect(service.remove).toHaveBeenCalledWith(id);
        expect(result).toEqual({ affected: 1 });
    });
});


describe('Pipes', () => {
    it('ParseUUIDPipe should throw error for invalid UUID', async () => {
        const pipe = new ParseUUIDPipe();
        const metadata: ArgumentMetadata = { type: 'param', metatype: String, data: 'id' };
        await expect(pipe.transform('invalid-uuid', metadata)).rejects.toThrow();
        expect(() => pipe.transform('a1b2c3d4-e5f6-7890-1234-567890abcdef', metadata)).not.toThrow();
    });
});

});