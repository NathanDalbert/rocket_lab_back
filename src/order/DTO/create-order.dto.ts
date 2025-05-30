// src/order/dto/create-order.dto.ts
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsUUID()
  cartId: string;

  // Adicione outros campos necessários, como informações de pagamento, endereço, etc.
  // @IsString()
  // @IsOptional()
  // paymentMethodId?: string; // Exemplo

  @IsString()
  @IsOptional()
  shippingAddress?: string;
}