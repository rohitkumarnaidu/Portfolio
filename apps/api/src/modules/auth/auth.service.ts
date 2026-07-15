import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import type { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import type { PrismaService } from '../../common/database/prisma.service';
import type { CacheService } from '../../common/cache/cache.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

const BCRYPT_ROUNDS = 12;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

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
    private readonly cache: CacheService,
  ) {}

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

  async login(dto: LoginDto) {
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
    const refresh_token = uuidv4();
    const tokenHash = hashToken(refresh_token);

    await this.cache.set(
      `session:${tokenHash}`,
      {
        userId: user.id,
        isRevoked: false,
      },
      SESSION_TTL_SECONDS,
    );

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

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new UnauthorizedException('Email already registered');

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        displayName: dto.display_name,
        passwordHash,
        isActive: true,
        roles: {
          create: {
            role: { connectOrCreate: { where: { name: 'editor' }, create: { name: 'editor' } } },
          },
        },
      },
      include: { roles: { include: { role: true } } },
    });

    const role = user.roles[0]?.role.name ?? 'editor';
    this.logger.log(`New user registered: ${user.email} (${role})`);
    return {
      id: user.id,
      email: user.email,
      display_name: user.displayName,
      role,
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
  ) {
    const email = profile.emails?.[0]?.value;
    if (!email) {
      throw new UnauthorizedException('Email is required from OAuth provider');
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          displayName: profile.displayName || profile.username || email.split('@')[0],
          avatarUrl: profile.photos?.[0]?.value,
          isActive: true,
          roles: {
            create: {
              role: { connectOrCreate: { where: { name: 'editor' }, create: { name: 'editor' } } },
            },
          },
        },
        include: { roles: { include: { role: true } } },
      });
      this.logger.log(`New user registered via ${provider} OAuth: ${user.email}`);
    }

    const role = user.roles[0]?.role.name ?? 'editor';
    const payload = { sub: user.id, email: user.email, role };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = uuidv4();
    const tokenHash = hashToken(refresh_token);

    await this.cache.set(
      `session:${tokenHash}`,
      {
        userId: user.id,
        isRevoked: false,
      },
      SESSION_TTL_SECONDS,
    );

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
    const session = await this.cache.get<{ userId: string; isRevoked: boolean }>(
      `session:${tokenHash}`,
    );
    if (!session || session.isRevoked) {
      this.logger.warn(`Invalid/expired refresh token used`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: session.userId },
      include: { roles: { include: { role: true } } },
    });
    if (!user) throw new UnauthorizedException('User not found');

    const role = user.roles[0]?.role.name ?? 'viewer';
    const payload = { sub: user.id, email: user.email, role };
    const new_access_token = this.jwtService.sign(payload);
    const new_refresh_token = uuidv4();
    const newTokenHash = hashToken(new_refresh_token);

    await this.cache.set(
      `session:${tokenHash}`,
      {
        ...session,
        isRevoked: true,
      },
      SESSION_TTL_SECONDS,
    );

    await this.cache.set(
      `session:${newTokenHash}`,
      {
        userId: user.id,
        isRevoked: false,
      },
      SESSION_TTL_SECONDS,
    );

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
    const session = await this.cache.get<{ userId: string; isRevoked: boolean }>(
      `session:${tokenHash}`,
    );
    if (session) {
      await this.cache.set(
        `session:${tokenHash}`,
        { ...session, isRevoked: true },
        SESSION_TTL_SECONDS,
      );
      this.logger.log(`User logged out: ${session.userId}`);
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
