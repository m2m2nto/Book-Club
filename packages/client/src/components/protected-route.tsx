import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/use-auth';

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const authQuery = useAuth();
  const location = useLocation();

  if (authQuery.isLoading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="state-card state-card--centered w-full max-w-md">
          <p className="eyebrow text-[color:var(--color-text-accent)]">Checking access</p>
          <p className="state-title mt-3">Loading your session</p>
          <p className="state-copy">We&apos;re confirming your sign-in details and preparing your workspace.</p>
        </div>
      </div>
    );
  }

  if (!authQuery.data) {
    const redirectTo = encodeURIComponent(
      `${location.pathname}${location.search}`,
    );
    return <Navigate to={`/login?next=${redirectTo}`} replace />;
  }

  return <>{children}</>;
};
