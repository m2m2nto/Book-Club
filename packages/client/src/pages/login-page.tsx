import { ArrowRight, KeyRound, Mail, LogIn } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/toast-provider';
import { authQueryKey, useAuth } from '../hooks/use-auth';
import { apiFetch } from '../lib/api';

const highlights = [
  'Bring the current read, archive, and next discussion into one polished home base.',
  'Keep voting, RSVPs, and planning inside a cleaner, more product-like publishing UI.',
  'Give members a front page that feels closer to WordPress.com than an admin dashboard.',
];

export const LoginPage = () => {
  const authQuery = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const nextPath = useMemo(() => searchParams.get('next') ?? '/', [searchParams]);

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      showToast({
        title: 'Password updated.',
        description: 'Sign in with your new password.',
        variant: 'success',
      });
    }
  }, [searchParams, showToast]);

  const loginMutation = useMutation({
    mutationFn: async () =>
      apiFetch<{ success: boolean; user: unknown }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKey });
      navigate(nextPath, { replace: true });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async () =>
      apiFetch<{ success: boolean; message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail }),
      }),
    onSuccess: (result) => {
      showToast({
        title: 'Reset email requested.',
        description: result.message,
        variant: 'success',
      });
      setMode('login');
    },
  });

  if (authQuery.data) {
    return <Navigate to={nextPath} replace />;
  }

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
                  The workspace now leans into a more polished WordPress-style direction: cleaner spacing, brighter surfaces, sharper calls to action, and clearer product hierarchy. Access stays invite-only, now through email and password.
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
                Already invited? Sign in with your email and password, or request a reset link if you still need to set one.
              </p>
            </div>
          </section>

          <section className="surface-raised fade-rise px-6 py-7 sm:px-8 sm:py-8 lg:mt-12">
            <div className="space-y-6">
              <div className="page-header gap-3">
                <p className="eyebrow">Member access</p>
                <div className="space-y-3">
                  <h2 className="section-title">
                    {mode === 'login' ? 'Sign in with email' : 'Request a reset link'}
                  </h2>
                  <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {mode === 'login'
                      ? 'Use the password you set from your invite link. If your email has been invited, you will land directly in the club dashboard.'
                      : 'We will email you a secure link to set or reset your password.'}
                  </p>
                </div>
              </div>

              {mode === 'login' ? (
                <form
                  className="space-y-4 border-t border-[color:var(--color-border-soft)] pt-6"
                  onSubmit={(event) => {
                    event.preventDefault();
                    loginMutation.mutate(undefined, {
                      onError: (error) => {
                        showToast({
                          title: 'Could not sign you in.',
                          description:
                            error instanceof Error ? error.message : 'Please try again.',
                          variant: 'error',
                        });
                      },
                    });
                  }}
                >
                  <label className="block text-sm text-[color:var(--color-text-secondary)]">
                    Email
                    <input
                      className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                      type="email"
                      value={loginForm.email}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="block text-sm text-[color:var(--color-text-secondary)]">
                    Password
                    <input
                      className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                      type="password"
                      value={loginForm.password}
                      onChange={(event) =>
                        setLoginForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <Button className="w-full justify-center gap-2 py-3 text-sm" type="submit">
                    <LogIn className="h-4 w-4" />
                    {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
                  </Button>

                  <Button
                    className="w-full justify-center"
                    onClick={() => setMode('forgot')}
                    type="button"
                    variant="ghost"
                  >
                    Forgot your password?
                  </Button>
                </form>
              ) : (
                <form
                  className="space-y-4 border-t border-[color:var(--color-border-soft)] pt-6"
                  onSubmit={(event) => {
                    event.preventDefault();
                    forgotPasswordMutation.mutate(undefined, {
                      onError: (error) => {
                        showToast({
                          title: 'Could not request the reset link.',
                          description:
                            error instanceof Error ? error.message : 'Please try again.',
                          variant: 'error',
                        });
                      },
                    });
                  }}
                >
                  <label className="block text-sm text-[color:var(--color-text-secondary)]">
                    Email
                    <input
                      className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                      type="email"
                      value={forgotEmail}
                      onChange={(event) => setForgotEmail(event.target.value)}
                    />
                  </label>

                  <Button className="w-full justify-center gap-2 py-3 text-sm" type="submit">
                    <Mail className="h-4 w-4" />
                    {forgotPasswordMutation.isPending
                      ? 'Sending reset link…'
                      : 'Send reset link'}
                  </Button>

                  <Button
                    className="w-full justify-center"
                    onClick={() => setMode('login')}
                    type="button"
                    variant="ghost"
                  >
                    Back to sign in
                  </Button>
                </form>
              )}

              <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[color:var(--color-canvas-subtle)] px-4 py-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                <span className="font-medium text-[color:var(--color-text-primary)]">
                  Need access first?
                </span>{' '}
                Ask your club admin to create your account and send you an invite link before signing in.
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
