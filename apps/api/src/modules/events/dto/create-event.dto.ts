import { IsString, IsOptional, IsObject, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'page_view' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  eventName!: string;

  @ApiPropertyOptional({ example: '/projects' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  pageUrl?: string;

  @ApiPropertyOptional({ example: 'sess_abc123' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  sessionId?: string;

  @ApiPropertyOptional({ example: 'vis_xyz789' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  visitorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;
}
