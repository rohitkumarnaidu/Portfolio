# State Management Architecture

Defines the state management strategy for the Next.js frontend: server state, client state, URL state, form state, cache configuration, mutation invalidation, and SSR hydration. Uses TanStack React Query as the primary data-fetching layer with React context for UI state.

---

## State Categories Overview

```
                     State Categories
                           |
          +----------------+----------------+----------------+
          |                |                |                |
    Server State      Client State       URL State       Form State
    (TanStack Query)  (React Context)  (searchParams)   (react-hook-form)
          |                |                |                |
    27 hooks in       Theme, Auth,       Pagination,     Contact forms,
    apps/web/src/     Scroll providers   filters, tabs   admin CRUD
    lib/hooks/
```

---

## 1. Server State (TanStack React Query v5)

### 1.1 Architecture

The server state layer uses TanStack React Query for all client-side data fetching and mutation. There are 27 hooks across 27 files in `apps/web/src/lib/hooks/`.

**Query Key Convention:**

| Pattern | Example | File |
|---------|---------|------|
| `['entity']` | `['projects']` | useProjects |
| `['entity', params]` | `['projects', { page: 1 }]` | useProjects |
| `['entity', id]` | `['project', slug]` | useProject |
| `['public', 'entity']` | `['public', 'experiences']` | usePublicData |
| `['public', 'entity', param]` | `['public', 'skills', category]` | usePublicData |

### 1.2 Default Cache Configuration

Configured in `apps/web/src/lib/query-provider.tsx:10-20`:

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 minutes - data is fresh
      gcTime: 30 * 60 * 1000,     // 30 minutes - data stays in cache
      retry: 2,                    // 2 retries on failure
      refetchOnWindowFocus: false, // No refetch on tab switch
      refetchOnReconnect: true,    // Refetch on network restore
    },
  },
})
```

### 1.3 Public Data Hooks (usePublicData.ts)

Public portfolio hooks use a shorter staleTime of 120_000 (2 minutes) to balance freshness with reduced API calls:

```typescript
export function usePublicExperiences() {
  return useQuery({
    queryKey: ['public', 'experiences'],
    queryFn: () => getExperiences(),
    staleTime: 120_000,  // 2 minutes
  });
}
```

Hooks exported from `apps/web/src/lib/hooks/usePublicData.ts`:
- `usePublicExperiences()`
- `usePublicTestimonials()`
- `usePublicServices()`
- `usePublicBlogPosts()`
- `usePublicFAQs()`
- `usePublicSkills(category?)`
- `usePublicProjects(params?)`

### 1.4 Admin/CRUD Hooks Pattern

Admin hooks follow a consistent pattern (example from `apps/web/src/lib/hooks/useProjects.ts`):

```typescript
// Read
export function useProjects(params) { ... }     // queryKey: ['projects', params]
export function useProject(slugOrId) { ... }    // queryKey: ['project', slugOrId]

