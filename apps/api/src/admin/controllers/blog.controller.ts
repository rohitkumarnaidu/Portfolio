import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from '../../modules/blog/blog.service';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { RolesGuard } from '../../modules/auth/roles.guard';
import { Roles } from '../../modules/auth/roles.decorator';
import { Audit } from '../../common/decorators/audit.decorator';
import { CreateBlogPostDto, UpdateBlogPostDto } from '../../modules/blog/dto';

@ApiTags('Admin - Blog')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/blog')
export class AdminBlogController {
  constructor(private readonly blog: BlogService) {}

  @Get() @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get all blog posts' }) async findAll() { return this.blog.findAll(); }
  @Get(':slugOrId') @Roles('admin', 'editor', 'viewer') @ApiOperation({ summary: 'Get blog post by slug or ID' }) async findOne(@Param('slugOrId') slugOrId: string) { const post = await this.blog.findBySlugOrId(slugOrId); return { data: post }; }
  @Post() @Roles('admin', 'editor') @Audit({ action: 'create', resource: 'blog' }) @ApiOperation({ summary: 'Create blog post' }) async create(@Body() dto: CreateBlogPostDto) { return { data: await this.blog.create(dto) }; }
  @Patch(':id') @Roles('admin', 'editor') @Audit({ action: 'update', resource: 'blog' }) @ApiOperation({ summary: 'Update blog post' }) async update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) { return { data: await this.blog.update(id, dto) }; }
  @Delete(':id') @Roles('admin') @Audit({ action: 'delete', resource: 'blog' }) @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Delete blog post' }) async delete(@Param('id') id: string) { await this.blog.delete(id); }
  @Delete(':id/hard') @Roles('admin') @Audit({ action: 'hard_delete', resource: 'blog' }) @HttpCode(HttpStatus.NO_CONTENT) @ApiOperation({ summary: 'Permanently delete a blog post' }) async hardDelete(@Param('id') id: string) { await this.blog.hardDelete(id); }
  @Patch(':id/publish') @Roles('admin', 'editor') @Audit({ action: 'publish', resource: 'blog' }) @ApiOperation({ summary: 'Publish a blog post' }) async publish(@Param('id') id: string) { return { data: await this.blog.publish(id) }; }
  @Patch(':id/unpublish') @Roles('admin', 'editor') @Audit({ action: 'unpublish', resource: 'blog' }) @ApiOperation({ summary: 'Unpublish a blog post' }) async unpublish(@Param('id') id: string) { return { data: await this.blog.unpublish(id) }; }
  @Post('bulk-delete') @Roles('admin') @Audit({ action: 'bulk_delete', resource: 'blog' }) @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Bulk soft-delete blog posts' }) async bulkDelete(@Body('ids') ids: string[]) { return this.blog.bulkDelete(ids); }
  @Post('bulk-update') @Roles('admin', 'editor') @Audit({ action: 'bulk_update', resource: 'blog' }) @HttpCode(HttpStatus.OK) @ApiOperation({ summary: 'Bulk publish/unpublish blog posts' }) async bulkUpdate(@Body('ids') ids: string[], @Body('data') data: Record<string, unknown>) { return { data: await this.blog.bulkUpdate(ids, data) }; }
}
