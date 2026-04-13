import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AppShell } from './components/app-shell';
import { HomePage } from './pages/home-page';

vi.stubGlobal(
  'fetch',
  vi.fn(async () => ({
    ok: true,
    json: async () => ({
      data: { status: 'ok' },
      error: null,
    }),
  })),
);

describe('HomePage', () => {
  it('renders the dashboard shell and health card', async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AppShell>
            <HomePage />
          </AppShell>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      screen.getByRole('heading', {
        name: /manager/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText(/api health/i)).toBeInTheDocument();
    expect(
      await screen.findByText('ok', { selector: 'p' }),
    ).toBeInTheDocument();
  });
});
