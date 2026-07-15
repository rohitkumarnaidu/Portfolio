import { IsString, IsOptional, IsObject, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackEventDto {
  @ApiProperty({ example: 'page_view' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  eventName!: string;

  @ApiProperty({ example: '/projects' })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  pageUrl!: string;

  @ApiProperty({ example: 'sess_abc123' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  sessionId!: string;

  @ApiProperty({ example: 'vis_xyz789' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  visitorId!: string;

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
