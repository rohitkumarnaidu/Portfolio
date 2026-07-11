'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input, Button } from '@portfolio/ui';
import { usePublicBlogPosts } from '@/lib/hooks/usePublicData';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

const PAGE_SIZE = 10;

export default function BlogPage() {
  const { data: posts, isLoading } = usePublicBlogPosts();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = posts ?? [];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (categoryFilter) result = result.filter(p => p.category === categoryFilter);
    return [...result].sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
  }, [posts, search, categoryFilter]);

  const categories = useMemo(() => [...new Set((posts ?? []).map(p => p.category).filter(Boolean))] as string[], [posts]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="pt-32 pb-24 section-container">
      <div className="space-y-4 mb-12">
        <h1 className="text-h1 font-display text-text-primary">Writing</h1>
        <p className="text-body-lg text-text-secondary max-w-2xl">
          Thoughts, tutorials, and insights on software engineering, architecture, and building products.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <Input placeholder="Search posts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setCategoryFilter(''); setPage(1); }} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${!categoryFilter ? 'bg-accent-500 text-white shadow-sm' : 'bg-surface-secondary text-text-secondary hover:bg-surface-elevated border border-border-primary'}`}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => { setCategoryFilter(c); setPage(1); }} className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${categoryFilter === c ? 'bg-accent-500 text-white shadow-sm' : 'bg-surface-secondary text-text-secondary hover:bg-surface-elevated border border-border-primary'}`}>{c}</button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="max-w-3xl space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-6 rounded-2xl bg-surface-secondary border border-border-primary animate-pulse space-y-3">
              <div className="h-4 w-48 bg-surface-elevated rounded" />
              <div className="h-6 w-3/4 bg-surface-elevated rounded" />
              <div className="h-4 w-full bg-surface-elevated rounded" />
            </div>
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-body-lg text-text-secondary">No posts found.</p>
          {(search || categoryFilter) && (
            <button onClick={() => { setSearch(''); setCategoryFilter(''); }} className="mt-3 text-accent-500 hover:text-accent-600 text-sm">Clear filters</button>
          )}
        </div>
      ) : (
        <div className="max-w-3xl space-y-4">
          {paged.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="block group hover:no-underline">
              <article className="p-6 rounded-2xl border border-border-primary bg-surface-secondary hover:bg-surface-elevated transition-all duration-200">
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <span className="text-text-tertiary">{formatDate(post.published_at || post.created_at)}</span>
                  <span className="w-1 h-1 rounded-full bg-border-accent" />
                  <span className="text-accent-500 font-medium">{post.category}</span>
                  <span className="text-text-tertiary">{post.read_time} min read</span>
                </div>
                <h2 className="text-h3 font-display text-text-primary mb-3 group-hover:text-accent-500 transition-colors">{post.title}</h2>
                <p className="text-body text-text-secondary line-clamp-2">{post.excerpt}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags?.map(tag => (
                    <span key={tag} className="px-2.5 py-1 text-xs font-medium rounded-full bg-surface-elevated text-text-tertiary border border-border-accent">{tag}</span>
                  ))}
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-primary max-w-3xl">
          <p className="text-sm text-text-tertiary">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
