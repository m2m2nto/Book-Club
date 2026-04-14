import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../hooks/use-auth';
import {
  useBookSurvey,
  useCloseSurvey,
  useResolveSurveyTie,
  useVoteSurvey,
} from '../hooks/use-surveys';

export const SurveyDetailPage = () => {
  const { id } = useParams();
  const surveyId = Number(id);
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-slate-300">
        Loading survey...
      </div>
    );
  }

  const submitVotes = () => {
    const votes = selected.map((optionId, index) => ({
      optionId,
      rank: index + 1,
    }));
    voteMutation.mutate(votes);
  };

  const topScore = survey.options[0]?.score ?? 0;
  const tiedOptions = survey.options.filter(
    (option) => option.score === topScore && topScore > 0,
  );

  return (
    <div className="space-y-8">
      <Link
        className="text-sm text-violet-300 hover:text-violet-200"
        to="/surveys"
      >
        ← Back to surveys
      </Link>

      <header className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-white">{survey.title}</h1>
          <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
            {survey.status}
          </span>
        </div>
        <p className="text-sm text-slate-400">
          Closes {new Date(survey.closesAt).toLocaleString()} · Max votes{' '}
          {survey.maxVotes}
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {survey.options.map((option) => {
          const selectedIndex = selected.indexOf(option.id);
          return (
            <article
              key={option.id}
              className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70"
            >
              <div className="aspect-[4/5] bg-slate-950">
                {option.coverUrl ? (
                  <img
                    alt={option.title}
                    className="h-full w-full object-cover"
                    src={option.coverUrl}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-slate-500">
                    No cover image
                  </div>
                )}
              </div>
              <div className="space-y-3 p-5">
                <h2 className="text-lg font-semibold text-white">
                  {option.title}
                </h2>
                <p className="text-sm text-slate-400">{option.author}</p>
                <p className="text-xs text-slate-500">Score: {option.score}</p>
                {survey.status === 'open' && !hasVoted ? (
                  <button
                    className="w-full rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
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
                    {selectedIndex >= 0
                      ? `Selected as #${selectedIndex + 1}`
                      : 'Select'}
                  </button>
                ) : null}
                {survey.status !== 'open' ? (
                  <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
                    Results visible
                  </p>
                ) : null}
                {survey.status === 'tie-break-required' &&
                isAdmin &&
                tiedOptions.some((item) => item.bookId === option.bookId) ? (
                  <button
                    className="w-full rounded-xl bg-violet-500 px-3 py-2 text-sm font-medium text-white hover:bg-violet-400"
                    onClick={() => resolveTieMutation.mutate(option.bookId)}
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
            className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
            onClick={submitVotes}
            type="button"
          >
            Submit vote
          </button>
        ) : null}
        {isAdmin && survey.status === 'open' ? (
          <button
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
            onClick={() => closeMutation.mutate()}
            type="button"
          >
            Close survey
          </button>
        ) : null}
      </div>
    </div>
  );
};
