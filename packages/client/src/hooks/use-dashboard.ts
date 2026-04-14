import { useQuery } from '@tanstack/react-query';

import { apiFetch } from '../lib/api';

export type DashboardData = {
  currentBook: {
    id: number;
    date: string;
    time: string;
    location: string;
    bookId: number | null;
  } | null;
  nextMeeting: {
    id: number;
    date: string;
    time: string;
    location: string;
    bookId: number | null;
    status: string;
    recap: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
  myRsvp: { status: 'yes' | 'no' | 'maybe' } | null;
  openSurveys: Array<{
    id: number;
    title: string;
    status: string;
    closesAt: string;
  }>;
  pendingRsvps: Array<{
    id: number;
    date: string;
    time: string;
    location: string;
  }>;
  adminSummary: { users: number; meetings: number; openSurveys: number } | null;
};

export const useDashboard = () =>
  useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiFetch<DashboardData>('/api/dashboard'),
  });
