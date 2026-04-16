import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/use-auth';

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const authQuery = useAuth();
  const location = useLocation();

  if (authQuery.isLoading) {
    return (
      <div className="page-shell flex min-h-screen items-center justify-center">
        <div className="surface-base w-full max-w-md px-6 py-6 text-sm text-[color:var(--color-text-secondary)]">
          Loading your session...
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
