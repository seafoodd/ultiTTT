import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({
    example: 'price_1RnjOAFpvYpqnz7jwhDM8CMB',
  })
  @IsString()
  priceId: string;
}
