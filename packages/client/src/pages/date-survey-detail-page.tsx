import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useToast } from '../components/ui/toast-provider';
import { useAuth } from '../hooks/use-auth';
import {
  useCloseDateSurvey,
  useDateSurvey,
  useVoteDateSurvey,
} from '../hooks/use-meetings';

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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-slate-300">
        Loading date survey...
      </div>
    );
  }

  const activeSelection = selectedOptionIds.length
    ? selectedOptionIds
    : ownVotes;

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
          <h1 className="text-3xl font-semibold text-white">{survey.title}</h1>
          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
            {survey.status}
          </span>
        </div>
        <p className="text-sm text-slate-400">
          Closes {new Date(survey.closesAt).toLocaleString()} · {survey.time} ·{' '}
          {survey.location}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {survey.options.map((option) => (
          <article
            key={option.id}
            className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5"
          >
            <p className="text-lg font-semibold text-white">
              {option.proposedDate}
            </p>
            <p className="mt-2 text-sm text-slate-400">{option.votes} votes</p>
            {survey.status === 'open' ? (
              <button
                className={`mt-4 w-full rounded-xl border px-3 py-2 text-sm ${activeSelection.includes(option.id) ? 'border-violet-400 bg-violet-500/10 text-violet-200' : 'border-slate-700 text-slate-200 hover:bg-slate-800'}`}
                onClick={() =>
                  setSelectedOptionIds((current) =>
                    current.includes(option.id)
                      ? current.filter((id) => id !== option.id)
                      : [...current, option.id],
                  )
                }
                type="button"
              >
                {activeSelection.includes(option.id)
                  ? 'Selected'
                  : 'Select date'}
              </button>
            ) : null}
            {isAdmin && survey.status === 'open' ? (
              <button
                className="mt-3 w-full rounded-xl bg-violet-500 px-3 py-2 text-sm font-medium text-white hover:bg-violet-400"
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
        ))}
      </section>

      {survey.status === 'open' ? (
        <button
          className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
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
