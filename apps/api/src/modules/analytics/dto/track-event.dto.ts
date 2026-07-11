import { IsString, IsOptional, IsObject, IsUrl, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackEventDto {
  @ApiProperty() @IsString() @MinLength(1) @MaxLength(100) eventName!: string;
  @ApiProperty() @IsString() @IsUrl() pageUrl!: string;
  @ApiProperty() @IsString() sessionId!: string;
  @ApiProperty() @IsString() visitorId!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() userAgent?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() properties?: Record<string, unknown>;
}
