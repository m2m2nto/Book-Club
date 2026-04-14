import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { StarRating } from '../components/star-rating';
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

export const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 text-slate-300">
        Loading book details...
      </div>
    );
  }

  const book = bookQuery.data;
  const isAdmin = authQuery.data?.role === 'admin';

  return (
    <div className="space-y-8">
      <Link
        className="text-sm text-violet-300 hover:text-violet-200"
        to="/books"
      >
        ← Back to books
      </Link>

      <section className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70">
          <div className="aspect-[4/5] bg-slate-950">
            {book.coverUrl ? (
              <img
                alt={book.title}
                className="h-full w-full object-cover"
                src={book.coverUrl}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">
                No cover image
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-violet-200">
              {book.status}
            </span>
            <h1 className="mt-3 text-4xl font-semibold text-white">
              {book.title}
            </h1>
            <p className="mt-2 text-lg text-slate-300">{book.author}</p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
              {book.description ?? 'No description yet.'}
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
              <span>
                Average rating:{' '}
                {book.averageRating ? book.averageRating.toFixed(1) : '—'}
              </span>
              <span>Date read: {book.dateRead ?? '—'}</span>
              <span>Open Library: {book.openLibraryId ?? '—'}</span>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Your rating
                </h2>
                <p className="text-sm text-slate-400">
                  Click a star to save or update your score.
                </p>
              </div>
              <StarRating
                value={currentUserRating}
                onChange={(score) => saveRatingMutation.mutate(score)}
              />
            </div>
          </div>

          {isAdmin ? (
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Admin book controls
                  </h2>
                  <p className="text-sm text-slate-400">
                    Edit details or delete this book.
                  </p>
                </div>
                <button
                  className="rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
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
                  className="grid gap-4 md:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    updateBookMutation.mutate(bookForm, {
                      onSuccess: () => setEditBookMode(false),
                    });
                  }}
                >
                  {[
                    'title',
                    'author',
                    'coverUrl',
                    'openLibraryId',
                    'dateRead',
                  ].map((field) => (
                    <label className="block text-sm text-slate-300" key={field}>
                      {field}
                      <input
                        className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
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
                  <label className="block text-sm text-slate-300">
                    Status
                    <select
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
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
                            {status}
                          </option>
                        ),
                      )}
                    </select>
                  </label>
                  <label className="block text-sm text-slate-300 md:col-span-2">
                    Description
                    <textarea
                      className="mt-2 min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                      value={bookForm.description}
                      onChange={(event) =>
                        setBookForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <div className="flex gap-3 md:col-span-2">
                    <button
                      className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
                      type="submit"
                    >
                      Save changes
                    </button>
                    <button
                      className="rounded-xl border border-rose-600/40 px-4 py-2 text-sm text-rose-300 hover:bg-rose-500/10"
                      onClick={() =>
                        deleteBookMutation.mutate(undefined, {
                          onSuccess: () => navigate('/books'),
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

      <section className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Ratings</h2>
          <div className="mt-4 space-y-3">
            {book.ratings.length ? (
              book.ratings.map((rating) => (
                <div
                  className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3"
                  key={rating.id}
                >
                  <div>
                    <p className="font-medium text-white">{rating.userName}</p>
                    <p className="text-xs text-slate-500">
                      Updated {new Date(rating.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <StarRating value={rating.score} />
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400">No ratings yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
          <h2 className="text-xl font-semibold text-white">Notes & comments</h2>
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              createCommentMutation.mutate(
                { text: commentText, isPrivate },
                {
                  onSuccess: () => {
                    setCommentText('');
                    setIsPrivate(false);
                  },
                },
              );
            }}
          >
            <textarea
              className="min-h-28 w-full rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              placeholder="Share a thought about this book..."
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
            />
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                checked={isPrivate}
                onChange={(event) => setIsPrivate(event.target.checked)}
                type="checkbox"
              />{' '}
              Save as private note
            </label>
            <button
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
              type="submit"
            >
              Post
            </button>
          </form>

          <div className="mt-6 space-y-4">
            {book.comments.length ? (
              book.comments.map((comment) => (
                <article
                  className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4"
                  key={comment.id}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">
                        {comment.userName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {comment.isPrivate ? 'Private note' : 'Public comment'}{' '}
                        · {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {comment.userId === authQuery.data?.id ||
                    authQuery.data?.role === 'admin' ? (
                      <div className="flex gap-2">
                        {comment.userId === authQuery.data?.id ? (
                          <button
                            className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300"
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
                          className="rounded-lg border border-rose-600/40 px-2 py-1 text-xs text-rose-300"
                          onClick={() =>
                            deleteCommentMutation.mutate(comment.id)
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
                          { onSuccess: () => setEditCommentId(null) },
                        );
                      }}
                    >
                      <textarea
                        className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-white"
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          className="rounded-lg bg-violet-500 px-3 py-2 text-xs text-white"
                          type="submit"
                        >
                          Save
                        </button>
                        <button
                          className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300"
                          onClick={() => setEditCommentId(null)}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-slate-300">
                      {comment.text}
                    </p>
                  )}
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-400">No comments yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
