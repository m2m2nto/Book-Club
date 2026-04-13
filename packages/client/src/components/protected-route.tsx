import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../hooks/use-auth';

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
  const authQuery = useAuth();
  const location = useLocation();

  if (authQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-sm text-slate-300">
        Loading your session...
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
