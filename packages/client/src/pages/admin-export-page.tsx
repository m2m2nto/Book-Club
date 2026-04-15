import { useState } from 'react';

import { apiFetch } from '../lib/api';

export const AdminExportPage = () => {
  const [confirming, setConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmDownload = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const result = await apiFetch<{ downloadUrl: string }>(
        '/api/admin/export-db/confirm',
        {
          method: 'POST',
          body: JSON.stringify({ confirmed: true }),
        },
      );

      window.location.assign(result.downloadUrl);
      setConfirming(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Failed to confirm database export.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-300">
          Admin utilities
        </p>
        <h1 className="text-3xl font-semibold text-white">Database export</h1>
      </header>
      <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
        <p className="text-sm leading-6 text-slate-400">
          Download the live SQLite database, including session and reminder
          data. Confirm before exporting.
        </p>
        {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
        {!confirming ? (
          <button
            className="mt-4 rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
            onClick={() => setConfirming(true)}
            type="button"
          >
            Export database
          </button>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              onClick={() => {
                void handleConfirmDownload();
              }}
              type="button"
            >
              {isSubmitting ? 'Preparing download...' : 'Confirm download'}
            </button>
            <button
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
              onClick={() => setConfirming(false)}
              type="button"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
