# Mobile Native Strategy — React Native vs PWA Decision & Roadmap

> **Document:** `docs/37-future/MOBILE-NATIVE-STRATEGY.md`
> **Status:** Design Spec
> **Version:** 1.0
> **Last Updated:** July 2026
> **Owner:** Director of Engineering / Mobile Team Lead
> **Audience:** Engineering leadership, Product, Design, Infrastructure

---

## 1. Executive Summary

This document evaluates the optimal mobile strategy for the portfolio platform, comparing Progressive Web App (PWA) and React Native approaches across technical, user experience, and business dimensions. The analysis is grounded in the current monorepo's shared packages (`@portfolio/shared`, `@portfolio/ui`), existing API architecture (NestJS REST API with JWT auth), and frontend tech stack (Next.js 14, Three.js, GSAP, Framer Motion).

The recommended strategy is a **hybrid approach**: a PWA as the immediate (0-6 month) mobile solution delivering instant improvements with minimal investment, followed by a React Native app for the admin dashboard (6-18 month) when mobile-specific features (push notifications, offline-first, camera access, biometric auth) justify the native investment. A full end-user React Native app is evaluated as a 18+ month option contingent on multi-tenancy adoption.

Current mobile baseline (from `docs/performance/PERFORMANCE-BENCHMARKS.md`): ~35% of portfolio traffic comes from mobile devices, with a 42% higher bounce rate and 28% lower average session duration compared to desktop. The mobile experience currently relies on the responsive CSS strategy documented in `docs/04-design/ResponsiveStrategy.md`.

---

## 2. Purpose

Design and specify a mobile strategy that:

- Provides an exceptional mobile experience for portfolio visitors
- Enables mobile content management for admin users on the go
- Maximizes code reuse from the existing monorepo
- Minimizes maintenance burden across platforms
- Supports offline capabilities for content consumption
- Handles mobile-specific 3D/WebGL constraints gracefully
- Delivers push notifications for lead alerts and admin updates

---

## 3. Decision Matrix: PWA vs React Native

### 3.1 Evaluation Criteria

| Criterion          | Weight | Rationale                                 |
| ------------------ | ------ | ----------------------------------------- |
| Development speed  | 20%    | Time-to-market for mobile solution        |
| Code reuse         | 20%    | Leverage existing monorepo packages       |
| User experience    | 20%    | Native feel, offline, notifications       |
| 3D/WebGL support   | 15%    | Portfolio relies on Three.js hero scene   |
| Maintenance cost   | 10%    | Long-term cost of multi-platform support  |
| Offline capability | 10%    | Content availability without connectivity |
| Distribution       | 5%     | App Store vs URL accessibility            |

### 3.2 PWA Score

| Criterion          | Score (1-10) | Weighted | Notes                                                                 |
| ------------------ | ------------ | -------- | --------------------------------------------------------------------- |
| Dev speed          | 9            | 1.80     | Next.js already supports PWA; minimal extra work                      |
| Code reuse         | 9            | 1.80     | 100% shared React components and packages                             |
| User experience    | 6            | 1.20     | No native gestures, limited haptics, no push on iOS                   |
| 3D/WebGL support   | 8            | 1.20     | Three.js works in mobile browsers; GPU-tier detection handles low-end |
| Maintenance cost   | 9            | 0.90     | Single codebase, no app store submissions                             |
| Offline capability | 5            | 0.50     | Service worker can cache static content; dynamic API needs network    |
| Distribution       | 6            | 0.30     | URL-based, no app store discoverability; iOS PWA limitations          |
| **Total**          |              | **7.70** |                                                                       |

### 3.3 React Native Score

