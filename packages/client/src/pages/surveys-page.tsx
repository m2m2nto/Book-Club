import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../hooks/use-auth';
import { useWishlist } from '../hooks/use-surveys';
import { useCreateSurvey, useBookSurveys } from '../hooks/use-surveys';

export const SurveysPage = () => {
  const authQuery = useAuth();
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
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-300">
          Book surveys
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Pick the next read together
        </h1>
      </header>

      {isAdmin ? (
        <section className="grid gap-6 lg:grid-cols-[400px_minmax(0,1fr)]">
          <form
            className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              createSurveyMutation.mutate(
                { title, closesAt, maxVotes, bookIds: selectedBookIds },
                {
                  onSuccess: () => {
                    setSelectedBookIds([]);
                    setClosesAt('');
                  },
                },
              );
            }}
          >
            <h2 className="text-lg font-semibold text-white">Create survey</h2>
            <label className="block text-sm text-slate-300">
              Title
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
            <label className="block text-sm text-slate-300">
              Closes at
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                type="datetime-local"
                value={closesAt}
                onChange={(event) => setClosesAt(event.target.value)}
              />
            </label>
            <label className="block text-sm text-slate-300">
              Max votes
              <select
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
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
            <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              {wishlistBooks.map((book) => (
                <label
                  className="flex items-start gap-3 text-sm text-slate-300"
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
                    <span className="font-medium text-white">{book.title}</span>
                    <br />
                    {book.author}
                  </span>
                </label>
              ))}
            </div>
            <button
              className="w-full rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
              type="submit"
            >
              {createSurveyMutation.isPending ? 'Saving...' : 'Create survey'}
            </button>
          </form>

          <div className="space-y-4">
            {surveysQuery.data?.map((survey) => (
              <Link
                key={survey.id}
                className="block rounded-3xl border border-slate-800 bg-slate-900/70 p-6 hover:bg-slate-900"
                to={`/surveys/${survey.id}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      {survey.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                      Closes {new Date(survey.closesAt).toLocaleString()} · Max
                      votes {survey.maxVotes}
                    </p>
                  </div>
                  <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
                    {survey.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="space-y-4">
          {surveysQuery.data?.map((survey) => (
            <Link
              key={survey.id}
              className="block rounded-3xl border border-slate-800 bg-slate-900/70 p-6 hover:bg-slate-900"
              to={`/surveys/${survey.id}`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {survey.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">
                    Closes {new Date(survey.closesAt).toLocaleString()} · Max
                    votes {survey.maxVotes}
                  </p>
                </div>
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
                  {survey.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
