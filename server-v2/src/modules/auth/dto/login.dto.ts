import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com or username',
  })
  @IsString()
  identifier: string;

  @ApiProperty({
    example: 'strongPassword123',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: true,
    type: Boolean,
  })
  @IsBoolean()
  rememberMe: boolean;
}
