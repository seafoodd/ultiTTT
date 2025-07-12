import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsString, Length } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  identifier: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsString()
  @Length(8)
  password: string;

  @ApiProperty({ example: 'true' })
  @IsBoolean()
  rememberMe: boolean;
}
