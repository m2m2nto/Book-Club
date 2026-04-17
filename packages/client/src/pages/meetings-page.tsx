import { CalendarDays, Clock3, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useToast } from '../components/ui/toast-provider';
import { useAuth } from '../hooks/use-auth';
import { useBooks } from '../hooks/use-books';
import {
  useCreateDateSurvey,
  useCreateMeeting,
  useDateSurveys,
  useMeetings,
} from '../hooks/use-meetings';

const statusLabel = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export const MeetingsPage = () => {
  const authQuery = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const booksQuery = useBooks();
  const meetingsQuery = useMeetings();
  const dateSurveysQuery = useDateSurveys();
  const createMeetingMutation = useCreateMeeting();
  const createDateSurveyMutation = useCreateDateSurvey();
  const isAdmin = authQuery.data?.role === 'admin';

  const [meetingForm, setMeetingForm] = useState({
    date: '',
    time: '',
    location: '',
    bookId: '',
  });
  const [dateSurveyForm, setDateSurveyForm] = useState({
    title: 'Next meeting date poll',
    closesAt: '',
    time: '',
    location: '',
    bookId: '',
    dates: ['', ''],
  });

  const upcoming = useMemo(
    () =>
      (meetingsQuery.data ?? []).filter(
        (meeting) =>
          meeting.status !== 'cancelled' &&
          meeting.date >= new Date().toISOString().slice(0, 10),
      ),
    [meetingsQuery.data],
  );
  const past = useMemo(
    () =>
      (meetingsQuery.data ?? []).filter(
        (meeting) =>
          meeting.date < new Date().toISOString().slice(0, 10) ||
          meeting.status === 'completed',
      ),
    [meetingsQuery.data],
  );

  return (
    <div className="page-stack">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_20rem] xl:items-end">
        <div className="page-header editorial-rule fade-rise max-w-4xl">
          <p className="eyebrow text-[color:var(--color-text-accent)]">Meetings</p>
          <h1 className="editorial-title text-balance max-w-5xl">
            Keep schedules, date polls, and RSVPs in one polished planning space.
          </h1>
          <p className="body-copy text-[1.02rem]">
            This view now follows the same cleaner publishing-product rhythm: key counts up top, stronger planning forms, and easier scanning across upcoming and past sessions.
          </p>
        </div>

        <div className="surface-tint fade-rise px-5 py-5">
          <p className="eyebrow">At a glance</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Open date polls
              </p>
              <p className="mt-2 font-[var(--font-editorial)] text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                {dateSurveysQuery.data?.length ?? 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Upcoming meetings
              </p>
              <p className="mt-2 font-[var(--font-editorial)] text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                {upcoming.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {isAdmin ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <form
            className="surface-base space-y-5 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              createMeetingMutation.mutate(
                {
                  ...meetingForm,
                  bookId: meetingForm.bookId
                    ? Number(meetingForm.bookId)
                    : null,
                },
                {
                  onSuccess: (createdMeeting) => {
                    showToast({
                      title: `Created meeting for ${meetingForm.date} at ${meetingForm.time}.`,
                      variant: 'success',
                      actionLabel: 'Open Meeting',
                      onAction: () => navigate(`/meetings/${createdMeeting.id}`),
                    });
                    setMeetingForm({
                      date: '',
                      time: '',
                      location: '',
                      bookId: '',
                    });
                  },
                  onError: (error) => {
                    showToast({
                      title: 'Could not create the meeting.',
                      description:
                        error instanceof Error
                          ? error.message
                          : 'Please try again.',
                      variant: 'error',
                    });
                  },
                },
              );
            }}
          >
            <div className="page-header gap-3">
              <p className="eyebrow">Create meeting</p>
              <div className="space-y-2">
                <h2 className="section-title">Schedule a confirmed gathering</h2>
                <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Put the next session on the calendar and optionally connect it
                  to a book.
                </p>
              </div>
            </div>
            {[
              ['date', 'Date'],
              ['time', 'Time'],
              ['location', 'Location'],
            ].map(([field, label]) => (
              <label
                className="block text-sm text-[color:var(--color-text-secondary)]"
                key={field}
              >
                {label}
                <input
                  className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                  type={
                    field === 'date'
                      ? 'date'
                      : field === 'time'
                        ? 'time'
                        : 'text'
                  }
                  value={meetingForm[field as keyof typeof meetingForm]}
                  onChange={(event) =>
                    setMeetingForm((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
            <label className="block text-sm text-[color:var(--color-text-secondary)]">
              Book
              <select
                className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                value={meetingForm.bookId}
                onChange={(event) =>
                  setMeetingForm((current) => ({
                    ...current,
                    bookId: event.target.value,
                  }))
                }
              >
                <option value="">No book</option>
                {booksQuery.data?.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="pressable w-full rounded-[var(--radius-pill)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
              type="submit"
            >
              {createMeetingMutation.isPending ? 'Saving...' : 'Create meeting'}
            </button>
          </form>

          <form
            className="surface-base space-y-5 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              createDateSurveyMutation.mutate(
                {
                  title: dateSurveyForm.title,
                  closesAt: dateSurveyForm.closesAt,
                  time: dateSurveyForm.time,
                  location: dateSurveyForm.location,
                  bookId: dateSurveyForm.bookId
                    ? Number(dateSurveyForm.bookId)
                    : null,
                  dates: dateSurveyForm.dates.filter(Boolean),
                },
                {
                  onSuccess: (createdDateSurvey) => {
                    showToast({
                      title: `Created date survey “${dateSurveyForm.title}”.`,
                      variant: 'success',
                      actionLabel: 'Open Date Survey',
                      onAction: () =>
                        navigate(`/date-surveys/${createdDateSurvey.id}`),
                    });
                    setDateSurveyForm({
                      title: 'Next meeting date poll',
                      closesAt: '',
                      time: '',
                      location: '',
                      bookId: '',
                      dates: ['', ''],
                    });
                  },
                  onError: (error) => {
                    showToast({
                      title: 'Could not create the date survey.',
                      description:
                        error instanceof Error
                          ? error.message
                          : 'Please try again.',
                      variant: 'error',
                    });
                  },
                },
              );
            }}
          >
            <div className="page-header gap-3">
              <p className="eyebrow">Create date poll</p>
              <div className="space-y-2">
                <h2 className="section-title">Start with availability first</h2>
                <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Collect a couple of possible dates before confirming the final
                  meeting.
                </p>
              </div>
            </div>
            <label className="block text-sm text-[color:var(--color-text-secondary)]">
              Title
              <input
                className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                value={dateSurveyForm.title}
                onChange={(event) =>
                  setDateSurveyForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block text-sm text-[color:var(--color-text-secondary)]">
              Closes at
              <input
                className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                type="datetime-local"
                value={dateSurveyForm.closesAt}
                onChange={(event) =>
                  setDateSurveyForm((current) => ({
                    ...current,
                    closesAt: event.target.value,
                  }))
                }
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['time', 'Time'],
                ['location', 'Location'],
              ].map(([field, label]) => (
                <label
                  className="block text-sm text-[color:var(--color-text-secondary)]"
                  key={field}
                >
                  {label}
                  <input
                    className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                    type={field === 'time' ? 'time' : 'text'}
                    value={dateSurveyForm[field as 'time' | 'location']}
                    onChange={(event) =>
                      setDateSurveyForm((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            <label className="block text-sm text-[color:var(--color-text-secondary)]">
              Book
              <select
                className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                value={dateSurveyForm.bookId}
                onChange={(event) =>
                  setDateSurveyForm((current) => ({
                    ...current,
                    bookId: event.target.value,
                  }))
                }
              >
                <option value="">No book</option>
                {booksQuery.data?.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-3">
              {dateSurveyForm.dates.map((value, index) => (
                <label
                  className="block text-sm text-[color:var(--color-text-secondary)]"
                  key={index}
                >
                  Option {index + 1}
                  <input
                    className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                    type="date"
                    value={value}
                    onChange={(event) =>
                      setDateSurveyForm((current) => ({
                        ...current,
                        dates: current.dates.map((item, itemIndex) =>
                          itemIndex === index ? event.target.value : item,
                        ),
                      }))
                    }
                  />
                </label>
              ))}
            </div>
            <button
              className="pressable w-full rounded-[var(--radius-pill)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
              type="submit"
            >
              {createDateSurveyMutation.isPending
                ? 'Saving...'
                : 'Create date survey'}
            </button>
          </form>
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="section-title text-[1.5rem]">Open date surveys</h2>
            <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
              Availability polls that still need input or confirmation.
            </p>
          </div>
          <span className="text-sm text-[color:var(--color-text-muted)]">
            {dateSurveysQuery.data?.length ?? 0} total
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {dateSurveysQuery.data?.map((survey) => (
            <Link
              key={survey.id}
              className="surface-base hover-lift block px-5 py-5"
              to={`/date-surveys/${survey.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                  {survey.title}
                </h3>
                <span className="rounded-full border border-[rgba(29,78,216,0.1)] bg-[color:var(--color-accent-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-accent)]">
                  {statusLabel(survey.status)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                Closes {new Date(survey.closesAt).toLocaleString()}
              </p>
            </Link>
          ))}
          {!dateSurveysQuery.data?.length ? (
            <div className="surface-base px-5 py-6 text-sm leading-7 text-[color:var(--color-text-secondary)]">
              No open date surveys yet.
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="section-title text-[1.5rem]">Upcoming meetings</h2>
          <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
            Confirmed gatherings the club can still prepare for.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {upcoming.map((meeting) => (
            <Link
              key={meeting.id}
              className="surface-base hover-lift block px-5 py-5"
              to={`/meetings/${meeting.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                  {meeting.bookTitle ?? 'General meeting'}
                </h3>
                <span className="rounded-full border border-[rgba(29,78,216,0.1)] bg-[color:var(--color-accent-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-accent)]">
                  {statusLabel(meeting.status)}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-[color:var(--color-text-secondary)]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[color:var(--color-text-muted)]" />
                  <span>{meeting.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[color:var(--color-text-muted)]" />
                  <span>{meeting.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[color:var(--color-text-muted)]" />
                  <span>{meeting.location}</span>
                </div>
              </div>
            </Link>
          ))}
          {!upcoming.length ? (
            <div className="surface-base px-5 py-6 text-sm leading-7 text-[color:var(--color-text-secondary)]">
              No upcoming meetings yet.
            </div>
          ) : null}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="section-title text-[1.5rem]">Past meetings</h2>
          <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
            Previous discussions, completed sessions, and archived planning.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {past.map((meeting) => (
            <Link
              key={meeting.id}
              className="surface-base hover-lift block px-5 py-5"
              to={`/meetings/${meeting.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                  {meeting.bookTitle ?? 'General meeting'}
                </h3>
                <span className="rounded-full border border-[color:var(--color-border-soft)] bg-[color:var(--color-canvas-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">
                  {statusLabel(meeting.status)}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-[color:var(--color-text-secondary)]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[color:var(--color-text-muted)]" />
                  <span>{meeting.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-[color:var(--color-text-muted)]" />
                  <span>{meeting.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[color:var(--color-text-muted)]" />
                  <span>{meeting.location}</span>
                </div>
              </div>
            </Link>
          ))}
          {!past.length ? (
            <div className="surface-base px-5 py-6 text-sm leading-7 text-[color:var(--color-text-secondary)]">
              No past meetings yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};
