export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: number;
  publishedAt: string;
  tags: string[];
  coverImage?: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: 'post-1',
    slug: 'building-accessible-react-components',
    title: 'Building Accessible React Components: A Practical Guide',
    excerpt:
      'Learn how to create React components that are fully accessible, from semantic HTML patterns to keyboard navigation and ARIA attributes.',
    content: `Accessibility is not an afterthought — it's a fundamental aspect of web development that ensures your applications can be used by everyone, regardless of their abilities.

In this guide, I'll walk through practical patterns for building accessible React components that follow WCAG 2.2 AA standards.

## Semantic HTML is Your Foundation

Before reaching for ARIA attributes, use the right semantic HTML element. A <button> is already keyboard accessible. A <nav> announces itself to screen readers. A <main> element defines the primary content region.

## Keyboard Navigation Patterns

Every interactive element must be reachable and operable via keyboard. This means:
- All interactive elements receive focus in logical order
- No keyboard traps (focus must be able to leave every component)
- Visible focus indicators that meet 3:1 contrast ratio

## ARIA: Add Only When HTML Isn't Enough

ARIA attributes supplement native semantics. The first rule of ARIA? Don't use ARIA if you can use a native HTML element that provides the semantics you need.

## Testing Your Components

Use a combination of automated tools (axe-core, Lighthouse) and manual testing (keyboard-only navigation, screen reader testing) to verify accessibility.`,
    category: 'Accessibility',
    readTime: 8,
    publishedAt: '2026-05-20',
    tags: ['React', 'Accessibility', 'WCAG'],
  },
  {
    id: 'post-2',
    slug: 'next-js-14-performance-optimization',
    title: 'Next.js 14 Performance: From 60 to 95+ Lighthouse Score',
    excerpt:
      'A deep dive into ISR, streaming, Server Components, and bundle optimization techniques that dramatically improved our Core Web Vitals.',
    content: `Performance optimization in Next.js 14 requires understanding the rendering strategies available and choosing the right one for each page.

## The Rendering Spectrum

Next.js offers four rendering strategies: Static Generation (SSG), Server-Side Rendering (SSR), Incremental Static Regeneration (ISR), and Streaming.

Each has its place. The key is matching the strategy to the data freshness requirements of each page.

## Code Splitting Architecture

Split your application at route boundaries, component boundaries, and library boundaries. Dynamic imports with named exports, next/dynamic for components, and careful dependency management all contribute to smaller bundles.

## Image Optimization

The Next.js Image component handles responsive images, lazy loading, and WebP conversion automatically. But you still need to provide correct dimensions and prioritize above-the-fold images.

## Measuring What Matters

Core Web Vitals (LCP, FID, CLS) are the metrics that matter for user experience and SEO. Use the Web Vitals library and real user monitoring to track these in production.`,
    category: 'Performance',
    readTime: 12,
    publishedAt: '2026-04-15',
    tags: ['Next.js', 'Performance', 'Core Web Vitals'],
  },
  {
    id: 'post-3',
    slug: 'enterprise-typescript-patterns',
    title: 'Enterprise TypeScript Patterns: Beyond the Basics',
    excerpt:
      'Advanced TypeScript patterns for large-scale applications: branded types, discriminated unions, builder patterns, and type-safe API clients.',
    content: `As TypeScript applications grow, basic types aren't enough. You need patterns that scale with your codebase.

## Branded Types for Type Safety

Branded types prevent mixing up values that share the same underlying type but represent different things. A UserId and a ProductId might both be strings, but they should never be interchangeable.

## Discriminated Unions for State Management

Model your application states as discriminated unions. Every possible state is explicitly defined, and TypeScript narrows the type based on the discriminant property. This eliminates impossible states at compile time.

## Builder Pattern for Complex Objects

When constructing objects with many optional parameters, the builder pattern provides a clean, composable API that guides the developer toward correct usage.

## Type-Safe API Clients

Define your API layer with typed request and response schemas. Use Zod for runtime validation that doubles as TypeScript type inference.`,
    category: 'TypeScript',
    readTime: 10,
    publishedAt: '2026-03-28',
    tags: ['TypeScript', 'Architecture', 'Patterns'],
  },
  {
    id: 'post-4',
    slug: 'docker-compose-for-development',
    title: 'Docker Compose for Local Development: A Complete Setup',
    excerpt:
      'How to set up a production-like local development environment using Docker Compose with hot reloading, database seeding, and service orchestration.',
    content: `Docker Compose provides a consistent development environment that mirrors production, eliminating "it works on my machine" problems.

## Service Architecture

Define each service (frontend, API, database, cache) as a separate service in docker-compose.yml. Use named volumes for persistent data and bind mounts for hot reloading.

## Hot Reloading in Containers

Configure your development servers to watch for file changes within the container. Use environment-specific Dockerfiles that install development dependencies and enable source maps.

## Database Seeding

Create a seed script that runs on first startup, populating your database with realistic test data. This ensures every developer starts with the same data state.

## Networking Between Services

Services communicate over an internal Docker network. Use service names as hostnames and never expose development databases to the host machine.`,
    category: 'DevOps',
    readTime: 7,
    publishedAt: '2026-02-10',
    tags: ['Docker', 'DevOps', 'Development'],
  },
  {
    id: 'post-5',
    slug: 'testing-react-hooks',
    title: 'Testing React Hooks: From Unit to Integration',
    excerpt:
      'Comprehensive guide to testing React hooks including custom hooks, state changes, side effects, and integration with components using React Testing Library.',
    content: `Testing React hooks requires understanding what the hook does and choosing the right testing strategy.

## Unit Testing Pure Logic

If your hook contains pure computations or data transformations, test those directly. Extract pure functions from your hooks and test them in isolation.

## Testing Hook Behavior

Use renderHook from @testing-library/react to test hooks in isolation. This lets you verify state changes, effect behavior, and return values without rendering a full component.

## Integration Testing with Components

The most valuable tests verify that hooks work correctly within components. Test the component behavior, not the hook implementation.

## Mocking External Dependencies

Mock API calls, browser APIs, and context providers to control the test environment. Use MSW for HTTP mocking and jest.spyOn for browser APIs.

## Testing Async Behavior

Use waitFor and findBy* queries for asynchronous behavior. Test loading states, success states, and error states for every async operation.`,
    category: 'Testing',
    readTime: 9,
    publishedAt: '2026-01-05',
    tags: ['Testing', 'React', 'Hooks'],
  },
  {
    id: 'post-6',
    slug: 'css-grid-modern-layouts',
    title: 'CSS Grid for Modern Layouts: Beyond the Basics',
    excerpt:
      'Master CSS Grid with advanced patterns for responsive layouts, overlapping elements, and complex magazine-style designs without framework dependencies.',
    content: `CSS Grid has revolutionized web layout. But most developers only scratch the surface.

## Grid Template Areas for Page Layout

Define your page layout using named grid areas. This creates a visual map of your layout in CSS that's easy to modify and maintain. Change the entire page layout by moving area names, not element positions.

## Responsive Grids Without Media Queries

Use auto-fit, auto-fill, and minmax() to create responsive grids that adapt to available space without a single media query. The grid does the math for you.

## Overlapping Elements with Grid

Grid items can occupy the same cell, creating natural overlap. Use z-index and alignment properties to control stacking and positioning. This enables magazine-style layouts with pure CSS.

## Subgrid for Nested Alignment

Subgrid lets child elements align with their parent grid tracks, creating consistent vertical and horizontal rhythms even with deeply nested content.

## Grid and Flexbox Working Together

Use Grid for two-dimensional layout (rows and columns) and Flexbox for one-dimensional layout (a single row or column). They complement each other.`,
    category: 'CSS',
    readTime: 6,
    publishedAt: '2025-12-01',
    tags: ['CSS', 'Grid', 'Layout'],
  },
];
