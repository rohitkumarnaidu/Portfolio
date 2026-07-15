'use client';

import { useState, useMemo } from 'react';
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useDeleteApiKey,
} from '@/lib/hooks/useApiKeys';
import type { ApiKey } from '@/lib/api';
import { Button, Input, Card, useToast, Modal } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';

export default function ApiKeysPage() {
  const { data: apiKeys, isLoading } = useApiKeys();
  const createMutation = useCreateApiKey();
  const revokeMutation = useRevokeApiKey();
  const deleteMutation = useDeleteApiKey();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState('');
  const [newKeyResult, setNewKeyResult] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createMutation.mutateAsync({
        name,
        permissions: permissions || undefined,
      });
      setNewKeyResult(result.rawKey);
      addToast({ variant: 'success', title: 'API key created' });
      setName('');
      setPermissions('');
      setShowForm(false);
    } catch {
      addToast({ variant: 'error', title: 'Failed to create API key' });
    }
  };

  const handleRevoke = async (k: ApiKey) => {
    try {
      await revokeMutation.mutateAsync(k.id);
      addToast({ variant: 'success', title: 'API key revoked' });
    } catch {
      addToast({ variant: 'error', title: 'Failed to revoke' });
    }
  };

  const handleDelete = async (k: ApiKey) => {
    await deleteMutation.mutateAsync(k.id);
  };

  const columns: Column<ApiKey>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        grow: true,
        render: (k) => <span className="text-sm font-medium text-text-primary">{k.name}</span>,
      },
      {
        key: 'keyPrefix',
        label: 'Key Prefix',
        width: '120px',
        render: (k) => (
          <code className="text-xs bg-surface-elevated px-2 py-0.5 rounded text-text-secondary font-mono">
            {k.keyPrefix}...
          </code>
        ),
      },
      {
        key: 'isRevoked',
        label: 'Status',
        width: '80px',
        sortable: true,
        render: (k) => (
          <span
            className={`text-xs font-medium ${k.isRevoked ? 'text-red-500' : 'text-emerald-500'}`}
          >
            {k.isRevoked ? 'Revoked' : 'Active'}
          </span>
        ),
      },
      {
        key: 'lastUsedAt',
        label: 'Last Used',
        width: '120px',
        render: (k) => (
          <span className="text-xs text-text-tertiary">
            {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never'}
          </span>
        ),
      },
      {
        key: 'createdAt',
        label: 'Created',
        width: '90px',
        render: (k) => (
          <span className="text-xs text-text-tertiary">
            {new Date(k.createdAt).toLocaleDateString()}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">API Keys</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Manage API keys for external integrations
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setNewKeyResult(null);
          }}
        >
          {showForm ? 'Cancel' : 'Create API Key'}
        </Button>
      </div>
      {showForm && (
        <Card variant="elevated" className="mb-8">
          <form onSubmit={handleCreate} className="p-6 space-y-4">
            <h3 className="font-display text-h4 text-text-primary">New API Key</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Production API Key"
              />
              <Input
                label="Permissions"
                value={permissions}
                onChange={(e) => setPermissions(e.target.value)}
                placeholder="read, write"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">Generate Key</Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setNewKeyResult(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
      <Modal
        isOpen={!!newKeyResult}
        onClose={() => setNewKeyResult(null)}
        title="API Key Generated"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-600 dark:text-amber-400">
            Make sure to copy this key now. You won&apos;t be able to see it again.
          </div>
          <div className="p-3 rounded-xl bg-surface-elevated border border-border-primary">
            <code className="text-sm font-mono text-text-primary break-all select-all">
              {newKeyResult}
            </code>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => {
                navigator.clipboard?.writeText(newKeyResult || '');
                addToast({ variant: 'success', title: 'Copied to clipboard' });
              }}
            >
              Copy to Clipboard
            </Button>
          </div>
        </div>
      </Modal>
      <DataTable
        data={apiKeys ?? []}
        columns={columns}
        keyExtractor={(k) => k.id}
        isLoading={isLoading}
        searchable
        searchPlaceholder="Search API keys..."
        pageSize={10}
        onEdit={undefined}
        onDelete={handleDelete}
        rowActions={(k) =>
          !k.isRevoked
            ? [{ label: 'Revoke', onClick: () => handleRevoke(k), variant: 'warning' }]
            : []
        }
      />
    </div>
  );
}
