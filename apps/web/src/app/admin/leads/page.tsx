'use client';

import { useState } from 'react';
import { useLeads, useUpdateLead } from '@/lib/hooks/useLeads';
import { getLeadsExportUrl } from '@/lib/api';
import type { Lead } from '@portfolio/shared';
import { Button, Input, useToast } from '@portfolio/ui';

const statusColors: Record<string, string> = {
  new: 'bg-accent-500/10 text-accent-500',
  read: 'bg-semantic-info-bg text-semantic-info',
  replied: 'bg-semantic-success-bg text-semantic-success',
  converted: 'bg-semantic-success text-white',
  archived: 'bg-surface-elevated text-text-tertiary',
};

const priorityColors: Record<string, string> = {
  low: 'text-text-tertiary',
  normal: 'text-text-secondary',
  high: 'text-semantic-warning',
  urgent: 'text-semantic-error',
};

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [page, setPage] = useState(1);
  const { data: leads, isLoading } = useLeads({
    page,
    per_page: 50,
    status: statusFilter || undefined,
    search: search || undefined,
  });
  const updateLead = useUpdateLead();
  const { addToast } = useToast();

  const handleSearch = () => {
    setPage(1);
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateLead.mutateAsync({ id, data: { status } as Record<string, unknown> });
      addToast({ variant: 'success', title: `Lead marked as ${status}` });
      if (selectedLead?.id === id) setSelectedLead(null);
    } catch {
      addToast({ variant: 'error', title: 'Failed to update lead' });
    }
  };

  const handleExport = () => {
    window.open(getLeadsExportUrl(undefined, undefined, statusFilter || undefined), '_blank');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Leads</h1>
          <p className="text-body-sm text-text-secondary mt-1">Manage contact form submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search leads..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'new', 'read', 'replied', 'converted', 'archived'].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === s ? 'bg-accent-500 text-white' : 'bg-surface-elevated text-text-secondary hover:text-text-primary'}`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {selectedLead && (
        <div className="rounded-2xl bg-surface-secondary border border-border-primary p-6 mb-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-h4 text-text-primary">{selectedLead.name}</h3>
              <p className="text-body-sm text-text-secondary">
                <a href={`mailto:${selectedLead.email}`} className="text-accent-500">
                  {selectedLead.email}
                </a>
                {selectedLead.company && <> &bull; {selectedLead.company}</>}
              </p>
            </div>
            <button
              onClick={() => setSelectedLead(null)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-elevated"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-body text-text-secondary bg-surface-elevated rounded-xl p-4 whitespace-pre-wrap">
            {selectedLead.message}
          </p>
          <div className="flex flex-wrap gap-3">
            {['new', 'read', 'replied', 'converted', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(selectedLead.id, status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${selectedLead.status === status ? statusColors[status] + ' ring-1 ring-current' : 'bg-surface-elevated text-text-secondary hover:text-text-primary'}`}
              >
                {status}
              </button>
            ))}
          </div>
          {selectedLead.metadata && Object.keys(selectedLead.metadata).length > 0 && (
            <div className="pt-2 border-t border-border-primary">
              <p className="text-xs font-medium text-text-tertiary mb-1">Metadata</p>
              <pre className="text-xs text-text-tertiary">
                {JSON.stringify(selectedLead.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-surface-secondary border border-border-primary"
            />
          ))}
        </div>
      ) : !leads?.length ? (
        <div className="text-center py-16">
          <p className="text-body text-text-secondary">No leads found.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {leads.map((lead) => (
            <button
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface-secondary border border-border-primary hover:border-border-accent transition-colors text-left"
            >
              <div className="flex-shrink-0">
                <span
                  className={`block text-xs font-medium px-1.5 py-0.5 rounded ${statusColors[lead.status] || 'bg-surface-elevated text-text-tertiary'}`}
                >
                  {lead.status}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">{lead.name}</span>
                  <span className={`text-xs ${priorityColors[lead.priority || 'normal']}`}>
                    {lead.priority}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary mt-0.5 truncate">
                  {lead.email} &bull; {new Date(lead.created_at).toLocaleDateString()}
                </p>
              </div>
              <svg
                className="w-4 h-4 text-text-tertiary shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
