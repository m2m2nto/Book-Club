export const USER_ROLES = ['admin', 'user'] as const;

export const BOOK_STATUSES = [
  'wishlist',
  'pipeline',
  'reading',
  'read',
] as const;

export const SURVEY_STATUSES = [
  'open',
  'closed',
  'tie-break-required',
] as const;

export const MEETING_STATUSES = [
  'scheduled',
  'completed',
  'cancelled',
] as const;

export const RSVP_STATUSES = ['yes', 'no', 'maybe'] as const;
