'use client';

import { useState, useMemo } from 'react';
import { useBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost } from '@/lib/hooks/useBlogPosts';
import type { BlogPost } from '@portfolio/shared';
import { Button, Input, Card, Modal, useToast } from '@portfolio/ui';
import { BlogForm } from '@/components/admin/BlogForm';

const PAGE_SIZE = 10;

export default function BlogPage() {
  const { data: posts, isLoading } = useBlogPosts();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<'title' | 'category' | 'published_at'>('published_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const { addToast } = useToast();

  const filtered = useMemo(() => {
    let result = posts ?? [];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.title.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q)));
    }
    if (categoryFilter) result = result.filter(p => p.category === categoryFilter);
    result = [...result].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortField === 'category') cmp = (a.category || '').localeCompare(b.category || '');
      else cmp = new Date(a.published_at || a.created_at).getTime() - new Date(b.published_at || b.created_at).getTime();
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [posts, search, categoryFilter, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const categories = useMemo(() => [...new Set((posts ?? []).map(p => p.category).filter(Boolean))] as string[], [posts]);
  const allSelected = paged.length > 0 && paged.every(p => selectedIds.has(p.id));

  const resetForm = () => { setEditingPost(null); setShowForm(false); };

  const handleEdit = (p: BlogPost) => {
    setEditingPost(p);
    setShowForm(true);
  };

  const handleSubmit = async (payload: Partial<BlogPost>) => {
    try {
      if (editingPost) {
        await updatePost.mutateAsync({ id: editingPost.id, data: payload });
        addToast({ variant: 'success', title: 'Blog post updated successfully' });
      } else {
        await createPost.mutateAsync(payload);
        addToast({ variant: 'success', title: 'Blog post created successfully' });
      }
      resetForm();
    } catch {
      addToast({ variant: 'error', title: 'Failed to save blog post' });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePost.mutateAsync(deleteTarget.id);
      addToast({ variant: 'success', title: 'Blog post deleted' });
      setDeleteTarget(null);
    } catch { addToast({ variant: 'error', title: 'Failed to delete blog post' }); }
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortOrder('asc'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => deletePost.mutateAsync(id)));
      addToast({ variant: 'success', title: `${selectedIds.size} posts deleted` });
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    } catch { addToast({ variant: 'error', title: 'Bulk delete failed' }); }
  };

  const handleBulkFeature = async (featured: boolean) => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => updatePost.mutateAsync({ id, data: { is_featured: featured } })));
      addToast({ variant: 'success', title: `${selectedIds.size} posts ${featured ? 'featured' : 'unfeatured'}` });
      setSelectedIds(new Set());
    } catch { addToast({ variant: 'error', title: 'Bulk update failed' }); }
  };

  const handleBulkPublish = async (published: boolean) => {
    try {
      await Promise.all(Array.from(selectedIds).map(id => updatePost.mutateAsync({ id, data: { is_published: published } })));
      addToast({ variant: 'success', title: `${selectedIds.size} posts ${published ? 'published' : 'unpublished'}` });
      setSelectedIds(new Set());
    } catch { addToast({ variant: 'error', title: 'Bulk publish failed' }); }
  };

  const SortHeader = ({ field, label, className }: { field: typeof sortField; label: string; className?: string }) => (
    <button onClick={() => toggleSort(field)} className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-text-tertiary hover:text-text-primary transition-colors ${className || ''}`}>
      {label}
      {sortField === field && (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          {sortOrder === 'asc' ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />}
        </svg>
      )}
    </button>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Blog Posts</h1>
          <p className="text-body-sm text-text-secondary mt-1">Manage your blog content</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>New Post</Button>
        )}
      </div>

      {showForm && (
        <Card variant="elevated" className="mb-8 p-6">
          <BlogForm 
            initialData={editingPost} 
            onSubmit={handleSubmit} 
            onCancel={resetForm} 
            isLoading={createPost.isPending || updatePost.isPending}
          />
        </Card>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Search posts..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => { setCategoryFilter(''); setPage(1); }} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${!categoryFilter ? 'bg-accent-500 text-white' : 'bg-surface-elevated text-text-secondary hover:text-text-primary'}`}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => { setCategoryFilter(c); setPage(1); }} className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${categoryFilter === c ? 'bg-accent-500 text-white' : 'bg-surface-elevated text-text-secondary hover:text-text-primary'}`}>{c}</button>
          ))}
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-10 mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-500 text-white shadow-lg">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="h-4 w-px bg-white/20" />
          <button onClick={() => setBulkDeleteOpen(true)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Bulk Delete</button>
          <button onClick={() => handleBulkFeature(true)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Bulk Feature</button>
          <button onClick={() => handleBulkFeature(false)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Bulk Unfeature</button>
          <button onClick={() => handleBulkPublish(true)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Bulk Publish</button>
          <button onClick={() => handleBulkPublish(false)} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Bulk Unpublish</button>
          <div className="flex-1" />
          <button onClick={() => setSelectedIds(new Set())} className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">Clear Selection</button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 animate-pulse">{[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-surface-secondary border border-border-primary" />)}</div>
      ) : paged.length === 0 ? (
        <div className="text-center py-16"><p className="text-body text-text-secondary">No blog posts yet. Write your first one!</p></div>
      ) : (
        <div>
          <div className="flex items-center gap-4 px-4 py-2 mb-1">
            <label className="flex items-center justify-center w-5 h-5">
              <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="rounded border-border-primary" />
            </label>
            <SortHeader field="title" label="Title" className="flex-1" />
            <SortHeader field="category" label="Category" className="w-24" />
            <SortHeader field="published_at" label="Date" className="w-20" />
            <div className="w-16" />
          </div>
          <div className="space-y-2">
            {paged.map((post) => (
              <div key={post.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-secondary border border-border-primary hover:border-border-accent transition-colors">
                <label className="flex items-center justify-center w-5 h-5 shrink-0">
                  <input type="checkbox" checked={selectedIds.has(post.id)} onChange={() => toggleSelect(post.id)} className="rounded border-border-primary" />
                </label>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{post.title}</span>
                    {post.is_featured && <span className="text-xs px-1.5 py-0.5 rounded bg-accent-500/10 text-accent-500">Featured</span>}
                    <span className={`text-xs px-1.5 py-0.5 rounded ${post.is_published ? 'bg-semantic-success-bg text-semantic-success' : 'bg-surface-elevated text-text-tertiary'}`}>{post.is_published ? 'Published' : 'Draft'}</span>
                  </div>
                  <p className="text-xs text-text-tertiary mt-0.5">{post.category} &bull; {post.read_time} min read &bull; {new Date(post.published_at || post.created_at).toLocaleDateString()}</p>
                </div>
                <div className="w-24 shrink-0 text-xs text-text-tertiary">{post.category && <span className="capitalize">{post.category}</span>}</div>
                <div className="w-20 shrink-0 text-xs text-text-tertiary">{new Date(post.published_at || post.created_at).toLocaleDateString()}</div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => handleEdit(post)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-elevated transition-colors" aria-label="Edit">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button onClick={() => setDeleteTarget(post)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-semantic-error hover:bg-semantic-error-bg transition-colors" aria-label="Delete">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-primary">
          <p className="text-sm text-text-tertiary">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</Button>
          </div>
        </div>
      )}

      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Blog Post" size="sm">
        <p className="text-sm text-text-secondary">Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>

      <Modal isOpen={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} title="Bulk Delete Posts" size="sm">
        <p className="text-sm text-text-secondary">Are you sure you want to delete {selectedIds.size} posts? This action cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setBulkDeleteOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleBulkDelete}>Delete {selectedIds.size} Posts</Button>
        </div>
      </Modal>
    </div>
  );
}
