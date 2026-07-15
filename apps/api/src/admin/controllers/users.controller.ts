import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { UsersService } from '../../modules/users/users.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { CreateUserDto, UpdateUserDto, UpdateUserRoleDto } from '../../modules/users/dto';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'List all users' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'editor', 'viewer'] })
  async findAll(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('search') search?: string,
    @Query('role') role?: string,
  ) {
    return this.users.findAll({
      page: page ? +page : undefined,
      perPage: perPage ? +perPage : undefined,
      search,
      role,
    });
  }

  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get user by ID' })
  async findById(@Param('id') id: string) {
    return { data: await this.users.findById(id) };
  }

  @Post()
  @Roles('admin')
  @Audit({ action: 'create', resource: 'user' })
  @ApiOperation({ summary: 'Create user' })
  async create(@Body() dto: CreateUserDto) {
    return { data: await this.users.create(dto) };
  }

  @Patch(':id')
  @Roles('admin')
  @Audit({ action: 'update', resource: 'user' })
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return { data: await this.users.update(id, dto) };
  }

  @Patch(':id/role')
  @Roles('admin')
  @Audit({ action: 'update_role', resource: 'user' })
  @ApiOperation({ summary: 'Update user role' })
  async updateRole(@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
    return { data: await this.users.updateRole(id, dto.role) };
  }

  @Post(':id/unlock')
  @Roles('admin')
  @Audit({ action: 'unlock', resource: 'user' })
  @ApiOperation({ summary: 'Unlock a locked user account' })
  async unlock(@Param('id') id: string) {
    return { data: await this.users.unlock(id) };
  }

  @Get(':id/export')
  @Roles('admin')
  @ApiOperation({ summary: 'Export all user data (GDPR)' })
  async exportData(@Param('id') id: string) {
    return { data: await this.users.exportData(id) };
  }

  @Post(':id/anonymize')
  @Roles('admin')
  @Audit({ action: 'anonymize', resource: 'user' })
  @ApiOperation({ summary: 'GDPR-compliant account anonymization' })
  async anonymize(@Param('id') id: string) {
    return { data: await this.users.anonymize(id) };
  }

  @Delete(':id')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'user' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete user' })
  async delete(@Param('id') id: string) {
    await this.users.delete(id);
  }

  @Delete(':id/hard')
  @Roles('admin')
  @Audit({ action: 'hard_delete', resource: 'user' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete user' })
  async hardDelete(@Param('id') id: string) {
    await this.users.hardDelete(id);
  }
}
