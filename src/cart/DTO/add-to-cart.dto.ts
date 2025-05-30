import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({
    description: 'ID do produto a ser adicionado ao carrinho (UUID)',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Quantidade do produto a ser adicionada',
    example: 2,
    type: 'integer',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}