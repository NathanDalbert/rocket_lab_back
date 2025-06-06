import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Product } from '../product/product-entity/product.entity';
import { CreateProductDto } from './DTO/create-product.dto';
import { UpdateProductDto } from './DTO/update-product.dto';
import { ProductService } from './product.service';

@ApiTags('products') 
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo produto' }) 
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'O produto foi criado com sucesso.', type: Product })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados de entrada inválidos.' })
  @HttpCode(HttpStatus.CREATED)

  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de produtos retornada com sucesso.', type: [Product] })
  findAll(): Promise<Product[]> {
    return this.productService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um produto específico pelo ID' })
  @ApiParam({ name: 'id', description: 'ID do produto (UUID)', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Produto encontrado.', type: Product })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Produto não encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Product> {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um produto existente' })
  @ApiParam({ name: 'id', description: 'ID do produto a ser atualizado (UUID)', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Produto atualizado com sucesso.', type: Product })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Produto não encontrado para atualização.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados de entrada inválidos para atualização.' })
 
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um produto' })
  @ApiParam({ name: 'id', description: 'ID do produto a ser removido (UUID)', type: 'string', format: 'uuid' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Produto removido com sucesso.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Produto não encontrado para remoção.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.productService.remove(id);
  }
}