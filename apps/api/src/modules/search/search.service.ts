import { Injectable, Logger } from '@nestjs/common';
import type { PrismaService } from '../../common/database/prisma.service';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: 'project' | 'blog_post' | 'case_study';
  score: number;
  slug?: string;
  url?: string;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(private readonly prisma: PrismaService) {}

  async search(opts: { q: string; type?: string; page?: number; limit?: number }) {
    const query = opts.q.trim();
    if (!query) return { data: { results: [] }, meta: { query, total: 0, searchTimeMs: 0 } };

    const startTime = Date.now();
    const page = Math.max(1, opts.page ?? 1);
    const limit = Math.min(50, Math.max(1, opts.limit ?? 20));

    const results: SearchResult[] = [];

    if (!opts.type || opts.type === 'all' || opts.type === 'projects') {
      const projects = await this.searchProjects(query, opts.type === 'projects' ? limit : 10);
      results.push(...projects);
    }

    if (!opts.type || opts.type === 'all' || opts.type === 'blog') {
      const posts = await this.searchBlogPosts(query, opts.type === 'blog' ? limit : 10);
      results.push(...posts);
    }

    if (!opts.type || opts.type === 'all' || opts.type === 'case_studies') {
      const studies = await this.searchCaseStudies(
        query,
        opts.type === 'case_studies' ? limit : 10,
      );
      results.push(...studies);
    }

    results.sort((a, b) => b.score - a.score);
    const total = results.length;
    const start = (page - 1) * limit;
    const paginated = results.slice(start, start + limit);
    const searchTimeMs = Date.now() - startTime;

    return {
      data: { results: paginated },
      meta: { query, total, page, limit, searchTimeMs },
    };
  }

  private async searchProjects(query: string, limit: number): Promise<SearchResult[]> {
    const _q = `%${query}%`;
    const items = await this.prisma.client.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT id, slug, title, description, tech_stack, 
              CASE 
                WHEN title ILIKE $1 THEN 3
                WHEN description ILIKE $1 THEN 2
                WHEN $2 = ANY(tech_stack) THEN 1
                ELSE 0
              END as score
       FROM projects 
       WHERE title ILIKE $1 OR description ILIKE $1 OR $2 = ANY(tech_stack)
       ORDER BY score DESC, display_order ASC
       LIMIT $3`,
      `%${query}%`,
      query,
      limit,
    );
    return (items as Array<Record<string, unknown>>).map((p) => ({
      id: p.id as string,
      title: p.title as string,
      excerpt: (p.description as string)?.slice(0, 200) ?? '',
      type: 'project' as const,
      score: Number(p.score),
      slug: p.slug as string,
      url: `/projects/${p.slug}`,
    }));
  }

  private async searchBlogPosts(query: string, limit: number): Promise<SearchResult[]> {
    const _r = `%${query}%`;
    const items = await this.prisma.client.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT id, slug, title, excerpt, content,
              CASE 
                WHEN title ILIKE $1 THEN 3
                WHEN excerpt ILIKE $1 THEN 2
                WHEN content ILIKE $1 THEN 1
                ELSE 0
              END as score
       FROM blog_posts
       WHERE is_published = true AND (title ILIKE $1 OR excerpt ILIKE $1 OR content ILIKE $1)
       ORDER BY score DESC, published_at DESC
       LIMIT $2`,
      _r,
      limit,
    );
    return (items as Array<Record<string, unknown>>).map((p) => ({
      id: p.id as string,
      title: p.title as string,
      excerpt: (p.excerpt as string) ?? (p.content as string)?.slice(0, 200) ?? '',
      type: 'blog_post' as const,
      score: Number(p.score),
      slug: p.slug as string,
      url: `/blog/${p.slug}`,
    }));
  }

  private async searchCaseStudies(query: string, limit: number): Promise<SearchResult[]> {
    const _s = `%${query}%`;
    const items = await this.prisma.client.$queryRawUnsafe<Array<Record<string, unknown>>>(
      `SELECT cs.id, p.title, p.slug, COALESCE(cs.challenge, '') as challenge, COALESCE(cs.solution, '') as solution, COALESCE(cs.impact, '') as impact,
              CASE 
                WHEN p.title ILIKE $1 THEN 3
                WHEN cs.challenge ILIKE $1 THEN 2
                WHEN cs.solution ILIKE $1 THEN 1
                WHEN cs.impact ILIKE $1 THEN 1
                ELSE 0
              END as score
       FROM case_studies cs
       JOIN projects p ON p.id = cs.project_id
       WHERE p.title ILIKE $1 OR cs.challenge ILIKE $1 OR cs.solution ILIKE $1 OR cs.impact ILIKE $1
       ORDER BY score DESC
       LIMIT $2`,
      _s,
      limit,
    );
    return (items as Array<Record<string, unknown>>).map((p) => ({
      id: p.id as string,
      title: p.title as string,
      excerpt: ((p.challenge as string) ?? '').slice(0, 200),
      type: 'case_study' as const,
      score: Number(p.score),
      slug: p.slug as string,
      url: `/projects/${p.slug}`,
    }));
  }
}
