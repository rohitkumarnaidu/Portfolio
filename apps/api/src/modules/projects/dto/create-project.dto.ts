import { IsString, IsBoolean, IsNumber, IsOptional, IsArray, IsEnum, IsUrl, Min, MaxLength, MinLength, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'E-Commerce Platform' })
  @IsString() @MinLength(2) @MaxLength(200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional() @IsString() @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({ example: 'A full-featured e-commerce platform...' })
  @IsOptional() @IsString() @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsArray() @IsString({ each: true }) @ArrayMinSize(1)
  techStack?: string[];

  @ApiPropertyOptional()
  @IsOptional() @IsUrl()
  liveUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUrl()
  githubUrl?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUrl()
  coverImage?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isPrivate?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsString()
  ndaPassword?: string;

  @ApiPropertyOptional({ enum: ['web', 'mobile', 'ai', 'devops', 'design', 'other'] })
  @IsOptional() @IsEnum(['web', 'mobile', 'ai', 'devops', 'design', 'other'])
  category?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber() @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  content?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  metrics?: Record<string, unknown>;
}

export class UpdateProjectDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(200) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) slug?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) techStack?: string[];
  @ApiPropertyOptional() @IsOptional() @IsUrl() liveUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() githubUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() coverImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() thumbnailUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPrivate?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() ndaPassword?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['web', 'mobile', 'ai', 'devops', 'design', 'other']) category?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) displayOrder?: number;
  @ApiPropertyOptional() @IsOptional() content?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() metrics?: Record<string, unknown>;
}
