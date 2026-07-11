# Rendering Strategy

This document outlines the rendering patterns used across the Portfolio application to balance Performance (Core Web Vitals), Search Engine Optimization (SEO), and highly interactive user experiences (3D, AI Chat).

## Next.js 14 App Router

We leverage the full spectrum of Next.js 14 rendering paradigms. The architecture defaults to **Server-First**, pushing interactive elements to the leaves of the component tree.

### 1. Server Components (RSC) - The Default

By default, all components in the `src/app` directory are React Server Components.

**Why:**

- **Zero Bundle Size:** RSCs ship no JavaScript to the client.
- **Direct Backend Access:** Can securely query the NestJS backend or internal services without exposing tokens.
- **SEO Excellence:** Content is fully rendered as HTML before reaching the browser.

**Use Cases:**

- Layouts and basic routing (`layout.tsx`, `page.tsx`).
- Portfolio typography, grid containers, and static text.
- Article and project detail views.

### 2. Client Components (`'use client'`)

Client boundaries are explicitly declared using the `'use client'` directive. We adhere strictly to the "leaves" pattern, pushing this directive as low in the component hierarchy as possible.

**Why:**

- Allows use of React hooks (`useState`, `useEffect`, `useContext`).
- Enables browser APIs (Window, Document, WebGL).
- Required for interactivity (Framer Motion, Radix UI primitives, React Three Fiber).

**Use Cases:**

- **3D Canvases:** Any component wrapping `<Canvas>` from `@react-three/fiber`.
- **Animations:** Framer Motion `<motion.div>` wrappers.
- **Interactive UI:** Forms, AI Chat windows, Admin dashboard data grids.

### 3. Static Site Generation (SSG) & Incremental Static Regeneration (ISR)

For the public portfolio, content that rarely changes is statically generated at build time.

- **Implementation:** We utilize `fetch` with `cache: 'force-cache'` and `next.revalidate` tags.
- **ISR Webhooks:** When an Admin updates a project or blog post via the NestJS backend, the backend fires an on-demand revalidation webhook to the Next.js API, purging the cache for that specific path.

### 4. Server-Side Rendering (SSR) & Dynamic Rendering

Routes that depend on user-specific data or search parameters are dynamically rendered at request time.

- **Implementation:** Triggered automatically when using dynamic functions (`cookies()`, `headers()`, `searchParams`).
- **Use Cases:** The entire Admin Dashboard (`/admin/*`) relies on dynamic rendering to ensure the user is authenticated and viewing the most up-to-date database state.

## Streaming and Suspense

To improve Perceived Load Time and First Contentful Paint (FCP), we heavily utilize React Suspense.

### Suspense Boundaries

- **Component-Level:** Wrap heavy components (like the 3D Canvas or AI Chat interface) in `<Suspense fallback={<LoadingSkeleton />}>`. This allows the text and layout of the portfolio to load instantly while the heavy assets load in the background.
- **Route-Level:** Use `loading.tsx` for route transitions in the App Router.

### Streaming Data

For the AI chat integration (LangChain/FastAPI), we use streaming Server-Sent Events (SSE). The Next.js frontend consumes these streams to render AI responses token-by-token, minimizing wait times for the user.

## React Three Fiber Rendering

- **Canvas Placement:** The 3D Canvas is kept at the layout level to persist across route changes, avoiding expensive WebGL context recreation and re-parsing of 3D models.
- **View Tracking:** We use R3F's `View` system to render different 3D scenes in different DOM nodes while utilizing a single underlying WebGL canvas.
