import { useState } from 'react';

import { useToast } from '../components/ui/toast-provider';
import { useSearchBooks } from '../hooks/use-books';
import { useCreateWishlistBook, useWishlist } from '../hooks/use-surveys';

export const WishlistPage = () => {
  const { showToast } = useToast();
  const wishlistQuery = useWishlist();
  const createMutation = useCreateWishlistBook();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    title: '',
    author: '',
    description: '',
    coverUrl: '',
    openLibraryId: '',
  });
  const searchQuery = useSearchBooks(search);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-300">
          Wishlist
        </p>
        <h1 className="text-3xl font-semibold text-white">
          Suggest future reads
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Any member can add a book suggestion for future surveys.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        <form
          className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/70 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate(form, {
              onSuccess: (createdBook) => {
                showToast({
                  title: `Added “${createdBook.title}” to the wishlist.`,
                  variant: 'success',
                });
                setForm({
                  title: '',
                  author: '',
                  description: '',
                  coverUrl: '',
                  openLibraryId: '',
                });
                setSearch('');
              },
              onError: (error) => {
                showToast({
                  title: 'Could not add the wishlist suggestion.',
                  description:
                    error instanceof Error ? error.message : 'Please try again.',
                  variant: 'error',
                });
              },
            });
          }}
        >
          <h2 className="text-lg font-semibold text-white">Add suggestion</h2>

          <label className="block text-sm text-slate-300">
            Search Open Library
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          {searchQuery.data?.length ? (
            <div className="max-h-64 space-y-2 overflow-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
              {searchQuery.data.map((result) => (
                <button
                  key={`${result.openLibraryId ?? result.title}-${result.author}`}
                  className="w-full rounded-xl border border-slate-800 px-3 py-3 text-left hover:bg-slate-900"
                  onClick={() =>
                    setForm({
                      title: result.title,
                      author: result.author,
                      description: result.description ?? '',
                      coverUrl: result.coverUrl ?? '',
                      openLibraryId: result.openLibraryId ?? '',
                    })
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
          ].map(([field, label]) => (
            <label className="block text-sm text-slate-300" key={field}>
              {label}
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                value={form[field as keyof typeof form]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field]: event.target.value,
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

          <button
            className="w-full rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
            type="submit"
          >
            {createMutation.isPending ? 'Saving...' : 'Add to wishlist'}
          </button>
        </form>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {wishlistQuery.data?.map((book) => (
            <article
              key={book.id}
              className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70"
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
                <h2 className="text-lg font-semibold text-white">
                  {book.title}
                </h2>
                <p className="text-sm text-slate-400">{book.author}</p>
                <p className="line-clamp-3 text-sm text-slate-500">
                  {book.description ?? 'No description yet.'}
                </p>
              </div>
            </article>
          ))}
        </section>
      </section>
    </div>
  );
};
