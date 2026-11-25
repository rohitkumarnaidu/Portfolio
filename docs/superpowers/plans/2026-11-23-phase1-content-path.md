# Phase 1 — Content Path Implementation Plan

> **Status:** drafted 2026-11-23, **not started**. Do not create a branch or edit product code until the user explicitly says to begin Phase 1.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Do not mark a step `[x]` without running the command it names.

**Goal:** Ship the five-section Default-view funnel on the existing paper palette — hero-lite → flagship work → capabilities → principles → contact — plus `/resume`, hardened contact, live availability, the machine layer (`llms.txt`, `ProfilePage` JSON-LD, AI-crawler access), a static OG image, cookieless PostHog with `?ref` attribution, and the Phase 0 hardening list.

**Architecture:** The public site keeps its curated `public-content.ts` source and `.site` editorial CSS; Phase 1 does **not** re-dress it as Skin 3. The six inline homepage sections become server components under `src/components/public/sections/`, and `/` is reduced to the five funnel sections; About and Writing stay as routes. A server-rendered public layout fetches availability from a new read-only NestJS endpoint and passes it to the header and hero. Contact moves onto `/` (same `ContactForm` as `/contact`) and is hardened at the API (honeypot, 3/hr/IP, server-derived IP, no reCAPTCHA). `/resume` composes only verified `public-content.ts` facts and prints to a committed PDF. `llms.txt`, JSON-LD, robots and sitemap are generated from the same curated data. PostHog initializes browser-only with `persistence: 'memory'` and `autocapture: false`; `?ref` is read once from the URL into module memory, never stored.

**Tech Stack:** Next.js 15 App Router (server components + route handlers), NestJS 12 + `@nestjs/throttler`, Prisma/Postgres, Zod 4 (web form validation), `posthog-js` (already installed), Vitest + MSW (web unit), Jest (API), Playwright (e2e + PDF/OG asset generation). No new runtime dependencies are expected.

**Spec:** `docs/superpowers/specs/2026-11-13-portfolio-themes-design.md` — §5 (funnel order), §6.1/6.2/6.4/6.7/6.8/6.9, §8 Phase 1 row, §12 Q2/Q3/Q4/Q7/Q8, §14 row 7 (the deferred `status.success` resolution), §15 (token-source closure). Design contract: root `DESIGN.md`.

## Global Constraints

- **Paper palette is fixed.** `publicSurface` values do not change. No public theme toggle in Phase 1 (spec §12 Q4 defers the switcher to Phase 3).
- **The `data-theme` mirror and the `--pf-*` alias bridge stay.** Admin still consumes `data-theme`; their demolition is Phase 3, not Phase 1. Correct the comments in `globals.css` (L35, L149) and `DESIGN.md`'s token-pipeline/theming bullets that currently say "deleted in Phase 1".
- **No raw hex in `apps/web/src`, `packages/ui/src`, `packages/shared/src` or `tailwind.config.ts`** — the Phase 0 hex guard enforces this. A new color starts in `packages/tokens/tokens.json`.
- **No fabricated resume content.** `/resume` renders only material already in `public-content.ts`. Education, employment dates and titles must be supplied by the user before they can appear.
- **Response envelope is always `{ data, meta? }`.** New public endpoints are read-only and cached; no auth.
- **Contact limits are server-authoritative.** 3 requests/hour/IP (`ttl: 3_600_000`), IP from `@Ip()` (trust proxy already set in `main.ts`), never from the request body.
- **Analytics is cookieless.** `persistence: 'memory'`, `autocapture: false`, no session recording, no person profiles. `?ref` is stateless — no cookie, no localStorage, no sessionStorage.
- **No Phase 2+ scope.** No 3D instrument, no MCP server, no AI console, no skins 1–2, no public switcher.
- **Install before any gate.** There is no `node_modules` on disk. Run `npm install` (Node ≥24, npm pinned via `packageManager`) before `typecheck`/tests/build.
- **Commits:** conventional prefixes (`feat(web):`, `feat(api):`, `feat(tokens):`, `test(e2e):`, `docs:`). One commit per task unless a task explicitly splits web/API.
- **Truthfulness:** CWV and e2e results are recorded from this session's runs. If INP cannot be measured in the lab, say so; do not claim a green INP.

## Review Focus

Six behaviours the spec implies but no single existing test exercises — each gets pinned in its owning task:

1. **Funnel completeness with 3D disabled.** `main section[id]` order is exactly `work → capabilities → principles → contact`, the hero has two CTAs and an availability badge, and `/` contains a working `ContactForm`. → section unit test (Task 1/3) + e2e order assertion (Task 10).
2. **Contact abuse path.** A filled honeypot is accepted by the client but discarded server-side without a DB row or notification; a fourth request in an hour is throttled; a client-supplied `ipAddress` cannot override the derived one; no PII is logged. → API controller/service tests (Task 4).
3. **Availability degradation.** If the API is down or unseeded, the public layout and hero still render a label (fallback to `SITE.availabilityLabel`) and the page does not 500. → web unit test with a rejected fetch + e2e (Task 5/10).
4. **Machine-layer truthfulness.** `llms.txt` is <2 KB, matches the curated projects/capabilities, and is served as `text/plain`; AI crawlers are not blocked; `/resume` is in the sitemap; the OG image is a real 1200×630 PNG referenced by absolute URL. → unit + e2e (Tasks 6/7/10).
5. **Token resolution for `status.success`.** The amended value passes the declared paper pair at `AA_NORMAL`, remains ≥3:1 as a non-text mark on the dark panel, and the availability badge itself uses `publicSurface.green` on paper (5.56:1). → token tests + checker (Task 5).
6. **CWV honesty.** LCP ≤ 2.5 s and CLS ≤ 0.1 are measured on the built site; INP is reported only if measured. The evidence block at the end records real numbers, not a claim. → Task 10.

---

### Task 1: Extract the first four funnel sections

**Files:**

- Create: `apps/web/src/components/public/sections/HeroSection.tsx`
- Create: `apps/web/src/components/public/sections/HeroSchematic.tsx`
- Create: `apps/web/src/components/public/sections/FlagshipWork.tsx`
- Create: `apps/web/src/components/public/sections/Capabilities.tsx`
- Create: `apps/web/src/components/public/sections/Principles.tsx`
- Modify: `apps/web/src/app/(public)/page.tsx` (compose sections, drop the inline markup)
- Modify: `apps/web/src/styles/public.css` (hero schematic, section spacing, serif role)
- Modify: `apps/web/src/styles/globals.css` (delete the interim `--font-serif` alias)
- Modify: `DESIGN.md` (font bullet: the serif role is gone)
- Test: `apps/web/src/test/__tests__/sections.test.tsx` (new)

**Interfaces:**

