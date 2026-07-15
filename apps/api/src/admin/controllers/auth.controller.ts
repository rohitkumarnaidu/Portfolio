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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import type { AuthService } from '../../modules/auth/auth.service';
import { Public } from '../../modules/auth/public.decorator';
import { CurrentUser } from '../../modules/auth/current-user.decorator';
import type { LoginDto } from '../../modules/auth/dto/login.dto';
import type { RegisterDto } from '../../modules/auth/dto/register.dto';
import type { RefreshTokenDto } from '../../modules/auth/dto/refresh-token.dto';

@ApiTags('Admin - Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.login(dto);
    res.cookie('admin_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api',
      maxAge: 900000,
    });
    res.cookie('admin_refresh', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { data: tokens };
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 900000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    return { data: await this.auth.register(dto) };
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.auth.refresh(dto.refresh_token);
    res.cookie('admin_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api',
      maxAge: 900000,
    });
    res.cookie('admin_refresh', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { data: tokens };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(
    @Body() dto: RefreshTokenDto,
    @CurrentUser() _user: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (dto?.refresh_token) {
      await this.auth.logout(dto.refresh_token);
    }
    res.clearCookie('admin_token', { path: '/api' });
    res.clearCookie('admin_refresh', { path: '/api/auth/refresh' });
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
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (!req.user) throw new UnauthorizedException();
    const tokens = await this.auth.validateOAuthLogin(
      req.user as {
        emails?: { value: string }[];
        displayName?: string;
        username?: string;
        photos?: { value: string }[];
      },
      'google',
    );
    res.cookie('admin_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api',
      maxAge: 900000,
    });
    res.cookie('admin_refresh', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { data: tokens };
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
  @ApiOperation({ summary: 'GitHub OAuth callback' })
  async githubAuthCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (!req.user) throw new UnauthorizedException();
    const tokens = await this.auth.validateOAuthLogin(
      req.user as {
        emails?: { value: string }[];
        displayName?: string;
        username?: string;
        photos?: { value: string }[];
      },
      'github',
    );
    res.cookie('admin_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api',
      maxAge: 900000,
    });
    res.cookie('admin_refresh', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { data: tokens };
  }
}
