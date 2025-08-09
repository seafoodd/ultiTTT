import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({
    example: 'supporter_monthly',
  })
  @IsString()
  priceName: string;
}
