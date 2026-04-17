import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { StarRating } from '../components/star-rating';
import { useToast } from '../components/ui/toast-provider';
import { useAuth } from '../hooks/use-auth';
import {
  type BookStatus,
  useBook,
  useCreateComment,
  useDeleteBook,
  useDeleteComment,
  useSaveRating,
  useUpdateBook,
  useUpdateComment,
} from '../hooks/use-books';

const statusLabel = (status: BookStatus) =>
  status.charAt(0).toUpperCase() + status.slice(1);

export const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const authQuery = useAuth();
  const bookId = Number(id);
  const bookQuery = useBook(bookId);
  const saveRatingMutation = useSaveRating(bookId);
  const createCommentMutation = useCreateComment(bookId);
  const updateCommentMutation = useUpdateComment(bookId);
  const deleteCommentMutation = useDeleteComment(bookId);
  const updateBookMutation = useUpdateBook(bookId);
  const deleteBookMutation = useDeleteBook(bookId);

  const [commentText, setCommentText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [editCommentId, setEditCommentId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [editBookMode, setEditBookMode] = useState(false);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    coverUrl: '',
    description: '',
    openLibraryId: '',
    status: 'wishlist' as BookStatus,
    dateRead: '',
  });

  const currentUserRating = useMemo(
    () =>
      bookQuery.data?.ratings.find(
        (rating) => rating.userId === authQuery.data?.id,
      )?.score ?? 0,
    [authQuery.data?.id, bookQuery.data?.ratings],
  );

  if (!bookQuery.data) {
    return (
      <div className="surface-base px-6 py-8 text-sm text-[color:var(--color-text-secondary)]">
        Loading book details...
      </div>
    );
  }

  const book = bookQuery.data;
  const isAdmin = authQuery.data?.role === 'admin';

  return (
    <div className="page-stack">
      <Link
        className="text-sm font-semibold text-[color:var(--color-text-accent)] hover:text-[color:var(--color-accent-primary-hover)]"
        to="/books"
      >
        ← Back to books
      </Link>

      <section className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)] xl:items-start">
        <div className="surface-base overflow-hidden">
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
        </div>

        <div className="space-y-6">
          <section className="surface-tint px-7 py-7 lg:px-8 lg:py-8">
            <div className="page-header gap-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full border border-[rgba(29,78,216,0.1)] bg-[rgba(255,255,255,0.74)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-text-accent)]">
                  {statusLabel(book.status)}
                </span>
                <span className="text-[color:var(--color-text-muted)]">
                  {book.averageRating
                    ? `${book.averageRating.toFixed(1)} average rating`
                    : 'No ratings yet'}
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="editorial-title text-balance max-w-5xl">
                  {book.title}
                </h1>
                <p className="text-lg text-[color:var(--color-text-secondary)]">
                  {book.author}
                </p>
              </div>

              <p className="body-copy max-w-3xl text-[1rem]">
                {book.description ?? 'No description yet.'}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[color:var(--color-text-secondary)]">
              <span>
                <span className="font-medium text-[color:var(--color-text-primary)]">
                  Date read:
                </span>{' '}
                {book.dateRead ?? '—'}
              </span>
              <span>
                <span className="font-medium text-[color:var(--color-text-primary)]">
                  Open Library:
                </span>{' '}
                {book.openLibraryId ?? '—'}
              </span>
            </div>
          </section>

          <section className="surface-base px-6 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="section-title text-[1.45rem]">Your rating</h2>
                <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                  Click a star to save or update your score.
                </p>
              </div>
              <StarRating
                value={currentUserRating}
                onChange={(score) =>
                  saveRatingMutation.mutate(score, {
                    onSuccess: () => {
                      showToast({
                        title: 'Saved your rating.',
                        description: `Your ${score}-star rating is now recorded.`,
                        variant: 'success',
                      });
                    },
                    onError: (error) => {
                      showToast({
                        title: 'Could not save your rating.',
                        description:
                          error instanceof Error
                            ? error.message
                            : 'Please try again.',
                        variant: 'error',
                      });
                    },
                  })
                }
              />
            </div>
          </section>

          {isAdmin ? (
            <section className="surface-base px-6 py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="eyebrow">Admin controls</p>
                  <h2 className="mt-3 text-[1.55rem] font-extrabold tracking-[-0.04em] text-[color:var(--color-text-primary)]">
                    Edit or remove this book
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                    Update metadata, change status, or remove the title from the
                    catalog.
                  </p>
                </div>
                <button
                  className="pressable rounded-[var(--radius-pill)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.88)] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-primary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]"
                  onClick={() => {
                    setEditBookMode((current) => !current);
                    setBookForm({
                      title: book.title,
                      author: book.author,
                      coverUrl: book.coverUrl ?? '',
                      description: book.description ?? '',
                      openLibraryId: book.openLibraryId ?? '',
                      status: book.status,
                      dateRead: book.dateRead ?? '',
                    });
                  }}
                  type="button"
                >
                  {editBookMode ? 'Close editor' : 'Edit book'}
                </button>
              </div>

              {editBookMode ? (
                <form
                  className="mt-6 grid gap-4 md:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    updateBookMutation.mutate(bookForm, {
                      onSuccess: () => {
                        showToast({
                          title: 'Saved your book changes.',
                          variant: 'success',
                        });
                        setEditBookMode(false);
                      },
                      onError: (error) => {
                        showToast({
                          title: 'Could not save the book changes.',
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
                  {[
                    ['title', 'Title'],
                    ['author', 'Author'],
                    ['coverUrl', 'Cover URL'],
                    ['openLibraryId', 'Open Library ID'],
                    ['dateRead', 'Date Read'],
                  ].map(([field, label]) => (
                    <label
                      className="block text-sm text-[color:var(--color-text-secondary)]"
                      key={field}
                    >
                      {label}
                      <input
                        className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                        value={bookForm[field as keyof typeof bookForm]}
                        onChange={(event) =>
                          setBookForm((current) => ({
                            ...current,
                            [field]: event.target.value,
                          }))
                        }
                      />
                    </label>
                  ))}
                  <label className="block text-sm text-[color:var(--color-text-secondary)]">
                    Status
                    <select
                      className="mt-2 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                      value={bookForm.status}
                      onChange={(event) =>
                        setBookForm((current) => ({
                          ...current,
                          status: event.target.value as BookStatus,
                        }))
                      }
                    >
                      {['wishlist', 'pipeline', 'reading', 'read'].map(
                        (status) => (
                          <option key={status} value={status}>
                            {statusLabel(status as BookStatus)}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="block text-sm text-[color:var(--color-text-secondary)] md:col-span-2">
                    Description
                    <textarea
                      className="mt-2 min-h-28 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                      value={bookForm.description}
                      onChange={(event) =>
                        setBookForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="flex flex-wrap gap-3 md:col-span-2">
                    <button
                      className="pressable rounded-[var(--radius-pill)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
                      type="submit"
                    >
                      Save changes
                    </button>
                    <button
                      className="pressable rounded-[var(--radius-pill)] border border-[rgba(180,35,24,0.18)] bg-[color:var(--color-error-soft)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-error-base)] hover:border-[rgba(180,35,24,0.28)]"
                      onClick={() =>
                        deleteBookMutation.mutate(undefined, {
                          onSuccess: () => {
                            showToast({
                              title: 'Deleted the book.',
                              variant: 'success',
                            });
                            navigate('/books');
                          },
                          onError: (error) => {
                            showToast({
                              title: 'Could not delete the book.',
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
                      Delete book
                    </button>
                  </div>
                </form>
              ) : null}
            </section>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface-base px-6 py-6">
          <h2 className="section-title text-[1.45rem]">Ratings</h2>
          <div className="mt-5 space-y-3">
            {book.ratings.length ? (
              book.ratings.map((rating) => (
                <div
                  className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.72)] px-4 py-4"
                  key={rating.id}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[color:var(--color-text-primary)]">
                        {rating.userName}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                        Updated {new Date(rating.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <StarRating value={rating.score} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                No ratings yet.
              </p>
            )}
          </div>
        </div>

        <div className="surface-base px-6 py-6">
          <h2 className="section-title text-[1.45rem]">Notes & comments</h2>
          <form
            className="mt-5 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              createCommentMutation.mutate(
                { text: commentText, isPrivate },
                {
                  onSuccess: () => {
                    showToast({
                      title: isPrivate
                        ? 'Saved your private note.'
                        : 'Posted your comment.',
                      variant: 'success',
                    });
                    setCommentText('');
                    setIsPrivate(false);
                  },
                  onError: (error) => {
                    showToast({
                      title: 'Could not save your note.',
                      description:
                        error instanceof Error
                          ? error.message
                          : 'Please try again.',
                      variant: 'error',
                    });
                  },
                },
              );
            }}
          >
            <textarea
              className="min-h-28 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
              placeholder="Share a thought about this book..."
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-[color:var(--color-text-secondary)]">
              <input
                checked={isPrivate}
                onChange={(event) => setIsPrivate(event.target.checked)}
                type="checkbox"
              />{' '}
              Save as private note
            </label>
            <button
              className="pressable rounded-[var(--radius-pill)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
              type="submit"
            >
              Post
            </button>
          </form>

          <div className="mt-6 space-y-4">
            {book.comments.length ? (
              book.comments.map((comment) => (
                <article
                  className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.74)] p-4"
                  key={comment.id}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[color:var(--color-text-primary)]">
                        {comment.userName}
                      </p>
                      <p className="mt-1 text-xs text-[color:var(--color-text-muted)]">
                        {comment.isPrivate ? 'Private note' : 'Public comment'} ·{' '}
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {comment.userId === authQuery.data?.id ||
                    authQuery.data?.role === 'admin' ? (
                      <div className="flex gap-2">
                        {comment.userId === authQuery.data?.id ? (
                          <button
                            className="pressable rounded-[var(--radius-pill)] border border-[color:var(--color-border-soft)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-canvas-subtle)]"
                            onClick={() => {
                              setEditCommentId(comment.id);
                              setEditText(comment.text);
                            }}
                            type="button"
                          >
                            Edit
                          </button>
                        ) : null}
                        <button
                          className="pressable rounded-[var(--radius-pill)] border border-[rgba(180,35,24,0.18)] bg-[color:var(--color-error-soft)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-error-base)]"
                          onClick={() =>
                            deleteCommentMutation.mutate(comment.id, {
                              onSuccess: () => {
                                showToast({
                                  title: 'Deleted the comment.',
                                  variant: 'success',
                                });
                              },
                              onError: (error) => {
                                showToast({
                                  title: 'Could not delete the comment.',
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
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {editCommentId === comment.id ? (
                    <form
                      className="mt-3 space-y-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        updateCommentMutation.mutate(
                          { commentId: comment.id, text: editText },
                          {
                            onSuccess: () => {
                              showToast({
                                title: 'Updated your comment.',
                                variant: 'success',
                              });
                              setEditCommentId(null);
                            },
                            onError: (error) => {
                              showToast({
                                title: 'Could not update the comment.',
                                description:
                                  error instanceof Error
                                    ? error.message
                                    : 'Please try again.',
                                variant: 'error',
                              });
                            },
                          },
                        );
                      }}
                    >
                      <textarea
                        className="min-h-24 w-full rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.92)] px-3 py-2.5 text-sm text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[rgba(42,93,176,0.12)]"
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          className="pressable rounded-[var(--radius-pill)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-inverse)]"
                          type="submit"
                        >
                          Save
                        </button>
                        <button
                          className="pressable rounded-[var(--radius-pill)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.88)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-canvas-subtle)]"
                          onClick={() => setEditCommentId(null)}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="mt-3 text-sm leading-7 text-[color:var(--color-text-secondary)]">
                      {comment.text}
                    </p>
                  )}
                </article>
              ))
            ) : (
              <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
                No comments yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
