import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsBoolean,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty() @IsEmail() email!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) displayName!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(8) password?: string;
  @ApiPropertyOptional({ enum: ['admin', 'editor', 'viewer'] })
  @IsOptional()
  @IsEnum(['admin', 'editor', 'viewer'])
  role?: 'admin' | 'editor' | 'viewer';
}

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional({ enum: ['admin', 'editor', 'viewer'] })
  @IsOptional()
  @IsEnum(['admin', 'editor', 'viewer'])
  role?: 'admin' | 'editor' | 'viewer';
}

export class UpdateUserRoleDto {
  @ApiProperty({ enum: ['admin', 'editor', 'viewer'] })
  @IsEnum(['admin', 'editor', 'viewer'])
  role!: 'admin' | 'editor' | 'viewer';
}
