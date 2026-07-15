import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../../common/database/prisma.service';
import { CacheService } from '../../common/cache/cache.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$12$hashedpassword'),
  compare: jest.fn().mockImplementation(async (_plain: string, _hash: string) => {
    return _plain === 'correct';
  }),
}));

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  passwordHash: '$2b$12$hashedpassword',
  roles: [{ role: { name: 'admin' } }],
  isActive: true,
  avatarUrl: null,
  metadata: { failedLoginAttempts: 0, lockedUntil: null },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('mock-access-token'),
};

const mockConfig = {
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'app.LOCKOUT_THRESHOLD') return 5;
    if (key === 'app.LOCKOUT_DURATION_MS') return 15 * 60 * 1000;
    return 'test';
  }),
};

const mockCache = {
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue(undefined),
  del: jest.fn().mockResolvedValue(undefined),
  delPattern: jest.fn().mockResolvedValue(undefined),
  getOrSet: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
        { provide: CacheService, useValue: mockCache },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await service.login({ email: mockUser.email, password: 'correct' });

      expect(result).toHaveProperty('access_token', 'mock-access-token');
      expect(result).toHaveProperty('refresh_token');
      expect(result.user.email).toBe(mockUser.email);
      expect(mockJwt.sign).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'unknown@test.com', password: 'x' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for inactive account', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

      await expect(service.login({ email: mockUser.email, password: 'x' })).rejects.toThrow(
        'Account is deactivated',
      );
    });

    it('should throw UnauthorizedException for locked account', async () => {
      const futureLock = new Date(Date.now() + 10 * 60 * 1000);
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        metadata: { ...mockUser.metadata, lockedUntil: futureLock },
      });

      await expect(service.login({ email: mockUser.email, password: 'x' })).rejects.toThrow(
        /Account is locked/,
      );
    });

    it('should increment failed attempts on wrong password', async () => {
      const userWithAttempts = {
        ...mockUser,
        metadata: { ...mockUser.metadata, failedLoginAttempts: 2 },
      };
      mockPrisma.user.findUnique.mockResolvedValue(userWithAttempts);
      mockPrisma.user.update.mockResolvedValue({
        ...userWithAttempts,
        metadata: { ...userWithAttempts.metadata, failedLoginAttempts: 3 },
      });

      await expect(service.login({ email: mockUser.email, password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({
            metadata: expect.objectContaining({ failedLoginAttempts: 3 }),
          }),
        }),
      );
    });

    it('should lock account after reaching threshold', async () => {
      const nearLimit = { ...mockUser, metadata: { ...mockUser.metadata, failedLoginAttempts: 5 } };
      mockPrisma.user.findUnique.mockResolvedValue(nearLimit);
      mockPrisma.user.update.mockResolvedValue({
        ...nearLimit,
        metadata: {
          ...nearLimit.metadata,
          failedLoginAttempts: 0,
          lockedUntil: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        },
      });

      await expect(service.login({ email: mockUser.email, password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({
            metadata: expect.objectContaining({ lockedUntil: expect.any(String) }),
          }),
        }),
      );
    });

    it('should reset failed attempts on successful login', async () => {
      const userWithAttempts = {
        ...mockUser,
        metadata: { ...mockUser.metadata, failedLoginAttempts: 3 },
      };
      mockPrisma.user.findUnique.mockResolvedValue(userWithAttempts);
      mockPrisma.user.update.mockResolvedValue({
        ...userWithAttempts,
        metadata: { failedLoginAttempts: 0, lockedUntil: null },
      });

      const result = await service.login({ email: mockUser.email, password: 'correct' });

      expect(result).toHaveProperty('access_token');
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({
            metadata: { failedLoginAttempts: 0, lockedUntil: null },
          }),
        }),
      );
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        ...mockUser,
        email: 'new@test.com',
        displayName: 'New User',
        roles: [{ role: { name: 'editor' } }],
      });

      const result = await service.register({
        email: 'new@test.com',
        password: 'password123',
        display_name: 'New User',
      });

      expect(result.email).toBe('new@test.com');
      expect(result.role).toBe('editor');
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ email: 'new@test.com' }) }),
      );
    });

    it('should throw for duplicate email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: mockUser.email,
          password: 'password123',
          display_name: 'Test',
        }),
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('refresh', () => {
    it('should rotate tokens on valid refresh token', async () => {
      mockCache.get.mockResolvedValue({ userId: mockUser.id, isRevoked: false });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refresh('valid-refresh-token');

      expect(result).toHaveProperty('access_token', 'mock-access-token');
      expect(result).toHaveProperty('refresh_token');
      expect(mockCache.get).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledTimes(2);
    });

    it('should throw for invalid refresh token', async () => {
      mockCache.get.mockResolvedValue(null);

      await expect(service.refresh('invalid-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw for revoked token', async () => {
      mockCache.get.mockResolvedValue({ userId: mockUser.id, isRevoked: true });

      await expect(service.refresh('revoked-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should revoke session', async () => {
      mockCache.get.mockResolvedValue({ userId: mockUser.id, isRevoked: false });

      await service.logout('some-token');

      expect(mockCache.set).toHaveBeenCalledWith(
        expect.stringContaining('session:'),
        expect.objectContaining({ isRevoked: true }),
        expect.any(Number),
      );
    });

    it('should not throw if session not found', async () => {
      mockCache.get.mockResolvedValue(null);

      await expect(service.logout('unknown-token')).resolves.toBeUndefined();
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password hash', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser.id);

      expect(result).toHaveProperty('email', mockUser.email);
      expect(result).toHaveProperty('display_name', mockUser.displayName);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return null for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getProfile('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('validateUser', () => {
    it('should return user object on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(mockUser.email, 'correct');

      expect(result).toHaveProperty('id', mockUser.id);
      expect(result).toHaveProperty('email', mockUser.email);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return null for unknown email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser('unknown@test.com', 'x');
      expect(result).toBeNull();
    });
  });
});
