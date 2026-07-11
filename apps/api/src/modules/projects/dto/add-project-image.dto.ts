import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddProjectImageDto {
  @ApiProperty({ description: 'Image URL' })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Accessibility alt text' })
  @IsString()
  @IsOptional()
  altText?: string;

  @ApiPropertyOptional({ default: 1, description: 'Display order' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  displayOrder?: number;
}
