import { About } from '@/components/sections/About';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { getSections } from '@/lib/api';
import type { Section } from '@portfolio/shared';

export const metadata = {
  title: 'About | Portfolio',
  description: 'Learn more about my background, experience, and approach to software engineering.',
};

export default async function AboutPage() {
  let data: Section | undefined;
  try {
    const sections = await getSections(true, 'about');
    data = sections?.[0];
  } catch {
    // API unavailable during static generation
  }

  return (
    <PageWrapper paddingY="lg">
      <div className="pt-24">
        <About data={data} />
      </div>
    </PageWrapper>
  );
}
