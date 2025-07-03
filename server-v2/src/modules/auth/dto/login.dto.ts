import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  identifier: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsString()
  @Length(8)
  password: string;

  @ApiProperty({ example: 'true' })
  rememberMe: boolean;
}
