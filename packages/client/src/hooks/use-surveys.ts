import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '../lib/api';

export type WishlistBook = {
  id: number;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string | null;
  openLibraryId: string | null;
  status: 'wishlist';
  suggestedByUserId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type SurveyOption = {
  id: number;
  surveyId: number;
  bookId: number;
  title: string;
  author: string;
  coverUrl: string | null;
  status: string;
  score: number;
};

export type SurveyVote = {
  id: number;
  surveyId: number;
  surveyOptionId: number;
  userId: number;
  rank: number;
  createdAt: string;
};

export type BookSurvey = {
  id: number;
  title: string;
  maxVotes: number;
  closesAt: string;
  createdByUserId: number;
  status: 'open' | 'closed' | 'tie-break-required';
  resolvedByUserId: number | null;
  resolvedBookId: number | null;
  createdAt: string;
  updatedAt: string;
  options: SurveyOption[];
  votes: SurveyVote[];
};

export const wishlistQueryKey = ['wishlist'] as const;
export const surveysQueryKey = ['book-surveys'] as const;
export const surveyDetailQueryKey = (id: number) =>
  ['book-surveys', id] as const;

export const useWishlist = () =>
  useQuery({
    queryKey: wishlistQueryKey,
    queryFn: () => apiFetch<WishlistBook[]>('/api/wishlist'),
  });

export const useCreateWishlistBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useBookSurveys = () =>
  useQuery({
    queryKey: surveysQueryKey,
    queryFn: () => apiFetch<BookSurvey[]>('/api/book-surveys'),
  });

export const useBookSurvey = (id: number) =>
  useQuery({
    queryKey: surveyDetailQueryKey(id),
    queryFn: () => apiFetch<BookSurvey>(`/api/book-surveys/${id}`),
    enabled: Number.isFinite(id),
  });

export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch('/api/book-surveys', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: surveysQueryKey });
      await queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useVoteSurvey = (surveyId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (votes: Array<{ optionId: number; rank: number }>) =>
      apiFetch(`/api/book-surveys/${surveyId}/vote`, {
        method: 'POST',
        body: JSON.stringify({ votes }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: surveysQueryKey });
      await queryClient.invalidateQueries({
        queryKey: surveyDetailQueryKey(surveyId),
      });
    },
  });
};

export const useCloseSurvey = (surveyId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch(`/api/book-surveys/${surveyId}/close`, { method: 'PATCH' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: surveysQueryKey });
      await queryClient.invalidateQueries({
        queryKey: surveyDetailQueryKey(surveyId),
      });
      await queryClient.invalidateQueries({ queryKey: ['books'] });
      await queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
    },
  });
};

export const useResolveSurveyTie = (surveyId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookId: number) =>
      apiFetch(`/api/book-surveys/${surveyId}/resolve-tie`, {
        method: 'PATCH',
        body: JSON.stringify({ bookId }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: surveysQueryKey });
      await queryClient.invalidateQueries({
        queryKey: surveyDetailQueryKey(surveyId),
      });
      await queryClient.invalidateQueries({ queryKey: ['books'] });
      await queryClient.invalidateQueries({ queryKey: wishlistQueryKey });
    },
  });
};
