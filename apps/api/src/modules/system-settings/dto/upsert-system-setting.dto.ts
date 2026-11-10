import { IsString, IsOptional, IsIn, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpsertSystemSettingDto {
  // The canonical key comes from the `:key` route param. Kept optional so
  // clients that also send it in the body still validate.
  @ApiPropertyOptional({
    example: 'site_name',
    description: 'Optional; the `:key` route parameter takes precedence.',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  settingKey?: string;

  @ApiProperty({ example: 'My Portfolio' })
  @IsString()
  @MaxLength(5000)
  settingValue!: string;

  @ApiPropertyOptional({ example: 'general' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  settingGroup?: string;

  @ApiPropertyOptional({ example: 'The site name displayed in the browser tab' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: 'string' })
  @IsOptional()
  @IsString()
  @IsIn(['string', 'number', 'boolean', 'json'])
  dataType?: string;
}
