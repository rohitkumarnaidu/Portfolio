import type { MetadataRoute } from 'next';
import type { Project, BlogPost } from '@portfolio/shared';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    {
      url: `${baseUrl}/case-studies`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/achievements`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const [projectsRes, blogRes, caseStudiesRes] = await Promise.all([
      fetch(`${API_BASE}/projects`),
      fetch(`${API_BASE}/blog`),
      fetch(`${API_BASE}/case-studies`),
    ]);

    const unwrap = async <T>(res: Response): Promise<T[]> => {
      const body = await res.json();
      return Array.isArray(body) ? body : (body.data as T[]);
    };

    const [projects, posts, rawCaseStudies] = await Promise.all([
      unwrap<Project>(projectsRes),
      unwrap<BlogPost>(blogRes),
      unwrap<{ id: string; updatedAt: string }>(caseStudiesRes),
    ]);

    const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
      url: `${baseUrl}/projects/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

    const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    const caseStudyRoutes: MetadataRoute.Sitemap = rawCaseStudies.map((cs) => ({
      url: `${baseUrl}/case-studies/${cs.id}`,
      lastModified: new Date(cs.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...projectRoutes, ...blogRoutes, ...caseStudyRoutes];
  } catch {
    return staticRoutes;
  }
}
