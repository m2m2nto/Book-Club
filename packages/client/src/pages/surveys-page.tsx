import { Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useToast } from '../components/ui/toast-provider';
import { useAuth } from '../hooks/use-auth';
import { useBookSurveys, useCreateSurvey, useWishlist } from '../hooks/use-surveys';

const statusLabel = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export const SurveysPage = () => {
  const authQuery = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isAdmin = authQuery.data?.role === 'admin';
  const surveysQuery = useBookSurveys();
  const wishlistQuery = useWishlist();
  const createSurveyMutation = useCreateSurvey();
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [title, setTitle] = useState('Next Book Vote');
  const [closesAt, setClosesAt] = useState('');
  const [maxVotes, setMaxVotes] = useState(1);

  const wishlistBooks = useMemo(
    () => wishlistQuery.data ?? [],
    [wishlistQuery.data],
  );

  return (
    <div className="page-stack">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_20rem] xl:items-end">
        <div className="page-header editorial-rule fade-rise max-w-4xl">
          <p className="eyebrow text-[color:var(--color-text-accent)]">Book surveys</p>
          <h1 className="editorial-title text-balance max-w-5xl">
            Make the next club read feel deliberate, visible, and easy to choose.
          </h1>
          <p className="body-copy text-[1.02rem]">
            The survey view now matches the cleaner WordPress-style direction: clearer controls, stronger feature cards, and a more product-like voting flow.
          </p>
        </div>

        <div className="surface-tint fade-rise px-5 py-5">
          <p className="eyebrow">At a glance</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Surveys
              </p>
              <p className="mt-2 font-[var(--font-editorial)] text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                {surveysQuery.data?.length ?? 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-[color:var(--color-text-secondary)]">
                Wishlist titles
              </p>
              <p className="mt-2 font-[var(--font-editorial)] text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                {wishlistBooks.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {isAdmin ? (
        <section className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)] xl:items-start">
          <form
            className="surface-base space-y-5 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              createSurveyMutation.mutate(
                { title, closesAt, maxVotes, bookIds: selectedBookIds },
                {
                  onSuccess: (createdSurvey) => {
                    showToast({
                      title: `Created survey “${createdSurvey.title}”.`,
                      variant: 'success',
                      actionLabel: 'Open Survey',
                      onAction: () => navigate(`/surveys/${createdSurvey.id}`),
                    });
                    setSelectedBookIds([]);
                    setClosesAt('');
                  },
                  onError: (error) => {
                    showToast({
                      title: 'Could not create the survey.',
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
              <p className="eyebrow">Create survey</p>
              <div className="space-y-2">
                <h2 className="section-title">Build the next vote</h2>
                <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Select wishlist books, define the deadline, and choose how many
                  votes each member can rank.
                </p>
              </div>
            </div>
            <label className="block text-sm text-[color:var(--color-text-secondary)]">
              Title
              <input
                className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label className="block text-sm text-[color:var(--color-text-secondary)]">
              Closes at
              <input
                className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                type="datetime-local"
                value={closesAt}
                onChange={(event) => setClosesAt(event.target.value)}
              />
            </label>
            <label className="block text-sm text-[color:var(--color-text-secondary)]">
              Max votes
              <select
                className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                value={maxVotes}
                onChange={(event) => setMaxVotes(Number(event.target.value))}
              >
                {[1, 2, 3].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-3 rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[color:var(--color-canvas-subtle)] p-3.5">
              {wishlistBooks.length ? (
                wishlistBooks.map((book) => (
                  <label
                    className="flex items-start gap-3 rounded-[var(--radius-lg)] bg-[rgba(255,255,255,0.82)] px-3 py-3 text-sm text-[color:var(--color-text-secondary)]"
                    key={book.id}
                  >
                    <input
                      checked={selectedBookIds.includes(book.id)}
                      onChange={(event) =>
                        setSelectedBookIds((current) =>
                          event.target.checked
                            ? [...current, book.id]
                            : current.filter((id) => id !== book.id),
                        )
                      }
                      type="checkbox"
                    />
                    <span>
                      <span className="font-medium text-[color:var(--color-text-primary)]">
                        {book.title}
                      </span>
                      <br />
                      {book.author}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Add wishlist books before creating a survey.
                </p>
              )}
            </div>
            <button
              className="pressable w-full rounded-[var(--radius-pill)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
              type="submit"
            >
              {createSurveyMutation.isPending ? 'Saving...' : 'Create survey'}
            </button>
          </form>

          <div className="space-y-4">
            {surveysQuery.data?.length ? (
              surveysQuery.data.map((survey) => (
                <Link
                  key={survey.id}
                  className="surface-base hover-lift block px-6 py-6"
                  to={`/surveys/${survey.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-accent)]">
                        <Sparkles className="h-4 w-4" />
                        Vote window
                      </div>
                      <h2 className="mt-4 text-[1.7rem] font-extrabold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                        {survey.title}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                        Closes {new Date(survey.closesAt).toLocaleString()} · Max
                        votes {survey.maxVotes}
                      </p>
                    </div>
                    <span className="rounded-full border border-[rgba(29,78,216,0.1)] bg-[color:var(--color-accent-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-accent)]">
                      {statusLabel(survey.status)}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="surface-base px-6 py-8 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                No surveys yet. Start the first vote from wishlist books.
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          {surveysQuery.data?.length ? (
            surveysQuery.data.map((survey) => (
              <Link
                key={survey.id}
                className="surface-base hover-lift block px-6 py-6"
                to={`/surveys/${survey.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[1.7rem] font-extrabold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                      {survey.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                      Closes {new Date(survey.closesAt).toLocaleString()} · Max
                      votes {survey.maxVotes}
                    </p>
                  </div>
                  <span className="rounded-full border border-[rgba(29,78,216,0.1)] bg-[color:var(--color-accent-primary-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-accent)]">
                    {statusLabel(survey.status)}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="surface-base px-6 py-8 text-sm leading-7 text-[color:var(--color-text-secondary)]">
              No surveys are open right now.
            </div>
          )}
        </section>
      )}
    </div>
  );
};
