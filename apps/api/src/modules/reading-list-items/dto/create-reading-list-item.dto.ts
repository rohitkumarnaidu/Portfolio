import { IsString, IsOptional, IsUrl, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReadingListItemDto {
  @ApiProperty({ example: 'Clean Code' })
  @IsString() @MaxLength(300)
  title!: string;

  @ApiPropertyOptional({ example: 'Robert C. Martin' }) @IsOptional() @IsString() @MaxLength(200)
  author?: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl()
  url?: string;

  @ApiPropertyOptional() @IsOptional() @IsUrl()
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: 'books' }) @IsOptional() @IsString() @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: 'A must-read for every developer' }) @IsOptional() @IsString() @MaxLength(2000)
  recommendation?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0)
  displayOrder?: number;
}

export class UpdateReadingListItemDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(300) title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) author?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() url?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() coverImageUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(2000) recommendation?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) displayOrder?: number;
}
