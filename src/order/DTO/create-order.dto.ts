import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({
    example: '0b23fba7-d7f9-4e76-8cc0-4d03b1e22f7a',
    description: 'ID do carrinho a partir do qual o pedido será criado'
  })
  @IsNotEmpty()
  @IsUUID()
  cartId: string;

  @ApiProperty({
    example: 'Rua das Laranjeiras, 123 - Salvador/BA',
    description: 'Endereço de entrega',
    required: false
  })
  @IsString()
  @IsOptional()
  shippingAddress?: string;
}
