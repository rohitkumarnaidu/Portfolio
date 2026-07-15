import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/database/prisma.service';

const mockUser: any = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  passwordHash: '$2b$12$hashedpassword',
  isActive: true,
  avatarUrl: null,
  roles: [{ role: { name: 'admin' } }],
  metadata: { failedLoginAttempts: 0, lockedUntil: null },
  createdAt: new Date(),
  updatedAt: new Date(),
  sessions: [],
  auditLogs: [],
  adminActivities: [],
  leadNotes: [],
  leadActivities: [],
  mediaAssets: [],
};

const mockPrisma = {
  user: {
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  userRole: {
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
  role: {
    upsert: jest.fn(),
  },
};

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('$2b$12$hashedpassword'),
}));

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUser]);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by role', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await service.findAll({ role: 'admin' });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ roles: { some: { role: { name: 'admin' } } } }),
        }),
      );
    });

    it('should search by email or display name', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await service.findAll({ search: 'test' });

      const callArg = mockPrisma.user.findMany.mock.calls[0][0];
      expect(callArg.where.OR).toBeDefined();
      expect(callArg.where.OR).toHaveLength(2);
    });

    it('should return empty when no users', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      const result = await service.findAll();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result).toEqual(mockUser);
    });

    it('should throw for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'test@example.com',
        displayName: 'Test User',
        password: 'password123',
      } as any);

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
            passwordHash: expect.any(String),
          }),
        }),
      );
    });

    it('should create user without password', async () => {
      mockPrisma.user.create.mockResolvedValue({ ...mockUser, passwordHash: null });

      const result = await service.create({
        email: 'test@example.com',
        displayName: 'Test User',
      } as any);

      expect(result).toBeDefined();
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            passwordHash: undefined,
            roles: expect.objectContaining({
              create: expect.objectContaining({
                role: expect.objectContaining({
                  connectOrCreate: expect.objectContaining({ where: { name: 'viewer' } }),
                }),
              }),
            }),
          }),
        }),
      );
    });
  });

  describe('update', () => {
    it('should update existing user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, displayName: 'Updated' });

      const result = await service.update('user-1', { displayName: 'Updated' } as any);

      expect(result.displayName).toBe('Updated');
    });

    it('should throw for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.update('nonexistent', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRole', () => {
    it('should update user role', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.userRole.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.role.upsert.mockResolvedValue({ id: 'role-2', name: 'editor' });
      mockPrisma.userRole.create.mockResolvedValue({ userId: 'user-1', roleId: 'role-2' });
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        roles: [{ role: { name: 'editor' } }],
      });

      const result: any = await service.updateRole('user-1', 'editor');

      expect(result.roles[0].role.name).toBe('editor');
    });

    it('should throw for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.updateRole('nonexistent', 'editor')).rejects.toThrow(NotFoundException);
    });
  });

  describe('unlock', () => {
    it('should unlock a locked user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        metadata: {
          ...mockUser.metadata,
          lockedUntil: new Date().toISOString(),
          failedLoginAttempts: 5,
        },
      });
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        metadata: { failedLoginAttempts: 0, lockedUntil: null },
      });

      const result: any = await service.unlock('user-1');

      expect(result.metadata.failedLoginAttempts).toBe(0);
      expect(result.metadata.lockedUntil).toBeNull();
    });

    it('should throw for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.unlock('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportData', () => {
    it('should export user data with relations', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.exportData('user-1');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('sessions');
      expect(result).toHaveProperty('auditLogs');
      expect(result).toHaveProperty('adminActivities');
      expect(result).toHaveProperty('mediaAssets');
      expect(result.user.email).toBe('test@example.com');
    });

    it('should throw for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.exportData('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('anonymize', () => {
    it('should anonymize user data', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        email: 'deleted-12345678@anonymous.com',
        displayName: 'Deleted User',
        isActive: false,
      });

      const result = await service.anonymize('user-1');

      expect(result.email).toContain('@anonymous.com');
      expect(result.displayName).toBe('Deleted User');
      expect(result.isActive).toBe(false);
    });

    it('should throw for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.anonymize('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete user by deactivating', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({ ...mockUser, isActive: false });

      const result = await service.delete('user-1');

      expect(result.isActive).toBe(false);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: { isActive: false },
        }),
      );
    });

    it('should throw for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('hardDelete', () => {
    it('should permanently delete a user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.delete.mockResolvedValue(mockUser);

      await service.hardDelete('user-1');

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });

    it('should throw for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.hardDelete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
