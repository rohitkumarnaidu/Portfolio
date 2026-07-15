'use client';

import { useState } from 'react';
import { useActivities } from '@/lib/hooks/useActivities';
import { getActivitiesExportUrl } from '@/lib/api';
import { Button } from '@portfolio/ui';

const actionColors: Record<string, string> = {
  CREATE: 'bg-semantic-success-bg text-semantic-success',
  UPDATE: 'bg-accent-500/10 text-accent-500',
  DELETE: 'bg-semantic-error-bg text-semantic-error',
  RESTORE: 'bg-semantic-info-bg text-semantic-info',
  LOGIN: 'bg-surface-elevated text-text-secondary',
};

const entityIcons: Record<string, string> = {
  section: 'S',
  project: 'P',
  skill: 'Sk',
  lead: 'L',
  experience: 'E',
  testimonial: 'T',
  blog: 'B',
  service: 'Sv',
  faq: 'F',
  activity: 'A',
  user: 'U',
};

export default function ActivitiesPage() {
  const [page, setPage] = useState(1);
  const { data: activities, isLoading, refetch } = useActivities({ page, per_page: 50 });

  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const nextPage = () => setPage((p) => p + 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Activity Log</h1>
          <p className="text-body-sm text-text-secondary mt-1">Audit trail of all admin actions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => refetch()}>
            Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.open(getActivitiesExportUrl(), '_blank')}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-surface-secondary border border-border-primary"
            />
          ))}
        </div>
      ) : !activities?.length ? (
        <div className="text-center py-16">
          <p className="text-body text-text-secondary">No activity recorded yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {activities.map((act) => (
              <div
                key={act.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-surface-secondary border border-border-primary transition-colors hover:border-border-accent"
              >
                <div className="w-8 h-8 rounded-lg bg-surface-elevated flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-text-tertiary">
                    {entityIcons[act.entity_type] || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded ${actionColors[act.action] || 'bg-surface-elevated text-text-tertiary'}`}
                    >
                      {act.action}
                    </span>
                    <span className="text-sm text-text-primary capitalize">{act.entity_type}</span>
                    <span className="text-xs text-text-tertiary font-mono">
                      {act.entity_id.slice(0, 8)}
                    </span>
                  </div>
                  {typeof act.metadata?.changes === 'string' && (
                    <p className="text-xs text-text-tertiary mt-0.5 truncate">
                      {act.metadata.changes}
                    </p>
                  )}
                </div>
                <span className="text-xs text-text-tertiary shrink-0">
                  {new Date(act.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-primary">
            <p className="text-sm text-text-tertiary">Page {page}</p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={prevPage} disabled={page <= 1}>
                Previous
              </Button>
              <Button variant="secondary" size="sm" onClick={nextPage}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
