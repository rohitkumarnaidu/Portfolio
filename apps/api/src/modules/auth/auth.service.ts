import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../common/database/prisma.service';
import { LoginDto } from './dto/login.dto';

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export interface SessionContext {
  userAgent?: string;
  ipAddress?: string;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Persists a refresh session and returns the opaque refresh token.
   * Only the SHA-256 hash is stored so a database leak cannot mint tokens.
   */
  private async createSession(userId: string, context?: SessionContext): Promise<string> {
    const refreshToken = uuidv4();
    await this.prisma.session.create({
      data: {
        userId,
        refreshToken: hashToken(refreshToken),
        userAgent: context?.userAgent ?? null,
        ipAddress: context?.ipAddress ?? null,
        expiresAt: new Date(Date.now() + SESSION_TTL_SECONDS * 1000),
      },
    });
    return refreshToken;
  }

  private get lockoutThreshold(): number {
    return this.configService.get<number>('app.LOCKOUT_THRESHOLD') ?? 5;
  }

  private get lockoutDurationMs(): number {
    return this.configService.get<number>('app.LOCKOUT_DURATION_MS') ?? 15 * 60 * 1000;
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return null;
    const passwordValid = await bcrypt.compare(password, user.passwordHash ?? '');
    if (!passwordValid) return null;
    const role = user.roles[0]?.role.name ?? 'viewer';
    return { id: user.id, email: user.email, role, displayName: user.displayName };
  }

  async login(dto: LoginDto, context?: SessionContext) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: { include: { role: true } } },
    });
    if (!user) {
      this.logger.warn(`Failed login attempt for unknown email: ${dto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      this.logger.warn(`Login attempt for inactive account: ${dto.email}`);
      throw new UnauthorizedException('Account is deactivated');
    }

    const meta = (user.metadata ?? {}) as Record<string, unknown>;
    const lockedUntil = meta.lockedUntil ? new Date(meta.lockedUntil as string) : null;
    if (lockedUntil && lockedUntil > new Date()) {
      const remainingMs = lockedUntil.getTime() - Date.now();
      this.logger.warn(`Login attempt for locked account: ${dto.email}`);
      throw new UnauthorizedException(
        `Account is locked. Try again in ${Math.ceil(remainingMs / 60000)} minutes`,
      );
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash ?? '');
    if (!passwordValid) {
      const attempts = ((meta.failedLoginAttempts as number) ?? 0) + 1;
      const newMeta: Record<string, unknown> = { ...meta, failedLoginAttempts: attempts };
      if (attempts >= this.lockoutThreshold) {
        newMeta.lockedUntil = new Date(Date.now() + this.lockoutDurationMs).toISOString();
        newMeta.failedLoginAttempts = 0;
        this.logger.warn(`Account locked due to ${attempts} failed attempts: ${dto.email}`);
      } else {
        this.logger.warn(
          `Failed login attempt ${attempts}/${this.lockoutThreshold} for: ${dto.email}`,
        );
      }
      await this.prisma.user.update({ where: { id: user.id }, data: { metadata: newMeta as any } }); // eslint-disable-line @typescript-eslint/no-explicit-any
      throw new UnauthorizedException('Invalid email or password');
    }

    if (((meta.failedLoginAttempts as number) ?? 0) > 0 || lockedUntil) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { metadata: { failedLoginAttempts: 0, lockedUntil: null } },
      });
    }

    const role = user.roles[0]?.role.name ?? 'viewer';
    const payload = { sub: user.id, email: user.email, role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = await this.createSession(user.id, context);

    this.logger.log(`Successful login: ${user.email} (${role})`);
    return {
      access_token,
      refresh_token,
      expires_in: 900,
      token_type: 'Bearer' as const,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.displayName,
        role,
      },
    };
  }

  async validateOAuthLogin(
    profile: {
      emails?: { value: string }[];
      displayName?: string;
      username?: string;
      photos?: { value: string }[];
    },
    provider: 'google' | 'github',
    context?: SessionContext,
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Email is required from OAuth provider');
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    // Admin accounts are provisioned explicitly by an administrator.
    // OAuth proves identity; it must never create access.
    if (!user) {
      this.logger.warn(`OAuth login rejected for unprovisioned email via ${provider}: ${email}`);
      throw new UnauthorizedException('No admin account exists for this email address');
    }
    if (!user.isActive) {
      this.logger.warn(`OAuth login rejected for inactive account via ${provider}: ${email}`);
      throw new UnauthorizedException('Account is deactivated');
    }

    const role = user.roles[0]?.role.name ?? 'viewer';
    const payload = { sub: user.id, email: user.email, role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = await this.createSession(user.id, context);

    return {
      access_token,
      refresh_token,
      expires_in: 900,
      token_type: 'Bearer' as const,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.displayName,
        role,
      },
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const session = await this.prisma.session.findUnique({
      where: { refreshToken: tokenHash },
    });
    if (!session || session.isRevoked || session.expiresAt <= new Date()) {
      this.logger.warn(`Invalid/expired refresh token used`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new UnauthorizedException('User not found');

    // Conditional update makes rotation single-use even under concurrent refreshes.
    const revoked = await this.prisma.session.updateMany({
      where: { id: session.id, isRevoked: false },
      data: { isRevoked: true },
    });
    if (revoked.count === 0) {
      this.logger.warn(`Refresh token already rotated`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const role = user.roles[0]?.role.name ?? 'viewer';
    const payload = { sub: user.id, email: user.email, role };
    const new_access_token = this.jwtService.sign(payload);
    const new_refresh_token = await this.createSession(user.id, {
      userAgent: session.userAgent ?? undefined,
      ipAddress: session.ipAddress ?? undefined,
    });

    this.logger.log(`Token refreshed for: ${user.email}`);
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token,
      expires_in: 900,
      token_type: 'Bearer' as const,
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const { count } = await this.prisma.session.updateMany({
      where: { refreshToken: tokenHash, isRevoked: false },
      data: { isRevoked: true },
    });
    if (count > 0) {
      this.logger.log(`Refresh session revoked`);
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) return null;
    const role = user.roles[0]?.role.name ?? 'viewer';
    return {
      id: user.id,
      email: user.email,
      display_name: user.displayName,
      role,
      avatar_url: user.avatarUrl,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }
}
