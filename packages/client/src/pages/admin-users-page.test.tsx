import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ToastProvider } from '../components/ui/toast-provider';
import { AdminUsersPage } from './admin-users-page';

const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);

  if (url.includes('/auth/me')) {
    return {
      ok: true,
      json: async () => ({
        data: {
          id: 1,
          email: 'admin@example.com',
          name: 'Admin',
          avatarUrl: null,
          role: 'admin',
          active: true,
        },
        error: null,
      }),
    };
  }

  if (url.includes('/api/users') && !url.includes('send-') && !init?.method) {
    return {
      ok: true,
      json: async () => ({
        data: [
          {
            id: 2,
            email: 'member@example.com',
            name: 'Member',
            avatarUrl: null,
            hasPassword: false,
            role: 'user',
            active: true,
            deletedAt: null,
            createdAt: '2026-04-17T10:00:00.000Z',
            updatedAt: '2026-04-17T10:00:00.000Z',
          },
        ],
        error: null,
      }),
    };
  }

  if (url.includes('/auth/csrf')) {
    return {
      ok: true,
      json: async () => ({
        data: { csrfToken: 'csrf-token' },
        error: null,
      }),
    };
  }

  if (url.includes('/api/users/2/send-invite')) {
    return {
      ok: true,
      json: async () => ({
        data: {
          success: true,
          expiresAt: '2026-04-18T10:00:00.000Z',
          deliveryMode: 'dev-log',
          resetUrl: 'http://localhost:5173/reset-password?token=test-token',
        },
        error: null,
      }),
    };
  }

  return {
    ok: true,
    json: async () => ({ data: { success: true }, error: null }),
  };
});

describe('AdminUsersPage', () => {
  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('shows password status and can send an invite link', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <AdminUsersPage />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('Pending')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /send invite/i }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([url]) => String(url).includes('/auth/csrf')),
      ).toBe(true);
      expect(
        screen.getByText(/http:\/\/localhost:5173\/reset-password\?token=test-token/i),
      ).toBeInTheDocument();
    });
  });
});
