import { IsString, IsBoolean, IsNumber, IsOptional, IsArray, Min, MaxLength, MinLength, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(200) title!: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(2000) description!: string;
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(50) icon!: string;
  @ApiProperty() @IsArray() @IsString({ each: true }) @ArrayMinSize(1) features!: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() pricingTier?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) priceCents?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(100) ctaText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) ctaUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) displayOrder?: number;
}
export class UpdateServiceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(200) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(10) @MaxLength(2000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(50) icon?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) features?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() pricingTier?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) priceCents?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(100) ctaText?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) ctaUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) displayOrder?: number;
}
