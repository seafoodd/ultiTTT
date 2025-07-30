import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    example: 'price_1RnjOAFpvYpqnz7jwhDM8CMB',
  })
  @IsString()
  priceId: string;

  @ApiProperty({
    example: 'https://ultittt.org/subscription-success',
  })
  @IsString()
  successUrl: string;

  @ApiProperty({
    example: 'https://ultittt.org/donate',
  })
  @IsString()
  cancelUrl: string;
}
