import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@portfolio.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '***REDACTED***' })
  @IsString()
  @MinLength(8)
  password!: string;
}

