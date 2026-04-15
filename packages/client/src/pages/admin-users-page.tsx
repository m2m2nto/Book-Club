import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useToast } from '../components/ui/toast-provider';
import { useAuth } from '../hooks/use-auth';
import { apiFetch } from '../lib/api';

type AdminUser = {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: 'admin' | 'user';
  active: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const usersQueryKey = ['admin', 'users'] as const;

export const AdminUsersPage = () => {
  const authQuery = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    email: '',
    name: '',
    role: 'user' as 'admin' | 'user',
  });

  const usersQuery = useQuery({
    queryKey: usersQueryKey,
    queryFn: () => apiFetch<AdminUser[]>('/api/users'),
    enabled: authQuery.data?.role === 'admin',
  });

  const refreshUsers = async () => {
    await queryClient.invalidateQueries({ queryKey: usersQueryKey });
  };

  const createUserMutation = useMutation({
    mutationFn: () =>
      apiFetch<AdminUser>('/api/users', {
        method: 'POST',
        body: JSON.stringify(form),
      }),
    onSuccess: async (createdUser) => {
      setForm({ email: '', name: '', role: 'user' });
      showToast({
        title: `Invited ${createdUser.email}.`,
        description: 'They can now sign in with Google.',
        variant: 'success',
      });
      await refreshUsers();
    },
  });

  const patchUserMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Record<string, unknown>;
    }) =>
      apiFetch<AdminUser>(`/api/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: refreshUsers,
  });

  const reactivateUserMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch<AdminUser>(`/api/users/${id}/reactivate`, { method: 'POST' }),
    onSuccess: refreshUsers,
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ success: boolean }>(`/api/users/${id}`, { method: 'DELETE' }),
    onSuccess: refreshUsers,
  });

  if (authQuery.data?.role !== 'admin') {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-slate-300">
        Admin access is required to manage users.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-300">
          Admin tools
        </p>
        <h1 className="text-3xl font-semibold text-white">User management</h1>
        <p className="text-sm text-slate-400">
          Invite members, promote admins, deactivate access, and restore
          soft-deleted accounts.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <form
          className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            createUserMutation.mutate(undefined, {
              onError: (error) => {
                showToast({
                  title: 'Could not add the user.',
                  description:
                    error instanceof Error ? error.message : 'Please try again.',
                  variant: 'error',
                });
              },
            });
          }}
        >
          <div>
            <h2 className="text-lg font-semibold text-white">Add user</h2>
            <p className="mt-1 text-sm text-slate-400">
              Users must be invited before they can log in with Google.
            </p>
          </div>

          <label className="block text-sm text-slate-300">
            Name
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-400"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>

          <label className="block text-sm text-slate-300">
            Email
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-400"
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </label>

          <label className="block text-sm text-slate-300">
            Role
            <select
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-violet-400"
              value={form.role}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  role: event.target.value === 'admin' ? 'admin' : 'user',
                }))
              }
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button
            className="w-full rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
            type="submit"
          >
            {createUserMutation.isPending ? 'Saving...' : 'Add user'}
          </button>

        </form>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Current users</h2>
            <button
              className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
              onClick={() => usersQuery.refetch()}
              type="button"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {usersQuery.data?.map((user) => {
                  const isDeleted = Boolean(user.deletedAt);
                  return (
                    <tr key={user.id}>
                      <td className="py-4">
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="py-4 capitalize">{user.role}</td>
                      <td className="py-4">
                        {isDeleted
                          ? 'Deleted'
                          : user.active
                            ? 'Active'
                            : 'Inactive'}
                      </td>
                      <td className="py-4">
                        <div className="flex justify-end gap-2">
                          {!isDeleted ? (
                            <button
                              className="rounded-lg border border-slate-700 px-3 py-2 text-xs hover:bg-slate-800"
                              onClick={() =>
                                patchUserMutation.mutate({
                                  id: user.id,
                                  payload: { active: !user.active },
                                })
                              }
                              type="button"
                            >
                              {user.active ? 'Deactivate' : 'Activate'}
                            </button>
                          ) : null}
                          {isDeleted ? (
                            <button
                              className="rounded-lg border border-emerald-600/40 px-3 py-2 text-xs text-emerald-300 hover:bg-emerald-500/10"
                              onClick={() =>
                                reactivateUserMutation.mutate(user.id)
                              }
                              type="button"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              className="rounded-lg border border-rose-600/40 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10"
                              onClick={() => {
                                if (
                                  window.confirm(`Soft-delete ${user.name}?`)
                                ) {
                                  deleteUserMutation.mutate(user.id);
                                }
                              }}
                              type="button"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </div>
  );
};
