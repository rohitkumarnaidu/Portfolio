import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { CookieOptions } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from '../../modules/auth/auth.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { Public } from '../../modules/auth/public.decorator';
import { CurrentUser } from '../../modules/auth/current-user.decorator';
import { Raw } from '../../common/decorators/raw.decorator';
import { LoginDto } from '../../modules/auth/dto/login.dto';
import { RefreshTokenDto } from '../../modules/auth/dto/refresh-token.dto';

const ACCESS_COOKIE = 'admin_token';
const REFRESH_COOKIE = 'admin_refresh';
const ACCESS_COOKIE_PATH = '/api';
const REFRESH_COOKIE_PATH = '/api/admin/auth';
const ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

interface OAuthProfile {
  emails?: { value: string }[];
  displayName?: string;
  username?: string;
  photos?: { value: string }[];
}

@ApiTags('Admin - Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private cookieOptions(maxAge: number): CookieOptions {
    const domain = this.config.get<string>('app.COOKIE_DOMAIN');
    return {
      httpOnly: true,
      secure: this.config.get<boolean>('app.COOKIE_SECURE') ?? false,
      sameSite: 'lax',
      path: ACCESS_COOKIE_PATH,
      maxAge,
      ...(domain ? { domain } : {}),
    };
  }

  private setSessionCookies(
    res: Response,
    tokens: { access_token: string; refresh_token: string },
  ) {
    res.cookie(ACCESS_COOKIE, tokens.access_token, this.cookieOptions(ACCESS_MAX_AGE_MS));
    res.cookie(REFRESH_COOKIE, tokens.refresh_token, {
      ...this.cookieOptions(REFRESH_MAX_AGE_MS),
      path: REFRESH_COOKIE_PATH,
    });
  }

  private clearSessionCookies(res: Response) {
    const base = { ...this.cookieOptions(0) };
    res.clearCookie(ACCESS_COOKIE, { ...base, path: ACCESS_COOKIE_PATH });
    // Clear both the current and the legacy refresh-cookie path.
    res.clearCookie(REFRESH_COOKIE, { ...base, path: REFRESH_COOKIE_PATH });
    res.clearCookie(REFRESH_COOKIE, { ...base, path: '/api/auth/refresh' });
  }

  private adminAppUrl(): string {
    return (this.config.get<string>('app.ADMIN_APP_URL') || 'http://localhost:3000').replace(
      /\/$/,
      '',
    );
  }

  private sessionContext(req: Request) {
    return {
      userAgent: req.get('user-agent') ?? undefined,
      ipAddress: req.ip,
    };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.auth.login(dto, this.sessionContext(req));
    this.setSessionCookies(res, tokens);
    return { data: tokens };
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using the refresh cookie or request body' })
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = dto?.refreshToken || req.cookies?.[REFRESH_COOKIE];
    if (!refreshToken) throw new UnauthorizedException('Missing refresh token');
    const tokens = await this.auth.refresh(refreshToken);
    this.setSessionCookies(res, tokens);
    return { data: tokens };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and invalidate the refresh token' })
  async logout(
    @Body() dto: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = dto?.refreshToken || req.cookies?.[REFRESH_COOKIE];
    if (refreshToken) {
      await this.auth.logout(refreshToken);
    }
    this.clearSessionCookies(res);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current admin user' })
  async profile(@CurrentUser() user: { id: string }) {
    const profile = await this.auth.getProfile(user.id);
    if (!profile) throw new UnauthorizedException('User not found');
    return { data: profile };
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google OAuth' })
  async googleAuth() {
    // Initiates the Google OAuth flow
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Raw()
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req.user as OAuthProfile | undefined, res, 'google', req);
  }

  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  @ApiOperation({ summary: 'Login with GitHub OAuth' })
  async githubAuth() {
    // Initiates the GitHub OAuth flow
  }

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  @Raw()
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req.user as OAuthProfile | undefined, res, 'github', req);
  }

  private async handleOAuthCallback(
    profile: OAuthProfile | undefined,
    res: Response,
    provider: 'google' | 'github',
    req: Request,
  ) {
    if (!profile) {
      res.redirect(`${this.adminAppUrl()}/admin/login?error=oauth_failed`);
      return;
    }
    try {
      const tokens = await this.auth.validateOAuthLogin(
        profile,
        provider,
        this.sessionContext(req),
      );
      this.setSessionCookies(res, tokens);
      res.redirect(`${this.adminAppUrl()}/admin`);
    } catch {
      res.redirect(`${this.adminAppUrl()}/admin/login?error=oauth_not_allowed`);
    }
  }
}
