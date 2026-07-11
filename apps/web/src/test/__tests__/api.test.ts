import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage for auth token
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

beforeEach(() => {
  mockFetch.mockReset();
  mockLocalStorage.clear();
  process.env.NEXT_PUBLIC_API_URL = 'http://test:3001';
});

describe('API Client: getProjects', () => {
  it('fetches projects with default params', async () => {
    const { getProjects } = await import('@/lib/api');
    const mockProjects = [
      { id: '1', title: 'Project A', slug: 'project-a', tech_stack: [], is_featured: false, is_private: false, display_order: 0, content: {}, metrics: {}, created_at: '', updated_at: '' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: mockProjects }),
    });

    const result = await getProjects();
    expect(result).toEqual(mockProjects);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/projects',
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
    );
  });

  it('applies query params correctly', async () => {
    const { getProjects } = await import('@/lib/api');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: [] }),
    });

    await getProjects({ category: 'web', featured: true, per_page: 10 });
    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('category=web');
    expect(url).toContain('featured=true');
    expect(url).toContain('per_page=10');
  });

  it('throws ApiError on non-ok response', async () => {
    const { getProjects, ApiError } = await import('@/lib/api');

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: { code: 'NOT_FOUND', message: 'Not found' } }),
    });

    await expect(getProjects()).rejects.toThrow(ApiError);
  });
});

describe('API Client: getBlogPost', () => {
  it('fetches a single blog post by slug', async () => {
    const { getBlogPost } = await import('@/lib/api');
    const mockPost = {
      id: '1', title: 'Test Post', slug: 'test-post', content: 'Hello', excerpt: 'Test',
      category: 'tech', tags: [], read_time: 5, is_published: true, is_featured: false,
      author: 'Admin', created_at: '', updated_at: '',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: mockPost }),
    });

    const result = await getBlogPost('test-post');
    expect(result).toEqual(mockPost);
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/blog/test-post',
      expect.any(Object),
    );
  });
});

describe('API Client: submitLead', () => {
  it('sends lead form data as POST', async () => {
    const { submitLead } = await import('@/lib/api');
    const mockResponse = {
      id: '1', name: 'John', email: 'john@test.com', message: 'Hello',
      source: 'contact_form', status: 'new', priority: 'normal',
      created_at: '', updated_at: '',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: mockResponse }),
    });

    const result = await submitLead({ name: 'John', email: 'john@test.com', message: 'Hello' });
    expect(result).toEqual(mockResponse);
  });
});