| Criterion          | Score (1-10) | Weighted | Notes                                                           |
| ------------------ | ------------ | -------- | --------------------------------------------------------------- |
| Dev speed          | 4            | 0.80     | New codebase, new paradigm, longer setup                        |
| Code reuse         | 5            | 1.00     | Shared types (Zod) + API client; UI components need porting     |
| User experience    | 9            | 1.80     | Native gestures, animations, transitions, haptics               |
| 3D/WebGL support   | 3            | 0.45     | Three.js doesn't run in RN; need `react-native-gl` or `expo-gl` |
| Maintenance cost   | 5            | 0.50     | Two codebases; App Store + Play Store management                |
| Offline capability | 9            | 0.90     | Full offline SQLite via WatermelonDB or similar                 |
| Distribution       | 9            | 0.45     | App Store + Play Store; push notifications on both platforms    |
| **Total**          |              | **5.90** |                                                                 |

### 3.4 Verdict

| Criterion                      | PWA        | React Native | Winner                      |
| ------------------------------ | ---------- | ------------ | --------------------------- |
| Immediate (0-6 months)         | ✅         | ❌           | PWA                         |
| Admin mobile (6-18 months)     | ⚠️ Partial | ✅           | React Native (admin)        |
| Full consumer app (18+ months) | ⚠️ Limited | ✅           | React Native (multi-tenant) |
| 3D-heavy experiences           | ✅         | ❌           | PWA                         |

**Recommendation:** PWA first (Phase 1), then React Native for admin (Phase 2), with a re-evaluation gate for consumer React Native after multi-tenancy.

---

## 4. Phase 1: PWA Enhancement (0-6 Months)

### 4.1 Scope

Transform the existing Next.js responsive site into a full PWA with:

- Service worker for offline caching and push notifications
- Web app manifest with install prompt
- Add-to-homescreen support
- Offline fallback pages
- Optimized mobile navigation (bottom tab bar)
- Touch-optimized interactions

### 4.2 Implementation Plan

#### 4.2.1 Service Worker

Using `@serwist/next` or `next-pwa` for Next.js App Router PWA support:

```typescript
// apps/web/src/sw.ts
// Service worker with stale-while-revalidate strategy

const CACHE_STRATEGIES = {
  // Static assets (JS, CSS, fonts): Cache first
  static: new CacheFirst({
    cacheName: 'static-assets',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  }),

  // Portfolio content (sections, projects, blog): Stale while revalidate
  content: new StaleWhileRevalidate({
    cacheName: 'portfolio-content',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 })],
  }),

  // API responses (portfolio endpoints): Network first with timeout
  api: new NetworkFirst({
    cacheName: 'api-responses',
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 24 * 60 * 60 })],
  }),

  // Images: Cache first with separate cache
  images: new CacheFirst({
    cacheName: 'portfolio-images',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 24 * 60 * 60 })],
  }),
};
```

**Key service worker behaviors:**

- Pre-cache the app shell (header, footer, navigation)
- Cache portfolio API responses for offline reading
- Display custom offline page when network unavailable
- Background sync for lead form submissions
- Push notification handling for admin users

#### 4.2.2 Web App Manifest

```json
{
  "name": "Portfolio by [Name]",
  "short_name": "Portfolio",
  "description": "Full-stack developer portfolio — projects, skills, and blog",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAFAFA",
  "theme_color": "#3B82F6",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    {
      "src": "/icons/icon-512-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["portfolio", "technology", "development"],
  "screenshots": [
    {
      "src": "/screenshots/mobile-home.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ]
}
```

#### 4.2.3 Mobile Navigation Redesign

The existing navbar becomes a bottom tab bar on mobile:

```
┌─────────────────────────────────────────────┐
│  Status Bar                                 │
├─────────────────────────────────────────────┤
│                                             │
│              Page Content                   │
│                                             │
│                                             │
│                                             │
│                                             │
├─────────────────────────────────────────────┤
│  🏠  │  💼  │  📝  │  📞  │  👤            │
│  Home │ Work │ Blog │Contact│ Menu          │
└─────────────────────────────────────────────┘
```

#### 4.2.4 Mobile 3D Strategy

