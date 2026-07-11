'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, Badge, Button, Input } from '@portfolio/ui';
import { usePublicProjects } from '@/lib/hooks/usePublicData';

const categories = [
  { value: '', label: 'All' },
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'ai', label: 'AI' },
  { value: 'devops', label: 'DevOps' },
  { value: 'design', label: 'Design' },
];

const PAGE_SIZE = 9;

export default function ProjectsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const sortOrder = 'desc' as const;
  const [page, setPage] = useState(1);

  const { data: allProjects, isLoading } = usePublicProjects({ per_page: 100 });

  const filtered = useMemo(() => {
    let result = allProjects ?? [];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tech_stack?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (categoryFilter) result = result.filter(p => p.category === categoryFilter);
    return [...result].sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [allProjects, search, categoryFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="pt-32 pb-24 section-container">
      {/* Header */}
      <div className="space-y-4 mb-12">
        <h1 className="text-h1 font-display text-text-primary">Projects</h1>
        <p className="text-body-lg text-text-secondary max-w-2xl">
          A showcase of my recent work, focusing on performance, accessibility, and modern design.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => { setCategoryFilter(cat.value); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                categoryFilter === cat.value
                  ? 'bg-accent-500 text-white shadow-sm'
                  : 'bg-surface-secondary text-text-secondary hover:bg-surface-elevated border border-border-primary'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-text-tertiary mb-6">
        {isLoading ? 'Loading...' : `${filtered.length} project${filtered.length !== 1 ? 's' : ''} found`}
      </p>

      {/* Loading */}
      {isLoading ? (
        <div className="card-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-surface-secondary border border-border-primary p-6 space-y-4 animate-pulse">
              <div className="aspect-video bg-surface-elevated rounded-lg" />
              <div className="h-4 w-20 bg-surface-elevated rounded" />
              <div className="h-6 w-3/4 bg-surface-elevated rounded" />
              <div className="h-4 w-full bg-surface-elevated rounded" />
            </div>
          ))}
        </div>
      ) : paged.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-body-lg text-text-secondary">No projects found.</p>
          {(search || categoryFilter) && (
            <button onClick={() => { setSearch(''); setCategoryFilter(''); }} className="mt-3 text-accent-500 hover:text-accent-600 text-sm">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="card-grid">
          {paged.map((project) => (
            <Link key={project.id} href={`/projects/${project.slug}`} className="hover:no-underline group">
              <Card variant="interactive" padding="md" className="flex flex-col h-full">
                <div className="aspect-video bg-surface-elevated rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                  {project.cover_image ? (
                    <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <span className="text-4xl font-display text-text-tertiary/30">{project.title.charAt(0)}</span>
                  )}
                  {project.is_featured && (
                    <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-lg bg-accent-500 text-white shadow-lg">Featured</span>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex gap-2 mb-3 flex-wrap">
                    {project.tech_stack?.slice(0, 3).map(tech => (
                      <Badge key={tech} variant="default" size="sm">{tech}</Badge>
                    ))}
                    {project.category && (
                      <Badge variant="neutral" size="sm">{project.category}</Badge>
                    )}
                  </div>
                  <h3 className="text-h4 font-display text-text-primary mb-2 group-hover:text-accent-500 transition-colors">{project.title}</h3>
                  {project.description && (
                    <p className="text-body-sm text-text-secondary mb-4 line-clamp-2 flex-1">{project.description}</p>
                  )}
                  <div className="mt-auto pt-4 border-t border-border-primary flex gap-3">
                    {project.live_url && (
                      <span className="text-sm font-medium text-accent-500 inline-flex items-center gap-1">
                        Live Demo
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </span>
                    )}
                    {project.github_url && (
                      <span className="text-sm font-medium text-text-secondary inline-flex items-center gap-1">
                        Source
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-primary">
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
