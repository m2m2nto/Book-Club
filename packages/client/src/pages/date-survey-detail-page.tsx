import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useToast } from '../components/ui/toast-provider';
import { useAuth } from '../hooks/use-auth';
import {
  useCloseDateSurvey,
  useDateSurvey,
  useVoteDateSurvey,
} from '../hooks/use-meetings';

const statusLabel = (status: string) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export const DateSurveyDetailPage = () => {
  const { id } = useParams();
  const surveyId = Number(id);
  const { showToast } = useToast();
  const authQuery = useAuth();
  const surveyQuery = useDateSurvey(surveyId);
  const voteMutation = useVoteDateSurvey(surveyId);
  const closeMutation = useCloseDateSurvey(surveyId);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);

  const survey = surveyQuery.data;
  const isAdmin = authQuery.data?.role === 'admin';
  const ownVotes = useMemo(
    () =>
      survey?.votes
        .filter((vote) => vote.userId === authQuery.data?.id)
        .map((vote) => vote.dateSurveyOptionId) ?? [],
    [authQuery.data?.id, survey?.votes],
  );

  if (!survey) {
    return (
      <div className="surface-base px-6 py-8 text-sm text-[color:var(--color-text-secondary)]">
        Loading date survey...
      </div>
    );
  }

  const activeSelection = selectedOptionIds.length
    ? selectedOptionIds
    : ownVotes;

  return (
    <div className="page-stack">
      <Link
        className="text-sm font-semibold text-[color:var(--color-text-accent)] hover:text-[color:var(--color-accent-primary-hover)]"
        to="/meetings"
      >
        ← Back to meetings
      </Link>

      <section className="surface-tint px-7 py-7 lg:px-8 lg:py-8">
        <div className="page-header gap-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-[rgba(29,78,216,0.1)] bg-[rgba(255,255,255,0.74)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-accent)]">
              {statusLabel(survey.status)}
            </span>
            <span className="text-[color:var(--color-text-muted)]">
              {survey.time} · {survey.location}
            </span>
          </div>
          <div className="space-y-3">
            <h1 className="editorial-title text-balance max-w-5xl">
              {survey.title}
            </h1>
            <p className="body-copy max-w-3xl text-[1rem]">
              Closes {new Date(survey.closesAt).toLocaleString()}. Select every
              date that works for you before the meeting is confirmed.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {survey.options.map((option) => {
          const isSelected = activeSelection.includes(option.id);
          const isConfirmed = survey.confirmedOptionId === option.id;

          return (
            <article
              key={option.id}
              className={
                isConfirmed ? 'surface-tint p-5' : 'surface-base p-5'
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[1.35rem] font-extrabold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                    {option.proposedDate}
                  </p>
                  <p className="mt-2 text-sm text-[color:var(--color-text-secondary)]">
                    {option.votes} votes
                  </p>
                </div>
                {isConfirmed ? (
                  <span className="rounded-full border border-[rgba(29,78,216,0.1)] bg-[rgba(255,255,255,0.72)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-accent)]">
                    Confirmed
                  </span>
                ) : null}
              </div>

              {survey.status === 'open' ? (
                <button
                  className={
                    isSelected
                      ? 'pressable mt-5 w-full rounded-[var(--radius-pill)] border border-[rgba(29,78,216,0.1)] bg-[color:var(--color-accent-primary-soft)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-accent)]'
                      : 'pressable mt-5 w-full rounded-[var(--radius-pill)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.88)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]'
                  }
                  onClick={() =>
                    setSelectedOptionIds((current) =>
                      current.includes(option.id)
                        ? current.filter((id) => id !== option.id)
                        : [...current, option.id],
                    )
                  }
                  type="button"
                >
                  {isSelected ? 'Selected' : 'Select date'}
                </button>
              ) : null}

              {isAdmin && survey.status === 'open' ? (
                <button
                  className="pressable mt-3 w-full rounded-[var(--radius-pill)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
                  onClick={() =>
                    closeMutation.mutate(option.id, {
                      onSuccess: () => {
                        showToast({
                          title: `Confirmed ${option.proposedDate} as the meeting date.`,
                          variant: 'success',
                        });
                      },
                      onError: (error) => {
                        showToast({
                          title: 'Could not confirm that date.',
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
                  Confirm this date
                </button>
              ) : null}
            </article>
          );
        })}
      </section>

      {survey.status === 'open' ? (
        <button
          className="pressable w-full sm:w-fit rounded-[var(--radius-pill)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
          onClick={() =>
            voteMutation.mutate(activeSelection, {
              onSuccess: () => {
                showToast({
                  title: 'Saved your availability.',
                  variant: 'success',
                });
              },
              onError: (error) => {
                showToast({
                  title: 'Could not save your availability.',
                  description:
                    error instanceof Error ? error.message : 'Please try again.',
                  variant: 'error',
                });
              },
            })
          }
          type="button"
        >
          Submit availability
        </button>
      ) : null}
    </div>
  );
};
