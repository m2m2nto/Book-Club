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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-slate-300">
        Loading meeting...
      </div>
    );
  }

  const meeting = meetingQuery.data;
  const isAdmin = authQuery.data?.role === 'admin';

  return (
    <div className="space-y-8">
      <Link
        className="text-sm text-violet-300 hover:text-violet-200"
        to="/meetings"
      >
        ← Back to meetings
      </Link>
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-white">
            {meeting.bookTitle ?? 'General meeting'}
          </h1>
          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
            {meeting.status}
          </span>
        </div>
        <p className="text-sm text-slate-400">
          {meeting.date} · {meeting.time} · {meeting.location}
        </p>
        {meeting.bookAuthor ? (
          <p className="text-sm text-slate-500">Book: {meeting.bookAuthor}</p>
        ) : null}
      </header>

      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">RSVP</h2>
          <p className="mt-2 text-sm text-slate-400">
            Let the club know whether you will join.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(['yes', 'maybe', 'no'] as const).map((status) => (
              <button
                key={status}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
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
                {status}
              </button>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-emerald-300">
              Yes
              <br />
              <span className="text-2xl font-semibold text-white">
                {meeting.rsvpCounts.yes}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-amber-300">
              Maybe
              <br />
              <span className="text-2xl font-semibold text-white">
                {meeting.rsvpCounts.maybe}
              </span>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-rose-300">
              No
              <br />
              <span className="text-2xl font-semibold text-white">
                {meeting.rsvpCounts.no}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">Attendees</h2>
          <div className="mt-4 space-y-3">
            {meeting.rsvps.length ? (
              meeting.rsvps.map((rsvp) => (
                <div
                  key={rsvp.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{rsvp.userName}</p>
                    <p className="text-xs text-slate-500">
                      Updated {new Date(rsvp.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
                    {rsvp.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No RSVPs yet.</p>
            )}
          </div>
        </div>
      </section>

      {meeting.recap ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">Meeting recap</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            {meeting.recap}
          </p>
        </section>
      ) : null}

      {isAdmin ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Admin controls</h2>
          <label className="block text-sm text-slate-300">
            Recap
            <textarea
              className="mt-2 min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={recap}
              onChange={(event) => setRecap(event.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
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
              className="rounded-xl border border-rose-600/40 px-4 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
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
