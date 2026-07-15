import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsUrl,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTestimonialDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) name!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) role!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) company!: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() avatarUrl?: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(2000) content!: string;
  @ApiProperty() @IsNumber() @Min(1) @Max(5) rating!: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVerified?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVisible?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) displayOrder?: number;
}
export class UpdateTestimonialDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(100) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(100) role?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(100) company?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() avatarUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(10) @MaxLength(2000) content?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(5) rating?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVerified?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVisible?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) displayOrder?: number;
}
