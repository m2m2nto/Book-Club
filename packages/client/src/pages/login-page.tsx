import { ArrowRight, LogIn } from 'lucide-react';

import { Button } from '../components/ui/button';

export const LoginPage = () => {
  return (
    <div className="page-shell flex min-h-screen items-center">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.3fr)_24rem] lg:items-stretch">
        <section className="surface-tint relative overflow-hidden px-7 py-10 lg:px-10 lg:py-12">
          <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(91,85,214,0.12),transparent_55%),radial-gradient(circle_at_top_right,rgba(255,239,214,0.55),transparent_42%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <p className="eyebrow text-[color:var(--color-text-accent)]">
                Book Club Manager
              </p>
              <div className="max-w-3xl space-y-5">
                <h1 className="editorial-title max-w-3xl">
                  Sign in to guide your club&apos;s reading rhythm.
                </h1>
                <p className="body-copy text-[1.05rem]">
                  Access is invite-only. Ask an admin to add your email address
                  before signing in so your next vote, RSVP, and reading note
                  all land in the right place.
                </p>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {[
                  ['Browse the club archive', 'See what your group has already read and discussed.'],
                  ['Vote on future reads', 'Take part in surveys that shape the next book.'],
                  ['RSVP with less friction', 'Keep meeting plans clear for everyone in the club.'],
                ].map(([title, description]) => (
                  <div
                    className="rounded-[var(--radius-lg)] border border-white/75 bg-white/70 px-4 py-4"
                    key={title}
                  >
                    <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                      {description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="max-w-sm space-y-3 border-l-0 border-[color:var(--color-border-soft)] pt-2 lg:border-l lg:pl-6">
                <p className="eyebrow">A quieter home for books, meetings, and shared decisions</p>
                <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Designed to feel bright, calm, and clear from the moment your
                  club arrives.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-base flex flex-col justify-between px-6 py-8 lg:px-8 lg:py-10">
          <div className="space-y-5">
            <p className="eyebrow">Member access</p>
            <div className="space-y-3">
              <h2 className="section-title text-[2rem]">Continue with Google</h2>
              <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                Google is the only sign-in method supported in v1. If your
                account has already been invited, you&apos;ll land right inside the
                club.
              </p>
            </div>
          </div>

          <div className="mt-10 space-y-5">
            <Button
              className="w-full justify-center gap-2 py-3 text-base"
              onClick={() => {
                window.location.href = '/auth/google';
              }}
            >
              <LogIn className="h-4 w-4" />
              Sign in with Google
            </Button>
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[color:var(--color-canvas-subtle)] px-4 py-3 text-sm text-[color:var(--color-text-secondary)]">
              <div className="flex items-start gap-2">
                <ArrowRight className="mt-0.5 h-4 w-4 text-[color:var(--color-text-accent)]" />
                <span>
                  Need access first? Ask your club admin to invite your email.
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
