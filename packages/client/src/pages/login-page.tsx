import { ArrowRight, LogIn } from 'lucide-react';

import { Button } from '../components/ui/button';

const highlights = [
  'Track the current read, archive, and meeting rhythm in one place.',
  'Keep voting, RSVPs, and discussion feeling clear instead of noisy.',
  'Give members a calm, fast path back into the club workspace.',
];

export const LoginPage = () => {
  return (
    <div className="page-shell flex min-h-screen items-center">
      <div className="page-container w-full">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_24rem] lg:items-center xl:gap-14">
          <section className="fade-rise space-y-10">
            <div className="page-header max-w-4xl gap-5">
              <p className="eyebrow text-[color:var(--color-text-accent)]">
                Book Club Manager
              </p>
              <div className="space-y-5">
                <h1 className="editorial-title text-balance max-w-4xl">
                  Sign in to a clearer, lighter book club workspace.
                </h1>
                <p className="body-copy text-[1.05rem]">
                  Keep books, meetings, votes, and shared decisions in one calm,
                  editorial system. Access is invite-only, so ask an admin to
                  add your email before signing in.
                </p>
              </div>
            </div>

            <div className="grid gap-3.5 sm:max-w-2xl">
              {highlights.map((item) => (
                <div
                  className="flex items-start gap-3 border-b border-[color:rgba(221,228,238,0.85)] pb-3.5 last:border-b-0 last:pb-0"
                  key={item}
                >
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[color:var(--color-text-accent)]" />
                  <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
              <ArrowRight className="mt-1 h-4 w-4 flex-none text-[color:var(--color-text-accent)]" />
              <p className="max-w-2xl">
                Already invited? Continue with Google and you&apos;ll land directly in
                your club workspace.
              </p>
            </div>
          </section>

          <section className="surface-raised fade-rise px-6 py-7 sm:px-8 sm:py-8">
            <div className="space-y-6">
              <div className="page-header gap-3">
                <p className="eyebrow">Member access</p>
                <div className="space-y-3">
                  <h2 className="section-title">Continue with Google</h2>
                  <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    Google is the only sign-in method in v1. If your email has
                    already been invited, you&apos;ll go straight into the club.
                  </p>
                </div>
              </div>

              <div className="space-y-4 border-t border-[color:var(--color-border-soft)] pt-6">
                <Button
                  className="w-full justify-center gap-2 py-3 text-base"
                  onClick={() => {
                    window.location.href = '/auth/google';
                  }}
                >
                  <LogIn className="h-4 w-4" />
                  Sign in with Google
                </Button>

                <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[color:var(--color-canvas-subtle)] px-4 py-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  <span className="font-medium text-[color:var(--color-text-primary)]">
                    Need access first?
                  </span>{' '}
                  Ask your club admin to invite your email address before
                  signing in.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
