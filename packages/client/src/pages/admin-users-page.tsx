import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { useToast } from '../components/ui/toast-provider';
import { useAuth } from '../hooks/use-auth';
import { apiFetch } from '../lib/api';

type AdminUser = {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  hasPassword: boolean;
  role: 'admin' | 'user';
  active: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type AuthLinkResponse = {
  success: boolean;
  expiresAt: string;
  deliveryMode: 'smtp' | 'dev-log';
  resetUrl: string | null;
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
        title: `Created ${createdUser.email}.`,
        description: 'Send them an invite link so they can set a password.',
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

  const sendInviteMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch<AuthLinkResponse>(`/api/users/${id}/send-invite`, {
        method: 'POST',
      }),
    onSuccess: async (result) => {
      showToast({
        title: 'Invite link sent.',
        description:
          result.resetUrl ??
          'The user can now open the link from their email to set a password.',
        variant: 'success',
      });
      await refreshUsers();
    },
  });

  const sendPasswordResetMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch<AuthLinkResponse>(`/api/users/${id}/send-password-reset`, {
        method: 'POST',
      }),
    onSuccess: async (result) => {
      showToast({
        title: 'Password reset sent.',
        description:
          result.resetUrl ??
          'The user can now open the reset link from their email.',
        variant: 'success',
      });
      await refreshUsers();
    },
  });

  if (authQuery.data?.role !== 'admin') {
    return (
      <div className="surface-base px-6 py-8 text-sm text-[color:var(--color-text-secondary)]">
        Admin access is required to manage users.
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_20rem] xl:items-end">
        <div className="page-header editorial-rule fade-rise max-w-4xl">
          <p className="eyebrow text-[color:var(--color-text-accent)]">Admin tools</p>
          <h1 className="editorial-title text-balance max-w-5xl">
            Manage member access with a cleaner, product-style operations view.
          </h1>
          <p className="body-copy text-[1.02rem]">
            Invite members, adjust roles, revoke access, and restore soft-deleted accounts with the same clearer publishing-product UI used across the app.
          </p>
        </div>

        <div className="surface-tint fade-rise px-5 py-5">
          <p className="eyebrow">At a glance</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Current users
              </p>
              <p className="mt-2 font-[var(--font-editorial)] text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                {usersQuery.data?.length ?? 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Admin role
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-accent)]">
                <ShieldCheck className="h-4 w-4" />
                Required
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)] xl:items-start">
        <form
          className="surface-base space-y-5 p-6"
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
          <div className="page-header gap-3">
            <p className="eyebrow">Add user</p>
            <div className="space-y-2">
              <h2 className="section-title">Invite someone new</h2>
              <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                Add the member here, then send them an invite link so they can set a password.
              </p>
            </div>
          </div>

          <label className="block text-sm text-[color:var(--color-text-secondary)]">
            Name
            <input
              className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
          </label>

          <label className="block text-sm text-[color:var(--color-text-secondary)]">
            Email
            <input
              className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
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

          <label className="block text-sm text-[color:var(--color-text-secondary)]">
            Role
            <select
              className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
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
            className="pressable w-full rounded-[var(--radius-pill)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
            type="submit"
          >
            {createUserMutation.isPending ? 'Saving...' : 'Add user'}
          </button>
        </form>

        <section className="surface-base p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="section-title">Current users</h2>
              <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                Review access state, roles, and soft-deleted accounts.
              </p>
            </div>
            <button
              className="pressable inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.88)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]"
              onClick={() => usersQuery.refetch()}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-[color:var(--color-text-secondary)]">
              <thead className="text-xs uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                <tr>
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Password</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border-soft)]">
                {usersQuery.data?.map((user) => {
                  const isDeleted = Boolean(user.deletedAt);
                  return (
                    <tr key={user.id}>
                      <td className="py-4">
                        <p className="font-semibold text-[color:var(--color-text-primary)]">
                          {user.name}
                        </p>
                        <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                          {user.email}
                        </p>
                      </td>
                      <td className="py-4 capitalize">{user.role}</td>
                      <td className="py-4">
                        <span
                          className={
                            user.hasPassword
                              ? 'rounded-full border border-[rgba(15,118,110,0.16)] bg-[color:var(--color-success-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-success-base)]'
                              : 'rounded-full border border-[color:var(--color-border-soft)] bg-[color:var(--color-canvas-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]'
                          }
                        >
                          {user.hasPassword ? 'Set' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4">
                        <span
                          className={
                            isDeleted
                              ? 'rounded-full border border-[rgba(180,35,24,0.18)] bg-[color:var(--color-error-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-error-base)]'
                              : user.active
                                ? 'rounded-full border border-[rgba(15,118,110,0.16)] bg-[color:var(--color-success-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-success-base)]'
                                : 'rounded-full border border-[color:var(--color-border-soft)] bg-[color:var(--color-canvas-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]'
                          }
                        >
                          {isDeleted ? 'Deleted' : user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex flex-wrap justify-end gap-2">
                          {!isDeleted ? (
                            <>
                              <button
                                className="pressable rounded-[var(--radius-pill)] border border-[color:var(--color-border-soft)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-canvas-subtle)]"
                                onClick={() =>
                                  sendInviteMutation.mutate(user.id, {
                                    onError: (error) => {
                                      showToast({
                                        title: 'Could not send the invite.',
                                        description:
                                          error instanceof Error
                                            ? error.message
                                            : 'Please try again.',
                                        variant: 'error',
                                      });
                                    },
                                  })
                                }
                                type="button"
                              >
                                Send invite
                              </button>
                              <button
                                className="pressable rounded-[var(--radius-pill)] border border-[color:var(--color-border-soft)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-canvas-subtle)]"
                                onClick={() =>
                                  sendPasswordResetMutation.mutate(user.id, {
                                    onError: (error) => {
                                      showToast({
                                        title: 'Could not send the reset link.',
                                        description:
                                          error instanceof Error
                                            ? error.message
                                            : 'Please try again.',
                                        variant: 'error',
                                      });
                                    },
                                  })
                                }
                                type="button"
                              >
                                Reset password
                              </button>
                              <button
                                className="pressable rounded-[var(--radius-pill)] border border-[color:var(--color-border-soft)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-canvas-subtle)]"
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
                            </>
                          ) : null}
                          {isDeleted ? (
                            <button
                              className="pressable rounded-[var(--radius-pill)] border border-[rgba(15,118,110,0.16)] bg-[color:var(--color-success-soft)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-success-base)]"
                              onClick={() => reactivateUserMutation.mutate(user.id)}
                              type="button"
                            >
                              Reactivate
                            </button>
                          ) : (
                            <button
                              className="pressable rounded-[var(--radius-pill)] border border-[rgba(180,35,24,0.18)] bg-[color:var(--color-error-soft)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-error-base)]"
                              onClick={() => {
                                if (window.confirm(`Soft-delete ${user.name}?`)) {
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
