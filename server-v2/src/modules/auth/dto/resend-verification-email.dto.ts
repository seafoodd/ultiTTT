import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

@ApiTags('ResendVerificationEmail')
export class ResendVerificationEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;
}