- Consumes: `SITE`, `FEATURED_WORK`, `CAPABILITIES`, `PRINCIPLES` from `@/lib/public-content`; `SectionHead`, `ArrowUpRight`; `pageMetadata`.
- Produces: server components with no props except the optional `availabilityLabel?: string` on `HeroSection` (wired in Task 5). Section anchors: `#work`, `#capabilities`, `#principles` (`#contact` arrives in Task 3).

- [ ] **Step 1: Write the failing test.** Render each section and assert the spec contract:

```tsx
// apps/web/src/test/__tests__/sections.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroSection } from '@/components/public/sections/HeroSection';
import { FlagshipWork } from '@/components/public/sections/FlagshipWork';
import { Capabilities } from '@/components/public/sections/Capabilities';
import { Principles } from '@/components/public/sections/Principles';

describe('funnel sections', () => {
  it('hero has one h1, an availability badge and two CTAs', () => {
    render(<HeroSection />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/open to work/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /view case studies/i })).toHaveAttribute(
      'href',
      '#work',
    );
    expect(screen.getByRole('link', { name: /r[eé]sum[eé]/i })).toHaveAttribute('href', '/resume');
  });

  it('flagship work renders exactly the three featured projects in order', () => {
    const { container } = render(<FlagshipWork />);
    expect(container.querySelectorAll('.work-row')).toHaveLength(3);
    expect(screen.getByText('Forgevena')).toBeInTheDocument();
    expect(screen.getByText('DRAXELYRA')).toBeInTheDocument();
    expect(screen.getByText('Evidence Review Pipeline')).toBeInTheDocument();
  });

  it('capabilities and principles render every curated item', () => {
    render(<Capabilities />);
    expect(screen.getAllByRole('article')).toHaveLength(3);
    render(<Principles />);
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });
});
```

- [ ] **Step 2: Run to verify failure** — from `apps/web`: `npm test -- src/test/__tests__/sections.test.tsx` → FAIL (modules not found).

- [ ] **Step 3: Create the components.** Move the existing markup verbatim where possible; the only visual additions are the schematic and the CTA pair.

```tsx
// HeroSection.tsx — key structure
<section className="hero container-ed" id="hero">
  <div className="hero__top">
    <span className="kicker">Software engineer · Portfolio 2026</span>
    <span className="hero__top-meta">Applied AI / Platform / Product</span>
  </div>
  <h1 className="display display--xl hero__title reveal">
    I build systems that <em>have to be right.</em>
  </h1>
  <div className="hero__grid hero__grid--lite">
    <div>
      <p className="hero__lead reveal reveal--1">{SITE.intro}</p>
      <div className="hero__actions">
        <a href="#work" className="btn">
          View case studies
        </a>
        <Link href="/resume" className="link-arrow">
          Résumé <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
    <HeroSchematic />
  </div>
  <span className="site-status hero__status" data-available={SITE.available}>
    <span className="site-status__dot" aria-hidden="true" />
    {availabilityLabel ?? SITE.availabilityLabel}
  </span>
</section>
```

`HeroSchematic` is a static inline SVG (`viewBox="0 0 520 340"`, `aria-hidden="true"`, `focusable="false"`) with a hairline grid, one copper polyline (`stroke="var(--accent)"`), four nodes and two mono labels. No animation, no canvas, no JS. Keep it under ~70 lines.

`FlagshipWork` maps `FEATURED_WORK` (exported at `public-content.ts:332`; currently Forgevena, DRAXELYRA, Evidence Review Pipeline) into the `.work-index` / `.work-row` markup and keeps the `01–03` numbering. This is the intentional change from today's homepage, which maps all six `WORK` entries. `Capabilities` maps `CAPABILITIES` into `.cap-grid` / `<article className="cap">`. `Principles` renders all four `PRINCIPLES` as `<li className="principle">` inside an `<ol>` (today the About aside renders only three as paragraphs).

- [ ] **Step 4: Rewrite `page.tsx`.** Delete the inline hero, work, statement, capabilities, about and writing sections; keep `revalidate = 300` and `metadata`. The page becomes:

```tsx
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
```

Remove the `getLatestPosts` fetch, `BlogPost`/`formatDate`/`ABOUT_PARAGRAPHS`/`WORK` imports. About and Writing remain reachable from the nav and footer.

- [ ] **Step 5: Add the minimal CSS.** In `public.css`: `.hero__grid--lite` (2-col, 1-col under 900px), `.hero__schematic` (`width:100%; height:auto; border:1px solid var(--rule); background: var(--paper-deep);`), `.hero__status` (margin-top), and `.principle-list` spacing reuse. No new hex.

  Also retire the serif role with **zero visual change** (it already resolves to IBM Plex Sans through the interim alias): replace the 21 `var(--serif)` call sites in `public.css` with `var(--sans)`, delete the `--serif:` declaration, and delete the `--font-serif: var(--font-body);` alias + its comment block from `globals.css:18-27`. `public.css` keeps `--sans` and `--mono`.

- [ ] **Step 6: Verify + commit** — `npm test -- src/test/__tests__/sections.test.tsx` → PASS; `npm run typecheck` → clean. Commit: `feat(web): extract funnel sections; homepage is hero, work, capabilities, principles`.

### Task 2: `/resume` route, hero CTA target, print PDF

**Files:**

- Create: `apps/web/src/app/(public)/resume/page.tsx`
- Create: `apps/web/src/components/public/ResumeDownloadLink.tsx` (plain link now; tracked in Task 8)
- Create: `apps/web/scripts/generate-resume-pdf.mjs`
- Create: `apps/web/public/resume/rohith-naidu-resume.pdf` (generated, committed)
- Modify: `apps/web/src/lib/public-content.ts` (`PUBLIC_NAV` + `CONTENT_UPDATED`)
- Modify: `apps/web/src/app/sitemap.ts` (`/resume` + stable dates)
- Modify: `apps/web/src/styles/public.css` (`@media print`)
- Modify: `apps/web/package.json` (`resume:pdf` script)
- Test: `apps/web/src/test/__tests__/sections.test.tsx` or new `resume.test.tsx`

**Interfaces:**

- Consumes: `SITE`, `FEATURED_WORK`, `CAPABILITIES`, `PRINCIPLES`, `TOOLKIT`, `ABOUT_PARAGRAPHS[0]`, `FACTS`; `pageMetadata`; `ResumeDownloadLink`.
- Produces: `/resume` static page; `PUBLIC_NAV` gains `{ label: 'Resume', href: '/resume' }` after About; `CONTENT_UPDATED = '2026-11-23'` for sitemap dates.

- [ ] **Step 1: Write the failing test.** Assert the page renders the name, role, selected systems, toolkit, a download link to the PDF, and that the nav contains Resume:

