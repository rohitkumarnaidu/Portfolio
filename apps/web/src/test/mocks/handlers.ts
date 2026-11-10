import { http, HttpResponse } from 'msw';

/**
 * MSW request handlers for the portfolio API.
 *
 * The web client (`src/lib/api.ts`) issues requests against a relative `/api`
 * base in the browser/jsdom environment, so handlers are registered for both
 * the relative path (jsdom origin, e.g. `http://localhost/api/...`) and the
 * absolute server base (`NEXT_PUBLIC_API_URL`) to cover SSR-style calls.
 *
 * The API response envelope is always `{ data, meta? }` — see AGENTS.md.
 */

const API_PATHS = ['/api', '*/api'] as const;

/** Wrap a value in the standard `{ data }` envelope. */
function envelope<T>(data: T, meta?: Record<string, unknown>) {
  return meta ? { data, meta } : { data };
}

// ── Fixtures ────────────────────────────────────────────────

export const mockProjects = [
  {
    id: 'p1',
    title: 'Realtime Analytics Dashboard',
    slug: 'realtime-analytics-dashboard',
    description: 'A high-throughput analytics dashboard built with React and WebSockets.',
    category: 'web',
    tech_stack: ['React', 'TypeScript', 'WebSockets'],
    is_featured: true,
    is_private: false,
    display_order: 0,
    content: {},
    metrics: {},
    cover_image: null,
    live_url: 'https://example.com',
    github_url: 'https://github.com/example/repo',
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'p2',
    title: 'Mobile Fitness Companion',
    slug: 'mobile-fitness-companion',
    description: 'A cross-platform fitness tracker with offline-first sync.',
    category: 'mobile',
    tech_stack: ['React Native', 'Expo', 'SQLite'],
    is_featured: false,
    is_private: false,
    display_order: 1,
    content: {},
    metrics: {},
    cover_image: null,
    live_url: null,
    github_url: null,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z',
  },
];

export const mockBlogPosts = [
  {
    id: 'b1',
    title: 'Scaling a Next.js App to a Million Users',
    slug: 'scaling-nextjs',
    content: 'Full article body.',
    excerpt: 'Lessons learned scaling a Next.js application.',
    category: 'engineering',
    tags: ['nextjs', 'performance'],
    read_time: 8,
    is_published: true,
    is_featured: true,
    author: 'Admin',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
];

/**
 * Mutable rate-limit switch. Tests can flip this to make the leads endpoint
 * respond with HTTP 429, exercising the client's rate-limit handling.
 */
export const leadState = {
  rateLimited: false,
};

// ── Handlers ────────────────────────────────────────────────

/** Build the handler set for a single API base path. */
function buildHandlers(base: string) {
  return [
    // Public / admin projects — api.ts calls GET /api/projects
    http.get(`${base}/projects`, () => HttpResponse.json(envelope(mockProjects))),
    http.get(`${base}/projects/:slugOrId`, ({ params }) => {
      const match = mockProjects.find(
        (p) => p.id === params.slugOrId || p.slug === params.slugOrId,
      );
      if (!match) {
        return HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Project not found' } },
          { status: 404 },
        );
      }
      return HttpResponse.json(envelope(match));
    }),

    // Portfolio-namespaced projects (defensive alias for future routing)
    http.get(`${base}/portfolio/projects`, () => HttpResponse.json(envelope(mockProjects))),

    // Blog posts — api.ts calls GET /api/admin/blog
    http.get(`${base}/admin/blog`, () => HttpResponse.json(envelope(mockBlogPosts))),
    http.get(`${base}/admin/blog/:slugOrId`, ({ params }) => {
      const match = mockBlogPosts.find(
        (p) => p.id === params.slugOrId || p.slug === params.slugOrId,
      );
      if (!match) {
        return HttpResponse.json(
          { error: { code: 'NOT_FOUND', message: 'Post not found' } },
          { status: 404 },
        );
      }
      return HttpResponse.json(envelope(match));
    }),
    http.get(`${base}/portfolio/blog`, () => HttpResponse.json(envelope(mockBlogPosts))),

    // Sections — used by contact/other pages
    http.get(`${base}/sections`, () => HttpResponse.json(envelope([]))),

    // Leads — api.ts calls POST /api/leads
    http.post(`${base}/leads`, async ({ request }) => {
      if (leadState.rateLimited) {
        return HttpResponse.json(
          {
            error: {
              code: 'RATE_LIMITED',
              message: 'Too many requests',
              details: [{ message: 'Please wait 60 seconds before trying again.' }],
            },
          },
          { status: 429 },
        );
      }
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(
        envelope({
          id: 'lead-1',
          name: body.name ?? '',
          email: body.email ?? '',
          message: body.message ?? '',
          source: body.source ?? 'contact_form',
          status: 'new',
          priority: 'normal',
          created_at: '2024-04-01T00:00:00Z',
          updated_at: '2024-04-01T00:00:00Z',
        }),
        { status: 201 },
      );
    }),
    // Leads — api.ts calls POST /api/portfolio/leads
    http.post(`${base}/portfolio/leads`, async ({ request }) => {
      if (leadState.rateLimited) {
        return HttpResponse.json(
          {
            error: {
              code: 'RATE_LIMITED',
              message: 'Too many requests',
              details: [{ message: 'Please wait 60 seconds before trying again.' }],
            },
          },
          { status: 429 },
        );
      }
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(
        envelope({
          id: 'lead-1',
          name: body.name ?? '',
          email: body.email ?? '',
          message: body.message ?? '',
          source: body.source ?? 'contact_form',
          status: 'new',
          priority: 'normal',
          created_at: '2024-04-01T00:00:00Z',
          updated_at: '2024-04-01T00:00:00Z',
        }),
        { status: 201 },
      );
    }),

    // Analytics events (fire-and-forget beacon endpoints)
    http.post(`${base}/analytics/events`, () =>
      HttpResponse.json(envelope({ accepted: true }), { status: 202 }),
    ),
    http.post(`${base}/portfolio/analytics/events`, () =>
      HttpResponse.json(envelope({ accepted: true }), { status: 202 }),
    ),
  ];
}

export const handlers = [...API_PATHS.flatMap((base) => buildHandlers(base))];
