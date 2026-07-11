'use client';

import { useState, useMemo } from 'react';
import { useUsers, useCreateUser, useUpdateUser, useUpdateUserRole, useUnlockUser, useDeleteUser } from '@/lib/hooks/useUsers';
import type { User } from '@/lib/api';
import { Button, Input, Card, useToast } from '@portfolio/ui';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';

interface UserForm {
  email: string; displayName: string; password: string; role: string;
}
const emptyForm: UserForm = { email: '', displayName: '', password: '', role: 'viewer' };

export default function UsersPage() {
  const [params, setParams] = useState<{ search?: string; role?: string }>({});
  const { data: users, isLoading } = useUsers(params);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const updateRoleMutation = useUpdateUserRole();
  const unlockMutation = useUnlockUser();
  const deleteMutation = useDeleteUser();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const { addToast } = useToast();

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setShowForm(false); };

  const handleEdit = (u: User) => {
    setForm({ email: u.email, displayName: u.displayName, password: '', role: u.role });
    setEditingId(u.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: { email: form.email, displayName: form.displayName, role: form.role } });
        addToast({ variant: 'success', title: 'User updated' });
      } else {
        await createMutation.mutateAsync({ email: form.email, displayName: form.displayName, password: form.password || undefined, role: form.role });
        addToast({ variant: 'success', title: 'User created' });
      }
      resetForm();
    } catch { addToast({ variant: 'error', title: 'Failed to save user' }); }
  };

  const handleDelete = async (u: User) => { await deleteMutation.mutateAsync(u.id); };

  const handleRoleChange = async (u: User, role: string) => {
    try {
      await updateRoleMutation.mutateAsync({ id: u.id, role });
      addToast({ variant: 'success', title: `Role changed to ${role}` });
    } catch { addToast({ variant: 'error', title: 'Failed to update role' }); }
  };

  const columns: Column<User>[] = useMemo(() => [
    { key: 'displayName', label: 'Name', sortable: true, grow: true, render: (u) => (
      <div>
        <span className="text-sm font-medium text-text-primary">{u.displayName}</span>
        <span className="text-xs text-text-tertiary block">{u.email}</span>
      </div>
    )},
    { key: 'role', label: 'Role', width: '100px', sortable: true, render: (u) => (
      <select value={u.role} onChange={e => handleRoleChange(u, e.target.value)}
        className="text-xs rounded-lg border border-border-primary bg-surface-secondary px-2 py-1 text-text-primary">
        <option value="admin">Admin</option><option value="editor">Editor</option><option value="viewer">Viewer</option>
      </select>
    )},
    { key: 'isActive', label: 'Status', width: '80px', sortable: true, render: (u) => (
      <span className={`text-xs font-medium ${u.isActive ? 'text-emerald-500' : 'text-red-500'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
    )},
    { key: 'lastLoginAt', label: 'Last Login', width: '120px', sortable: true, render: (u) => (
      <span className="text-xs text-text-tertiary">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}</span>
    )},
  ], []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Users</h1>
          <p className="text-body-sm text-text-secondary mt-1">Manage admin users and permissions</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(!showForm); }}>{showForm ? 'Cancel' : 'Add User'}</Button>
      </div>
      {showForm && (
        <Card variant="elevated" className="mb-8">
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h3 className="font-display text-h4 text-text-primary">{editingId ? 'Edit User' : 'New User'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Email *" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              <Input label="Display Name *" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} required />
              {!editingId && <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave empty for auto-generate" />}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full rounded-xl border border-border-primary bg-surface-secondary px-4 py-2.5 text-sm text-text-primary">
                  <option value="admin">Admin</option><option value="editor">Editor</option><option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
              <Button variant="ghost" type="button" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}
      <DataTable
        data={users ?? []}
        columns={columns}
        keyExtractor={(u) => u.id}
        isLoading={isLoading}
        searchable
        onSearch={(q) => setParams(p => ({ ...p, search: q || undefined }))}
        searchPlaceholder="Search users..."
        pageSize={10}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