The Three.js hero scene is the primary mobile challenge. The Scene Optimizer (detailed in `AI-PERSONALIZATION-ENGINE.md`) already handles GPU tier detection via `detect-gpu`. Mobile-specific optimizations:

| Optimization            | Implementation                                              | Impact                      |
| ----------------------- | ----------------------------------------------------------- | --------------------------- |
| Static fallback         | Replace animated scene with static image on low-end devices | 0 GPU load                  |
| Reduced geometry        | Use low-poly models (max 500 triangles)                     | 60% fewer vertices          |
| Disable post-processing | Remove bloom, SSAO effects                                  | 40% faster frame time       |
| Half-resolution render  | `setPixelRatio(Math.min(window.devicePixelRatio, 2))`       | 50% less GPU fill           |
| Touch interaction       | Replace mouse hover with tap/scroll triggers                | Native interaction          |
| Lazy load               | Defer Three.js bundle until viewport enters                 | 150KB saved on initial load |
| Video fallback          | Pre-rendered hero video for devices without WebGL           | Universal compatibility     |

#### 4.2.5 Touch Interactions

| Desktop                 | Mobile Equivalent     | Implementation                    |
| ----------------------- | --------------------- | --------------------------------- |
| `onMouseEnter` hover    | `onTouchStart`        | Framer Motion `whileTap`          |
| GSAP ScrollTrigger      | Same (works on touch) | Already responsive                |
| Three.js orbit controls | Touch drag + pinch    | `@react-three/drei` OrbitControls |
| Drag-and-drop (admin)   | Long-press + drag     | custom touch handlers             |
| Tooltip on hover        | Tap to show tooltip   | Portal-based tooltip              |

### 4.3 PWA Success Metrics

| Metric                       | Current (Desktop)   | PWA Target (6 months)      |
| ---------------------------- | ------------------- | -------------------------- |
| Mobile bounce rate           | 52%                 | < 40%                      |
| Mobile avg session duration  | 2:41 min            | > 3:30 min                 |
| Mobile pages/session         | 2.8                 | > 3.5                      |
| PWA install rate             | N/A                 | > 5% of mobile visitors    |
| Offline page views           | N/A                 | > 1% of total mobile views |
| Lighthouse PWA score         | N/A                 | > 90                       |
| 3D hero mobile performance   | ~25fps on mid-range | > 30fps sustained          |
| Time to interactive (mobile) | ~4.2s               | < 2.5s (Lighthouse mobile) |

---

## 5. Phase 2: React Native Admin App (6-18 Months)

### 5.1 Scope

A React Native (Expo) application for admin users to manage portfolio content on the go:

- Blog post creation and editing (with offline draft support)
- Lead management (view, respond, convert)
- Analytics dashboard (mobile-optimized charts)
- Push notifications for new leads, comments, and system alerts
- Content moderation (comments, testimonials)
- Quick actions: toggle availability, publish blog posts

### 5.2 Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│  React Native (Expo) Admin App                                         │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Shared Packages (via monorepo)                                   │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │ @portfolio/  │  │ @portfolio/  │  │ @portfolio/  │           │  │
│  │  │ shared       │  │ shared (Zod) │  │ ui           │           │  │
│  │  │ (types)      │  │ (validation) │  │ (tokens)     │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  App-Specific Layers                                              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │  Navigation  │  │  Screens     │  │  Components  │           │  │
│  │  │  (Expo Router)│  │  (per module)│  │  (RN-native) │           │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │  │
│  │  │  API Client  │  │  Offline     │  │  Push        │           │  │
│  │  │  (typed fetch)│  │  (WatermelonDB)│  │  (Expo Notif)│          │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ HTTPS + JWT
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  NestJS API (apps/api)                                                 │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  Admin Controllers   │  │  Portfolio           │                    │
│  │  (existing)          │  │  Controllers         │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  Push Notification   │  │  File Upload         │                    │
│  │  (Expo Push API)     │  │  (existing)          │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Shared Code Analysis

