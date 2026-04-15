import { Link } from 'react-router-dom';

import { useAuth } from '../hooks/use-auth';
import { useBooks } from '../hooks/use-books';
import { useDashboard } from '../hooks/use-dashboard';
import { useMeetings } from '../hooks/use-meetings';
import { useBookSurveys } from '../hooks/use-surveys';

export const DashboardPage = () => {
  const authQuery = useAuth();
  const dashboardQuery = useDashboard();
  const booksQuery = useBooks();
  const surveysQuery = useBookSurveys();
  const meetingsQuery = useMeetings();

  const dashboard = dashboardQuery.data;
  const adminChecklist = [
    {
      label: 'Invite at least one member',
      done: (dashboard?.adminSummary?.users ?? 0) > 1,
      href: '/admin/users',
      help: 'Add your first non-admin club member.',
    },
    {
      label: 'Add your first book',
      done: (booksQuery.data?.length ?? 0) > 0,
      href: '/books',
      help: 'Start the library with a wishlist or reading title.',
    },
    {
      label: 'Create a survey',
      done: (surveysQuery.data?.length ?? 0) > 0,
      href: '/surveys',
      help: 'Turn wishlist books into a vote.',
    },
    {
      label: 'Schedule a meeting',
      done: (meetingsQuery.data?.length ?? 0) > 0,
      href: '/meetings',
      help: 'Put the next date on the calendar.',
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/15 via-slate-900 to-slate-950 p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-300">
              Dashboard
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-white">
              Your book club at a glance
            </h1>
            <p className="text-base leading-7 text-slate-300">
              Track the next meeting, open surveys, and anything still waiting
              for your response.
            </p>
          </div>
          {authQuery.data?.role === 'admin' ? (
            <div className="grid gap-2 sm:grid-cols-3">
              <Link
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-900"
                to="/admin/users"
              >
                Manage users
              </Link>
              <Link
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-900"
                to="/meetings"
              >
                Schedule meeting
              </Link>
              <Link
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-900"
                to="/surveys"
              >
                Create survey
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-violet-300">
            Book of the moment
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {dashboard?.nextMeeting?.bookId
              ? 'Current reading cycle'
              : 'No book selected yet'}
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            {dashboard?.nextMeeting
              ? `${dashboard.nextMeeting.date} · ${dashboard.nextMeeting.time} · ${dashboard.nextMeeting.location}`
              : 'Create a meeting or date poll to get started.'}
          </p>
        </article>
        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
            Next meeting
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">
            {dashboard?.nextMeeting
              ? dashboard.nextMeeting.date
              : 'No meeting scheduled'}
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            {dashboard?.myRsvp
              ? `Your RSVP: ${dashboard.myRsvp.status}`
              : 'You have not responded yet.'}
          </p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">Open surveys</h3>
          <p className="mt-2 text-3xl font-semibold text-white">
            {dashboard?.openSurveys.length ?? 0}
          </p>
          <Link
            className="mt-4 inline-block text-sm text-violet-300 hover:text-violet-200"
            to="/surveys"
          >
            Review surveys →
          </Link>
        </article>
        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">Pending RSVPs</h3>
          <p className="mt-2 text-3xl font-semibold text-white">
            {dashboard?.pendingRsvps.length ?? 0}
          </p>
          <Link
            className="mt-4 inline-block text-sm text-violet-300 hover:text-violet-200"
            to="/meetings"
          >
            Check meetings →
          </Link>
        </article>
        <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h3 className="text-lg font-semibold text-white">Reading stats</h3>
          <p className="mt-2 text-3xl font-semibold text-white">Insights</p>
          <Link
            className="mt-4 inline-block text-sm text-violet-300 hover:text-violet-200"
            to="/stats"
          >
            Open stats →
          </Link>
        </article>
      </section>

      {dashboard?.adminSummary ? (
        <>
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Admin getting started
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Follow these first steps to get the club up and running.
                </p>
              </div>
              <p className="text-sm text-slate-500">
                {adminChecklist.filter((item) => item.done).length}/
                {adminChecklist.length} complete
              </p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {adminChecklist.map((item) => (
                <Link
                  key={item.label}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 hover:bg-slate-900"
                  to={item.href}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.help}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em] ${item.done ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}
                    >
                      {item.done ? 'Done' : 'Next'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-sm text-slate-500">Users</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {dashboard.adminSummary.users}
              </p>
            </article>
            <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-sm text-slate-500">Meetings</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {dashboard.adminSummary.meetings}
              </p>
            </article>
            <article className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-sm text-slate-500">Open surveys</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {dashboard.adminSummary.openSurveys}
              </p>
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
};
