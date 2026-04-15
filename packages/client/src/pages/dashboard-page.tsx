import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  Vote,
} from 'lucide-react';
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
  const completedChecklist = [
    {
      label: 'Invite at least one member',
      done: (dashboard?.adminSummary?.users ?? 0) > 1,
      href: '/admin/users',
      help: 'Welcome your first non-admin club member.',
    },
    {
      label: 'Add your first book',
      done: (booksQuery.data?.length ?? 0) > 0,
      href: '/books',
      help: 'Start the shelf with a wishlist or reading title.',
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
      help: 'Put the next gathering on the calendar.',
    },
  ];

  const nextMeeting = dashboard?.nextMeeting;
  const openSurveyCount = dashboard?.openSurveys.length ?? 0;
  const pendingRsvpCount = dashboard?.pendingRsvps.length ?? 0;

  const summaryCards = [
    {
      label: 'Open surveys',
      value: String(openSurveyCount),
      href: '/surveys',
      action: 'Review surveys',
      icon: Vote,
      tone: 'accent',
    },
    {
      label: 'Pending RSVPs',
      value: String(pendingRsvpCount),
      href: '/meetings',
      action: 'Check meetings',
      icon: CalendarDays,
      tone: 'warning',
    },
    {
      label: 'Reading stats',
      value: 'Insights',
      href: '/stats',
      action: 'Open stats',
      icon: CheckCircle2,
      tone: 'success',
    },
  ] as const;

  return (
    <div className="page-stack">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_22rem] lg:items-end">
        <div className="space-y-5">
          <p className="eyebrow text-[color:var(--color-text-accent)]">Dashboard</p>
          <div className="max-w-3xl space-y-4">
            <h1 className="editorial-title max-w-3xl">
              Your book club, arranged with a little more calm.
            </h1>
            <p className="body-copy text-[1.05rem]">
              Track the next meeting, spot open votes, and see what still needs
              your attention without digging through the whole club archive.
            </p>
          </div>
        </div>

        {authQuery.data?.role === 'admin' ? (
          <div className="surface-base grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ['Invite members', '/admin/users'],
              ['Schedule meeting', '/meetings'],
              ['Create survey', '/surveys'],
            ].map(([label, href]) => (
              <Link
                className="inline-flex items-center justify-between rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-base)] px-4 py-3 text-sm font-medium text-[color:var(--color-text-primary)] hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]"
                key={href}
                to={href}
              >
                <span>{label}</span>
                <ArrowRight className="h-4 w-4 text-[color:var(--color-text-accent)]" />
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <article className="surface-tint px-7 py-8 lg:px-8 lg:py-9">
          <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-accent)]">
            <Sparkles className="h-4 w-4" />
            Book of the moment
          </div>
          <h2 className="mt-5 font-editorial text-[2.75rem] leading-[0.96] tracking-[-0.03em] text-[color:var(--color-text-primary)] lg:text-[3.25rem]">
            {nextMeeting?.bookId ? 'Current reading cycle' : 'No book selected yet'}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[color:var(--color-text-secondary)]">
            {nextMeeting
              ? `${nextMeeting.date} · ${nextMeeting.time} · ${nextMeeting.location}`
              : 'Create a meeting or date poll to give the club a clear next chapter.'}
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-accent-primary-soft)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-accent)]">
            <CalendarDays className="h-4 w-4" />
            {nextMeeting
              ? 'Next club session is on the calendar.'
              : 'No current reading session yet.'}
          </div>
        </article>

        <article className="surface-base flex flex-col justify-between px-6 py-7 lg:px-7 lg:py-8">
          <div>
            <p className="eyebrow">Next meeting</p>
            <h2 className="mt-4 section-title text-[2rem]">
              {nextMeeting ? nextMeeting.date : 'Nothing scheduled yet'}
            </h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
              {dashboard?.myRsvp
                ? `Your RSVP is currently marked as ${dashboard.myRsvp.status}.`
                : 'You have not responded yet.'}
            </p>
          </div>
          <Link
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-accent)] hover:text-[color:var(--color-accent-primary-hover)]"
            to="/meetings"
          >
            Open meetings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map(({ label, value, href, action, icon: Icon, tone }) => (
          <article className="surface-base px-6 py-6" key={label}>
            <div
              className={
                tone === 'accent'
                  ? 'flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-accent)]'
                  : tone === 'warning'
                    ? 'flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-[color:var(--color-warning-base)]'
                    : 'flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-[color:var(--color-success-base)]'
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </div>
            <p className="mt-5 text-4xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
              {value}
            </p>
            <Link
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-accent)] hover:text-[color:var(--color-accent-primary-hover)]"
              to={href}
            >
              {action}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        ))}
      </section>

      {dashboard?.adminSummary ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <article className="surface-base px-6 py-7 lg:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">Admin getting started</p>
                <h2 className="mt-3 section-title">Set the club in motion.</h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Follow these first steps to get members invited, books added,
                  and the next discussion on the calendar.
                </p>
              </div>
              <p className="text-sm text-[color:var(--color-text-muted)]">
                {completedChecklist.filter((item) => item.done).length}/
                {completedChecklist.length} complete
              </p>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {completedChecklist.map((item) => (
                <Link
                  key={item.label}
                  className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[color:var(--color-surface-base)] px-4 py-4 hover:-translate-y-0.5 hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]"
                  to={item.href}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                        {item.help}
                      </p>
                    </div>
                    <span
                      className={
                        item.done
                          ? 'rounded-full bg-[color:var(--color-success-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-success-base)]'
                          : 'rounded-full bg-[color:var(--color-accent-primary-soft)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-accent)]'
                      }
                    >
                      {item.done ? 'Done' : 'Next'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </article>

          <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            <article className="surface-base px-6 py-6">
              <p className="eyebrow">Users</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                {dashboard.adminSummary.users}
              </p>
            </article>
            <article className="surface-base px-6 py-6">
              <p className="eyebrow">Meetings</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                {dashboard.adminSummary.meetings}
              </p>
            </article>
            <article className="surface-base px-6 py-6">
              <p className="eyebrow">Open surveys</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
                {dashboard.adminSummary.openSurveys}
              </p>
            </article>
          </section>
        </section>
      ) : null}
    </div>
  );
};
