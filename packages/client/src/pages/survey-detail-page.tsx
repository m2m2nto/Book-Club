import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useToast } from '../components/ui/toast-provider';
import { useAuth } from '../hooks/use-auth';
import {
  useBookSurvey,
  useCloseSurvey,
  useResolveSurveyTie,
  useVoteSurvey,
} from '../hooks/use-surveys';

const statusLabel = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export const SurveyDetailPage = () => {
  const { id } = useParams();
  const surveyId = Number(id);
  const { showToast } = useToast();
  const authQuery = useAuth();
  const surveyQuery = useBookSurvey(surveyId);
  const voteMutation = useVoteSurvey(surveyId);
  const closeMutation = useCloseSurvey(surveyId);
  const resolveTieMutation = useResolveSurveyTie(surveyId);
  const [selected, setSelected] = useState<number[]>([]);

  const survey = surveyQuery.data;
  const isAdmin = authQuery.data?.role === 'admin';
  const hasVoted = useMemo(
    () =>
      survey?.votes.some((vote) => vote.userId === authQuery.data?.id) ?? false,
    [authQuery.data?.id, survey?.votes],
  );

  if (!survey) {
    return (
      <div className="surface-base px-6 py-8 text-sm text-[color:var(--color-text-secondary)]">
        Loading survey...
      </div>
    );
  }

  const submitVotes = () => {
    const votes = selected.map((optionId, index) => ({
      optionId,
      rank: index + 1,
    }));
    voteMutation.mutate(votes, {
      onSuccess: () => {
        showToast({
          title: 'Submitted your vote.',
          description: 'Your ranked choices have been locked in.',
          variant: 'success',
        });
      },
      onError: (error) => {
        showToast({
          title: 'Could not submit your vote.',
          description:
            error instanceof Error ? error.message : 'Please try again.',
          variant: 'error',
        });
      },
    });
  };

  const topScore = survey.options[0]?.score ?? 0;
  const tiedOptions = survey.options.filter(
    (option) => option.score === topScore && topScore > 0,
  );

  return (
    <div className="page-stack">
      <Link
        className="text-sm font-medium text-[color:var(--color-text-accent)] hover:text-[color:var(--color-accent-primary-hover)]"
        to="/surveys"
      >
        ← Back to surveys
      </Link>

      <section className="surface-tint px-7 py-7 lg:px-8 lg:py-8">
        <div className="page-header gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-[rgba(42,93,176,0.1)] bg-[rgba(255,255,255,0.74)] px-3 py-1.5 font-medium text-[color:var(--color-text-accent)]">
              {statusLabel(survey.status)}
            </span>
            <span className="text-[color:var(--color-text-muted)]">
              Max votes {survey.maxVotes}
            </span>
          </div>
          <div className="space-y-3">
            <h1 className="editorial-title text-balance max-w-4xl">
              {survey.title}
            </h1>
            <p className="body-copy max-w-3xl text-[1rem]">
              Closes {new Date(survey.closesAt).toLocaleString()}.
              {survey.status === 'open'
                ? ' Rank your choices in order of preference.'
                : ' Results are now visible to the club.'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {survey.options.map((option) => {
          const selectedIndex = selected.indexOf(option.id);
          return (
            <article
              key={option.id}
              className="surface-base overflow-hidden"
            >
              <div className="aspect-[4/5] bg-[color:var(--color-canvas-subtle)]">
                {option.coverUrl ? (
                  <img
                    alt={option.title}
                    className="h-full w-full object-cover"
                    src={option.coverUrl}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[color:var(--color-text-muted)]">
                    No cover image
                  </div>
                )}
              </div>
              <div className="space-y-4 p-5">
                <div>
                  <h2 className="text-lg font-semibold tracking-[-0.02em] text-[color:var(--color-text-primary)]">
                    {option.title}
                  </h2>
                  <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                    {option.author}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[color:var(--color-text-muted)]">
                    Score: {option.score}
                  </span>
                  {selectedIndex >= 0 ? (
                    <span className="rounded-full border border-[rgba(42,93,176,0.1)] bg-[color:var(--color-accent-primary-soft)] px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-accent)]">
                      Rank #{selectedIndex + 1}
                    </span>
                  ) : null}
                </div>

                {survey.status === 'open' && !hasVoted ? (
                  <button
                    className="pressable w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.88)] px-3 py-2.5 text-sm font-medium text-[color:var(--color-text-primary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]"
                    onClick={() => {
                      setSelected((current) => {
                        if (current.includes(option.id)) {
                          return current.filter((id) => id !== option.id);
                        }
                        if (current.length >= survey.maxVotes) {
                          return current;
                        }
                        return [...current, option.id];
                      });
                    }}
                    type="button"
                  >
                    {selectedIndex >= 0 ? `Selected as #${selectedIndex + 1}` : 'Select'}
                  </button>
                ) : null}

                {survey.status !== 'open' ? (
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-[color:var(--color-text-accent)]">
                    Results visible
                  </p>
                ) : null}

                {survey.status === 'tie-break-required' &&
                isAdmin &&
                tiedOptions.some((item) => item.bookId === option.bookId) ? (
                  <button
                    className="pressable w-full rounded-[var(--radius-lg)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-3 py-2.5 text-sm font-medium text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
                    onClick={() =>
                      resolveTieMutation.mutate(option.bookId, {
                        onSuccess: () => {
                          showToast({
                            title: `Picked “${option.title}” as the winner.`,
                            variant: 'success',
                          });
                        },
                        onError: (error) => {
                          showToast({
                            title: 'Could not resolve the tie.',
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
                    Pick as winner
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </section>

      <div className="flex flex-wrap gap-3">
        {survey.status === 'open' && !hasVoted ? (
          <button
            className="pressable rounded-[var(--radius-lg)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
            onClick={submitVotes}
            type="button"
          >
            Submit vote
          </button>
        ) : null}
        {isAdmin && survey.status === 'open' ? (
          <button
            className="pressable rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.88)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-text-primary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]"
            onClick={() =>
              closeMutation.mutate(undefined, {
                onSuccess: () => {
                  showToast({
                    title: 'Closed the survey.',
                    variant: 'success',
                  });
                },
                onError: (error) => {
                  showToast({
                    title: 'Could not close the survey.',
                    description:
                      error instanceof Error ? error.message : 'Please try again.',
                    variant: 'error',
                  });
                },
              })
            }
            type="button"
          >
            Close survey
          </button>
        ) : null}
      </div>
    </div>
  );
};
