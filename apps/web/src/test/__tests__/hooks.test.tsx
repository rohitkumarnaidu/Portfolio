import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    length: 0,
  };
})();
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage, configurable: true });

process.env.NEXT_PUBLIC_API_URL = 'http://test:3001';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
}

beforeEach(() => {
  mockFetch.mockReset();
  mockLocalStorage.clear();
});

describe('useProjects hook', () => {
  it('returns projects data on success', async () => {
    const mockProjects = [
      { id: '1', title: 'Project A', slug: 'project-a', tech_stack: ['React'], is_featured: true, is_private: false, display_order: 0, content: {}, metrics: {}, created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: mockProjects }),
    });

    const { useProjects } = await import('@/lib/hooks/useProjects');
    const { result } = renderHook(() => useProjects(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockProjects);
  });

  it('handles error state', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { useProjects } = await import('@/lib/hooks/useProjects');
    const { result } = renderHook(() => useProjects(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});

describe('useBlogPosts hook', () => {
  it('returns blog posts data', async () => {
    const mockPosts = [
      { id: '1', title: 'Post 1', slug: 'post-1', content: 'Content', excerpt: 'Excerpt', category: 'tech', tags: [], read_time: 5, is_published: true, is_featured: false, author: 'Admin', created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: mockPosts }),
    });

    const { useBlogPosts } = await import('@/lib/hooks/useBlogPosts');
    const { result } = renderHook(() => useBlogPosts(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockPosts);
  });
});