| Package                   | Path                           | Reusable in RN? | Notes                                                                          |
| ------------------------- | ------------------------------ | --------------- | ------------------------------------------------------------------------------ |
| `@portfolio/shared`       | `packages/shared/src/index.ts` | ✅ 100%         | Pure TypeScript types + Zod schemas; no platform dependencies                  |
| `@portfolio/shared` (env) | `packages/shared/src/env.ts`   | ✅ 100%         | Pure validation logic                                                          |
| `@portfolio/ui`           | `packages/ui/src/`             | ⚠️ Partial      | Tailwind CSS class utilities (`clsx`, `tailwind-merge`) — RN equivalent needed |
| API client pattern        | `apps/web/src/lib/api.ts`      | ✅ 100%         | Typed fetch wrapper; only URL and token differ                                 |
| Data fetching             | `@tanstack/react-query`        | ✅ Compatible   | `@tanstack/react-query` works in RN                                            |
| Zod schemas               | All schemas in shared          | ✅ 100%         | Runtime validation identical across platforms                                  |
| Form handling             | `react-hook-form`              | ⚠️ Partial      | Works in RN but field components differ                                        |
| Three.js components       | N/A                            | ❌ Not reusable | WebGL not available in RN                                                      |

### 5.4 Push Notification Architecture

```
  NestJS API                      Expo Push API               Mobile Device
      │                              │                             │
      │── Admin saves push token ───>│                             │
      │   (stored in User model)     │                             │
      │                              │                             │
      │── New lead created ──────────>                             │
      │                              │                             │
      │── POST /expo/push/send ─────>│                             │
      │   { to: pushToken,           │                             │
      │     title: "New Lead",       │                             │
      │     body: "Alice from Acme", │                             │
      │     data: { leadId } }       │                             │
      │                              │── Push notification ──────>│
      │                              │                             │
      │<── 200 OK ───────────────────│                             │
      │                              │                             │
```

### 5.5 Offline Architecture (WatermelonDB)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Offline-First Data Layer                                               │
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐                    │
│  │  WatermelonDB        │  │  Sync Engine          │                    │
│  │  • SQLite-backed      │  │  • Pull: GET /sync    │                    │
│  │  • Observable queries │  │    (since timestamp)  │                    │
│  │  • Lazy loading       │  │  • Push: POST /sync   │                    │
│  │                       │  │    (local changes)    │                    │
│  └──────────────────────┘  └──────────────────────┘                    │
│                                                                         │
│  Sync Strategy:                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  1. App opens → Pull latest from API (ETag-based)               │  │
│  │  2. User edits → Write to local SQLite first                    │  │
│  │  3. Background → Push local changes to API                       │  │
│  │  4. Conflict → Last-write-wins with server timestamp             │  │
│  │  5. Offline → Queue changes; sync when online                    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.6 Admin Mobile Screens

| Screen     | Purpose                              | Offline Support | Push Notifications    |
| ---------- | ------------------------------------ | --------------- | --------------------- |
| Dashboard  | Analytics overview, quick stats      | Cached snapshot | N/A                   |
| Leads      | Inbox, lead detail, quick actions    | Full offline    | New lead alerts       |
| Blog Posts | List, create, edit, publish          | Draft offline   | Publish confirmations |
| Projects   | List, edit, reorder                  | Read offline    | N/A                   |
| Media      | Upload, browse, search               | Upload queue    | Upload complete       |
| Comments   | Moderate testimonials, blog comments | Pending queue   | New comment alerts    |
| Settings   | Preferences, notification config     | Cached          | N/A                   |

---

## 6. Phase 3: React Native Consumer App (18+ Months)

### 6.1 Scope

A full React Native application for portfolio visitors, contingent on:

- Multi-tenancy adoption (see `MULTITENANCY-STRATEGY.md`): the app would serve multiple portfolios
- Sufficient mobile traffic baseline (>50% of total visits from mobile)
- Business case validated through Phase 2 admin app metrics

