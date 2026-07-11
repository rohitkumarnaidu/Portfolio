# RFC-002: TanStack React Query for Client-State Management

**Status:** Accepted (implemented)
**Date:** 2025-01-20
**Authors:** Portfolio Team

---

## Table of Contents

1. Context
2. Decision
3. Alternatives Considered
4. Consequences
5. Implementation Notes
6. References

---

## 1. Context

The Portfolio web frontend (Next.js 14 App Router) needed a data-fetching strategy for its admin dashboard and public portfolio pages. Key requirements:

- **Server state synchronization** — cache data from the NestJS API and keep it fresh.
- **Loading/error states** — consistent UX for every data-fetching component without boilerplate.
- **Mutation invalidation** — after creating, updating, or deleting a resource, automatically refetch affected data.
- **Typed API layer** — integrate with the `@portfolio/shared` Zod schemas and the typed fetch wrapper in `src/lib/api.ts`.
- **Monorepo compatibility** — lightweight dependency that works within the Turborepo build graph.

The frontend manages 25+ entity types (BlogPost, Project, Skill, Section, User, Lead, etc.), each with query and mutation hooks — 27 hook files totaling dozens of exported hooks in `apps/web/src/lib/hooks/`.

---

## 2. Decision

**Adopt TanStack React Query v5** as the primary client-state management layer.

| Component | Choice |
|-----------|--------|
| Library | `@tanstack/react-query` v5 |
| Devtools | `@tanstack/react-query-devtools` |
| Default stale time | 5 minutes |
| Default garbage collection | 30 minutes |
| Retry policy | 2 retries, exponential backoff |
| Refetch behavior | On reconnect; disabled on window focus |

The `QueryProvider` component wraps the application root and applies these defaults globally. A `PublicQueryProvider` alias is exported for the public portfolio layout; the admin dashboard uses the same provider with identical configuration.

---

## 3. Alternatives Considered

| Alternative | Why Not Chosen |
|-------------|----------------|
| **SWR** | Lighter (3 KB) but fewer features: no first-class mutation API, no devtools, weaker cache invalidation patterns. Needs separate state for mutations. |
| **Zustand** | Client state only — no server-state caching, no automatic background refetching, no retry logic. Would require manually building all cache/invalidation infrastructure. |
| **Redux Toolkit Query** | Heavier bundle (~12 KB), steeper boilerplate (slices, reducers), over-engineered for an app that doesn't use Redux. RTK Query is great but the rest of Redux is unused. |
| **Apollo Client** | GraphQL-only. The API is REST (NestJS with global `{ data, meta }` envelope). Would require a BFF layer or GraphQL gateway. |
| **Plain fetch + useState** | No caching, no deduplication, no retry, no background refetching. Every component re-fetches on mount. Every mutation requires manual state management. |

---

## 4. Consequences

### Pros

- **Automatic caching.** Queries are cached for 5 minutes (stale time) and garbage-collected after 30 minutes. Cache deduplication prevents redundant network requests when multiple components mount simultaneously.
- **Retry with backoff.** Failed queries retry 2 times with exponential backoff, providing resilience against transient network errors.
- **Developer tools.** `ReactQueryDevtools` are included in the dev bundle for inspecting cache state, invalidating queries, and debugging refetch behavior.
- **Mutation invalidation.** Every `useMutation` hook invalidates its related query keys on success, keeping the UI in sync with server state. The pattern is consistent across all 27+ hook files.
- **Typed wrapper.** The `useApiQuery` utility provides a thin typed wrapper around `useQuery`, ensuring consistent `queryKey`/`queryFn` patterns.
- **Zero client-state boilerplate.** No reducers, no actions, no selectors. Queries and mutations are co-located with the components that use them.

### Cons

- **Bundle size.** ~5 KB gzipped for the core library + devtools. Marginal relative to the existing Three.js/GSAP/Theatre.js stack.
- **Learning curve.** Mutation invalidation patterns (`invalidateQueries` vs. `setQueryData`) require team familiarity. The codebase uses a broad invalidation strategy (invalidate all queries with a matching prefix), which is simple but slightly less granular than optimistic updates.
- **Devtools in production.** The `ReactQueryDevtools` component is bundled but only renders in development (Next.js `'use client'` boundary). No production impact.

---

## 5. Implementation Notes

### Architecture

```
apps/web/src/lib/
├── query-provider.tsx         # QueryClient + QueryClientProvider + Devtools
├── use-api-query.ts           # Typed useQuery wrapper
├── api.ts                     # Typed fetch wrapper (ApiError, auth token)
├── hooks/                     # 27 hook files
│   ├── index.ts               # Re-exports all hooks (25 lines)
│   ├── useBlogPosts.ts        # Queries + mutations for BlogPost
│   ├── useProjects.ts         # Queries + mutations for Project
│   ├── useAuth.ts             # Auth-specific hooks
│   └── ... (24 more)
└── query-provider.tsx         # Exports QueryProvider & PublicQueryProvider
```

