import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AppShell } from './components/app-shell';
import { DashboardPage } from './pages/dashboard-page';

vi.stubGlobal(
  'fetch',
  vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes('/auth/me')) {
      return {
        ok: true,
        json: async () => ({
          data: {
            id: 1,
            email: 'member@example.com',
            name: 'Member',
            avatarUrl: null,
            role: 'user',
            active: true,
          },
          error: null,
        }),
      };
    }

    return {
      ok: true,
      json: async () => ({
        data: {
          currentBook: null,
          nextMeeting: null,
          myRsvp: null,
          openSurveys: [],
          pendingRsvps: [],
          adminSummary: null,
        },
        error: null,
      }),
    };
  }),
);

describe('DashboardPage', () => {
  it('renders dashboard cards', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppShell>
            <DashboardPage />
          </AppShell>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText(/your book club at a glance/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Open surveys' }),
    ).toBeInTheDocument();
  });
});
