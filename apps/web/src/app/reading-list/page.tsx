'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getReadingListItems } from '@/lib/api';
import type { ReadingListItem } from '@/lib/api';

const categories = [
  { value: '', label: 'All' },
  { value: 'currently_reading', label: 'Currently Reading' },
  { value: 'books', label: 'Books' },
  { value: 'articles', label: 'Articles' },
  { value: 'recommendations', label: 'Recommendations' },
];

export default function ReadingListPage() {
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: items, isLoading } = useQuery({
    queryKey: ['readingListItems', categoryFilter],
    queryFn: () => getReadingListItems({ category: categoryFilter || undefined }),
  });

  const grouped = useMemo(() => {
    if (!items) return {};
    return items.reduce<Record<string, ReadingListItem[]>>((acc, item) => {
      const cat = item.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [items]);

  return (
    <div className="min-h-dvh bg-surface-primary">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="mb-12">
          <h1 className="font-display text-h1 text-text-primary mb-3">Reading List</h1>
          <p className="text-body text-text-secondary max-w-2xl">Books, articles, and resources I&apos;m reading or recommend.</p>
        </div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map(c => (
            <button
              key={c.value}
              onClick={() => setCategoryFilter(c.value)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                categoryFilter === c.value
                  ? 'bg-accent-500 text-white'
                  : 'bg-surface-elevated text-text-secondary hover:text-text-primary'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className="rounded-2xl bg-surface-secondary border border-border-primary p-6 animate-pulse h-32" />)}
          </div>
        ) : !items?.length ? (
          <div className="text-center py-16">
            <p className="text-body text-text-secondary">No items in reading list yet.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category} className="mb-10">
              <h2 className="font-display text-h3 text-text-primary mb-4 capitalize">
                {category.replace('_', ' ')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryItems.map(item => (
                  <div key={item.id} className="rounded-2xl bg-surface-secondary border border-border-primary p-5 hover:border-border-accent transition-colors">
                    <div className="flex gap-4">
                      {item.coverUrl && (
                        <img src={item.coverUrl} alt={item.title} className="w-16 h-20 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-text-primary">{item.title}</h3>
                        <p className="text-xs text-text-secondary mt-0.5">{item.author}</p>
                        {item.description && <p className="text-xs text-text-tertiary mt-2">{item.description}</p>}
                        <div className="flex items-center gap-3 mt-3">
                          {item.url && (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-500 hover:underline">
                              Read more
                            </a>
                          )}
                          {item.completedDate && (
                            <span className="text-xs text-text-tertiary">Completed {item.completedDate}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
