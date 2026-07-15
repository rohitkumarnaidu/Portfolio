import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('app.GITHUB_CLIENT_ID') || 'placeholder-id',
      clientSecret: configService.get<string>('app.GITHUB_CLIENT_SECRET') || 'placeholder-secret',
      callbackURL:
        configService.get<string>('app.GITHUB_CALLBACK_URL') ||
        'http://localhost:3001/api/admin/auth/github/callback',
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: Record<string, unknown>,
    done: (err: Error | null, user: Record<string, unknown>) => void,
  ): Promise<void> {
    done(null, profile);
  }
}
