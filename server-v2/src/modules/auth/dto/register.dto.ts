import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail(undefined, { message: 'Invalid email' })
  email: string;

  @ApiProperty({ example: 'username123' })
  @IsString()
  @Length(3, 24)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsString()
  @Length(8)
  password: string;
}
