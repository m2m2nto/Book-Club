import { KeyRound } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '../components/ui/button';
import { useToast } from '../components/ui/toast-provider';
import { apiFetch } from '../lib/api';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

  const resetPasswordMutation = useMutation({
    mutationFn: async () =>
      apiFetch<{ success: boolean }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      }),
    onSuccess: () => {
      navigate('/login?reset=success', { replace: true });
    },
  });

  const validationMessage =
    !token
      ? 'This reset link is missing its token.'
      : password.length < 8
        ? 'Choose a password with at least 8 characters.'
        : password !== confirmPassword
          ? 'Passwords must match.'
          : null;

  return (
    <div className="page-shell flex min-h-screen items-center justify-center">
      <div className="page-container w-full max-w-xl">
        <section className="surface-raised fade-rise px-6 py-7 sm:px-8 sm:py-8">
          <div className="space-y-6">
            <div className="page-header gap-3">
              <p className="eyebrow">Invite and reset</p>
              <div className="space-y-3">
                <h1 className="section-title">Set your password</h1>
                <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Choose a password for your invite or reset link, then return to sign in.
                </p>
              </div>
            </div>

            <form
              className="space-y-4 border-t border-[color:var(--color-border-soft)] pt-6"
              onSubmit={(event) => {
                event.preventDefault();

                if (validationMessage) {
                  showToast({
                    title: 'Password could not be updated.',
                    description: validationMessage,
                    variant: 'error',
                  });
                  return;
                }

                resetPasswordMutation.mutate(undefined, {
                  onError: (error) => {
                    showToast({
                      title: 'Password could not be updated.',
                      description:
                        error instanceof Error ? error.message : 'Please try again.',
                      variant: 'error',
                    });
                  },
                });
              }}
            >
              <label className="block text-sm text-[color:var(--color-text-secondary)]">
                New password
                <input
                  className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              <label className="block text-sm text-[color:var(--color-text-secondary)]">
                Confirm password
                <input
                  className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </label>

              {validationMessage ? (
                <div className="rounded-[var(--radius-lg)] border border-[rgba(180,35,24,0.18)] bg-[color:var(--color-error-soft)] px-4 py-3 text-sm text-[color:var(--color-error-base)]">
                  {validationMessage}
                </div>
              ) : null}

              <Button className="w-full justify-center gap-2 py-3 text-sm" type="submit">
                <KeyRound className="h-4 w-4" />
                {resetPasswordMutation.isPending
                  ? 'Updating password…'
                  : 'Save password'}
              </Button>

              <Button
                className="w-full justify-center"
                onClick={() => navigate('/login')}
                type="button"
                variant="ghost"
              >
                Back to sign in
              </Button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};
