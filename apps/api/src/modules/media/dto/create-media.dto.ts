import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMediaDto {
  @ApiProperty() @IsString() fileName!: string;
  @ApiProperty() @IsString() filePath!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bucketName?: string;
  @ApiProperty() @IsString() mimeType!: string;
  @ApiProperty() @IsNumber() @Min(0) fileSizeBytes!: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() width?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() height?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() altText?: string;
}
