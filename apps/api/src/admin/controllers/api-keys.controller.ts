import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import type { ApiKeysService } from '../../modules/api-keys/api-keys.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { CreateApiKeyDto } from '../../modules/api-keys/dto';

@ApiTags('Admin - API Keys')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/api-keys')
export class AdminApiKeysController {
  constructor(private readonly apiKeys: ApiKeysService) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'List all API keys' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'perPage', required: false })
  async findAll(@Query('page') page?: string, @Query('perPage') perPage?: string) {
    return this.apiKeys.findAll({ page: page ? +page : 1, perPage: perPage ? +perPage : 50 });
  }

  @Get(':id')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get API key by ID' })
  async findOne(@Param('id') id: string) {
    return { data: await this.apiKeys.findById(id) };
  }

  @Post()
  @Roles('admin', 'editor')
  @Audit({ action: 'create', resource: 'api_key' })
  @ApiOperation({ summary: 'Create an API key (returns raw key once)' })
  async create(@Body() dto: CreateApiKeyDto) {
    return { data: await this.apiKeys.create(dto.name, dto.permissions) };
  }

  @Post(':id/revoke')
  @Roles('admin', 'editor')
  @Audit({ action: 'revoke', resource: 'api_key' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke an API key' })
  async revoke(@Param('id') id: string) {
    return { data: await this.apiKeys.revoke(id) };
  }

  @Delete(':id')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'api_key' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an API key' })
  async delete(@Param('id') id: string) {
    await this.apiKeys.delete(id);
  }
}
