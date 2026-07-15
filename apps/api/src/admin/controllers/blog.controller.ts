import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { BlogService } from '../../modules/blog/blog.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import type { RevalidationService } from '../../common/revalidation/revalidation.service';
import type { CreateBlogPostDto, UpdateBlogPostDto } from '../../modules/blog/dto';

@ApiTags('Admin - Blog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/blog')
export class AdminBlogController {
  constructor(
    private readonly blog: BlogService,
    private readonly revalidation: RevalidationService,
  ) {}

  @Get()
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get all blog posts' })
  async findAll() {
    return this.blog.findAll();
  }

  @Get('tags')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'List all tags with post counts' })
  async listTags() {
    const result = await this.blog.findTags();
    return { data: result };
  }

  @Get(':id/tags')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get tags for a blog post' })
  async getPostTags(@Param('id') id: string) {
    const result = await this.blog.getPostTags(id);
    return { data: result };
  }

  @Post(':id/tags')
  @Roles('admin', 'editor')
  @Audit({ action: 'add_tag', resource: 'blog' })
  @ApiOperation({ summary: 'Add a tag to a blog post' })
  async addTag(@Param('id') id: string, @Body('tag') tag: string) {
    const result = await this.blog.addTag(id, tag);
    await this.revalidation.revalidate(['blog']);
    return { data: result };
  }

  @Delete(':id/tags/:tag')
  @Roles('admin', 'editor')
  @Audit({ action: 'remove_tag', resource: 'blog' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a tag from a blog post' })
  async removeTag(@Param('id') id: string, @Param('tag') tag: string) {
    const result = await this.blog.removeTag(id, decodeURIComponent(tag));
    await this.revalidation.revalidate(['blog']);
    return { data: result };
  }

  @Get(':slugOrId')
  @Roles('admin', 'editor', 'viewer')
  @ApiOperation({ summary: 'Get blog post by slug or ID' })
  async findOne(@Param('slugOrId') slugOrId: string) {
    const post = await this.blog.findBySlugOrId(slugOrId);
    return { data: post };
  }
  @Post()
  @Roles('admin', 'editor')
  @Audit({ action: 'create', resource: 'blog' })
  @ApiOperation({ summary: 'Create blog post' })
  async create(@Body() dto: CreateBlogPostDto) {
    const result = await this.blog.create(dto);
    await this.revalidation.revalidate(['blog']);
    return { data: result };
  }
  @Patch(':id')
  @Roles('admin', 'editor')
  @Audit({ action: 'update', resource: 'blog' })
  @ApiOperation({ summary: 'Update blog post' })
  async update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    const result = await this.blog.update(id, dto);
    await this.revalidation.revalidate(['blog']);
    return { data: result };
  }
  @Delete(':id')
  @Roles('admin')
  @Audit({ action: 'delete', resource: 'blog' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete blog post' })
  async delete(@Param('id') id: string) {
    await this.blog.delete(id);
    await this.revalidation.revalidate(['blog']);
  }
  @Delete(':id/hard')
  @Roles('admin')
  @Audit({ action: 'hard_delete', resource: 'blog' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Permanently delete a blog post' })
  async hardDelete(@Param('id') id: string) {
    await this.blog.hardDelete(id);
    await this.revalidation.revalidate(['blog']);
  }
  @Patch(':id/publish')
  @Roles('admin', 'editor')
  @Audit({ action: 'publish', resource: 'blog' })
  @ApiOperation({ summary: 'Publish a blog post' })
  async publish(@Param('id') id: string) {
    const result = await this.blog.publish(id);
    await this.revalidation.revalidate(['blog']);
    return { data: result };
  }
  @Patch(':id/unpublish')
  @Roles('admin', 'editor')
  @Audit({ action: 'unpublish', resource: 'blog' })
  @ApiOperation({ summary: 'Unpublish a blog post' })
  async unpublish(@Param('id') id: string) {
    const result = await this.blog.unpublish(id);
    await this.revalidation.revalidate(['blog']);
    return { data: result };
  }
  @Post('bulk-delete')
  @Roles('admin')
  @Audit({ action: 'bulk_delete', resource: 'blog' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk soft-delete blog posts' })
  async bulkDelete(@Body('ids') ids: string[]) {
    const result = await this.blog.bulkDelete(ids);
    await this.revalidation.revalidate(['blog']);
    return result;
  }
  @Post('bulk-update')
  @Roles('admin', 'editor')
  @Audit({ action: 'bulk_update', resource: 'blog' })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk publish/unpublish blog posts' })
  async bulkUpdate(@Body('ids') ids: string[], @Body('data') data: Record<string, unknown>) {
    const result = await this.blog.bulkUpdate(ids, data);
    await this.revalidation.revalidate(['blog']);
    return { data: result };
  }
}
