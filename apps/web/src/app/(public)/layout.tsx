import { getPublicAvailability, type PublicAvailability } from '@/lib/api';
import { personSchema, websiteSchema } from '@/lib/json-ld';
import { SITE } from '@/lib/public-content';
import { SiteFooter } from '@/components/public/SiteFooter';
import { SiteHeader } from '@/components/public/SiteHeader';

async function getAvailability(): Promise<PublicAvailability | null> {
  try {
    return await getPublicAvailability();
  } catch {
    return null;
  }
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const availability = await getAvailability();

  return (
    <div className="site" id="top">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteHeader availability={availability} />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema(SITE.shortName, SITE.url)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema(SITE.name, SITE.role, SITE.url)),
        }}
      />
    </div>
  );
}
