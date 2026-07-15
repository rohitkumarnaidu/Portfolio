import type { Metadata } from 'next';
import { getCaseStudy, getProject } from '@/lib/api';
import { CaseStudyDetailClient } from './client';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const cs = await getCaseStudy(params.id);
    const project = await getProject(cs.projectId);
    return {
      title: `${project.title} — Case Study`,
      description:
        cs.challenge ||
        project.description ||
        `${project.title} case study — architecture, approach, and impact`,
      openGraph: {
        title: `${project.title} — Case Study`,
        description: cs.challenge || project.description || undefined,
        images: project.cover_image ? [{ url: project.cover_image }] : [],
      },
    };
  } catch {
    return { title: 'Case Study not found' };
  }
}

export default function CaseStudyDetailPage({ params }: { params: { id: string } }) {
  return <CaseStudyDetailClient id={params.id} />;
}
