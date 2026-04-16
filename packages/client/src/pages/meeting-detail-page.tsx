import { CalendarDays, Clock3, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useToast } from '../components/ui/toast-provider';
import { useAuth } from '../hooks/use-auth';
import {
  useCancelMeeting,
  useMeeting,
  useSaveRsvp,
  useUpdateMeeting,
} from '../hooks/use-meetings';

const statusLabel = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export const MeetingDetailPage = () => {
  const { id } = useParams();
  const meetingId = Number(id);
  const { showToast } = useToast();
  const authQuery = useAuth();
  const meetingQuery = useMeeting(meetingId);
  const saveRsvpMutation = useSaveRsvp(meetingId);
  const updateMeetingMutation = useUpdateMeeting(meetingId);
  const cancelMeetingMutation = useCancelMeeting(meetingId);
  const [recap, setRecap] = useState('');

  if (!meetingQuery.data) {
    return (
      <div className="surface-base px-6 py-8 text-sm text-[color:var(--color-text-secondary)]">
        Loading meeting...
      </div>
    );
  }

  const meeting = meetingQuery.data;
  const isAdmin = authQuery.data?.role === 'admin';

  return (
    <div className="page-stack">
      <Link
        className="text-sm font-medium text-[color:var(--color-text-accent)] hover:text-[color:var(--color-accent-primary-hover)]"
        to="/meetings"
      >
        ← Back to meetings
      </Link>

      <section className="surface-tint px-7 py-7 lg:px-8 lg:py-8">
        <div className="page-header gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-[rgba(42,93,176,0.1)] bg-[rgba(255,255,255,0.74)] px-3 py-1.5 font-medium text-[color:var(--color-text-accent)]">
              {statusLabel(meeting.status)}
            </span>
            {meeting.bookAuthor ? (
              <span className="text-[color:var(--color-text-muted)]">
                Book by {meeting.bookAuthor}
              </span>
            ) : null}
          </div>

          <div className="space-y-3">
            <h1 className="editorial-title text-balance max-w-4xl">
              {meeting.bookTitle ?? 'General meeting'}
            </h1>
            <p className="body-copy max-w-3xl text-[1rem]">
              Keep attendance and the meeting plan clear before the club gets
              together.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 text-sm text-[color:var(--color-text-secondary)]">
          <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.72)] px-4 py-3">
            <CalendarDays className="h-4 w-4 text-[color:var(--color-text-muted)]" />
            <span>{meeting.date}</span>
          </div>
          <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.72)] px-4 py-3">
            <Clock3 className="h-4 w-4 text-[color:var(--color-text-muted)]" />
            <span>{meeting.time}</span>
          </div>
          <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.72)] px-4 py-3">
            <MapPin className="h-4 w-4 text-[color:var(--color-text-muted)]" />
            <span>{meeting.location}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="surface-base px-6 py-6">
          <h2 className="section-title text-[1.45rem]">RSVP</h2>
          <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
            Let the club know whether you will join.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {(['yes', 'maybe', 'no'] as const).map((status) => (
              <button
                key={status}
                className="pressable rounded-[var(--radius-pill)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.84)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-primary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]"
                onClick={() =>
                  saveRsvpMutation.mutate(status, {
                    onSuccess: () => {
                      showToast({
                        title: `Saved your RSVP as “${status}”.`,
                        variant: 'success',
                      });
                    },
                    onError: (error) => {
                      showToast({
                        title: 'Could not save your RSVP.',
                        description:
                          error instanceof Error
                            ? error.message
                            : 'Please try again.',
                        variant: 'error',
                      });
                    },
                  })
                }
                type="button"
              >
                {statusLabel(status)}
              </button>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-[var(--radius-lg)] border border-[color:rgba(45,107,79,0.16)] bg-[color:var(--color-success-soft)] p-4 text-[color:var(--color-success-base)]">
              Yes
              <br />
              <span className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                {meeting.rsvpCounts.yes}
              </span>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[color:rgba(148,101,31,0.16)] bg-[color:var(--color-warning-soft)] p-4 text-[color:var(--color-warning-base)]">
              Maybe
              <br />
              <span className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                {meeting.rsvpCounts.maybe}
              </span>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[color:rgba(160,69,82,0.16)] bg-[color:var(--color-error-soft)] p-4 text-[color:var(--color-error-base)]">
              No
              <br />
              <span className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                {meeting.rsvpCounts.no}
              </span>
            </div>
          </div>
        </div>

        <div className="surface-base px-6 py-6">
          <h2 className="section-title text-[1.45rem]">Attendees</h2>
          <div className="mt-5 space-y-3">
            {meeting.rsvps.length ? (
              meeting.rsvps.map((rsvp) => (
                <div
                  key={rsvp.id}
                  className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.74)] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-[color:var(--color-text-primary)]">
                        {rsvp.userName}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                        Updated {new Date(rsvp.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="rounded-full border border-[rgba(42,93,176,0.1)] bg-[color:var(--color-accent-primary-soft)] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-accent)]">
                      {statusLabel(rsvp.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                No RSVPs yet.
              </p>
            )}
          </div>
        </div>
      </section>

      {meeting.recap ? (
        <section className="surface-base px-6 py-6">
          <h2 className="section-title text-[1.45rem]">Meeting recap</h2>
          <p className="mt-4 max-w-4xl text-sm leading-8 text-[color:var(--color-text-secondary)]">
            {meeting.recap}
          </p>
        </section>
      ) : null}

      {isAdmin ? (
        <section className="surface-base space-y-4 px-6 py-6">
          <div>
            <p className="eyebrow">Admin controls</p>
            <h2 className="mt-3 text-[1.45rem] font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
              Add a recap or change the meeting state
            </h2>
          </div>
          <label className="block text-sm text-[color:var(--color-text-secondary)]">
            Recap
            <textarea
              className="mt-2 min-h-28 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
              value={recap}
              onChange={(event) => setRecap(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className="pressable rounded-[var(--radius-lg)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
              onClick={() =>
                updateMeetingMutation.mutate(
                  { recap, status: 'completed' },
                  {
                    onSuccess: () => {
                      showToast({
                        title: 'Saved the recap and marked the meeting completed.',
                        variant: 'success',
                      });
                    },
                    onError: (error) => {
                      showToast({
                        title: 'Could not save the recap.',
                        description:
                          error instanceof Error
                            ? error.message
                            : 'Please try again.',
                        variant: 'error',
                      });
                    },
                  },
                )
              }
              type="button"
            >
              Save recap + mark completed
            </button>
            <button
              className="pressable rounded-[var(--radius-lg)] border border-[rgba(160,69,82,0.18)] bg-[color:var(--color-error-soft)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-error-base)] hover:border-[rgba(160,69,82,0.28)]"
              onClick={() =>
                cancelMeetingMutation.mutate(undefined, {
                  onSuccess: () => {
                    showToast({
                      title: 'Cancelled the meeting.',
                      variant: 'success',
                    });
                  },
                  onError: (error) => {
                    showToast({
                      title: 'Could not cancel the meeting.',
                      description:
                        error instanceof Error ? error.message : 'Please try again.',
                      variant: 'error',
                    });
                  },
                })
              }
              type="button"
            >
              Cancel meeting
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
};
