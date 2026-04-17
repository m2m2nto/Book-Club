import { Search, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useToast } from '../components/ui/toast-provider';
import { useAuth } from '../hooks/use-auth';
import {
  type BookStatus,
  useBooks,
  useCreateBook,
  useSearchBooks,
} from '../hooks/use-books';

const statuses: Array<{ label: string; value?: BookStatus }> = [
  { label: 'All' },
  { label: 'Reading', value: 'reading' },
  { label: 'Read', value: 'read' },
  { label: 'Pipeline', value: 'pipeline' },
  { label: 'Wishlist', value: 'wishlist' },
];

const statusLabel = (status: BookStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export const BooksPage = () => {
  const authQuery = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [status, setStatus] = useState<BookStatus | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [form, setForm] = useState({
    title: '',
    author: '',
    coverUrl: '',
    description: '',
    openLibraryId: '',
    status: 'wishlist' as BookStatus,
    dateRead: '',
  });

  const booksQuery = useBooks(status);
  const createBookMutation = useCreateBook();
  const searchQueryResult = useSearchBooks(searchQuery);
  const isAdmin = authQuery.data?.role === 'admin';

  const introText = useMemo(() => {
    if (!booksQuery.data?.length) {
      return 'No books yet. Add the first title to start your club library.';
    }

    return `${booksQuery.data.length} books available in this view.`;
  }, [booksQuery.data]);

  const featuredBook = booksQuery.data?.[0] ?? null;
  const remainingBooks = featuredBook ? booksQuery.data?.slice(1) ?? [] : [];

  return (
    <div className="page-stack">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_20rem] xl:items-end">
        <div className="page-header editorial-rule fade-rise max-w-4xl">
          <p className="eyebrow text-[color:var(--color-text-accent)]">Library</p>
          <h1 className="editorial-title text-balance max-w-5xl">
            A library view with cleaner publishing-product polish.
          </h1>
          <p className="body-copy text-[1.02rem]">{introText}</p>
        </div>

        <div className="fade-rise flex flex-wrap gap-2">
          {statuses.map((item) => (
            <button
              key={item.label}
              className={
                status === item.value
                  ? 'pressable rounded-[var(--radius-pill)] border border-[rgba(15,95,60,0.12)] bg-[color:var(--color-accent-primary-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-accent)]'
                  : 'pressable rounded-[var(--radius-pill)] border border-[color:var(--color-border-soft)] bg-[rgba(255,253,249,0.82)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)] hover:text-[color:var(--color-text-primary)]'
              }
              onClick={() => setStatus(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {isAdmin ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_24rem] xl:items-start">
          <div className="space-y-6">
            {featuredBook ? (
              <Link
                className="surface-tint hover-lift fade-rise grid overflow-hidden lg:grid-cols-[220px_minmax(0,1fr)]"
                to={`/books/${featuredBook.id}`}
              >
                <div className="aspect-[4/5] bg-[color:var(--color-canvas-subtle)] lg:h-full">
                  {featuredBook.coverUrl ? (
                    <img
                      alt={featuredBook.title}
                      className="h-full w-full object-cover"
                      src={featuredBook.coverUrl}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[color:var(--color-text-muted)]">
                      No cover image
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between px-6 py-6 lg:px-8 lg:py-8">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-accent)]">
                      <Sparkles className="h-4 w-4" />
                      Featured title
                    </div>
                    <h2 className="mt-5 font-[var(--font-reading)] text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[color:var(--color-text-primary)] lg:text-[2.6rem]">
                      {featuredBook.title}
                    </h2>
                    <p className="mt-3 text-base text-[color:var(--color-text-secondary)]">
                      {featuredBook.author}
                    </p>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
                      {featuredBook.description ?? 'No description yet.'}
                    </p>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
                    <span className="rounded-full border border-[rgba(42,93,176,0.1)] bg-[rgba(255,255,255,0.72)] px-3 py-1.5 font-medium text-[color:var(--color-text-accent)]">
                      {statusLabel(featuredBook.status)}
                    </span>
                    <span className="text-[color:var(--color-text-muted)]">
                      {featuredBook.averageRating
                        ? `${featuredBook.averageRating.toFixed(1)} average rating`
                        : 'No ratings yet'}
                    </span>
                  </div>
                </div>
              </Link>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {remainingBooks.map((book) => (
                <Link
                  className="surface-base hover-lift overflow-hidden"
                  key={book.id}
                  to={`/books/${book.id}`}
                >
                  <div className="aspect-[4/5] bg-[color:var(--color-canvas-subtle)]">
                    {book.coverUrl ? (
                      <img
                        alt={book.title}
                        className="h-full w-full object-cover"
                        src={book.coverUrl}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[color:var(--color-text-muted)]">
                        No cover image
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                        {statusLabel(book.status)}
                      </span>
                      <span className="text-xs text-[color:var(--color-text-muted)]">
                        {book.averageRating
                          ? `${book.averageRating.toFixed(1)}★`
                          : '—'}
                      </span>
                    </div>
                    <div>
                      <h2 className="font-[var(--font-reading)] text-xl font-semibold tracking-[-0.02em] text-[color:var(--color-text-primary)]">
                        {book.title}
                      </h2>
                      <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                        {book.author}
                      </p>
                    </div>
                    <p className="line-clamp-3 text-sm leading-6 text-[color:var(--color-text-secondary)]">
                      {book.description ?? 'No description yet.'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {!booksQuery.data?.length ? (
              <div className="surface-base px-6 py-8 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                No books match this view yet.
              </div>
            ) : null}
          </div>

          <form
            className="surface-base space-y-5 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              createBookMutation.mutate(form, {
                onSuccess: (createdBook) => {
                  showToast({
                    title: `Saved “${createdBook.title}” to the library.`,
                    variant: 'success',
                    actionLabel: 'Open Book',
                    onAction: () => navigate(`/books/${createdBook.id}`),
                  });
                  setForm({
                    title: '',
                    author: '',
                    coverUrl: '',
                    description: '',
                    openLibraryId: '',
                    status: 'wishlist',
                    dateRead: '',
                  });
                },
                onError: (error) => {
                  showToast({
                    title: 'Could not save the book.',
                    description:
                      error instanceof Error
                        ? error.message
                        : 'Please try again.',
                    variant: 'error',
                  });
                },
              });
            }}
          >
            <div className="page-header gap-3">
              <p className="eyebrow">Add book</p>
              <div className="space-y-2">
                <h2 className="section-title">Add a title to the catalog</h2>
                <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Search Open Library or enter the details manually.
                </p>
              </div>
            </div>

            <label className="block text-sm text-[color:var(--color-text-secondary)]">
              Search Open Library
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--color-text-muted)]" />
                <input
                  className="w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] py-2.5 pl-10 pr-3 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            </label>

            {searchQueryResult.data?.length ? (
              <div className="max-h-64 space-y-2 overflow-auto rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[color:var(--color-canvas-subtle)] p-3">
                {searchQueryResult.data.map((result) => (
                  <button
                    key={`${result.openLibraryId ?? result.title}-${result.author}`}
                    className="pressable w-full rounded-[var(--radius-lg)] border border-[color:transparent] bg-[rgba(255,255,255,0.82)] px-3 py-3 text-left hover:border-[color:var(--color-border-soft)] hover:bg-[rgba(255,255,255,0.98)]"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        title: result.title,
                        author: result.author,
                        coverUrl: result.coverUrl ?? current.coverUrl,
                        description: result.description ?? current.description,
                        openLibraryId:
                          result.openLibraryId ?? current.openLibraryId,
                      }))
                    }
                    type="button"
                  >
                    <p className="font-medium text-[color:var(--color-text-primary)]">
                      {result.title}
                    </p>
                    <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                      {result.author}
                    </p>
                  </button>
                ))}
              </div>
            ) : null}

            {[
              ['title', 'Title'],
              ['author', 'Author'],
              ['coverUrl', 'Cover URL'],
              ['openLibraryId', 'Open Library ID'],
              ['dateRead', 'Date Read (YYYY-MM-DD)'],
            ].map(([key, label]) => (
              <label
                className="block text-sm text-[color:var(--color-text-secondary)]"
                key={key}
              >
                {label}
                <input
                  className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                  value={form[key as keyof typeof form]}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}

            <label className="block text-sm text-[color:var(--color-text-secondary)]">
              Description
              <textarea
                className="mt-2 min-h-28 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </label>

            <label className="block text-sm text-[color:var(--color-text-secondary)]">
              Status
              <select
                className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as BookStatus,
                  }))
                }
              >
                {statuses
                  .filter((item) => item.value)
                  .map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
              </select>
            </label>

            <button
              className="pressable w-full rounded-[var(--radius-lg)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
              type="submit"
            >
              {createBookMutation.isPending ? 'Saving...' : 'Save book'}
            </button>
          </form>
        </section>
      ) : (
        <section className="space-y-6">
          {featuredBook ? (
            <Link
              className="surface-tint hover-lift fade-rise grid overflow-hidden lg:grid-cols-[220px_minmax(0,1fr)]"
              to={`/books/${featuredBook.id}`}
            >
              <div className="aspect-[4/5] bg-[color:var(--color-canvas-subtle)] lg:h-full">
                {featuredBook.coverUrl ? (
                  <img
                    alt={featuredBook.title}
                    className="h-full w-full object-cover"
                    src={featuredBook.coverUrl}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[color:var(--color-text-muted)]">
                    No cover image
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between px-6 py-6 lg:px-8 lg:py-8">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.14em] text-[color:var(--color-text-accent)]">
                    <Sparkles className="h-4 w-4" />
                    Featured title
                  </div>
                  <h2 className="mt-5 font-[var(--font-reading)] text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-[color:var(--color-text-primary)] lg:text-[2.6rem]">
                    {featuredBook.title}
                  </h2>
                  <p className="mt-3 text-base text-[color:var(--color-text-secondary)]">
                    {featuredBook.author}
                  </p>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {featuredBook.description ?? 'No description yet.'}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
                  <span className="rounded-full border border-[rgba(42,93,176,0.1)] bg-[rgba(255,255,255,0.72)] px-3 py-1.5 font-medium text-[color:var(--color-text-accent)]">
                    {statusLabel(featuredBook.status)}
                  </span>
                  <span className="text-[color:var(--color-text-muted)]">
                    {featuredBook.averageRating
                      ? `${featuredBook.averageRating.toFixed(1)} average rating`
                      : 'No ratings yet'}
                  </span>
                </div>
              </div>
            </Link>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(featuredBook ? remainingBooks : booksQuery.data ?? []).map((book) => (
              <Link
                className="surface-base hover-lift overflow-hidden"
                key={book.id}
                to={`/books/${book.id}`}
              >
                <div className="aspect-[4/5] bg-[color:var(--color-canvas-subtle)]">
                  {book.coverUrl ? (
                    <img
                      alt={book.title}
                      className="h-full w-full object-cover"
                      src={book.coverUrl}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-[color:var(--color-text-muted)]">
                      No cover image
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--color-text-muted)]">
                    {statusLabel(book.status)}
                  </span>
                  <div>
                    <h2 className="font-[var(--font-reading)] text-xl font-semibold tracking-[-0.02em] text-[color:var(--color-text-primary)]">
                      {book.title}
                    </h2>
                    <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">
                      {book.author}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!booksQuery.data?.length ? (
            <div className="surface-base px-6 py-8 text-sm leading-7 text-[color:var(--color-text-secondary)]">
              No books match this view yet.
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
};
