import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { PrismaService } from '../../common/database/prisma.service';
import type { PaginationOpts, PaginatedResult } from '../../common/database/pagination.helper';
import { paginateQuery } from '../../common/database/pagination.helper';
import type { CreateUserDto, UpdateUserDto } from './dto';

const BCRYPT_ROUNDS = 12;
const SORT_FIELDS = ['createdAt', 'email', 'displayName'];

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts?: PaginationOpts & { search?: string; role?: string }): Promise<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PaginatedResult<any>
  > {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (opts?.search) {
      where.OR = [
        { email: { contains: opts.search, mode: 'insensitive' } },
        { displayName: { contains: opts.search, mode: 'insensitive' } },
      ];
    }
    if (opts?.role) where.roles = { some: { role: { name: opts.role } } };
    const orderBy =
      opts?.sortBy && SORT_FIELDS.includes(opts.sortBy)
        ? { [opts.sortBy]: opts.sortOrder ?? 'asc' }
        : { createdAt: 'desc' as const };
    return paginateQuery(
      (args) => this.prisma.user.findMany({ where, orderBy, ...args }),
      () => this.prisma.user.count({ where }),
      opts,
    );
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto) {
    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    }
    const roleName = dto.role ?? 'viewer';
    return this.prisma.user.create({
      data: {
        email: dto.email,
        displayName: dto.displayName,
        passwordHash,
        isActive: true,
        roles: {
          create: {
            role: { connectOrCreate: { where: { name: roleName }, create: { name: roleName } } },
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.user.update({ where: { id }, data: dto as any });
  }

  async updateRole(id: string, roleName: 'admin' | 'editor' | 'viewer') {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    await this.prisma.userRole.deleteMany({ where: { userId: id } });
    const role = await this.prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
    await this.prisma.userRole.create({ data: { userId: id, roleId: role.id } });
    return this.prisma.user.findUnique({
      where: { id },
      include: { roles: { include: { role: true } } },
    });
  }

  async unlock(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { metadata: { failedLoginAttempts: 0, lockedUntil: null } },
    });
  }

  async exportData(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: { include: { role: true } },
        sessions: { where: { isRevoked: false } },
        auditLogs: { take: 100, orderBy: { createdAt: 'desc' } },
        adminActivities: { take: 100, orderBy: { createdAt: 'desc' } },
        leadNotes: true,
        leadActivities: true,
        mediaAssets: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.roles[0]?.role.name ?? 'viewer',
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      sessions: user.sessions.map(
        (s: { id: string; createdAt: Date; expiresAt: Date | null; ipAddress: string | null }) => ({
          id: s.id,
          createdAt: s.createdAt,
          expiresAt: s.expiresAt,
          ipAddress: s.ipAddress,
        }),
      ),
      auditLogs: user.auditLogs,
      adminActivities: user.adminActivities,
      mediaAssets: user.mediaAssets,
    };
  }

  async anonymize(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: {
        email: `deleted-${id.slice(0, 8)}@anonymous.com`,
        displayName: 'Deleted User',
        passwordHash: null,
        isActive: false,
        avatarUrl: null,
        metadata: { failedLoginAttempts: 0, lockedUntil: null },
      },
    });
  }

  async delete(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  async hardDelete(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
  }
}
