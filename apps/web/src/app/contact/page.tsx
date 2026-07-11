import { Contact } from '@/components/sections/Contact';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { getSections } from '@/lib/api';

export const metadata = {
  title: 'Contact | Portfolio',
  description: 'Get in touch — I am always open to discussing new projects, opportunities, and ideas.',
};

export default async function ContactPage() {
  const sections = await getSections(true, 'contact');
  const data = sections[0];

  return (
    <PageWrapper paddingY="lg">
      <div className="pt-24">
        <Contact data={data} />
      </div>
    </PageWrapper>
  );
}
