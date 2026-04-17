import { ArrowRight, LogIn } from 'lucide-react';

import { Button } from '../components/ui/button';

const highlights = [
  'Bring the current read, archive, and next discussion into one polished home base.',
  'Keep voting, RSVPs, and planning inside a cleaner, more product-like publishing UI.',
  'Give members a front page that feels closer to WordPress.com than an admin dashboard.',
];

export const LoginPage = () => {
  return (
    <div className="page-shell flex min-h-screen items-center">
      <div className="page-container w-full">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_25rem] lg:items-start xl:gap-16">
          <section className="fade-rise editorial-rule space-y-10 pt-10">
            <div className="page-header max-w-4xl gap-5">
              <p className="eyebrow text-[color:var(--color-text-accent)]">
                Book Club Journal
              </p>
              <div className="space-y-5">
                <h1 className="editorial-title text-balance max-w-5xl">
                  A modern publishing home for your book club.
                </h1>
                <p className="body-copy text-[1.08rem]">
                  The workspace now leans into a more polished WordPress-style direction: cleaner spacing, brighter surfaces, sharper calls to action, and clearer product hierarchy. Access is still invite-only.
                </p>
              </div>
            </div>

            <div className="grid gap-3.5 sm:max-w-2xl">
              {highlights.map((item, index) => (
                <div
                  className="grid gap-2 border-b border-[rgba(22,20,18,0.1)] pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[3rem_minmax(0,1fr)]"
                  key={item}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                    0{index + 1}
                  </span>
                  <p className="text-base leading-8 text-[color:var(--color-text-secondary)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
              <ArrowRight className="mt-1 h-4 w-4 flex-none text-[color:var(--color-text-accent)]" />
              <p className="max-w-2xl">
                Already invited? Continue with Google and you&apos;ll land directly in your club workspace.
              </p>
            </div>
          </section>

          <section className="surface-raised fade-rise px-6 py-7 sm:px-8 sm:py-8 lg:mt-12">
            <div className="space-y-6">
              <div className="page-header gap-3">
                <p className="eyebrow">Member access</p>
                <div className="space-y-3">
                  <h2 className="section-title">Continue with Google</h2>
                  <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    One sign-in route, one familiar workspace. If your email has been invited, you&apos;ll land directly in the club dashboard.
                  </p>
                </div>
              </div>

              <div className="space-y-4 border-t border-[color:var(--color-border-soft)] pt-6">
                <Button
                  className="w-full justify-center gap-2 py-3 text-sm"
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
                  Ask your club admin to invite your email address before signing in.
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
