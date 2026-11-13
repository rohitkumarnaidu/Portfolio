import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLeadDto {
  @ApiPropertyOptional({
    enum: ['new', 'read', 'replied', 'converted', 'archived'],
    description: 'Lead status',
  })
  @IsEnum(['new', 'read', 'replied', 'converted', 'archived'])
  @IsOptional()
  status?: 'new' | 'read' | 'replied' | 'converted' | 'archived';

  @ApiPropertyOptional({ enum: ['low', 'normal', 'high', 'urgent'], description: 'Lead priority' })
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  @IsOptional()
  priority?: 'low' | 'normal' | 'high' | 'urgent';

  @ApiPropertyOptional({ description: 'Internal note content' })
  @IsString()
  @IsOptional()
  note?: string;
}