// Mutations
export function useCreateProject() { ... }      // invalidates ['projects']
export function useUpdateProject() { ... }      // invalidates ['projects', 'project']
export function useDeleteProject() { ... }      // invalidates ['projects']
```

### 1.5 All 27 Hooks

| File | Hook | Type |
|------|------|------|
| usePublicData.ts | 7 hooks | Read (public) |
| useProjects.ts | 5 hooks | Read + CRUD |
| useBlogPosts.ts | 5 hooks | Read + CRUD |
| useSkills.ts | 3 hooks | Read + CRUD |
| useExperiences.ts | 3 hooks | Read + CRUD |
| useSections.ts | 3 hooks | Read + CRUD |
| useTestimonials.ts | 3 hooks | Read + CRUD |
| useServices.ts | 3 hooks | Read + CRUD |
| useFAQs.ts | 3 hooks | Read + CRUD |
| useLeads.ts | 3 hooks | Read + CRUD |
| useAuth.ts | 2 hooks | Login + Refresh |
| useCaseStudies.ts | 3 hooks | Read + CRUD |
| useAchievements.ts | 3 hooks | Read + CRUD |
| usePressFeatures.ts | 3 hooks | Read + CRUD |
| useGuestAppearances.ts | 3 hooks | Read + CRUD |
| useReadingList.ts | 3 hooks | Read + CRUD |
| useAvailability.ts | 3 hooks | Read + CRUD |
| useFeatureFlags.ts | 3 hooks | Read + CRUD |
| useChat.ts | 2 hooks | Read + Send |
| useChatAdmin.ts | 2 hooks | Read + Delete |
| useNotifications.ts | 3 hooks | Read + Mark read |
| useAnalytics.ts | 2 hooks | Read events |
| useActivities.ts | 2 hooks | Read + Clear |
| useUsers.ts | 3 hooks | Read + CRUD |
| useMedia.ts | 3 hooks | Read + CRUD |
| useApiKeys.ts | 3 hooks | Read + CRUD |
| useSettings.ts | 3 hooks | Read + Upsert |

---

## 2. Client State (React Context)

### 2.1 ThemeProvider

File: `apps/web/src/components/layout/ThemeProvider.tsx`
- Provides `theme` (light/dark/system) and `setTheme` to all components
- Persists preference to localStorage and `@media (prefers-color-scheme)` listener
- Applied in root layout at `apps/web/src/app/layout.tsx:5`

### 2.2 AuthContext (via useAuth hook)

File: `apps/web/src/lib/hooks/useAuth.ts`
- Stores `access_token`, `refresh_token`, `user` in localStorage
- `useLogin` mutation saves tokens on success, invalidates all queries
- Client-side check prevents rendering admin pages without valid session
- Token refresh via `useRefreshToken` mutation (called on 401 response)

### 2.3 ScrollProvider

File: `apps/web/src/components/layout/ScrollProvider.tsx`
- Tracks scroll position, direction, and velocity
- Used by GSAP ScrollTrigger, parallax effects, and sticky header show/hide
- Imported in `ClientShell.tsx` at `apps/web/src/components/layout/ClientShell.tsx:6`

---

## 3. URL State (Next.js searchParams)

URL parameters are the source of truth for:
- Pagination: `?page=1&per_page=12`
- Filtering: `?category=web-app&tech=react`
- Sorting: `?sort=created_at&order=desc`
- Search: `?search=nestjs`
- Active tabs: `?tab=published`

**Implementation:**
- Parameters read via `useSearchParams()` from `next/navigation`
- Filter changes push new URL via `useRouter().push()` with shallow routing
- React Query hooks read parameters and pass them as query keys
- SSR renders initial data based on URL params; client takes over after hydration

**Admin pagination example:**
```
URL: /admin/projects?page=2&per_page=25&sort=created_at&order=desc
React Query key: ['projects', { page: 2, per_page: 25, sort: 'created_at', order: 'desc' }]
```

---

## 4. Form State (React Hook Form + Zod)

| Form | Location | Schema |
|------|----------|--------|
| Contact form | /contact page | leadSchema from @portfolio/shared |
| Admin project create/edit | /admin/projects | CreateProjectDto / UpdateProjectDto |
| Admin blog create/edit | /admin/blog | CreateBlogPostDto / UpdateBlogPostDto |
| Admin settings | /admin/settings | SystemSettingSchema |
| Login form | /admin/login | LoginSchema |

**Validation chain:**
1. Zod schema in `@portfolio/shared` defines the canonical validation rules
2. React Hook Form uses `zodResolver` for client-side validation
3. NestJS `ValidationPipe` validates again server-side with the same Zod-derived class-validator DTOs
4. Error messages surface as field-level errors in the form

---

## 5. Mutation Invalidation Pattern

All mutations follow this invalidation strategy:

```typescript
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateProject(id, data),
    onSuccess: () => {
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      // Invalidate single-item queries
      queryClient.invalidateQueries({ queryKey: ['project'] });
    },
  });
}
```

**Invalidation rules:**
| Mutation | Invalidates |
|----------|-------------|
| Create entity | `['entity']` list queries |
| Update entity | `['entity']` list + `['entity', id]` detail queries |
| Delete entity | `['entity']` list queries |
| Bulk operations | `['entity']` list queries |
| Login | All queries (full invalidation) |
| Settings update | `['settings']` queries |

No optimistic updates are used — the cache is stale after mutation and refetches. For slower operations, the mutation shows a loading state until the API responds.

---

## 6. SSR Hydration Strategy

### 6.1 Public Pages (ISR)

Public portfolio pages use Incremental Static Regeneration, not SSR with React Query hydration:

1. Page is pre-rendered at build time or revalidated at the ISR interval
2. API data is fetched server-side inside `async function Page()`
3. The rendered HTML is cached on CDN
4. On client hydration, React Query is initialized with no initial data (fresh cache)
5. If the user interacts (clicks, navigates), React Query fetches from the API
6. ISR revalidation happens silently in the background for the next visitor

### 6.2 Admin Pages (SSR)

Admin pages use server-side rendering with client-side data fetching:

1. Next.js renders the admin shell (layout, sidebar) on the server
2. Auth check happens on the server (redirect to /admin/login if no session)
3. Page content renders a loading skeleton
4. Client hydrates, React Query fetches data from the API
5. TanStack Query DevTools available in development for debugging

### 6.3 Prefetching (Optional Future Pattern)

For admin pages that need faster initial loads, `dehydrate()` / `hydrate()` from `@tanstack/react-query` can be used:

```typescript
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

async function AdminProjectsPage() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ['projects', { page: 1 }],
    queryFn: () => getProjects({ page: 1 }),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectsTable />
    </HydrationBoundary>
  );
}
```

This pattern is available but not yet implemented — current admin pages use client-side fetching with loading states.