```tsx
it('resume page renders verified profile content and a PDF link', () => {
  render(<ResumePage />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/rohith kumar naidu/i);
  expect(screen.getByText('Forgevena')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /download pdf/i })).toHaveAttribute(
    'href',
    '/resume/rohith-naidu-resume.pdf',
  );
  expect(PUBLIC_NAV.some((item) => item.href === '/resume')).toBe(true);
});
```

- [ ] **Step 2: Create the page.** Structure: `page-head` with kicker `Index / Résumé`, name + role + availability, `ResumeDownloadLink`; then `Selected systems` (three `FEATURED_WORK` entries with title, kicker, summary, stack), `Capabilities`, `Toolkit` (from `TOOLKIT`), `Working principles` (four), and a contact line linking `/contact`. Use existing editorial classes (`.page-head`, `.section`, `.work-index`, `.toolkit`, `.principle-list`). Add `metadata = pageMetadata({ title: 'Résumé', description: ..., path: '/resume' })`. No education/employment block until the user supplies verified facts.

- [ ] **Step 3: Print CSS.** Add to `public.css`:

```css
@media print {
  @page {
    margin: 16mm;
  }
  .site-header,
  .site-footer,
  .skip-link,
  .resume__actions {
    display: none !important;
  }
  .site {
    background: var(--paper);
    color: var(--ink);
  }
  a {
    text-decoration: none;
    color: inherit;
  }
  .section {
    break-inside: avoid;
  }
}
```

- [ ] **Step 4: Generate the PDF.** Script uses the already-installed Playwright Chromium:

```js
// apps/web/scripts/generate-resume-pdf.mjs
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const url = process.env.RESUME_URL || 'http://localhost:3000/resume';
const dir = fileURLToPath(new URL('../public/resume/', import.meta.url));
const out = fileURLToPath(new URL('../public/resume/rohith-naidu-resume.pdf', import.meta.url));
await mkdir(dir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'print' });
await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
await browser.close();
```

Add `"resume:pdf": "node scripts/generate-resume-pdf.mjs"` to `apps/web/package.json`. Run: start `npm run dev:web`, then `npm run resume:pdf -w @portfolio/web`. Verify the file starts with `%PDF` and is >20 KB; commit it.

- [ ] **Step 5: Nav + sitemap.** Add Resume to `PUBLIC_NAV`. In `sitemap.ts`, add `{ url: \`${baseUrl}/resume\`, lastModified: new Date(CONTENT_UPDATED), changeFrequency: 'monthly', priority: 0.7 }`and replace`new Date()`with`new Date(CONTENT_UPDATED)` for the five static routes.

- [ ] **Step 6: Verify + commit** — tests PASS, `npm run typecheck` clean, PDF opens in a viewer. Commit: `feat(web): add print-ready /resume with committed PDF`.

### Task 3: Contact section on `/` sharing `ContactForm`

**Files:**

- Create: `apps/web/src/components/public/sections/ContactSection.tsx`
- Modify: `apps/web/src/app/(public)/page.tsx` (append the section)
- Modify: `apps/web/src/styles/public.css` (home contact spacing)
- Test: `apps/web/src/test/__tests__/sections.test.tsx`

**Interfaces:**

- Consumes: `ContactForm` (unchanged import), `SectionHead`, `SITE`, `ArrowUpRight`, optional `availabilityLabel`.
- Produces: `<section id="contact">` with the same form instance used at `/contact`; no second implementation.

- [ ] **Step 1: Write the failing test.** Assert `/`-level section renders a labelled form and the aside copy:

```tsx
it('contact section hosts the shared form', () => {
  render(<ContactSection />);
  expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument();
  expect(screen.getByText(/start with the problem/i)).toBeInTheDocument();
  expect(screen.getByLabelText('Name')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Implement.** Mirror the `/contact` two-column `.contact-grid`: a compact aside whose first line is `Start with the problem.` (as text, not the section heading), GitHub/npm links, and a response note, plus `<ContactForm />`. Use `SectionHead index="04" title="Contact" aside={availabilityLabel ?? SITE.availabilityLabel}`. Keep the copy shorter than `/contact` — the full page remains.

- [ ] **Step 3: Compose + verify** — add `<ContactSection />` to `page.tsx`. Run tests and typecheck. Commit: `feat(web): put the shared contact form in the homepage funnel`.

### Task 4: Contact hardening — honeypot, Zod, 3/hr/IP, server-derived IP

**Files:**

- Create: `apps/web/src/lib/contact-schema.ts`
- Modify: `apps/web/src/components/public/ContactForm.tsx`
- Modify: `apps/web/src/lib/api.ts` (`submitLead` input gains `website?`)
- Modify: `apps/web/src/styles/public.css` (`.field--honeypot`)
- Modify: `apps/api/src/modules/leads/dto/create-lead.dto.ts` (add `website`, remove `ipAddress`; remove `ipAddress` from `UpdateLeadDto`)
- Modify: `apps/api/src/modules/leads/leads.service.ts` (`create(dto, ipAddress?)`, drop honeypot field)
- Modify: `apps/api/src/portfolio/controllers/leads.controller.ts` (`@Ip()`, honeypot guard, `limit: 3`, `ttl: 3600000`)
- Modify: `apps/api/src/modules/leads/leads.service.spec.ts`, `apps/api/src/portfolio/controllers/leads.controller.spec.ts`
- Test: `apps/web/src/test/__tests__/contact-lead.test.tsx`

**Interfaces:**

- Consumes: `zod` (root dependency, already resolvable from `apps/web`), `@nestjs/common` `Ip`, `sanitizeStrings`.
- Produces: `contactSchema` / `ContactInput`; `LeadsService.create(dto: CreateLeadDto, ipAddress?: string)`; controller returns `{ data: { id: 'discarded' } }` for honeypot hits without calling the service.

- [ ] **Step 1: Write the failing web test.** Zod rejects a short message and an invalid email; the honeypot input is present, hidden, and not tabbable; a filled honeypot still reaches the success state (the server silently discards it):

```tsx
it('rejects a message shorter than 10 characters', () => {
  const result = contactSchema.safeParse({
    name: 'Ada',
    email: 'ada@example.com',
    subject: '',
    message: 'short',
    website: '',
  });
  expect(result.success).toBe(false);
});
```

- [ ] **Step 2: Implement client validation + honeypot.** `contactSchema`:

```ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.email({ error: 'Please enter a valid email address' }).max(254),
  subject: z.string().trim().max(500).optional(),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(5000),
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

In `ContactForm`, add `website: ''` to `INITIAL`, parse with `contactSchema.safeParse` before `submitLead`, set `feedback` to the first issue message and `status='error'` on failure, include `website: form.website` in the `submitLead` payload (the reset back to `INITIAL` clears it), and render the honeypot before the submit footer:

```tsx
<div className="field field--honeypot">
  <label htmlFor="contact-website">Website</label>
  <input
    id="contact-website"
    name="website"
    type="text"
    tabIndex={-1}
    autoComplete="off"
    value={form.website}
    onChange={(event) => update('website', event.target.value)}
  />
</div>
```

