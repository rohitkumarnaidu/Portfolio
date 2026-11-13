import type { MetadataRoute } from 'next';
import type { Project, BlogPost } from '@portfolio/shared';
import { SITE, WORK } from '@/lib/public-content';

const API_BASE = `${process.env.API_PROXY_TARGET || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`;

async function getDashboardData(): Promise<{ projects: Project[]; posts: BlogPost[] }> {
  try {
    const [projectsRes, blogRes] = await Promise.all([
      fetch(`${API_BASE}/portfolio/projects?perPage=100`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/portfolio/blog?perPage=100`, { next: { revalidate: 3600 } }),
    ]);

    const unwrap = async <T>(res: Response): Promise<T[]> => {
      if (!res.ok) return [];
      const body = await res.json();
      return Array.isArray(body) ? body : ((body.data as T[]) ?? []);
    };

    const [projects, posts] = await Promise.all([
      unwrap<Project>(projectsRes),
      unwrap<BlogPost>(blogRes),
    ]);

    return { projects, posts };
  } catch {
    return { projects: [], posts: [] };
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE.url.replace(/\/$/, '');
  const { projects, posts } = await getDashboardData();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const curatedSlugs = new Set(WORK.map((project) => project.slug));

  const curatedRoutes: MetadataRoute.Sitemap = WORK.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const dashboardRoutes: MetadataRoute.Sitemap = projects
    .filter((project) => !curatedSlugs.has(project.slug))
    .map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...curatedRoutes, ...dashboardRoutes, ...blogRoutes];
}
