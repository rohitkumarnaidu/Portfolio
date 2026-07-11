/**
 * @module HomePage
 * @description Homepage composition assembling all 10 portfolio sections
 * in the architectural order defined in docs/09-ARCHITECTURE.md §2.4.
 *
 * Rendering Strategy: ISR with revalidate (sections are Server Components
 * with client interactivity where needed)
 */

import { getSections } from '@/lib/api';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Skills } from '@/components/sections/Skills';
import { Experience } from '@/components/sections/Experience';
import { Projects } from '@/components/sections/Projects';
import { Services } from '@/components/sections/Services';
import { Testimonials } from '@/components/sections/Testimonials';
import { BlogPreview } from '@/components/sections/BlogPreview';
import { FAQ } from '@/components/sections/FAQ';
import { Contact } from '@/components/sections/Contact';
import { PageWrapper } from '@/components/layout/PageWrapper';

import type { Section } from '@portfolio/shared';

export const revalidate = 60; // ISR revalidation every 60 seconds

export default async function Home() {
  // Fetch all live sections
  let sections: Section[] = [];
  try {
    // We catch the error just in case the API is not reachable yet (Phase 5)
    sections = await getSections(true);
  } catch (error) {
    console.error('Failed to fetch sections:', error);
  }

  // Helper to find section data
  const getSectionData = (type: string) => sections.find((s) => s.section_type === type);

  return (
    <PageWrapper width="full" paddingX="none" paddingY="none">
      {/* 1. Hero — Primary CTA, above the fold */}
      <Hero data={getSectionData('hero')} />

      {/* 2. About — Bio, stats, capabilities */}
      <About data={getSectionData('about')} />

      {/* 3. Skills — Technical proficiency grid */}
      <Skills data={getSectionData('skills')} />

      {/* 4. Experience — Career timeline */}
      <Experience data={getSectionData('experience')} />

      {/* 5. Projects — Featured work showcase */}
      <Projects data={getSectionData('projects')} />

      {/* 6. Services — What I offer */}
      <Services data={getSectionData('services')} />

      {/* 7. Testimonials — Social proof carousel */}
      <Testimonials data={getSectionData('testimonials')} />

      {/* 8. Blog — Latest content preview */}
      <BlogPreview data={getSectionData('blog')} />

      {/* 9. FAQ — Common questions */}
      <FAQ data={getSectionData('faq')} />

      {/* 10. Contact — Form + information */}
      <Contact data={getSectionData('contact')} />
    </PageWrapper>
  );
}
