import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateDonationDto {
  @ApiProperty({
    example: 123,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    example: 'currency',
  })
  @IsString()
  currency: string;

  @ApiProperty({
    example: 'paymentMethodId',
  })
  @IsString()
  paymentMethodId: string;
}