### QueryProvider configuration

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 minutes
      gcTime: 30 * 60 * 1000,      // 30 minutes
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});
```

### useApiQuery typed wrapper

A thin passthrough that enforces consistent typing across all hooks:

```typescript
export function useApiQuery<TData>(
  queryKey: QueryKey,
  fetcher: () => Promise<TData>,
  options?: UseQueryOptions<TData, Error, TData, QueryKey>,
) {
  return useQuery<TData, Error, TData, QueryKey>({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
}
```

### Mutation pattern (consistent across all hooks)

```typescript
export function useCreateBlogPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<BlogPost>) => createBlogPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });
    },
  });
}
```

All 27+ hook files follow this exact pattern: mutations call `invalidateQueries` with the matching query key prefix on success. This is a **broad invalidation strategy** — simple, correct, and easy to reason about.

### Covered entities (27 hook files)

| File | Exports |
|------|---------|
| `useAuth.ts` | `useLogin`, `useRefreshToken` |
| `useProjects.ts` | `useProjects`, `useProject`, `useCreateProject`, `useUpdateProject`, `useDeleteProject` |
| `useBlogPosts.ts` | `useBlogPosts`, `useCreateBlogPost`, `useUpdateBlogPost`, `useDeleteBlogPost` |
| `useSections.ts` | `useSections`, `useSection`, `useCreateSection`, `useUpdateSection`, `useDeleteSection`, `useReorderSections` |
| `useSkills.ts` | `useSkills`, `useCreateSkill`, `useUpdateSkill`, `useDeleteSkill` |
| `useExperiences.ts` | `useExperiences`, `useCreateExperience`, `useUpdateExperience`, `useDeleteExperience` |
| `useTestimonials.ts` | `useTestimonials`, `useCreateTestimonial`, `useUpdateTestimonial`, `useDeleteTestimonial` |
| `useServices.ts` | `useAdminServices`, `useCreateAdminService`, `useUpdateAdminService`, `useDeleteAdminService` |
| `useFAQs.ts` | `useFAQs`, `useCreateFAQ`, `useUpdateFAQ`, `useDeleteFAQ` |
| `useLeads.ts` | `useLeads`, `useLead`, `useUpdateLead` |
| `useAnalytics.ts` | `useAnalyticsSummary`, `useAnalyticsSessions` |
| `useActivities.ts` | `useActivities`, `useActivity` |
| `useMedia.ts` | `useMediaAssets`, `useUploadMediaAsset`, `useDeleteMediaAsset` |
| `useCaseStudies.ts` | `useCaseStudies`, `useCaseStudy`, `useCaseStudyWithProject` |
| `useAchievements.ts` | `useAdminAchievements`, `useCreateAchievement`, `useUpdateAchievement`, `useDeleteAchievement`, `useBulkDeleteAchievements` |
| `usePressFeatures.ts` | `useAdminPressFeatures`, `useCreatePressFeature`, `useUpdatePressFeature`, `useDeletePressFeature`, `useBulkDeletePressFeatures` |
| `useSettings.ts` | `useSettings`, `useSetting`, `useUpsertSetting`, `useDeleteSetting` |
| `useGuestAppearances.ts` | `useAdminGuestAppearances`, `useCreateGuestAppearance`, `useUpdateGuestAppearance`, `useDeleteGuestAppearance`, `useBulkDeleteGuestAppearances` |
| `useReadingList.ts` | `useAdminReadingListItems`, `useCreateReadingListItem`, `useUpdateReadingListItem`, `useDeleteReadingListItem`, `useBulkDeleteReadingListItems` |
| `useAvailability.ts` | `useAdminAvailabilityStatus`, `useUpdateAvailabilityStatus` |
| `useUsers.ts` | `useUsers`, `useUser`, `useCreateUser`, `useUpdateUser`, `useUpdateUserRole`, `useUnlockUser`, `useDeleteUser` |
| `useNotifications.ts` | `useNotifications`, `useUnreadNotificationCount`, `useMarkNotificationRead`, `useMarkAllNotificationsRead`, `useDeleteNotification` |
| `useApiKeys.ts` | `useApiKeys`, `useApiKey`, `useCreateApiKey`, `useRevokeApiKey`, `useDeleteApiKey` |
| `useFeatureFlags.ts` | `useFeatureFlags`, `useFeatureFlag`, `useCreateFeatureFlag`, `useUpdateFeatureFlag`, `useDeleteFeatureFlag` |
| `useChatAdmin.ts` | `useChatConversations`, `useChatConversationMessages`, `useDeleteChatConversation` |
| `useChat.ts` | Chat-specific hooks |
| `usePublicData.ts` | Public portfolio data hooks |

### API layer integration

All hooks call through `src/lib/api.ts`, a typed fetch wrapper that:
- Unwraps the API's `{ data, meta }` envelope
- Throws `ApiError` on non-2xx responses
- Attaches the bearer token from `localStorage('admin_access_token')`
- Uses `NEXT_PUBLIC_API_URL` for server-side and `/api` relative base for client-side

### Public vs Admin providers

Separate `QueryProvider` instances are used for the public portfolio and admin dashboard, though both share identical configuration. This prevents cache cross-contamination between the two contexts.

---

## 6. References

- [Frontend Architecture](../design/FrontendArchitecture.md) — overall frontend architecture and data flow
- `apps/web/src/lib/query-provider.tsx` — QueryProvider implementation (31 lines)
- `apps/web/src/lib/use-api-query.ts` — Typed useQuery wrapper (13 lines)
- `apps/web/src/lib/hooks/index.ts` — Hook re-exports (25 lines)
- `apps/web/src/lib/hooks/useBlogPosts.ts` — Example hook file following the standard pattern
- `apps/web/src/lib/api.ts` — Typed fetch wrapper
- `turbo.json` — Turborepo build dependency graph
