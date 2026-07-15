import { Contact } from '@/components/sections/Contact';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { getSections } from '@/lib/api';
import type { Section } from '@portfolio/shared';

export const metadata = {
  title: 'Contact | Portfolio',
  description:
    'Get in touch — I am always open to discussing new projects, opportunities, and ideas.',
};

export default async function ContactPage() {
  let data: Section | undefined;
  try {
    const sections = await getSections(true, 'contact');
    data = sections?.[0];
  } catch {
    // API unavailable during static generation
  }

  return (
    <PageWrapper paddingY="lg">
      <div className="pt-24">
        <Contact data={data} />
      </div>
    </PageWrapper>
  );
}