### 6.2 Key Differences from Admin App

| Dimension    | Admin App                   | Consumer App                           |
| ------------ | --------------------------- | -------------------------------------- |
| Auth         | Required                    | Optional (guest mode)                  |
| Content      | Read-write                  | Read-only                              |
| 3D           | No 3D                       | Simplified 3D (see mobile 3D strategy) |
| Offline      | Full offline (WatermelonDB) | Cached content (SQLite)                |
| Push         | Admin alerts                | Portfolio updates                      |
| Distribution | TestFlight + internal       | App Store + Play Store                 |
| Performance  | Moderate                    | Critical (first impression)            |

### 6.3 Render Engine Comparison for 3D

| Engine                            | RN Support          | WebGL               | Performance | Notes                           |
| --------------------------------- | ------------------- | ------------------- | ----------- | ------------------------------- |
| Three.js                          | ❌ No               | ✅ Yes              | N/A         | Not available in RN             |
| `expo-gl`                         | ✅ Yes              | ✅ Yes (GL context) | Medium      | Low-level; no scene graph       |
| `react-native-webview` + Three.js | ✅ Yes (in WebView) | ✅ Yes              | Low         | Bridge overhead; no native feel |
| `react-native-gl-model-view`      | ✅ Yes              | ⚠️ Limited          | High        | GLTF only; no animation         |
| `@react-three/fiber` (WebView)    | ⚠️ Experimental     | ✅ Yes              | Low         | Needs React 18 in WebView       |
| Video playback                    | ✅ Yes              | N/A                 | High        | Pre-rendered scenes             |

**Recommendation for consumer app:** Use pre-rendered video backgrounds (recorded from the Three.js hero scene) rather than attempting real-time 3D in RN. This provides 60fps playback with minimal battery drain and universal compatibility.

---

## 7. Security Considerations

| Concern                    | PWA Mitigation                                                    | RN Mitigation                                       |
| -------------------------- | ----------------------------------------------------------------- | --------------------------------------------------- |
| Service worker hijacking   | Register SW from same origin; use `Service-Worker-Allowed` header | Not applicable                                      |
| Push notification spoofing | VAPID key validation on server                                    | Expo push token validation                          |
| Offline data exposure      | Cache-control headers for sensitive content                       | SQLite encryption via `expo-sqlite` with encryption |
| API token storage          | HTTP-only cookies (existing)                                      | `expo-secure-store` for JWT tokens                  |
| Biometric auth             | WebAuthn API (limited support)                                    | `expo-local-authentication` (FaceID, fingerprint)   |
| Screenshot blocking        | N/A                                                               | `expo-screen-capture` for admin screens             |
| Certificate pinning        | N/A                                                               | SSL pinning in RN HTTP client                       |

---

## 8. Shared Packages Enhancement

### 8.1 Required Changes

To support both PWA and React Native from the monorepo:

| Change                                       | Package                  | Effort | Rationale                                              |
| -------------------------------------------- | ------------------------ | ------ | ------------------------------------------------------ |
| Extract API client to shared                 | `@portfolio/shared`      | 2 days | Currently in `apps/web/src/lib/`; RN needs same client |
| Extract Zod schemas to shared                | Already done ✅          | 0 days | `packages/shared/src/index.ts` is RN-compatible        |
| Add RN-specific TypeScript config            | Root `tsconfig.json`     | 1 day  | Platform-specific path aliases                         |
| Create platform-agnostic storage abstraction | `@portfolio/shared`      | 2 days | localStorage (web) vs AsyncStorage (RN)                |
| Extract API URL config                       | `@portfolio/shared`      | 1 day  | Different base URLs per platform                       |
| Add mobile mocks for Web API                 | `apps/mobile/src/mocks/` | 3 days | `window.matchMedia`, `Navigator` stubs                 |

### 8.2 New Shared Module Structure

