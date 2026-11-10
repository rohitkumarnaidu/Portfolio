import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiPropertyOptional({
    description:
      'Refresh token. Omit when the httpOnly admin_refresh cookie is present (the default for browser clients).',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
