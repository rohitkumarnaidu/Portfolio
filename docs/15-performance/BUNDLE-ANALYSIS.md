# Bundle Analysis

> **Document:** `BUNDLE-ANALYSIS.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** Active | **Owner:** Frontend Lead | **Review Cadence:** Per Release
> **Cross-References:** [PERFORMANCE-ARCHITECTURE.md](./PERFORMANCE-ARCHITECTURE.md) | [PERFORMANCE-BUDGET.md](./PERFORMANCE-BUDGET.md) | [PERFORMANCE-OPTIMIZATION.md](./PERFORMANCE-OPTIMIZATION.md)

---

## 1. Bundle Composition

The `@portfolio/web` bundle is analyzed using `@next/bundle-analyzer` (enabled via `ANALYZE=true`). The table below shows current bundle sizes for the home page entry point.

### 1.1 Key Contributors (Initial Load)

| Package | Size (gzipped) | Category | Splitting Strategy |
|---------|---------------|----------|-------------------|
| Three.js / R3F | ~200 KB | 3D Rendering | Dynamic import, loaded on hero visibility |
| GSAP | ~40 KB | Animation | Dynamic import per page |
| Tiptap | ~50 KB | Rich Text Editor | Admin only, lazy loaded |
| Framer Motion | ~30 KB | UI Animation | Route-based splitting |
| Monaco Editor | ~500 KB | Code Editor | Admin sandbox only, on-demand load |

### 1.2 Shared Dependencies

| Package | Size (gzipped) | Notes |
|---------|---------------|-------|
| React + React DOM | ~45 KB | Single copy, shared across routes |
| Next.js runtime | ~70 KB | Includes router, image optimization |
| Tailwind CSS | ~10 KB | Purged, tree-shaken |
| `@portfolio/ui` | ~15 KB | Shared UI components |
| `@portfolio/shared` | ~5 KB | Type validation schemas |

---

## 2. Code Splitting Strategy

### 2.1 Route-Based Splitting (Automatic via App Router)

Next.js App Router automatically code-splits per route segment. Each page loads only its own JavaScript chunk.

| Route | JS Chunk | Includes | Strategy |
|-------|---------|----------|----------|
| `/` (Home) | home.js | Hero, sections | Core bundle only |
| `/portfolio` | portfolio.js | Project grid | Static generation |
| `/blog` | blog.js | Blog list | Static generation |
| `/admin` | admin.js | Dashboard | Authenticated, lazy |
| `/admin/sandbox` | sandbox.js | Monaco, terminal | On-demand only |

### 2.2 Dynamic Imports

```typescript
// 3D scene — loaded only when hero section enters viewport
const HeroScene = dynamic(() => import('@/components/3d/HeroScene'), {
  loading: () => <HeroSkeleton />,
  ssr: false,
});

// Monaco editor — admin sandbox only, loaded on interaction
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

// GSAP — loaded per-page only where animations are needed
const AnimatedSection = dynamic(() => import('@/components/AnimatedSection'), {
  ssr: false,
});
```

### 2.3 Package Import Optimization

Configured in `next.config.js`:

```javascript
experimental: {
  optimizePackageImports: ['@portfolio/ui', '@portfolio/shared', 'three', 'motion', 'gsap'],
}
```

---

## 3. Measurement Methodology

### 3.1 Bundle Analyzer

- Enabled via environment variable: `ANALYZE=true npm run build`
- Run `@next/bundle-analyzer` — produces interactive treemap of bundle composition
- Analyzer configuration inline in `next.config.js`:

```javascript
const withBundleAnalyzer = process.env.ANALYZE
  ? require('@next/bundle-analyzer')({ enabled: true })
  : (config) => config;
```

### 3.2 CI Integration

| Check | Tool | Frequency | Action on Failure |
|-------|------|-----------|-------------------|
| Bundle size diff | `compare-size` action | Every PR | Comment with diff |
| Budget enforcement | Lighthouse CI | Every PR | Block merge |
| Dependency size | `size-limit` | Every PR | Warning annotation |

---

## 4. Budget Targets

| Route | Target (gzipped) | Current | Status |
|-------|-----------------|---------|--------|
| Home page JS | < 150 KB | ~120 KB | ✅ Pass |
| Blog page JS | < 100 KB | ~80 KB | ✅ Pass |
| Portfolio page JS | < 100 KB | ~75 KB | ✅ Pass |
| Admin page JS | < 300 KB | ~250 KB | ✅ Pass |
| Sandbox page JS | < 600 KB | ~550 KB | ⚠️ Near limit |
| Total page CSS | < 50 KB | ~30 KB | ✅ Pass |
| Total page JS (any) | < 600 KB | varies | ⚠️ Near limit on sandbox |

---

## 5. Optimization Techniques

| Technique | Impact | Implementation |
|-----------|--------|----------------|
| Tree shaking | Removes unused exports | ES module imports, barrel file elimination |
| Package optimization | Reduces bundle per route | `optimizePackageImports` in next.config.js |
| Dynamic imports | Defers heavy libs to runtime | `next/dynamic` with `ssr: false` |
| Image optimization | Reduces image payload | `next/image`, WebP/AVIF, responsive sizes |
| Font optimization | Eliminates render-blocking font requests | `next/font`, self-hosted, `display: swap` |
| Third-party scripts | Prevents render blocking | `next/script` with `strategy: 'lazyOnload'` |
| Route groups | Separates marketing vs app bundles | App Router route group layout |

---

## 6. Regression Prevention

| Guard | Mechanism | Escalation |
|-------|-----------|------------|
| CI bundle size check | Compare PR bundle vs baseline | PR blocked if > 10% increase |
| Budget violation alert | Lighthouse CI assertion | PR blocked, Slack notification |
| Weekly bundle report | Automated size-limit report | Reviewed in weekly perf meeting |
| Dependency audit | `npm audit` + size review | Flagged before major version bumps |

Bundle size regressions are treated as performance bugs. Any PR that increases the initial JS payload by more than 10% requires architecture lead approval and a documented justification.

When a budget violation occurs:
1. Run `ANALYZE=true npm run build` to generate treemap
2. Identify the largest new contributors
3. Evaluate dynamic import or lazy loading options
4. If unavoidable, follow the override process in `PERFORMANCE-BUDGET.md`

---

## 7. Related Documents

- [PERFORMANCE-ARCHITECTURE.md](./PERFORMANCE-ARCHITECTURE.md) — Full performance architecture & bundle consciousness principle
- [PERFORMANCE-BUDGET.md](./PERFORMANCE-BUDGET.md) — Budget definitions and enforcement
- [PERFORMANCE-OPTIMIZATION.md](./PERFORMANCE-OPTIMIZATION.md) — Optimization plan with code splitting and bundle reduction details
