import { useState } from 'react';

import { useClubStats, usePersonalStats } from '../hooks/use-stats';

export const StatsPage = () => {
  const [tab, setTab] = useState<'club' | 'me'>('club');
  const clubStatsQuery = useClubStats();
  const personalStatsQuery = usePersonalStats();

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-300">
          Reading stats
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Club trends and personal habits
        </h1>
      </header>

      <div className="flex gap-2">
        <button
          className={`rounded-xl border px-4 py-2 text-sm ${tab === 'club' ? 'border-violet-400 bg-violet-500/10 text-violet-200' : 'border-slate-700 text-slate-300'}`}
          onClick={() => setTab('club')}
          type="button"
        >
          Club
        </button>
        <button
          className={`rounded-xl border px-4 py-2 text-sm ${tab === 'me' ? 'border-violet-400 bg-violet-500/10 text-violet-200' : 'border-slate-700 text-slate-300'}`}
          onClick={() => setTab('me')}
          type="button"
        >
          Personal
        </button>
      </div>

      {tab === 'club' ? (
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold text-white">Books per year</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {clubStatsQuery.data?.booksPerYear.map((entry) => (
                <div
                  key={entry.year}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5"
                >
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    {entry.year}
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {entry.count}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold text-white">
              Average ratings by book
            </h2>
            <div className="mt-4 space-y-3">
              {clubStatsQuery.data?.averageRatings.map((entry) => (
                <div
                  key={entry.bookId}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{entry.title}</p>
                      <p className="text-xs text-slate-500">{entry.author}</p>
                    </div>
                    <p className="text-lg font-semibold text-white">
                      {entry.averageRating
                        ? entry.averageRating.toFixed(1)
                        : '—'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Books rated
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {personalStatsQuery.data?.booksRated ?? 0}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Average rating
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {personalStatsQuery.data?.averageRating
                  ? personalStatsQuery.data.averageRating.toFixed(1)
                  : '—'}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                Comments
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {personalStatsQuery.data?.commentCount ?? 0}
              </p>
            </div>
          </section>
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <h2 className="text-lg font-semibold text-white">
              Rating distribution
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-5">
              {personalStatsQuery.data?.ratingDistribution.map((entry) => (
                <div
                  key={entry.score}
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-center"
                >
                  <p className="text-sm text-slate-500">{entry.score}★</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {entry.count}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