CSS: `.field--honeypot { display: none; }`. Do **not** use `aria-hidden` here — axe flags aria-hidden containers with focusable descendants, and `display:none` already removes the field from the accessibility tree.

- [ ] **Step 3: Write the failing API tests.** Update the controller spec to assert:
  - `controller.create(dto, '203.0.113.7')` calls `service.create(dto, '203.0.113.7')`.
  - `controller.create({ ...dto, website: 'https://spam.example' }, ip)` resolves `{ data: { id: 'discarded' } }` and does **not** call the service.
  - The route metadata still carries `@Throttle` 3/3_600_000 (assert via `Reflect.getMetadata('THROTTLER:LIMITdefault', handler)` or a focused test that reads the decorator metadata).

- [ ] **Step 4: Implement the API changes.**

```ts
// create-lead.dto.ts
@ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) website?: string;
// delete: ipAddress from CreateLeadDto and UpdateLeadDto

// leads.controller.ts — add `private readonly logger = new Logger(PortfolioLeadsController.name);`
@Post()
@Throttle({ default: { limit: 3, ttl: 3600000 } })
async create(@Body() dto: CreateLeadDto, @Ip() ip: string) {
  if (dto.website?.trim()) {
    this.logger.debug('Lead honeypot triggered; payload discarded');
    return { data: { id: 'discarded' } };
  }
  return { data: await this.leads.create(dto, ip) };
}
```

`LeadsService.create` strips the honeypot key and persists the derived IP:

```ts
async create(dto: CreateLeadDto, ipAddress?: string) {
  const { website: _website, ...sanitized } = sanitizeStrings(dto) as Record<string, unknown>;
  const lead = await this.prisma.lead.create({
    data: { ...sanitized, ipAddress, source: (sanitized.source as string) || 'contact_form', status: 'new', priority: 'normal', metadata: sanitized.metadata || {} } as any,
  });
  // notification unchanged; never log name/email/message
```

- [ ] **Step 5: Run both suites** — from `apps/api`: `npm test -- leads`; from `apps/web`: `npm test -- contact-lead`. Both PASS. Commit (two commits allowed): `feat(web): zod + honeypot on contact form` and `feat(api): 3/hr lead throttle, server-derived IP, honeypot discard`.

### Task 5: Live availability + the deferred `status.success` resolution

**Files:**

- Create: `apps/api/src/portfolio/controllers/availability-status.controller.ts`
- Create: `apps/api/src/portfolio/controllers/availability-status.controller.spec.ts`
- Modify: `apps/api/src/portfolio/portfolio.module.ts`
- Modify: `apps/web/src/lib/api.ts` (`PublicAvailability`, `getPublicAvailability`)
- Modify: `apps/web/src/app/(public)/layout.tsx` (async fetch + pass prop)
- Modify: `apps/web/src/components/public/SiteHeader.tsx` (prop, `data-available`)
- Modify: `apps/web/src/components/public/sections/HeroSection.tsx`, `ContactSection.tsx`
- Modify: `apps/web/src/app/(public)/page.tsx` (fetch availability for the hero/contact)
- Modify: `apps/web/src/styles/public.css` (badge states)
- Modify: `packages/tokens/tokens.json` (`status.success`, `publicContrastPairs`, `statusContrastPairs`)
- Modify: `packages/tokens/src/validate.mjs`, `src/check-contrast.mjs`
- Modify: `packages/tokens/test/tokens.test.mjs`, `test/build.test.mjs`, `test/check-contrast.test.mjs`
- Modify: `packages/tokens/dist/theme-tokens.css` (regenerated)
- Modify: `docs/superpowers/specs/2026-11-13-portfolio-themes-design.md` (new §16)
- Modify: `DESIGN.md` (status/public-green usage)

**Interfaces:**

- Consumes: `AvailabilityStatusService.getStatus()`; `CACHE_TAGS.AVAILABILITY_STATUS`.
- Produces: `GET /api/portfolio/availability-status` → `{ data: { isAvailable, statusLabel, availableUntil, preferredContact, updatedAt } }`; `getPublicAvailability(): Promise<PublicAvailability>` (server fetch, 60 s revalidate, tag `availability-status`); `SiteHeader({ availability }: { availability?: PublicAvailability | null })`.

- [ ] **Step 1: Write the failing token tests.** Pin the amendment and the new matrices:

```js
test('status.success is the Phase 1 amendment', () => {
  assert.deepEqual(tokens.status.success, color('#1F7A52'));
});
test('public and status contrast pairs are locked', () => {
  assert.deepEqual(
    tokens.publicContrastPairs.map((p) => `${p.fg}/${p.bg}`),
    [
      'ink/paper',
      'inkSoft/paper',
      'muted/paper',
      'muted/paperDeep',
      'accent/paper',
      'accentDeep/paper',
      'green/paper',
      'green/paperDeep',
      'codeFg/codeBg',
    ],
  );
  assert.deepEqual(tokens.statusContrastPairs, [
    { fg: 'success', bg: 'paper', level: 'AA_NORMAL' },
  ]);
});
```

Measured evidence for the chosen values (WCAG 2.x, full precision):
`#1F7A52` × `paper` 4.66 ✓ AA_NORMAL · × light base 4.86 ✓ · × dark panel 3.12 ✓ AA_LARGE (non-text) · × dark base 3.69 ✓.
`#2F6B4A` × paper 5.56 · × paperDeep 5.00 · × light base 5.79 · × dark panel 2.61 (fails 3:1 — the badge never sits on graphite).
Every declared public pair passes `AA_NORMAL` on paper: ink 16.15 · inkSoft 10.35 · muted 5.14 · muted/paperDeep 4.62 · accent 4.56 · accentDeep 7.27 · green 5.56 · green/paperDeep 5.00 · codeFg/codeBg 14.22. No scheme-constant green passes AA_NORMAL on both light and dark panels; the resolution is: `status.success` is a **non-text mark on dark panels** (≥3:1) and **text-capable on paper/light**; status text uses `text.*` or `publicSurface.*`, never `status.success` as body text on graphite.

- [ ] **Step 2: Amend `tokens.json`.** `status.success.$value = '#1F7A52'`; add `publicContrastPairs` (nine entries, all `AA_NORMAL`) and `statusContrastPairs` (one entry). `codeFg/codeBg` = 14.22. Do not touch any other status value or hue — in particular `viz['3']` stays `#2E9E6D` (it is a data-viz slot, not status). The only pinned `#2E9E6D` that changes in `test/tokens.test.mjs` is the `status.success` line (L129); `test/build.test.mjs:58` changes from `--pf-status-success: #2E9E6D` to `#1F7A52`.

- [ ] **Step 3: Extend the validator + checker.**

