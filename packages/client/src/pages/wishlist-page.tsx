import { Search, Sparkles } from 'lucide-react';
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

  const featuredSuggestion = wishlistQuery.data?.[0] ?? null;
  const remainingSuggestions = featuredSuggestion
    ? wishlistQuery.data?.slice(1) ?? []
    : wishlistQuery.data ?? [];

  return (
    <div className="page-stack">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_20rem] xl:items-end">
        <div className="page-header editorial-rule fade-rise max-w-4xl">
          <p className="eyebrow text-[color:var(--color-text-accent)]">Wishlist</p>
          <h1 className="editorial-title text-balance max-w-5xl">
            Keep future reads in one clear, polished suggestion pool.
          </h1>
          <p className="body-copy text-[1.02rem]">
            Wishlist now follows the same product-style pattern as the rest of the app: easier submission, cleaner featured content, and better scanning across suggestions.
          </p>
        </div>

        <div className="surface-tint fade-rise px-5 py-5">
          <p className="eyebrow">At a glance</p>
          <div className="mt-4">
            <p className="text-sm text-[color:var(--color-text-secondary)]">
              Wishlist suggestions
            </p>
            <p className="mt-2 font-[var(--font-editorial)] text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
              {wishlistQuery.data?.length ?? 0}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[24rem_minmax(0,1fr)] xl:items-start">
        <form
          className="surface-base space-y-5 p-6"
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
          <div className="page-header gap-3">
            <p className="eyebrow">Add suggestion</p>
            <div className="space-y-2">
              <h2 className="section-title">Suggest a future read</h2>
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
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </label>

          {searchQuery.data?.length ? (
            <div className="max-h-64 space-y-2 overflow-auto rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[color:var(--color-canvas-subtle)] p-3">
              {searchQuery.data.map((result) => (
                <button
                  key={`${result.openLibraryId ?? result.title}-${result.author}`}
                  className="pressable w-full rounded-[var(--radius-lg)] border border-transparent bg-[rgba(255,255,255,0.82)] px-3 py-3 text-left hover:border-[color:var(--color-border-soft)] hover:bg-[rgba(255,255,255,0.98)]"
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
          ].map(([field, label]) => (
            <label
              className="block text-sm text-[color:var(--color-text-secondary)]"
              key={field}
            >
              {label}
              <input
                className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
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

          <button
            className="pressable w-full rounded-[var(--radius-pill)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
            type="submit"
          >
            {createMutation.isPending ? 'Saving...' : 'Add to wishlist'}
          </button>
        </form>

        <div className="space-y-6">
          {featuredSuggestion ? (
            <article className="surface-tint fade-rise grid overflow-hidden lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="aspect-[4/5] bg-[color:var(--color-canvas-subtle)] lg:h-full">
                {featuredSuggestion.coverUrl ? (
                  <img
                    alt={featuredSuggestion.title}
                    className="h-full w-full object-cover"
                    src={featuredSuggestion.coverUrl}
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
                    Featured suggestion
                  </div>
                  <h2 className="mt-5 text-[2rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[color:var(--color-text-primary)] lg:text-[2.6rem]">
                    {featuredSuggestion.title}
                  </h2>
                  <p className="mt-3 text-base text-[color:var(--color-text-secondary)]">
                    {featuredSuggestion.author}
                  </p>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    {featuredSuggestion.description ?? 'No description yet.'}
                  </p>
                </div>
              </div>
            </article>
          ) : null}

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {remainingSuggestions.map((book) => (
              <article
                key={book.id}
                className="surface-base overflow-hidden"
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
                  <div>
                    <h2 className="text-xl font-extrabold tracking-[-0.03em] text-[color:var(--color-text-primary)]">
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
              </article>
            ))}
            {!wishlistQuery.data?.length ? (
              <div className="surface-base px-6 py-8 text-sm leading-7 text-[color:var(--color-text-secondary)] sm:col-span-2 xl:col-span-3">
                No suggestions yet. Add the first future read.
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </div>
  );
};
