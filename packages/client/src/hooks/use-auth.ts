import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ApiError, apiFetch } from '../lib/api';

export type CurrentUser = {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: 'admin' | 'user';
  active: boolean;
};

export const authQueryKey = ['auth', 'me'] as const;

export const useAuth = () => {
  return useQuery<CurrentUser | null>({
    queryKey: authQueryKey,
    queryFn: async () => {
      try {
        return await apiFetch<CurrentUser>('/auth/me');
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }

        throw error;
      }
    },
    retry: false,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      apiFetch<{ success: boolean }>('/auth/logout', { method: 'POST' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authQueryKey });
    },
  });
};
