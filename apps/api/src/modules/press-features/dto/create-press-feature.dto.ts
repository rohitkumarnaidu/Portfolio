import { IsString, IsOptional, IsUrl, IsNumber, IsDateString, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePressFeatureDto {
  @ApiProperty({ example: 'TechCrunch' })
  @IsString() @MaxLength(200)
  publication!: string;

  @ApiProperty({ example: 'Startup Raises $10M' })
  @IsString() @MaxLength(300)
  title!: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl()
  url?: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional() @IsOptional() @IsDateString()
  featuredDate?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0)
  displayOrder?: number;
}

export class UpdatePressFeatureDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) publication?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() url?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() logoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() featuredDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) displayOrder?: number;
}
