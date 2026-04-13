export type ApiError = {
  code: string;
  message: string;
};

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
};

export type UserRole = 'admin' | 'user';

export type BookStatus = 'wishlist' | 'pipeline' | 'reading' | 'read';

export type SurveyStatus = 'open' | 'closed' | 'tie-break-required';

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';

export type RsvpStatus = 'yes' | 'no' | 'maybe';
