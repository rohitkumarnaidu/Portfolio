import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  IsUrl,
  Min,
  MaxLength,
  MinLength,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlogPostDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(200) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) slug?: string;
  @ApiProperty() @IsString() @MaxLength(500) excerpt!: string;
  @ApiProperty() @IsString() @MinLength(10) content!: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() coverImage?: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(50) category!: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) readTimeMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() publishedAt?: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) authorName!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoDescription?: string;
}

export class UpdateBlogPostDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(200) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) slug?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) excerpt?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(10) content?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() coverImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(50) category?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) readTimeMinutes?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPublished?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() publishedAt?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  authorName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoTitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() seoDescription?: string;
}
