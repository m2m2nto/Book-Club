import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '../lib/api';

export type BookStatus = 'wishlist' | 'pipeline' | 'reading' | 'read';

export type BookListItem = {
  id: number;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string | null;
  openLibraryId: string | null;
  status: BookStatus;
  dateRead: string | null;
  createdAt: string;
  updatedAt: string;
  averageRating: number | null;
};

export type BookComment = {
  id: number;
  bookId: number;
  userId: number;
  text: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  userName: string;
};

export type BookRating = {
  id: number;
  bookId: number;
  userId: number;
  score: number;
  createdAt: string;
  updatedAt: string;
  userName: string;
};

export type BookDetail = BookListItem & {
  ratings: BookRating[];
  comments: BookComment[];
};

export type SearchResult = {
  openLibraryId: string | null;
  title: string;
  author: string;
  coverUrl: string | null;
  description: string | null;
};

export const booksQueryKey = (status?: string) =>
  ['books', status ?? 'all'] as const;
export const bookDetailQueryKey = (id: number) =>
  ['books', 'detail', id] as const;

export const useBooks = (status?: string) =>
  useQuery({
    queryKey: booksQueryKey(status),
    queryFn: () =>
      apiFetch<BookListItem[]>(
        status ? `/api/books?status=${status}` : '/api/books',
      ),
  });

export const useBook = (id: number) =>
  useQuery({
    queryKey: bookDetailQueryKey(id),
    queryFn: () => apiFetch<BookDetail>(`/api/books/${id}`),
    enabled: Number.isFinite(id),
  });

export const useSaveRating = (bookId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (score: number) =>
      apiFetch(`/api/books/${bookId}/rating`, {
        method: 'PUT',
        body: JSON.stringify({ score }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: bookDetailQueryKey(bookId),
      });
      await queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useCreateComment = (bookId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { text: string; isPrivate: boolean }) =>
      apiFetch(`/api/books/${bookId}/comments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: bookDetailQueryKey(bookId),
      });
    },
  });
};

export const useUpdateComment = (bookId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, text }: { commentId: number; text: string }) =>
      apiFetch(`/api/books/${bookId}/comments/${commentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ text }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: bookDetailQueryKey(bookId),
      });
    },
  });
};

export const useDeleteComment = (bookId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) =>
      apiFetch(`/api/books/${bookId}/comments/${commentId}`, {
        method: 'DELETE',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: bookDetailQueryKey(bookId),
      });
    },
  });
};

export const useSearchBooks = (query: string) =>
  useQuery({
    queryKey: ['books', 'search', query],
    queryFn: () =>
      apiFetch<SearchResult[]>(
        `/api/books/search?q=${encodeURIComponent(query)}`,
      ),
    enabled: query.trim().length >= 2,
  });

export const useCreateBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch('/api/books', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};

export const useUpdateBook = (bookId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch(`/api/books/${bookId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['books'] });
      await queryClient.invalidateQueries({
        queryKey: bookDetailQueryKey(bookId),
      });
    },
  });
};

export const useDeleteBook = (bookId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(`/api/books/${bookId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};