```
packages/shared/src/
├── index.ts            (existing — types + Zod)
├── env.ts              (existing — env validation)
├── api/
│   ├── client.ts       (NEW — platform-agnostic fetch wrapper)
│   ├── types.ts        (NEW — API response envelope types)
│   └── errors.ts       (NEW — error handling)
├── storage/
│   └── index.ts        (NEW — localStorage / AsyncStorage adapter)
├── auth/
│   ├── tokens.ts       (NEW — token management)
│   └── permissions.ts  (NEW — role-based permission checks)
└── platform/
    ├── detect.ts       (NEW — platform detection utilities)
    └── config.ts       (NEW — environment config per platform)
```

---

## 9. Mobile CI/CD Pipeline

### 9.1 PWA Pipeline (Existing)

```
PR → Vercel Preview → Lighthouse Mobile Audit → Merge → Deploy
```

Enhanced with:

```
Add `lighthouse-ci` mobile audit
Enforce PWA checklist in CI
Service worker validation
```

### 9.2 React Native Pipeline (New)

```
PR → TypeScript Check → Tests → EAS Build (Android + iOS)
          │
          ├── Staging: EAS Update (OTA)
          ├── TestFlight (iOS, manual)
          └── Play Store Internal (Android, auto)

Production:
  Tag vX.Y.Z → EAS Build → App Store + Play Store
```

Expo's EAS (Expo Application Services) handles:

- **EAS Build**: Cloud-based native builds (no local Xcode/Android Studio)
- **EAS Submit**: Automated App Store + Play Store submission
- **EAS Update**: Over-the-air JS bundle updates (bypasses app review for non-native changes)
- **EAS Metadata**: Automated store listing management

---

## 10. Performance Budget — Mobile

### 10.1 PWA Budget

| Metric                       | Target                | Tool              |
| ---------------------------- | --------------------- | ----------------- |
| TTI (First Contentful Paint) | < 2.5s on 4G          | Lighthouse Mobile |
| TTI (Time to Interactive)    | < 3.5s on 4G          | Lighthouse Mobile |
| Largest Contentful Paint     | < 2.5s                | Lighthouse Mobile |
| First Input Delay            | < 100ms               | Chrome Web Vitals |
| Cumulative Layout Shift      | < 0.1                 | Lighthouse Mobile |
| JS bundle (initial)          | < 200KB gzipped       | Bundle analyzer   |
| Service worker size          | < 10KB                | Bundle analyzer   |
| Offline page load            | < 1s on cached device | Manual testing    |

### 10.2 React Native Budget

| Metric                    | Target                     | Tool           |
| ------------------------- | -------------------------- | -------------- |
| App startup time (cold)   | < 3s                       | Metro bundler  |
| App startup time (warm)   | < 1.5s                     | Metro bundler  |
| JS bundle size            | < 8MB (uncompressed)       | Metro bundler  |
| Screen transition         | < 300ms                    | RN Profiler    |
| List scroll (60fps)       | 60fps on mid-range Android | Flipper        |
| Offline sync              | < 5s for 100 records       | Manual testing |
| Push notification latency | < 5s from server to device | Expo Push API  |
| APK size                  | < 40MB                     | EAS Build      |
| IPA size                  | < 100MB                    | EAS Build      |

---

## 11. Phased Rollout Plan

### Phase 1: PWA (Months 1-6)

| Task                                        | Est. Effort | Owner    | Deliverable      |
| ------------------------------------------- | ----------- | -------- | ---------------- |
| Add service worker with caching strategies  | 3 days      | Frontend | `sw.ts`          |
| Configure Web App Manifest                  | 1 day       | Frontend | `manifest.json`  |
| Implement offline fallback pages            | 2 days      | Frontend | Offline page     |
| Redesign mobile navigation (bottom tab)     | 3 days      | Frontend | Bottom nav       |
| Implement mobile 3D tier detection          | 2 days      | Frontend | Scene tier logic |
| Add touch interaction improvements          | 3 days      | Frontend | Touch handlers   |
| Configure push notifications (Web Push API) | 4 days      | Both     | Push setup       |
| Add `beforeinstallprompt` handling          | 1 day       | Frontend | Install prompt   |
| Lighthouse mobile audit and optimization    | 3 days      | Frontend | Score > 90       |
| Load test with mobile throttling            | 2 days      | QA       | Test report      |

