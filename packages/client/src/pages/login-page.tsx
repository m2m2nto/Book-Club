import { LogIn } from 'lucide-react';

import { Button } from '../components/ui/button';

export const LoginPage = () => {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
      <div className="grid w-full gap-6 rounded-3xl border border-slate-800 bg-slate-950/80 p-8 shadow-glow lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 via-slate-900 to-slate-950 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-300">
            Book Club Manager
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white">
            Sign in to manage your club's reading rhythm.
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-300">
            Access is invite-only. Ask an admin to add your email address before
            signing in with Google.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
              View club history
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
              Vote on future reads
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-sm text-slate-300">
              RSVP to meetings
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/70 p-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
              Member access
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Continue with Google
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Google is the only sign-in method supported in v1.
            </p>
          </div>

          <Button
            className="mt-10 w-full gap-2"
            onClick={() => {
              window.location.href = '/auth/google';
            }}
          >
            <LogIn className="h-4 w-4" />
            Sign in with Google
          </Button>
        </section>
      </div>
    </div>
  );
};
