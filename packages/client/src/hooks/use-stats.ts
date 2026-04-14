import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '../lib/api';

export type ClubStats = {
  booksPerYear: Array<{ year: string; count: number }>;
  averageRatings: Array<{
    bookId: number;
    title: string;
    author: string;
    averageRating: number | null;
    ratingsCount: number;
  }>;
};

export type PersonalStats = {
  ratingDistribution: Array<{ score: number; count: number }>;
  booksRated: number;
  averageRating: number | null;
  commentCount: number;
};

export const useClubStats = () =>
  useQuery({
    queryKey: ['stats', 'club'],
    queryFn: () => apiFetch<ClubStats>('/api/stats/club'),
  });

export const usePersonalStats = () =>
  useQuery({
    queryKey: ['stats', 'me'],
    queryFn: () => apiFetch<PersonalStats>('/api/stats/me'),
  });
