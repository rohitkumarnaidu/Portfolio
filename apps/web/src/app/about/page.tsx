import { About } from '@/components/sections/About';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { getSections } from '@/lib/api';

export const metadata = {
  title: 'About | Portfolio',
  description: 'Learn more about my background, experience, and approach to software engineering.',
};

export default async function AboutPage() {
  const sections = await getSections(true, 'about');
  const data = sections[0];

  return (
    <PageWrapper paddingY="lg">
      <div className="pt-24">
        <About data={data} />
      </div>
    </PageWrapper>
  );
}
