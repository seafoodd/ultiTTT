import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsString, Length } from 'class-validator';

@ApiTags('Login')
export class LoginDto {
  @ApiProperty({
    example: 'user@example.com or username',
    description: 'User login identifier, can be an email or username',
  })
  @IsString()
  identifier: string;

  @ApiProperty({
    example: 'strongPassword123',
    description: 'User login identifier, can be an email or username',
  })
  @IsString()
  @Length(8)
  password: string;

  @ApiProperty({
    example: true,
    type: Boolean,
    description: 'User login identifier, can be an email or username',
  })
  @IsBoolean()
  rememberMe: boolean;
}