**Phase 1 Gate:** PWA Lighthouse score > 90 across mobile tests. Mobile bounce rate below 45%.

### Phase 2: React Native Admin (Months 7-14)

| Task                                  | Est. Effort | Owner          | Deliverable              |
| ------------------------------------- | ----------- | -------------- | ------------------------ |
| Set up Expo monorepo workspace        | 2 days      | Infrastructure | `apps/mobile/` workspace |
| Extract API client to shared package  | 2 days      | Backend        | Shared client            |
| Implement Expo Router navigation      | 3 days      | Mobile         | Navigation shell         |
| Build auth flow (JWT + biometric)     | 4 days      | Mobile         | Auth screens             |
| Build leads management screens        | 5 days      | Mobile         | Leads module             |
| Build blog management screens         | 5 days      | Mobile         | Blog module              |
| Build analytics dashboard (mobile)    | 4 days      | Mobile         | Analytics                |
| Implement offline sync (WatermelonDB) | 5 days      | Mobile         | Sync engine              |
| Configure push notifications (Expo)   | 3 days      | Both           | Push pipeline            |
| Build media upload from camera        | 3 days      | Mobile         | Camera integration       |
| Set up EAS Build + CI/CD              | 3 days      | Infrastructure | Pipeline                 |
| TestFlight + internal testing         | 2 weeks     | QA             | Beta release             |

**Phase 2 Gate:** Admin app functional for blog + lead management. Offline sync working. Beta users (N=5) rating > 4/5.

### Phase 3: Consumer App Re-evaluation (Month 18+)

| Criteria                      | Gate           | If Met                               |
| ----------------------------- | -------------- | ------------------------------------ |
| Mobile traffic > 50% of total | Month 15 check | Proceed to Phase 3                   |
| Multi-tenancy launched        | Month 16 check | Proceed (multi-tenant portfolio app) |
| Admin RN app MAU > 10         | Month 14 check | Proceed                              |
| Any criteria not met          | —              | Pause; extend PWA investment         |

**Phase 3 Gate:** Business case validated. Multi-tenancy live. Executive approval obtained.

---

## 12. Risk Assessment

| Risk                                                  | Probability | Impact | Mitigation                                                                      |
| ----------------------------------------------------- | ----------- | ------ | ------------------------------------------------------------------------------- |
| iOS PWA limitations (no push, no storage persistence) | High        | Medium | Focus RN investment on iOS; PWA serves as Android-first progressive enhancement |
| Three.js performance on mid/low mobile GPUs           | Medium      | High   | GPU tier detection; static fallback; video alternative                          |
| WatermelonDB sync conflicts                           | Medium      | Medium | Server-timestamp-based last-write-wins; manual conflict UI for admins           |
| React Native developer learning curve                 | Medium      | Medium | Start Phase 2 with experienced RN contractor; extensive documentation           |
| App Store rejection for admin-only app                | Low         | High   | Build as internal enterprise app; TestFlight distribution                       |
| Monorepo complexity with 3 platforms                  | Medium      | Medium | Clear workspace boundaries; shared packages as strict interfaces                |

---

## 13. Cross-References

### Internal Documents

