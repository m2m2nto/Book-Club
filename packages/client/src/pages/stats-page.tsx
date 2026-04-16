import { useState } from 'react';

import { useClubStats, usePersonalStats } from '../hooks/use-stats';

export const StatsPage = () => {
  const [tab, setTab] = useState<'club' | 'me'>('club');
  const clubStatsQuery = useClubStats();
  const personalStatsQuery = usePersonalStats();

  return (
    <div className="page-stack">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_20rem] xl:items-end">
        <div className="page-header fade-rise max-w-3xl">
          <p className="eyebrow text-[color:var(--color-text-accent)]">Reading stats</p>
          <h1 className="editorial-title text-balance max-w-4xl">
            See club patterns and personal reading habits more clearly.
          </h1>
          <p className="body-copy text-[1.02rem]">
            Switch between the club-wide view and your own stats to see how the
            reading rhythm is taking shape.
          </p>
        </div>

        <div className="fade-rise flex gap-2 justify-start xl:justify-end">
          <button
            className={
              tab === 'club'
                ? 'pressable rounded-[var(--radius-pill)] border border-[rgba(42,93,176,0.1)] bg-[color:var(--color-accent-primary-soft)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-accent)]'
                : 'pressable rounded-[var(--radius-pill)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.78)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)] hover:text-[color:var(--color-text-primary)]'
            }
            onClick={() => setTab('club')}
            type="button"
          >
            Club
          </button>
          <button
            className={
              tab === 'me'
                ? 'pressable rounded-[var(--radius-pill)] border border-[rgba(42,93,176,0.1)] bg-[color:var(--color-accent-primary-soft)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-accent)]'
                : 'pressable rounded-[var(--radius-pill)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.78)] px-4 py-2 text-sm font-medium text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)] hover:text-[color:var(--color-text-primary)]'
            }
            onClick={() => setTab('me')}
            type="button"
          >
            Personal
          </button>
        </div>
      </section>

      {tab === 'club' ? (
        <div className="space-y-6">
          <section className="surface-base px-6 py-6">
            <h2 className="section-title text-[1.45rem]">Books per year</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {clubStatsQuery.data?.booksPerYear.map((entry) => (
                <div
                  key={entry.year}
                  className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.74)] p-5"
                >
                  <p className="text-sm uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                    {entry.year}
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                    {entry.count}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface-base px-6 py-6">
            <h2 className="section-title text-[1.45rem]">Average ratings by book</h2>
            <div className="mt-5 space-y-3">
              {clubStatsQuery.data?.averageRatings.map((entry) => (
                <div
                  key={entry.bookId}
                  className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.74)] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-[color:var(--color-text-primary)]">
                        {entry.title}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                        {entry.author}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-[color:var(--color-text-primary)]">
                      {entry.averageRating ? entry.averageRating.toFixed(1) : '—'}
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
            <div className="surface-base px-6 py-6">
              <p className="text-sm uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                Books rated
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                {personalStatsQuery.data?.booksRated ?? 0}
              </p>
            </div>
            <div className="surface-base px-6 py-6">
              <p className="text-sm uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                Average rating
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                {personalStatsQuery.data?.averageRating
                  ? personalStatsQuery.data.averageRating.toFixed(1)
                  : '—'}
              </p>
            </div>
            <div className="surface-base px-6 py-6">
              <p className="text-sm uppercase tracking-[0.16em] text-[color:var(--color-text-muted)]">
                Comments
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                {personalStatsQuery.data?.commentCount ?? 0}
              </p>
            </div>
          </section>

          <section className="surface-base px-6 py-6">
            <h2 className="section-title text-[1.45rem]">Rating distribution</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-5">
              {personalStatsQuery.data?.ratingDistribution.map((entry) => (
                <div
                  key={entry.score}
                  className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.74)] p-4 text-center"
                >
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    {entry.score}★
                  </p>
                  <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
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
