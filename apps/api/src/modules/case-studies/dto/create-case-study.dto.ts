import { IsString, IsArray, IsObject, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCaseStudyDto {
  @ApiProperty({ example: 'clx...' })
  @IsString()
  @MinLength(1)
  projectId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  challenge?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  approach?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  solution?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  impact?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  architectureDiagrams?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  codeSnippets?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metrics?: Record<string, unknown>;
}

export class UpdateCaseStudyDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) projectId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) challenge?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) approach?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) solution?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) impact?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  architectureDiagrams?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) codeSnippets?: string[];
  @ApiPropertyOptional() @IsOptional() @IsObject() metrics?: Record<string, unknown>;
}
