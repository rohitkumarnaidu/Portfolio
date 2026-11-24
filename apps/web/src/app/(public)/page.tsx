import { SITE } from '@/lib/public-content';
import { pageMetadata } from '@/lib/seo';
import { HeroSection } from '@/components/public/sections/HeroSection';
import { FlagshipWork } from '@/components/public/sections/FlagshipWork';
import { Capabilities } from '@/components/public/sections/Capabilities';
import { Principles } from '@/components/public/sections/Principles';

export const revalidate = 300;

export const metadata = pageMetadata({
  title: `${SITE.shortName} — ${SITE.role}`,
  description: SITE.description,
  path: '/',
  absoluteTitle: true,
  socialTitle: `${SITE.shortName} — ${SITE.role}`,
});

export default async function HomePage() {
  return (
    <>
      <HeroSection />
      <FlagshipWork />
      <Capabilities />
      <Principles />
    </>
  );
}
