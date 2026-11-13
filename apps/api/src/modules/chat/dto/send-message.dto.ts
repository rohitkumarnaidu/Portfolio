import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: 'abc123-session' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  sessionId!: string;

  @ApiProperty({ example: 'Hello, I have a question about your services' })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;

  @ApiPropertyOptional({ example: '/services' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  pageContext?: string;
}
