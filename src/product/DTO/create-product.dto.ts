import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Importe
import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'O nome do produto',
    example: 'Smartphone XYZ',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ 
    description: 'Uma descrição detalhada do produto',
    example: 'Um smartphone com câmera de alta resolução e bateria de longa duração.',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'O preço do produto',
    example: 1999.99,
    type: 'number',
    format: 'float', 
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'A quantidade em estoque do produto',
    example: 150,
    type: 'integer',
    minimum: 0,
  })
  @IsNumber()

 
  @IsPositive() 
  stockQuantity: number;
}