import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WORK, getWork } from '@/lib/public-content';
import { pageMetadata } from '@/lib/seo';
import { CaseStudy } from '@/components/public/CaseStudy';

export const revalidate = 60;

export function generateStaticParams() {
  return WORK.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const curated = getWork(slug);

  if (!curated) {
    return { title: 'Project not found', robots: { index: false, follow: false } };
  }

  return pageMetadata({
    title: curated.title,
    description: curated.summary,
    path: `/projects/${curated.slug}`,
    type: 'article',
  });
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const curated = getWork(slug);

  if (!curated) {
    notFound();
  }

  return <CaseStudy project={curated} />;
}
