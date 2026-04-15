import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiFetch } from '../lib/api';

export type Meeting = {
  id: number;
  date: string;
  time: string;
  location: string;
  bookId: number | null;
  status: 'scheduled' | 'completed' | 'cancelled';
  recap: string | null;
  createdAt: string;
  updatedAt: string;
  bookTitle: string | null;
  bookAuthor: string | null;
  bookCoverUrl: string | null;
  rsvpCount?: number;
};

export type MeetingDetail = Meeting & {
  rsvps: Array<{
    id: number;
    meetingId: number;
    userId: number;
    status: 'yes' | 'no' | 'maybe';
    respondedAt: string | null;
    updatedAt: string;
    userName: string;
  }>;
  rsvpCounts: { yes: number; no: number; maybe: number };
};

export type DateSurvey = {
  id: number;
  meetingId: number | null;
  title: string;
  closesAt: string;
  createdByUserId: number;
  status: 'open' | 'closed';
  time: string;
  location: string;
  bookId: number | null;
  confirmedOptionId: number | null;
  createdAt: string;
  updatedAt: string;
  options: Array<{
    id: number;
    dateSurveyId: number;
    proposedDate: string;
    votes: number;
  }>;
  votes: Array<{
    id: number;
    dateSurveyId: number;
    dateSurveyOptionId: number;
    userId: number;
    createdAt: string;
  }>;
};

export const meetingsQueryKey = ['meetings'] as const;
export const meetingDetailQueryKey = (id: number) => ['meetings', id] as const;
export const dateSurveysQueryKey = ['date-surveys'] as const;
export const dateSurveyDetailQueryKey = (id: number) =>
  ['date-surveys', id] as const;

export const useMeetings = () =>
  useQuery({
    queryKey: meetingsQueryKey,
    queryFn: () => apiFetch<Meeting[]>('/api/meetings'),
  });
export const useMeeting = (id: number) =>
  useQuery({
    queryKey: meetingDetailQueryKey(id),
    queryFn: () => apiFetch<MeetingDetail>(`/api/meetings/${id}`),
    enabled: Number.isFinite(id),
  });
export const useDateSurveys = () =>
  useQuery({
    queryKey: dateSurveysQueryKey,
    queryFn: () => apiFetch<DateSurvey[]>('/api/date-surveys'),
  });
export const useDateSurvey = (id: number) =>
  useQuery({
    queryKey: dateSurveyDetailQueryKey(id),
    queryFn: () => apiFetch<DateSurvey>(`/api/date-surveys/${id}`),
    enabled: Number.isFinite(id),
  });

export const useCreateMeeting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch<MeetingDetail>('/api/meetings', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: meetingsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};
export const useUpdateMeeting = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch(`/api/meetings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: meetingsQueryKey });
      await queryClient.invalidateQueries({
        queryKey: meetingDetailQueryKey(id),
      });
    },
  });
};
export const useCancelMeeting = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(`/api/meetings/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: meetingsQueryKey });
      await queryClient.invalidateQueries({
        queryKey: meetingDetailQueryKey(id),
      });
    },
  });
};
export const useSaveRsvp = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: 'yes' | 'no' | 'maybe') =>
      apiFetch(`/api/meetings/${id}/rsvp`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: meetingsQueryKey });
      await queryClient.invalidateQueries({
        queryKey: meetingDetailQueryKey(id),
      });
    },
  });
};
export const useCreateDateSurvey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      apiFetch<DateSurvey>('/api/date-surveys', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dateSurveysQueryKey });
    },
  });
};
export const useVoteDateSurvey = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (optionIds: number[]) =>
      apiFetch(`/api/date-surveys/${id}/vote`, {
        method: 'POST',
        body: JSON.stringify({ optionIds }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dateSurveysQueryKey });
      await queryClient.invalidateQueries({
        queryKey: dateSurveyDetailQueryKey(id),
      });
    },
  });
};
export const useCloseDateSurvey = (id: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (optionId: number) =>
      apiFetch(`/api/date-surveys/${id}/close`, {
        method: 'PATCH',
        body: JSON.stringify({ optionId }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dateSurveysQueryKey });
      await queryClient.invalidateQueries({
        queryKey: dateSurveyDetailQueryKey(id),
      });
      await queryClient.invalidateQueries({ queryKey: meetingsQueryKey });
      await queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
};
