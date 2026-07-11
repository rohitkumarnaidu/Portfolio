import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery, generateSlug } from '../../common/database/pagination.helper';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts?: { published?: boolean; category?: string; featured?: boolean; page?: number; perPage?: number }) {
    const where: any = {};
    if (opts?.published) where.isPublished = true;
    if (opts?.category) where.category = opts.category;
    if (opts?.featured) where.isFeatured = true;
    return paginateQuery(
      (args) => this.prisma.blogPost.findMany({ where, orderBy: { createdAt: 'desc' }, ...args }),
      () => this.prisma.blogPost.count({ where }),
      { page: opts?.page, perPage: opts?.perPage },
    );
  }

  async findBySlugOrId(slugOrId: string) {
    let post = await this.prisma.blogPost.findUnique({ where: { id: slugOrId } });
    if (!post) post = await this.prisma.blogPost.findFirst({ where: { slug: slugOrId } });
    return post;
  }

  async create(dto: CreateBlogPostDto) {
    const sanitized = sanitizeStrings(dto);
    const slug = sanitized.slug || generateSlug(sanitized.title || '');
    return this.prisma.blogPost.create({ data: { ...sanitized, slug, tags: sanitized.tags || [] } as any });
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');
    const sanitized = sanitizeStrings(dto);
    if (sanitized.title) sanitized.slug = generateSlug(sanitized.title);
    return this.prisma.blogPost.update({ where: { id }, data: sanitized as any });
  }

  async delete(id: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');
    await this.prisma.blogPost.delete({ where: { id } });
  }

  async publish(id: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');
    return this.prisma.blogPost.update({ where: { id }, data: { isPublished: true, publishedAt: new Date() } });
  }

  async unpublish(id: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');
    return this.prisma.blogPost.update({ where: { id }, data: { isPublished: false } });
  }

  restore(_id: string) {
    throw new NotFoundException('Blog post not found');
  }

  async hardDelete(id: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');
    await this.prisma.blogPost.delete({ where: { id } });
  }

  async bulkDelete(ids: string[]) {
    const result = await this.prisma.blogPost.deleteMany({ where: { id: { in: ids } } });
    return { deleted: result.count, failed: ids.length - result.count };
  }

  async bulkUpdate(ids: string[], data: Record<string, any>) {
    const sanitized = sanitizeStrings(data);
    return Promise.all(
      ids.map(async (id) => {
        const updated = await this.prisma.blogPost.update({ where: { id }, data: sanitized as any }).catch(() => null);
        if (!updated) throw new NotFoundException(`Blog post ${id} not found`);
        return updated;
      }),
    );
  }
}
