import type { ApiResponse } from '@book-club/shared';
import { useQuery } from '@tanstack/react-query';
import { Activity, ArrowRight, BadgeCheck, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '../components/ui/button';

type HealthResponse = ApiResponse<{ status: string }>;

const fetchHealth = async () => {
  const response = await fetch('/api/health');

  if (!response.ok) {
    throw new Error('Failed to load server health.');
  }

  return (await response.json()) as HealthResponse;
};

export const HomePage = () => {
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });

  const healthStatus = healthQuery.data?.data.status ?? 'loading';

  return (
    <div className="page-stack">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_20rem] xl:items-end">
        <div className="page-header editorial-rule fade-rise max-w-4xl">
          <p className="eyebrow text-[color:var(--color-text-accent)]">Welcome</p>
          <h1 className="editorial-title text-balance max-w-5xl">
            A polished publishing-style home for your book club.
          </h1>
          <p className="body-copy text-[1.02rem]">
            Track books, meetings, surveys, and member activity in one cleaner
            workspace with calmer navigation and more readable summaries.
          </p>
        </div>

        <div className="surface-tint fade-rise px-5 py-5">
          <p className="eyebrow">System status</p>
          <p className="mt-3 stat-number capitalize">{healthStatus}</p>
          <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
            Live health from the server, ready for day-to-day club operations.
          </p>
        </div>
      </section>

      <section className="surface-raised fade-rise px-6 py-7 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="eyebrow">Product overview</p>
            <h2 className="section-title text-[1.8rem]">
              Books, votes, RSVPs, and reading history in one focused interface.
            </h2>
            <p className="text-sm leading-8 text-[color:var(--color-text-secondary)]">
              This preview page now matches the rest of the app: brighter
              surfaces, stronger calls to action, and clearer scanning across key
              workflows.
            </p>
          </div>

          <Link to="/login">
            <Button className="gap-2">
              Open sign in
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="surface-base px-6 py-6">
          <div className="flex items-center gap-3 text-[color:var(--color-text-accent)]">
            <Activity className="h-5 w-5" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-text-accent)]">
              API health
            </h3>
          </div>
          <p className="mt-5 stat-number capitalize">{healthStatus}</p>
          <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
            Live status from the backend through the local client.
          </p>
        </article>

        <article className="surface-base px-6 py-6">
          <div className="flex items-center gap-3 text-[color:var(--color-success-base)]">
            <BadgeCheck className="h-5 w-5" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-success-base)]">
              Workflow coverage
            </h3>
          </div>
          <p className="mt-5 text-[1.8rem] font-extrabold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
            Books · Votes · RSVPs
          </p>
          <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
            The core member and admin workflows are already connected.
          </p>
        </article>

        <article className="surface-base px-6 py-6">
          <div className="flex items-center gap-3 text-[color:var(--color-warning-base)]">
            <Clock3 className="h-5 w-5" />
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-warning-base)]">
              Next up
            </h3>
          </div>
          <p className="mt-5 text-[1.8rem] font-extrabold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
            Full launch polish
          </p>
          <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
            Final mobile cleanup, tighter microcopy, and production readiness.
          </p>
        </article>
      </section>
    </div>
  );
};
