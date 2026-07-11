import type { Metadata } from 'next';
import { getProject } from '@/lib/api';
import { ProjectDetailClient } from './client';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
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

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  return <ProjectDetailClient slug={params.slug} />;
}
