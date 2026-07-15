import type { Metadata } from 'next';
import { getProject } from '@/lib/api';
import { articleSchema } from '@/lib/json-ld';
import { ProjectDetailClient } from './client';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const project = await getProject(params.slug);
    return {
      title: project.title,
      description: project.description || `${project.title} — A project by Portfolio`,
      openGraph: {
        title: project.title,
        description: project.description || undefined,
        type: 'article',
        images: project.cover_image ? [{ url: project.cover_image }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: project.title,
        description: project.description || undefined,
        images: project.cover_image ? [project.cover_image] : [],
      },
    };
  } catch {
    return { title: 'Project not found' };
  }
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  let project;
  try {
    project = await getProject(params.slug);
  } catch {
    return <ProjectDetailClient slug={params.slug} />;
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

  const jsonLd = articleSchema({
    title: project.title,
    description: project.description,
    datePublished: project.created_at,
    dateModified: project.updated_at,
    url: `${baseUrl}/projects/${project.slug}`,
    image: project.cover_image,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectDetailClient slug={params.slug} />
    </>
  );
}