```js
// validate.mjs
const TOP_LEVEL_KEYS = [..., 'contrastPairs', 'publicContrastPairs', 'statusContrastPairs'];

function assertDtcgPairs(pairs, group, at, name) { /* each ref resolves to group[ref].$value */ }
// public: fg/bg both resolve in tokens.publicSurface
// status: fg resolves in tokens.status, bg in tokens.publicSurface
```

`check-contrast.mjs` gains `evaluatePublicPairs(tokens)` and `evaluateStatusPairs(tokens)` returning `{ fg, bg, scheme: 'constant', level, required, actual, pass, kind }`. `run()` concatenates them **only when the arrays exist**, so existing fixtures without the new keys keep their current counts (`test/check-contrast.test.mjs:121`'s `pairs × 2` assertion is unchanged). The CLI summary line prints `30/30 pair-scheme checks pass` (20 existing + 9 public + 1 status); update the `20\/20` regex in `test/check-contrast.test.mjs:143` accordingly.

- [ ] **Step 4: Run the token gate** — `node packages/tokens/src/build.mjs && node --test packages/tokens/test/ && node packages/tokens/src/check-contrast.mjs && node packages/tokens/src/check-budget.mjs` → all green, 30/30 pairs. Commit: `fix(tokens): resolve status.success on paper; add public/status pair matrices`.

- [ ] **Step 5: API endpoint.** Controller mirrors the case-studies pattern (`@Get()`, `@CacheTTL(60000)`, envelope). Register `AvailabilityStatusModule` + controller in `PortfolioModule`. Spec asserts the envelope and delegation. Commit: `feat(api): expose cached public availability status`.

- [ ] **Step 6: Web wiring.** Add `getPublicAvailability()` using `request(..., { next: { revalidate: 60, tags: [CACHE_TAGS.AVAILABILITY_STATUS] } }, true)`. Make `(public)/layout.tsx` async; try/catch → `null`. `SiteHeader` label = `availability?.statusLabel || SITE.availabilityLabel`; `data-available={availability?.isAvailable ?? SITE.available}`. Home page fetches availability for `HeroSection`/`ContactSection` with the same try/catch — Next memoizes the identical `fetch` within one render pass, so layout + page make one API call. CSS: `.site-status[data-available='false'] .site-status__dot { background: var(--muted); box-shadow: none; }` and replace the hardcoded dot shadow with `color-mix(in srgb, var(--green) 12%, transparent)`. Commit: `feat(web): live availability badge with static fallback`.

- [ ] **Step 7: Spec §16 + DESIGN.md.** Add §16 "Phase 1 contrast amendment — `status.success`" with the table row (`was #2E9E6D`, `now #1F7A52`, pairs/ratios above), the non-text-on-graphite ruling, and the public pair matrix. Mark §14 row 7 closed. Update DESIGN.md's status token guidance.

### Task 6: Machine layer — `llms.txt`, `ProfilePage`, robots, sitemap

**Files:**

- Create: `apps/web/src/lib/llms.ts`
- Create: `apps/web/src/app/llms.txt/route.ts`
- Modify: `apps/web/src/lib/json-ld.ts` (`profilePageSchema`)
- Modify: `apps/web/src/app/(public)/layout.tsx` (render `ProfilePage`)
- Modify: `apps/web/src/app/robots.ts` (allow AI crawlers)
- Modify: `apps/web/src/app/sitemap.ts` (already `/resume` from Task 2)
- Test: `apps/web/src/test/__tests__/machine-layer.test.ts` (new)

**Interfaces:**

- Produces: `buildLlmsTxt(): string` (<2048 bytes); `profilePageSchema({ name, jobTitle, url, sameAs, knowsAbout })`; robots rules where GPTBot/CCBot/anthropic-ai/ClaudeBot/PerplexityBot are allowed `/` but still blocked from `/admin/`, `/api/`, `/_next/`.

- [ ] **Step 1: Write the failing test.** Assert byte length, content, JSON-LD shape and robots policy:

```ts
const text = buildLlmsTxt();
expect(Buffer.byteLength(text, 'utf8')).toBeLessThan(2048);
expect(text).toContain('Forgevena');
expect(text).toContain('https://github.com/rohitkumarnaidu');
const rules = robots().rules as Array<{
  userAgent: string | string[];
  disallow?: string | string[];
}>;
const ai = rules.find((rule) => Array.isArray(rule.userAgent) && rule.userAgent.includes('GPTBot'));
expect(ai?.disallow).toEqual(['/admin/', '/api/', '/_next/', '/404', '/500']);
```

- [ ] **Step 2: Implement `llms.ts`.** H1 `# Rohith Naidu`, one blockquote description, role/availability/site lines, `## Selected work` (three featured, one title + absolute URL + one-line summary each), `## Capabilities` (three one-liners), `## Toolkit` (five group names on one line), `## Contact` (contact URL + GitHub). Use `absoluteUrl()` from `seo.ts` for links so the GitHub Pages base path is preserved. Keep the whole file under 2 KB: no project paragraphs and no full ABOUT copy. No `llms-full.txt`, no `.md` mirrors (spec §12 Q3).

- [ ] **Step 3: Route handler.** `app/llms.txt/route.ts`:

```ts
import { buildLlmsTxt } from '@/lib/llms';
export const dynamic = 'force-static';
export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}
```

- [ ] **Step 4: JSON-LD + robots.** Add `profilePageSchema` wrapping `Person` (`sameAs`: GitHub + npm, `knowsAbout`: capability titles). In the public layout, replace the standalone `personSchema` script with `ProfilePage` (keep `WebSite`). In `robots.ts`, replace the three `disallow: '/'` blocks with one allow rule for the five AI agents sharing the standard disallow list.

- [ ] **Step 5: Verify + commit** — tests PASS; `curl` the dev server for `/llms.txt` and `/robots.txt`. Commit: `feat(web): llms.txt, ProfilePage JSON-LD, allow AI crawlers`.

### Task 7: Static OG image (1200×630) + metadata defaults

**Files:**

- Create: `apps/web/scripts/generate-og.mjs`
- Create: `apps/web/public/og/og-default.png` (generated, committed)
- Modify: `apps/web/src/lib/seo.ts` (`DEFAULT_OG_IMAGE`, default images, `summary_large_image`)
- Modify: `apps/web/src/app/layout.tsx` (root `openGraph.images`, `twitter.images`)
- Modify: `apps/web/package.json` (`og:generate` script)
- Test: `apps/web/src/test/__tests__/seo.test.ts` (new)

**Interfaces:**

- Produces: `DEFAULT_OG_IMAGE = '/og/og-default.png'`; every `pageMetadata()` result carries at least one image and `twitter.card === 'summary_large_image'`.

- [ ] **Step 1: Write the failing test.**

```ts
const meta = pageMetadata({ title: 'Work', description: 'Selected systems.', path: '/projects' });
expect(meta.openGraph?.images).toEqual([{ url: absoluteUrl('/og/og-default.png') }]);
expect(meta.twitter).toMatchObject({ card: 'summary_large_image' });
```

- [ ] **Step 2: Generate the asset.** `generate-og.mjs` sets a 1200×630 viewport, `page.setContent()` with an inline template (graphite `#0A0C10` background, ember `#C1662E` trace polyline, name + role + site), and screenshots to `apps/web/public/og/og-default.png`. The script is a design-asset generator, not app code — it is the one allowed place for literal hex. Add `"og:generate": "node scripts/generate-og.mjs"`; run it and commit the PNG.

- [ ] **Step 3: Wire metadata.** `pageMetadata` uses `images?.length ? images : [DEFAULT_OG_IMAGE]`, maps every entry through `absoluteUrl` (a leading `/` would otherwise drop the `/Portfolio` base path), and always emits images; `hasImages` becomes always true. Root layout adds `images: [{ url: absoluteUrl(DEFAULT_OG_IMAGE), width: 1200, height: 630, alt: 'Rohith Naidu — software engineer' }]`, `twitter.card: 'summary_large_image'`, and `twitter.images: [absoluteUrl(DEFAULT_OG_IMAGE)]`.

- [ ] **Step 4: Verify + commit** — tests PASS; inspect the PNG dimensions (`file`/image viewer); `npm run build` metadata output includes the image. Commit: `feat(web): static OG image and metadata defaults`.

### Task 8: Cookieless PostHog + stateless `?ref`

**Files:**

- Create: `apps/web/src/lib/analytics.ts`
- Create: `apps/web/src/components/public/AnalyticsProvider.tsx`
- Create: `apps/web/src/components/public/TrackedLink.tsx`
- Modify: `apps/web/src/components/public/ContactForm.tsx` (`contact_submit`)
- Modify: `apps/web/src/components/public/ResumeDownloadLink.tsx` (`resume_download`)
- Modify: `apps/web/src/components/public/CaseStudy.tsx` (`demo_click` on “Live application”)
- Modify: `apps/web/src/app/(public)/layout.tsx` (mount provider)
- Test: `apps/web/src/test/__tests__/analytics.test.ts` (new)

**Interfaces:**

- Produces: `initAnalytics()`, `getRef(): string | null`, `track(event, props)`, `resetAnalyticsForTests()`. Allowed events: `resume_download`, `demo_click`, `contact_submit`. `?ref` matches `/^[a-z0-9_-]{1,32}$/i`, lowercased, read once from `window.location.search`.

- [ ] **Step 1: Write the failing test** with `vi.mock('posthog-js')`: no key → no init; `getRef` returns `linkedin` for `?ref=LinkedIn`, `null` for `?ref=<script>`; `track` before init is a no-op; after init it forwards `ref: 'direct'` when absent.

- [ ] **Step 2: Implement `analytics.ts`.**

```ts
import posthog from 'posthog-js';

const REF_PATTERN = /^[a-z0-9_-]{1,32}$/i;
let initialized = false;
let ref: string | null | undefined;

export function getRef(): string | null {
  if (ref !== undefined) return ref;
  if (typeof window === 'undefined') return (ref = null);
  const value = new URLSearchParams(window.location.search).get('ref')?.trim().toLowerCase() ?? '';
  return (ref = REF_PATTERN.test(value) ? value : null);
}

export function initAnalytics(): void {
  if (initialized || typeof window === 'undefined') return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    persistence: 'memory',
    autocapture: false,
    capture_pageview: true,
    disable_session_recording: true,
    person_profiles: 'never',
    respect_dnt: true,
  });
  initialized = true;
}

export function track(event: string, properties: Record<string, unknown> = {}): void {
  if (!initialized) return;
  posthog.capture(event, { ...properties, ref: getRef() ?? 'direct' });
}

export function resetAnalyticsForTests(): void {
  initialized = false;
  ref = undefined;
}
```

- [ ] **Step 3: Mount + instrument.** `AnalyticsProvider` is a client component calling `initAnalytics()` in `useEffect(..., [])` and rendering `null`; mount it inside the public layout. `ContactForm` calls `track('contact_submit', { source: 'contact_form' })` after success. `ResumeDownloadLink` calls `track('resume_download', { format: 'pdf' })` on click. `CaseStudy` uses `TrackedLink` for links whose `label === 'Live application'` with `event="demo_click"` and `{ project: project.slug }`; all other links stay plain `<a>`.

- [ ] **Step 4: Verify + commit** — tests PASS; confirm no cookie/localStorage write in DevTools with `?ref=linkedin`; commit `feat(web): cookieless PostHog with stateless ?ref attribution`.

### Task 9: Phase 0 carried hardening

**Files:**

- Modify: `packages/tokens/src/validate.mjs` (non-empty semantic strings; reject unknown skins)
- Modify: `packages/tokens/src/check-contrast.mjs` (optional `PF_TOKENS_PATH` for failure-path CLI test)
- Create: `packages/tokens/scripts/check-syntax.mjs` (new, variadic `node --check`)
- Modify: `packages/tokens/package.json` (`lint` script)
- Modify: root `package.json` (`lint-staged` for `*.mjs`)
- Modify: `apps/web/src/styles/globals.css` (remove three unused timing literals; correct Phase 1 → Phase 3 comments)
- Modify: `apps/web/src/app/layout.tsx` (`data-theme="dark"` SSR mirror)
- Modify: `DESIGN.md` (token-pipeline + theming bullets: Phase 3, not Phase 1)
- Test: `packages/tokens/test/tokens.test.mjs`, `test/check-contrast.test.mjs`, `test/build.test.mjs`, `apps/web/src/test/__tests__/tokens-alias.test.ts` (new)
- Test: `apps/web/e2e/theme-no-flash.spec.ts` (SSR attribute assertion)

**Interfaces:**

- Produces: `validateTokens` rejects `''` semantic values and any `skins` key other than `'3'`; `check-contrast.mjs` reads `PF_TOKENS_PATH` when set; `node packages/tokens/scripts/check-syntax.mjs file...`; the alias-drift test fails if a `var(--pf-*)` used in `globals.css`/`public.css` is absent from `dist/theme-tokens.css`.

- [ ] **Step 1: Write the failing tests.**
  - `validateTokens` with `text.primary.light = ''` → throws `/non-empty/`.
  - `validateTokens` with `skins['1'] = {}` → throws `/only skin "3"/`.
  - Spawn the checker with `PF_TOKENS_PATH` pointing at a temp failing fixture → exit 1 and a failure line.
  - Build vacuity guard: `build().length > 4000` (the generated CSS never silently collapses).
  - Alias drift: read `globals.css` + `public.css` (via `process.cwd()` = `apps/web`), collect every `var(--pf-…)` first argument, assert each appears as a definition in `../../packages/tokens/dist/theme-tokens.css`. Today's baseline is 42 referenced / 65 defined / 0 missing, so the guard starts green and fails on future drift.
  - `theme-no-flash.spec.ts` gains an SSR assertion: `browser.newContext({ javaScriptEnabled: false })`, load `/`, and assert `<html>` carries `data-theme="dark"` (plus `data-scheme`/`data-skin`) — the no-JS state now matches the script's default instead of an absent mirror.

- [ ] **Step 2: Implement the guards.** `assertSemantic` gains `value.length === 0` rejection. `validateTokens` gains `const skins = Object.keys(tokens.skins); if (skins.some((k) => k !== '3')) fail('only skin "3" is implemented; ...')`. `check-contrast.mjs` replaces the static import with a guarded loader (default `../tokens.json`, override via `PF_TOKENS_PATH`). Add `check-syntax.mjs`:

```js
import { execFileSync } from 'node:child_process';
for (const file of process.argv.slice(2)) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}
```

`packages/tokens/package.json`: `"lint": "node scripts/check-syntax.mjs src/*.mjs test/*.mjs"`. Root lint-staged: `"*.mjs": ["prettier --write", "node packages/tokens/scripts/check-syntax.mjs"]`.

- [ ] **Step 3: Apply the small fixes.** Delete `--duration-instant`, `--ease-in`, `--ease-smooth` from `globals.css` (verified zero `var()` usages). Add `data-theme="dark"` to `<html>` in `layout.tsx` so the no-JS SSR state matches the script. Change both "deleted in Phase 1" comments to "deleted in Phase 3 with the alias bridge".

- [ ] **Step 4: Verify + commit** — token tests PASS; `npm run lint -w @portfolio/tokens` PASS; `npm test -w @portfolio/web -- tokens-alias` PASS. Commit: `chore(tokens): Phase 0 hardening — validation, syntax lint, alias drift, SSR mirror`.

### Task 10: E2E refresh, full gate, CWV evidence, docs

**Files:**

- Modify: `apps/web/e2e/homepage.spec.ts` (funnel order, nav `Primary`, no theme toggle)
- Modify: `apps/web/e2e/contact.spec.ts` (labels, Zod messages, honeypot, no reCAPTCHA, success text)
- Modify: `apps/web/e2e/accessibility.spec.ts` (landmarks, headings, nav label)
- Modify: `apps/web/e2e/projects.spec.ts` (drop the search/filter/counter tests — `/projects` is a static list with none of those; assert the heading and the six curated rows)
- Modify: `apps/web/e2e/theme-no-flash.spec.ts` (`data-theme` SSR)
- Create: `apps/web/e2e/resume.spec.ts`
- Create: `apps/web/e2e/machine-layer.spec.ts`
- Modify: `PROGRESS.md`, `roadmap.md`, `DESIGN.md`
- Test: all suites + gate

**Interfaces:**

- Consumes: every prior task.
- Produces: a green web/API/token gate and a recorded evidence block (below).

- [ ] **Step 1: Rewrite the drifting specs.** `homepage.spec.ts`:
  - nav `getByRole('navigation', { name: 'Primary' })`;
  - `section[id]` order `['work','capabilities','principles','contact']`;
  - hero has "View case studies" + "Résumé" links and an availability label;
  - delete the theme-toggle and `Toggle mobile menu` tests (neither exists; the switcher is Phase 3, the mobile menu is a `<details>` labelled `Menu`).

  `contact.spec.ts`: labels are `Name`/`Email`/`Message` (no `*` — today's spec asserts `Name *` and fails), Zod messages are the source strings, the honeypot input is hidden (`display:none`) and not tabbable, the page contains no `recaptcha` script, and a valid submit ends in the real success text (`Message received. I will reply from the address you left.`) **or** the handled error state (the e2e webServer runs Next only, not the API).

- [ ] **Step 2: Add the new specs.**
  - `resume.spec.ts`: `/resume` h1, PDF link, `request.get('/resume/rohith-naidu-resume.pdf')` → 200 + `application/pdf`, print media hides `.site-header`.
  - `machine-layer.spec.ts`: `/llms.txt` 200 `text/plain` and <2 KB; `/robots.txt` allows GPTBot; `/sitemap.xml` contains `/resume`; `/` has `og:image` ending `/og/og-default.png`.

- [ ] **Step 3: Full gate (fresh install).**

```bash
npm install
npm run typecheck
npm run lint
npm test -w @portfolio/api
npm test -w @portfolio/web
npm test -w @portfolio/tokens          # node --test test/
npm run build -w @portfolio/tokens     # regenerate dist before the gate
npm run check -w @portfolio/tokens     # check-contrast + check-budget
npm run build
npm run test:e2e -w @portfolio/web
```

Record the actual counts. Do not carry forward Phase 0's numbers.

- [ ] **Step 4: CWV evidence.** Stop any dev server first (the e2e run above leaves one on :3000 and `reuseExistingServer` would otherwise point Lighthouse at dev), then `npm run build` and `npm run start -w @portfolio/web`; run `npx --yes lighthouse http://localhost:3000 --only-categories=performance --chrome-flags="--headless" --output=json --output-path=./.lighthouse-home.json` (delete the artifact after recording). Record LCP, CLS, TBT. INP is interaction-only: if it is not measured, write "INP not measured in lab" — do not claim it.

- [ ] **Step 5: Docs.** `PROGRESS.md`: Phase 1 status line, phase table, session log with the gate/CWV numbers. `roadmap.md`: mark Phase 1 complete, move unfinished carried items forward. `DESIGN.md`: note the funnel sections, availability badge token usage, and the Phase 3 demolition of the alias bridge. Commit: `test(e2e): Phase 1 funnel, resume and machine-layer coverage; docs: Phase 1 evidence`.

---

## Self-review notes (author)

- **Spec coverage:** §5 order (Tasks 1/3), §6.1 machine layer (Task 6, Q3 scope), §6.2 availability (Task 5), §6.4 `?ref` (Task 8), §6.7 contact (Task 4), §6.8 analytics (Task 8), §6.9 SEO/OG/a11y (Tasks 6/7/10), §8 exit (Task 10). §12 Q2 (one static OG), Q3 (`llms.txt` only), Q7 (no reCAPTCHA), Q8 (cookieless PostHog) are honoured. Q4 (no switcher) is a constraint, not a task.
- **Type consistency:** `CreateLeadDto` gains `website` and loses `ipAddress` in the same task that changes the service signature; `PublicAvailability` is defined once in `api.ts` and imported by the layout/header/hero; `CONTENT_UPDATED` is the only new date source.
- **Placeholder scan:** no "TBD" left. The two facts the plan cannot invent — education/employment history on `/resume` — are explicitly out until the user supplies them.
- **Proportion:** 10 tasks, each independently committable and testable; no task depends on a later one except the final gate.

### Verified against the working tree (2026-11-23, HEAD `dfc87b6`)

Every file/interface named above was re-read this session. Corrections the verification forced (already applied to the task text above):

- The third featured project is titled **`Evidence Review Pipeline`** (slug `insurance-evidence-review`), not "Insurance Evidence Review" — Task 1's test pins the real title.
- `publicContrastPairs` are measured, not assumed: every declared paper pair passes `AA_NORMAL` (smallest margin `muted × paperDeep` 4.62, `accent × paper` 4.56). `#2E9E6D` on paper is 2.96 — it genuinely fails, so the amendment is required, not cosmetic.
- Only **one** pinned `#2E9E6D` changes in `test/tokens.test.mjs` (the `status.success` line); the identical hex in `viz['3']` is a data-viz slot and stays.
- `check-contrast.test.mjs:143` asserts the CLI's `20/20` summary in stdout — that regex becomes `30/30`; the `pairs × 2` fixture count (line 121) is untouched because the new arrays are optional.
- The e2e `contact.spec.ts` drift is worse than labels: it asserts `Name *`, a `Message sent!` success string that has never existed (the form says "Message received…"), and validation strings that arrive only with Task 4. Task 10 rewrites it against reality.
- `projects.spec.ts` tests a search box, result counter and category filters that **do not exist** on `/projects` — added to Task 10's rewrite list.
- `pageMetadata` images must go through `absoluteUrl()`; a leading-slash OG URL would resolve against `metadataBase` and drop the `/Portfolio` GitHub Pages base path.
- The Playwright PDF script needs `fileURLToPath` — `new URL(...).pathname` yields `/C:/...` on Windows.
- The honeypot uses `display:none` + `tabIndex={-1}`, not `aria-hidden` (axe's aria-hidden-focus rule).
- The token gate command is `npm run check -w @portfolio/tokens` (the script exists; a `check-contrast` script does not).

## Post-plan closure (executed 2026-11-25, HEAD `da5b507` + Task 10)

- **Funnel e2e:** `e2e/homepage.spec.ts` pins `main section[id]` to exactly `['hero','work','capabilities','principles','contact']` in order, the hero CTAs (`View case studies` → `#work`, `Résumé` → `/resume`), the availability fallback text in `.hero__status`, the route-based primary nav (Work/About/Resume/Writing/Contact), and the mobile `<details>` menu at 375px. 4/4 pass.
- **Contact tests:** e2e pins the honeypot (hidden, never keyboard-reachable, never a reCAPTCHA script) and each Zod validation message in order; the throttle (3/hr/IP) and the derived-IP mutation are pinned by API Jest in Task 4. Contact e2e 5/5.
- **Availability fallback:** with no API running, the homepage e2e pins `.hero__status` to `Open to work` (curated fallback); unit tests pin the `/portfolio/availability` contract and its 60 s revalidate. (Expected `ECONNREFUSED` noise appears in the e2e log on the submit test only.)
- **Token gate:** `npm run check -w @portfolio/tokens` → **30/30** pair-scheme checks pass; skin 3 = 899 B light + 946 B dark = **1,845 B** < 8,192 B (+1,481 B shared `:root` overhead, not counted); raw-hex guard **0 violations**; `check-syntax` 30/30.
- **Machine layer (production build, served by `next start`):** `/llms.txt` = **1,620 B** (limit 2,048); `/robots.txt` = 373 B, allows `GPTBot`/`CCBot`/`anthropic-ai`/`ClaudeBot`/`PerplexityBot` and never `Disallow: /`; `/sitemap.xml` = 2,317 B and lists `/resume`; `/og/og-default.png` = **44,629 B** (1200×630) referenced by absolute URL on `/`. e2e `machine-layer.spec.ts` 4/4.
- **Full gate (all real, 0 cached):** `turbo run typecheck lint --force` → **9/9**; API Jest → **39 suites / 466 tests**; web Vitest → **14 files / 106 tests**; tokens → 30/30 + budget; `turbo run build --force` → **3/3** (1 m 50 s, SSR `<html lang="en" data-scheme="dark" data-skin="3" data-theme="dark">`); Playwright → **26/26** in 52.9 s.
- **CWV (Lighthouse 13.6.0, mobile form factor, against the production build):** median of 5 runs — **LCP 1.075 s ✓ (gate ≤ 2.5 s), CLS 0.000 ✓ (gate ≤ 0.1), TBT 113 ms, FCP 1.075 s, score 99**. Observed LCP 175–370 ms; the LCP element is the hero `<h1>`. **INP not measured in lab.**
  - _Caveat (upstream, Windows-only):_ Next 15.5.x's `NextFontManifestPlugin` matches the loader with a forward-slash literal (`includes('/next-font-loader/index.js?')`), so on Windows the font manifest is empty and **no font preloads are emitted**. Measured on this machine: without preloads LCP 2.65–2.92 s / CLS up to 0.041 (font-swap shift); with them, LCP 1.07–1.11 s / CLS 0.000. Patching the check to accept `\` reproduces the Linux output exactly — the manifest populates, Next itself emits the same four `<link rel=preload as=font>` tags, and they survive the 60 s ISR revalidation of `/`. Production (Linux) therefore ships the preloads; `apps/web/src` is unchanged and carries no workaround (a postbuild HTML patcher was prototyped and **rejected** — ISR re-renders strip static edits; see follow-ups). Re-measure CWV on Linux before treating any Windows number as a regression.
- **Follow-ups discovered:**
  1. **Next 15.5.x Windows font-preload defect** (above) — worth an upstream issue; track it so a future Windows CWV gate is not misread.
  2. `next start` is incompatible with `output: 'standalone'` — measure with `node .next/standalone/apps/web/server.js` (and copy `.next/static` + `public` in, as deploy does).
  3. `next dev` and the Playwright webServer share `.next`, so an e2e run **destroys** the production build (`Could not find a production build`); rebuild after e2e.
  4. `.reveal` runs **850 ms** (`public.css`), outside DESIGN.md's 260–500 ms reveal band — pre-existing drift, carried to Phase 3 (motion), not changed here.
  5. `e2e/` is excluded from `tsconfig` and outside `next lint`, so Playwright specs are verified by execution only — a type error in a spec cannot fail the gate.
  6. `/` and `/resume` use `initialRevalidateSeconds: 60`, so any postbuild HTML patching is unreliable by design; render-time emission (the font manifest) is the only durable place for preloads.
  7. The root layout declares `og:image` `width`/`height`/`alt`, but every page that calls `pageMetadata()` replaces the `openGraph` object, so the emitted HTML carries the image URL only. Add the 1200×630 hints (and alt) to the default card inside `pageMetadata` if rich-preview metadata matters; the current output still satisfies the plan (absolute URL, real 1200×630 PNG).