| Document                  | Path                                            | Relevance                                            |
| ------------------------- | ----------------------------------------------- | ---------------------------------------------------- |
| Innovation Backlog        | `docs/25-roadmap/INNOVATION-BACKLOG.md`         | IB-20 (Personalized Visitor Dashboard), IB-07 (i18n) |
| Responsive Strategy       | `docs/04-design/ResponsiveStrategy.md`          | Current mobile CSS approach                          |
| Mobile Experience         | `docs/04-design/MobileExperience.md`            | Existing mobile UX research                          |
| Performance Benchmarks    | `docs/15-performance/PERFORMANCE-BENCHMARKS.md` | Current mobile performance baselines                 |
| Analytics Architecture    | `docs/21-operations/AnalyticsArchitecture.md`   | Mobile analytics tracking                            |
| 3D Architecture           | `docs/07-frontend/3D-ARCHITECTURE.md`           | 3D scene mobile optimization                         |
| Frontend Architecture     | `docs/07-frontend/FRONTEND-ARCHITECTURE.md`     | Frontend patterns for PWA                            |
| API Contracts             | `docs/10-api/APIContracts.md`                   | API response envelope for mobile                     |
| AI Personalization Engine | `docs/37-future/AI-PERSONALIZATION-ENGINE.md`   | Scene Optimizer for mobile GPU tier                  |
| Multi-Tenancy Strategy    | `docs/37-future/MULTITENANCY-STRATEGY.md`       | Phase 3 consumer app dependency                      |
| Testing Strategy          | `docs/35-quality/TestingArchitecture.md`        | Mobile testing approach                              |
| User Personas             | `docs/01-product/UserPersonas.md`               | Visitor profiles for mobile UX                       |
| Security Architecture     | `docs/11-security/SecurityArchitecture.md`      | Mobile-specific security                             |
| Admin Architecture        | `docs/04-design/AdminArchitecture.md`           | Admin features for mobile                            |

### ADR References

| ADR     | Title              | Relevance                            |
| ------- | ------------------ | ------------------------------------ |
| ADR-002 | Next.js App Router | PWA foundation (SSR/ISR for mobile)  |
| ADR-005 | ISR Rendering      | PWA caching strategy alignment       |
| ADR-011 | JWT Auth           | Mobile auth token management         |
| ADR-012 | Vercel Deployment  | PWA hosting + service worker         |
| ADR-013 | Framer Motion      | Mobile gesture compatibility         |
| ADR-014 | Zod Validation     | Shared schemas for mobile API client |

### External References

- **Serwist (PWA):** https://serwist.pages.dev/ — Next.js App Router PWA library
- **Expo:** https://docs.expo.dev/ — React Native framework
- **WatermelonDB:** https://nozbe.github.io/WatermelonDB/ — SQLite-based offline DB
- **EAS Build:** https://docs.expo.dev/build/introduction/ — CI/CD for Expo
- **Web Push API:** https://web.dev/push-notifications-web-push-protocols/ — PWA push
- **Expo Notifications:** https://docs.expo.dev/versions/latest/sdk/notifications/ — RN push

---

## 14. Decision Log

| ID      | Decision                                 | Rationale                                                                               |
| ------- | ---------------------------------------- | --------------------------------------------------------------------------------------- |
| MS-D001 | PWA first, RN second                     | 6-month faster time-to-market; validates mobile demand before RN investment             |
| MS-D002 | RN for admin, not consumer               | Admin needs push notifications + offline; higher ROI per user; validates RN in monorepo |
| MS-D003 | WatermelonDB for RN offline              | SQLite-based; observable queries; battle-tested in production apps                      |
| MS-D004 | Expo managed workflow (not bare RN)      | Faster iteration; OTA updates; EAS CI/CD; sufficient for admin app needs                |
| MS-D005 | Pre-rendered video for 3D in consumer RN | Avoids WebView bridge overhead; 60fps guaranteed; universal compatibility               |
| MS-D006 | Extract API client to shared package     | Single source of truth for API contracts; RN and web use same client                    |

---

## Change Log

| Version | Date     | Changes                                               | Author                  |
| ------- | -------- | ----------------------------------------------------- | ----------------------- |
| 1.0     | Jul 2026 | Initial design specification — Mobile Native Strategy | Director of Engineering |

---

_End of Document — Mobile Native Strategy v1.0_
