'use client';

import { useState, useMemo } from 'react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from '@/lib/hooks/useNotifications';
import type { Notification } from '@/lib/api';
import { Button, useToast } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';

export default function NotificationsPage() {
  const [filter, setFilter] = useState<{ isRead?: boolean }>({});
  const { data: notifications, isLoading } = useNotifications(filter);
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();
  const { addToast } = useToast();

  const handleMarkRead = async (n: Notification) => {
    try {
      await markReadMutation.mutateAsync(n.id);
      addToast({ variant: 'success', title: 'Marked as read' });
    } catch { addToast({ variant: 'error', title: 'Failed to mark as read' }); }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllReadMutation.mutateAsync();
      addToast({ variant: 'success', title: 'All notifications marked as read' });
    } catch { addToast({ variant: 'error', title: 'Failed to mark all as read' }); }
  };

  const handleDelete = async (n: Notification) => { await deleteMutation.mutateAsync(n.id); };

  const columns: Column<Notification>[] = useMemo(() => [
    { key: 'title', label: 'Title', sortable: true, grow: true, render: (n) => (
      <div className="flex items-center gap-2">
        {!n.isRead && <span className="w-2 h-2 rounded-full bg-accent-500 shrink-0" />}
        <div>
          <span className={`text-sm ${n.isRead ? 'text-text-secondary' : 'font-medium text-text-primary'}`}>{n.title}</span>
          {n.body && <span className="text-xs text-text-tertiary block truncate max-w-xs">{n.body}</span>}
        </div>
      </div>
    )},
    { key: 'type', label: 'Type', width: '80px', sortable: true, render: (n) => <span className="text-xs text-text-secondary capitalize">{n.type}</span> },
    { key: 'createdAt', label: 'Date', width: '120px', sortable: true, render: (n) => <span className="text-xs text-text-tertiary">{new Date(n.createdAt).toLocaleString()}</span> },
    { key: 'isRead', label: '', width: '80px', render: (n) => !n.isRead ? <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n)}>Mark Read</Button> : null },
  ], []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Notifications</h1>
          <p className="text-body-sm text-text-secondary mt-1">System notifications and alerts</p>
        </div>
        <div className="flex gap-2">
          <select value={filter.isRead === undefined ? 'all' : filter.isRead ? 'read' : 'unread'} onChange={e => {
            const v = e.target.value;
            setFilter(v === 'all' ? {} : { isRead: v === 'read' });
          }} className="rounded-xl border border-border-primary bg-surface-secondary px-3 py-2 text-xs text-text-primary">
            <option value="all">All</option><option value="unread">Unread</option><option value="read">Read</option>
          </select>
          <Button variant="ghost" onClick={handleMarkAllRead}>Mark All Read</Button>
        </div>
      </div>
      <DataTable
        data={notifications ?? []}
        columns={columns}
        keyExtractor={(n) => n.id}
        isLoading={isLoading}
        pageSize={10}
        onDelete={handleDelete}
      />
    </div>
  );
}
