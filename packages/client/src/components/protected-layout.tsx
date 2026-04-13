import { Outlet } from 'react-router-dom';

import { useAuth, useLogout } from '../hooks/use-auth';
import { AppShell } from './app-shell';
import { ProtectedRoute } from './protected-route';

export const ProtectedLayout = () => {
  const authQuery = useAuth();
  const logoutMutation = useLogout();

  return (
    <ProtectedRoute>
      <AppShell
        currentUser={authQuery.data ?? null}
        onLogout={() => logoutMutation.mutate()}
      >
        <Outlet />
      </AppShell>
    </ProtectedRoute>
  );
};
