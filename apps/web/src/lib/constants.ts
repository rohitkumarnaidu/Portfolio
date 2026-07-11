/**
 * @module constants
 * @description Centralized application constants. Single source of truth for
 * site metadata, navigation, section IDs, and route paths.
 *
 * Rules:
 * - Never hardcode these values in components
 * - Always import from this module
 * - Update this file when adding new sections or routes
 *
 * Architecture Reference: docs/09-ARCHITECTURE.md §2.1 (Route Structure)
 * Design Reference: docs/08b-COMPONENT-LIBRARY.md §1.1 (Navbar)
 */

// ── Site Metadata ───────────────────────────────────────────

export const SITE_CONFIG = {
  name: 'Portfolio',
  title: 'Portfolio — Full-Stack Developer',
  titleTemplate: '%s — Portfolio',
  description:
    'Full-stack developer specializing in React, Next.js, NestJS, and TypeScript. Building enterprise-grade web applications with modern technologies.',
  author: 'Portfolio Owner',
  locale: 'en_US',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://portfolioowner.com',
} as const;

// ── Social Links ────────────────────────────────────────────

export const SOCIAL_LINKS = [
  {
    platform: 'github' as const,
    url: 'https://github.com',
    label: 'Visit GitHub profile',
  },
  {
    platform: 'linkedin' as const,
    url: 'https://linkedin.com',
    label: 'Visit LinkedIn profile',
  },
  {
    platform: 'email' as const,
    url: 'mailto:hello@portfolio.com',
    label: 'Send an email',
  },
] as const;

// ── Section IDs ─────────────────────────────────────────────

/**
 * Unique IDs for each homepage section.
 * Used for:
 * - Scroll anchoring (#hero, #about)
 * - Navigation active state (useScrollSpy)
 * - Skip links
 * - Analytics section_view events
 *
 * @see docs/08b-COMPONENT-LIBRARY.md §1.5 (SectionWrapper)
 */
export const SECTION_IDS = {
  HERO: 'hero',
  ABOUT: 'about',
  SKILLS: 'skills',
  EXPERIENCE: 'experience',
  PROJECTS: 'projects',
  TESTIMONIALS: 'testimonials',
  BLOG: 'blog',
  SERVICES: 'services',
  FAQ: 'faq',
  CONTACT: 'contact',
} as const;

export type SectionId = (typeof SECTION_IDS)[keyof typeof SECTION_IDS];

// ── Navigation Links ────────────────────────────────────────

/**
 * Primary navigation items for the public Navbar.
 * Order matches the visual scroll order of homepage sections.
 *
 * @see docs/08b-COMPONENT-LIBRARY.md §1.1 — Max 7 nav links
 */
// ── Route Paths ─────────────────────────────────────────────

export const ROUTES = {
  // Public routes
  HOME: '/',
  PROJECTS: '/projects',
  PROJECT_DETAIL: (slug: string) => `/projects/${slug}` as const,
  BLOG: '/blog',
  BLOG_POST: (slug: string) => `/blog/${slug}` as const,
  CONTACT: '/contact',
  CASE_STUDIES: '/case-studies',
  CASE_STUDY_DETAIL: (id: string) => `/case-studies/${id}` as const,
  AI_ASSISTANT: '/ai-assistant',
  ACHIEVEMENTS: '/achievements',
  PRESS: '/press',
  READING_LIST: '/reading-list',
  GUEST_APPEARANCES: '/guest-appearances',

  // Admin routes
  ADMIN: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin',
  ADMIN_CMS: '/admin/cms',
  ADMIN_LEADS: '/admin/leads',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_ACHIEVEMENTS: '/admin/achievements',
  ADMIN_PRESS_FEATURES: '/admin/press-features',

  // API routes
  API_HEALTH: '/api/health',
  API_REVALIDATE: '/api/revalidate',
} as const;

// ── Navigation Links ────────────────────────────────────────

export const NAV_LINKS = [
  { href: `#${SECTION_IDS.ABOUT}`, label: 'About' },
  { href: `#${SECTION_IDS.SKILLS}`, label: 'Skills' },
  { href: `#${SECTION_IDS.EXPERIENCE}`, label: 'Experience' },
  { href: `#${SECTION_IDS.PROJECTS}`, label: 'Projects' },
  { href: ROUTES.BLOG, label: 'Blog' },
  { href: ROUTES.CASE_STUDIES, label: 'Case Studies' },
  { href: ROUTES.AI_ASSISTANT, label: 'AI Assistant' },
  { href: `#${SECTION_IDS.CONTACT}`, label: 'Contact' },
] as const;

// ── ISR Revalidation Intervals ──────────────────────────────

/**
 * ISR revalidation intervals in seconds.
 *
 * @see docs/09-ARCHITECTURE.md §2.2 (Rendering Strategy)
 */
export const REVALIDATE = {
  /** Homepage sections, projects listing */
  DEFAULT: 60,
  /** Blog posts — less frequently updated */
  BLOG: 300,
  /** Skills, testimonials — rarely updated */
  STATIC: 3600,
} as const;

// ── API Configuration ───────────────────────────────────────

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  aiBaseUrl: process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000',
  version: 'v1',
  timeout: 10000,
} as const;

// ── Rate Limiting ───────────────────────────────────────────

/**
 * Client-side rate limiting thresholds.
 * Server enforces actual limits; these provide UX feedback.
 *
 * @see docs/09-ARCHITECTURE.md §11.4 (Rate Limiting Tiers)
 */
export const RATE_LIMITS = {
  CONTACT_FORM: { max: 3, windowMs: 15 * 60 * 1000 },
  AI_CHAT: { max: 20, windowMs: 60 * 1000 },
} as const;

// ── Animation ───────────────────────────────────────────────

/**
 * Shared animation configuration values.
 *
 * @see docs/08-DESIGN-SYSTEM.md §1.5 (Animation Tokens)
 */
export const ANIMATION = {
  /** IntersectionObserver threshold for scroll reveals */
  REVEAL_THRESHOLD: 0.1,
  /** Stagger delay between items (ms) */
  STAGGER_DELAY: 80,
  /** Section reveal animation duration (ms) */
  REVEAL_DURATION: 600,
} as const;
