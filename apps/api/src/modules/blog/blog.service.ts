import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';
import { sanitizeStrings } from '../../common/utils/sanitize';
import { paginateQuery, generateSlug } from '../../common/database/pagination.helper';
import type { CreateBlogPostDto, UpdateBlogPostDto } from './dto';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(opts?: {
    published?: boolean;
    category?: string;
    featured?: boolean;
    page?: number;
    perPage?: number;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (opts?.published) {
      where.isPublished = true;
      where.OR = [{ publishedAt: null }, { publishedAt: { lte: new Date() } }];
    }
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
    return this.prisma.blogPost.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { ...sanitized, slug, tags: sanitized.tags || [] } as any,
    });
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');
    const sanitized = sanitizeStrings(dto);
    if (sanitized.title && !dto.slug) {
      sanitized.slug = generateSlug(sanitized.title);
    } else if (dto.slug) {
      sanitized.slug = generateSlug(dto.slug);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.blogPost.update({ where: { id }, data: sanitized as any });
  }

  async delete(id: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');
    await this.prisma.blogPost.delete({ where: { id } });
  }

  async publish(id: string, publishedAt?: Date) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');
    return this.prisma.blogPost.update({
      where: { id },
      data: { isPublished: true, publishedAt: publishedAt ?? new Date() },
    });
  }

  async getScheduledPosts() {
    const now = new Date();
    return this.prisma.blogPost.findMany({
      where: { isPublished: false, publishedAt: { lte: now } },
    });
  }

  async unpublish(id: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');
    return this.prisma.blogPost.update({ where: { id }, data: { isPublished: false } });
  }

  async restore(id: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');
    return existing;
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

  // ── Tag methods ──────────────────────────────────────────

  async findTags() {
    const posts = await this.prisma.blogPost.findMany({
      where: { tags: { isEmpty: false } },
      select: { tags: true },
    });
    const tagMap = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
      }
    }
    return Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, postCount: count }))
      .sort((a, b) => b.postCount - a.postCount);
  }

  async getPostTags(postId: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id: postId },
      select: { tags: true },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post.tags;
  }

  async addTag(postId: string, tagName: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id: postId } });
    if (!existing) throw new NotFoundException('Blog post not found');
    const tag = tagName.trim().toLowerCase().replace(/\s+/g, '-');
    if (existing.tags.includes(tag)) return existing.tags;
    const updated = await this.prisma.blogPost.update({
      where: { id: postId },
      data: { tags: { push: tag } },
    });
    return updated.tags;
  }

  async removeTag(postId: string, tagName: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id: postId } });
    if (!existing) throw new NotFoundException('Blog post not found');
    const updated = await this.prisma.blogPost.update({
      where: { id: postId },
      data: { tags: { set: existing.tags.filter((t) => t !== tagName) } },
    });
    return updated.tags;
  }

  async updateTags(postId: string, tagNames: string[]) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id: postId } });
    if (!existing) throw new NotFoundException('Blog post not found');
    const normalized = tagNames
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, '-'))
      .filter(Boolean);
    const updated = await this.prisma.blogPost.update({
      where: { id: postId },
      data: { tags: { set: normalized } },
    });
    return updated.tags;
  }

  async bulkUpdate(ids: string[], data: Record<string, unknown>) {
    const sanitized = sanitizeStrings(data);
    return Promise.all(
      ids.map(async (id) => {
        const updated = await this.prisma.blogPost
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .update({ where: { id }, data: sanitized as any })
          .catch(() => null);
        if (!updated) throw new NotFoundException(`Blog post ${id} not found`);
        return updated;
      }),
    );
  }
}
