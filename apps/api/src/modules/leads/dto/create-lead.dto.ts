import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(100) name!: string;
  @ApiProperty() @IsEmail() email!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) company?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) subject?: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(5000) message!: string;
  @ApiPropertyOptional({ enum: ['contact_form', 'ai_chat', 'referral', 'direct'] })
  @IsOptional()
  @IsEnum(['contact_form', 'ai_chat', 'referral', 'direct'])
  source?: string;
  @ApiPropertyOptional() @IsOptional() @IsObject() metadata?: Record<string, unknown>;
  @ApiPropertyOptional() @IsOptional() @IsString() ipAddress?: string;
}

export class UpdateLeadDto {
  @ApiPropertyOptional({ enum: ['new', 'read', 'replied', 'converted', 'archived'] })
  @IsOptional()
  @IsEnum(['new', 'read', 'replied', 'converted', 'archived'])
  status?: string;
  @ApiPropertyOptional({ enum: ['low', 'normal', 'high', 'urgent'] })
  @IsOptional()
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  priority?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() ipAddress?: string;
}
