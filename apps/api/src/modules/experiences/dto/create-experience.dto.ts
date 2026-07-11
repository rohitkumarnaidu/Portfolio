import { IsString, IsBoolean, IsNumber, IsOptional, IsArray, IsUrl, IsDateString, Min, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExperienceDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(200) role!: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(200) company!: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() companyLogoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() companyUrl?: string;
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(200) location!: string;
  @ApiProperty() @IsString() @IsDateString() startDate!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsDateString() endDate?: string;
  @ApiProperty() @IsString() @MaxLength(2000) description!: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) technologies?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isCurrent?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) displayOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVisible?: boolean;
}

export class UpdateExperienceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(200) role?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(200) company?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() companyLogoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() companyUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) @MaxLength(200) location?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) technologies?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isCurrent?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) displayOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isVisible?: boolean;
}
