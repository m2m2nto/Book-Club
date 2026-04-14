import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

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

export const BooksPage = () => {
  const authQuery = useAuth();
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
    if (!booksQuery.data?.length)
      return 'No books yet. Add the first title to start your club library.';
    return `${booksQuery.data.length} books available in this view.`;
  }, [booksQuery.data]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-300">
            Library
          </p>
          <h1 className="text-3xl font-semibold text-white">Books</h1>
          <p className="mt-2 text-sm text-slate-400">{introText}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {statuses.map((item) => (
            <button
              key={item.label}
              className={`rounded-xl border px-3 py-2 text-sm ${status === item.value ? 'border-violet-400 bg-violet-500/10 text-violet-200' : 'border-slate-700 text-slate-300 hover:bg-slate-900'}`}
              onClick={() => setStatus(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {isAdmin ? (
        <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          <form
            className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
            onSubmit={(event) => {
              event.preventDefault();
              createBookMutation.mutate(form, {
                onSuccess: () => {
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
              });
            }}
          >
            <div>
              <h2 className="text-lg font-semibold text-white">Add book</h2>
              <p className="mt-1 text-sm text-slate-400">
                Search Open Library or enter data manually.
              </p>
            </div>

            <label className="block text-sm text-slate-300">
              Search Open Library
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            {searchQueryResult.data?.length ? (
              <div className="max-h-64 space-y-2 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                {searchQueryResult.data.map((result) => (
                  <button
                    key={`${result.openLibraryId ?? result.title}-${result.author}`}
                    className="w-full rounded-xl border border-slate-800 px-3 py-3 text-left hover:bg-slate-900"
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
                    <p className="font-medium text-white">{result.title}</p>
                    <p className="text-xs text-slate-400">{result.author}</p>
                  </button>
                ))}
              </div>
            ) : null}

            {[
              ['title', 'Title'],
              ['author', 'Author'],
              ['coverUrl', 'Cover URL'],
              ['openLibraryId', 'Open Library ID'],
              ['dateRead', 'Date read (YYYY-MM-DD)'],
            ].map(([key, label]) => (
              <label className="block text-sm text-slate-300" key={key}>
                {label}
                <input
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
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

            <label className="block text-sm text-slate-300">
              Description
              <textarea
                className="mt-2 min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </label>

            <label className="block text-sm text-slate-300">
              Status
              <select
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
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
              className="w-full rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
              type="submit"
            >
              {createBookMutation.isPending ? 'Saving...' : 'Save book'}
            </button>
          </form>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {booksQuery.data?.map((book) => (
              <Link
                key={book.id}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 transition-transform hover:-translate-y-0.5"
                to={`/books/${book.id}`}
              >
                <div className="aspect-[4/5] bg-slate-950">
                  {book.coverUrl ? (
                    <img
                      alt={book.title}
                      className="h-full w-full object-cover"
                      src={book.coverUrl}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-slate-500">
                      No cover image
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
                      {book.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {book.averageRating
                        ? `${book.averageRating.toFixed(1)}★`
                        : '—'}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    {book.title}
                  </h2>
                  <p className="text-sm text-slate-400">{book.author}</p>
                  <p className="line-clamp-3 text-sm text-slate-500">
                    {book.description ?? 'No description yet.'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {booksQuery.data?.map((book) => (
            <Link
              key={book.id}
              className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70"
              to={`/books/${book.id}`}
            >
              <div className="aspect-[4/5] bg-slate-950">
                {book.coverUrl ? (
                  <img
                    alt={book.title}
                    className="h-full w-full object-cover"
                    src={book.coverUrl}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-6 text-center text-slate-500">
                    No cover image
                  </div>
                )}
              </div>
              <div className="space-y-2 p-5">
                <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
                  {book.status}
                </span>
                <h2 className="text-lg font-semibold text-white">
                  {book.title}
                </h2>
                <p className="text-sm text-slate-400">{book.author}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
