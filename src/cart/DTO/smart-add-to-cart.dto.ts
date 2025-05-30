import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsUUID, Min } from 'class-validator';

export class SmartAddToCartDto {
  @ApiPropertyOptional({
    description: 'ID do carrinho existente (UUID). Se não fornecido, um novo carrinho será criado.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  cartId?: string;

  @ApiProperty({
    description: 'ID do produto a ser adicionado (UUID)',
    example: 'b1c2d3e4-f5g6-7890-1234-567890abcdef',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Quantidade do produto a ser adicionada',
    example: 1,
    type: 'integer',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}