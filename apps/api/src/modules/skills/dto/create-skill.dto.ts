import { IsString, IsBoolean, IsNumber, IsOptional, IsUrl, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty({ example: 'React' })
  @IsString() @MinLength(1) @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'frontend' })
  @IsString() @MinLength(2) @MaxLength(50)
  category!: string;

  @ApiProperty({ example: 95 })
  @IsNumber() @Min(0) @Max(100)
  proficiency!: number;

  @ApiPropertyOptional() @IsOptional() @IsUrl()
  iconUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl()
  lottieUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({ default: false }) @IsOptional() @IsBoolean()
  isFeatured?: boolean;
}

export class UpdateSkillDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) @MaxLength(100) name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(50) category?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) @Max(100) proficiency?: number;
  @ApiPropertyOptional() @IsOptional() @IsUrl() iconUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() lottieUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) displayOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isFeatured?: boolean;
}
