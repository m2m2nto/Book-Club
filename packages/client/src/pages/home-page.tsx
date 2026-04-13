import type { ApiResponse } from '@book-club/shared';
import { useQuery } from '@tanstack/react-query';
import { Activity, ArrowRight, BadgeCheck, Clock3 } from 'lucide-react';

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
    <div className="space-y-8">
      <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 via-slate-900 to-slate-950 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-300">
              Dashboard preview
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-white">
              A calm control center for your book club.
            </h2>
            <p className="text-base leading-7 text-slate-300">
              Track the current read, coordinate meetings, and keep voting
              workflows visible for every member.
            </p>
          </div>

          <Button className="gap-2 self-start lg:self-auto">
            Explore setup
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center gap-3 text-violet-300">
            <Activity className="h-5 w-5" />
            <h3 className="font-medium text-white">API health</h3>
          </div>
          <p className="text-3xl font-semibold capitalize text-white">
            {healthStatus}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Live status from the Express backend through the Vite proxy.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center gap-3 text-emerald-300">
            <BadgeCheck className="h-5 w-5" />
            <h3 className="font-medium text-white">Workflow coverage</h3>
          </div>
          <p className="text-3xl font-semibold text-white">
            Books · Votes · RSVPs
          </p>
          <p className="mt-2 text-sm text-slate-400">
            The app shell is ready to expand into member and admin workflows.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <div className="mb-4 flex items-center gap-3 text-amber-300">
            <Clock3 className="h-5 w-5" />
            <h3 className="font-medium text-white">Next up</h3>
          </div>
          <p className="text-3xl font-semibold text-white">Shared types + DB</p>
          <p className="mt-2 text-sm text-slate-400">
            The next tasks wire in shared contracts and persistent storage.
          </p>
        </article>
      </section>
    </div>
  );
};
