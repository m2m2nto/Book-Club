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

  const adminQuickActions = [
    ['Invite members', '/admin/users'],
    ['Schedule meeting', '/meetings'],
    ['Create survey', '/surveys'],
  ] as const;

  return (
    <div className="page-stack">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_19rem] xl:items-start">
        <div className="fade-rise editorial-rule page-header max-w-4xl">
          <p className="eyebrow text-[color:var(--color-text-accent)]">Overview</p>
          <h1 className="editorial-title text-balance max-w-5xl">
            Your book club at a glance, with a cleaner WordPress-style rhythm.
          </h1>
          <p className="body-copy text-[1.02rem]">
            The dashboard now feels more like a polished publishing product: clear hierarchy, stronger summaries, and easier scanning from top to bottom.
          </p>
        </div>

        {authQuery.data?.role === 'admin' ? (
          <aside className="surface-base fade-rise p-5">
            <p className="eyebrow">Quick actions</p>
            <div className="mt-4 grid gap-2.5">
              {adminQuickActions.map(([label, href]) => (
                <Link
                  className="hover-lift flex items-center justify-between border-b border-[rgba(22,20,18,0.08)] px-1 py-3 text-sm font-semibold text-[color:var(--color-text-primary)] last:border-b-0"
                  key={href}
                  to={href}
                >
                  <span>{label}</span>
                  <ArrowRight className="h-4 w-4 text-[color:var(--color-text-accent)]" />
                </Link>
              ))}
            </div>
          </aside>
        ) : null}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <article className="surface-tint fade-rise px-7 py-8 lg:px-10 lg:py-10">
          <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-accent)]">
            <Sparkles className="h-4 w-4" />
Featured update
          </div>
          <div className="mt-5 max-w-3xl space-y-4">
            <h2 className="font-[var(--font-reading)] text-[2.2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[color:var(--color-text-primary)] lg:text-[3rem]">
              {nextMeeting
                ? 'The next gathering already has momentum.'
                : 'Start the next chapter with a clear date and a polished plan.'}
            </h2>
            <p className="text-base leading-8 text-[color:var(--color-text-secondary)]">
              {nextMeeting
                ? `${nextMeeting.date} · ${nextMeeting.time} · ${nextMeeting.location}`
                : 'Create a meeting or date poll to give the club a clear next step that stands out immediately.'}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-[rgba(15,95,60,0.14)] bg-[rgba(255,255,255,0.74)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-accent)]">
              {nextMeeting
                ? 'Next club session is on the calendar.'
                : 'No active session yet.'}
            </span>
            <Link
              className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-accent)] hover:text-[color:var(--color-accent-primary-hover)]"
              to="/meetings"
            >
              Open meetings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <article className="surface-base fade-rise flex flex-col justify-between px-6 py-7 lg:px-7 lg:py-8">
          <div className="space-y-4">
            <p className="eyebrow">Next meeting</p>
            <h2 className="font-[var(--font-reading)] text-[1.8rem] font-semibold leading-[1.06] tracking-[-0.035em] text-[color:var(--color-text-primary)]">
              {nextMeeting ? nextMeeting.date : 'Nothing scheduled yet'}
            </h2>
            <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
              {dashboard?.myRsvp
                ? `Your RSVP is currently marked as ${dashboard.myRsvp.status}.`
                : 'You have not responded to the next gathering yet.'}
            </p>
          </div>
          <Link
            className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-accent)] hover:text-[color:var(--color-accent-primary-hover)]"
            to="/meetings"
          >
            Review meeting details
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map(({ label, value, href, action, icon: Icon, tone }) => (
          <article className="surface-base fade-rise px-6 py-6" key={label}>
            <h2
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
            </h2>
            <p className="mt-5 font-[var(--font-reading)] text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
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
          <article className="surface-base fade-rise px-6 py-7 lg:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow">Admin getting started</p>
                <h2 className="mt-3 font-[var(--font-reading)] text-[1.9rem] font-semibold leading-[1.04] tracking-[-0.035em] text-[color:var(--color-text-primary)]">
                  Set the club in motion.
                </h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Follow these first steps to invite members, add books, and put
                  the next discussion on the calendar.
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
                  className="hover-lift rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.84)] px-4 py-4"
                  key={item.label}
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
            <article className="surface-base fade-rise px-6 py-6">
              <p className="eyebrow">Users</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                {dashboard.adminSummary.users}
              </p>
            </article>
            <article className="surface-base fade-rise px-6 py-6">
              <p className="eyebrow">Meetings</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                {dashboard.adminSummary.meetings}
              </p>
            </article>
            <article className="surface-base fade-rise px-6 py-6">
              <p className="eyebrow">Open surveys</p>
              <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                {dashboard.adminSummary.openSurveys}
              </p>
            </article>
          </section>
        </section>
      ) : null}
    </div>
  );
};
