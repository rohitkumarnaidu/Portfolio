import { PassportStrategy } from '@nestjs/passport';
import type { VerifyCallback } from 'passport-google-oauth20';
import { Strategy } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('app.GOOGLE_CLIENT_ID') || 'placeholder-id',
      clientSecret: configService.get<string>('app.GOOGLE_CLIENT_SECRET') || 'placeholder-secret',
      callbackURL:
        configService.get<string>('app.GOOGLE_CALLBACK_URL') ||
        'http://localhost:3001/api/admin/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Record<string, unknown>,
    done: VerifyCallback,
  ): Promise<void> {
    done(null, profile);
  }
}
