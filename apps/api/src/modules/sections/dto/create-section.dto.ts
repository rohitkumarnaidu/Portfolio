import { IsString, IsBoolean, IsNumber, IsOptional, IsObject, Min, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ example: 'hero' })
  @IsString() @MinLength(2) @MaxLength(100)
  sectionKey!: string;

  @ApiProperty({ example: 'Hero Section' })
  @IsString() @MinLength(2) @MaxLength(200)
  sectionLabel!: string;

  @ApiPropertyOptional({ example: 'hero' })
  @IsOptional() @IsString() @MaxLength(50)
  sectionType?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isLive?: boolean;

  @ApiPropertyOptional({ default: 'default' })
  @IsOptional() @IsString() @MaxLength(50)
  stylePreset?: string;

  @ApiPropertyOptional()
  @IsOptional() @IsNumber() @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @IsNumber() @Min(1)
  minItems?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  autoPublish?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isAlwaysVisible?: boolean;

  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  styleConfig?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional() @IsObject()
  content?: Record<string, unknown>;
}

export class UpdateSectionDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(100) sectionKey?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(200) sectionLabel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) sectionType?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isLive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50) stylePreset?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) displayOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) minItems?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() autoPublish?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isAlwaysVisible?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsObject() styleConfig?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsObject() content?: Record<string, unknown>;
}
