import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../hooks/use-auth';
import { useBooks } from '../hooks/use-books';
import {
  useCreateDateSurvey,
  useCreateMeeting,
  useDateSurveys,
  useMeetings,
} from '../hooks/use-meetings';

export const MeetingsPage = () => {
  const authQuery = useAuth();
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
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-300">
          Meetings
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Schedule, date polls, and RSVPs
        </h1>
      </header>

      {isAdmin ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <form
            className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
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
                  onSuccess: () =>
                    setMeetingForm({
                      date: '',
                      time: '',
                      location: '',
                      bookId: '',
                    }),
                },
              );
            }}
          >
            <h2 className="text-lg font-semibold text-white">Create meeting</h2>
            {['date', 'time', 'location'].map((field) => (
              <label className="block text-sm text-slate-300" key={field}>
                {field}
                <input
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
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
            <label className="block text-sm text-slate-300">
              Book
              <select
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
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
              className="w-full rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
              type="submit"
            >
              {createMeetingMutation.isPending ? 'Saving...' : 'Create meeting'}
            </button>
          </form>

          <form
            className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
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
                  onSuccess: () =>
                    setDateSurveyForm({
                      title: 'Next meeting date poll',
                      closesAt: '',
                      time: '',
                      location: '',
                      bookId: '',
                      dates: ['', ''],
                    }),
                },
              );
            }}
          >
            <h2 className="text-lg font-semibold text-white">
              Create date survey
            </h2>
            <label className="block text-sm text-slate-300">
              Title
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                value={dateSurveyForm.title}
                onChange={(event) =>
                  setDateSurveyForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label className="block text-sm text-slate-300">
              Closes at
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
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
              {['time', 'location'].map((field) => (
                <label className="block text-sm text-slate-300" key={field}>
                  {field}
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
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
            <label className="block text-sm text-slate-300">
              Book
              <select
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
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
            <div className="space-y-2">
              {dateSurveyForm.dates.map((value, index) => (
                <label className="block text-sm text-slate-300" key={index}>
                  Option {index + 1}
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
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
              className="w-full rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Open date surveys
          </h2>
          <span className="text-sm text-slate-500">
            {dateSurveysQuery.data?.length ?? 0} total
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {dateSurveysQuery.data?.map((survey) => (
            <Link
              key={survey.id}
              className="block rounded-3xl border border-slate-800 bg-slate-900/70 p-5 hover:bg-slate-900"
              to={`/date-surveys/${survey.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {survey.title}
                </h3>
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
                  {survey.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                Closes {new Date(survey.closesAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Upcoming meetings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {upcoming.map((meeting) => (
            <Link
              key={meeting.id}
              className="block rounded-3xl border border-slate-800 bg-slate-900/70 p-5 hover:bg-slate-900"
              to={`/meetings/${meeting.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {meeting.bookTitle ?? 'General meeting'}
                </h3>
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
                  {meeting.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {meeting.date} · {meeting.time} · {meeting.location}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Past meetings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {past.map((meeting) => (
            <Link
              key={meeting.id}
              className="block rounded-3xl border border-slate-800 bg-slate-900/70 p-5 hover:bg-slate-900"
              to={`/meetings/${meeting.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-white">
                  {meeting.bookTitle ?? 'General meeting'}
                </h3>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                  {meeting.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-400">
                {meeting.date} · {meeting.time} · {meeting.location}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
