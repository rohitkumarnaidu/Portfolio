import { getPublicAvailability, type PublicAvailability } from '@/lib/api';
import { SITE } from '@/lib/public-content';
import { pageMetadata } from '@/lib/seo';
import { HeroSection } from '@/components/public/sections/HeroSection';
import { FlagshipWork } from '@/components/public/sections/FlagshipWork';
import { Capabilities } from '@/components/public/sections/Capabilities';
import { Principles } from '@/components/public/sections/Principles';
import { ContactSection } from '@/components/public/sections/ContactSection';

export const revalidate = 300;

export const metadata = pageMetadata({
  title: `${SITE.shortName} — ${SITE.role}`,
  description: SITE.description,
  path: '/',
  absoluteTitle: true,
  socialTitle: `${SITE.shortName} — ${SITE.role}`,
});

async function getAvailability(): Promise<PublicAvailability | null> {
  try {
    return await getPublicAvailability();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const availability = await getAvailability();

  return (
    <>
      <HeroSection availability={availability} />
      <FlagshipWork />
      <Capabilities />
      <Principles />
      <ContactSection availability={availability} />
    </>
  );
}
