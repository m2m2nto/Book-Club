import { ShieldCheck } from 'lucide-react';
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
    <div className="page-stack">
      <section className="grid gap-8 xl:grid-cols-[minmax(0,1.12fr)_20rem] xl:items-end">
        <div className="page-header fade-rise max-w-3xl">
          <p className="eyebrow text-[color:var(--color-text-accent)]">Admin utilities</p>
          <h1 className="editorial-title text-balance max-w-4xl">
            Export the live database with one explicit confirmation step.
          </h1>
          <p className="body-copy text-[1.02rem]">
            This includes sensitive session, reminder, and operational data, so
            the export flow should stay direct and deliberate.
          </p>
        </div>

        <div className="surface-base fade-rise px-5 py-5">
          <p className="eyebrow">Sensitive action</p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--color-text-accent)]">
            <ShieldCheck className="h-4 w-4" />
            Admin confirmation required
          </div>
        </div>
      </section>

      <section className="surface-base max-w-3xl px-6 py-6">
        <p className="text-sm leading-7 text-[color:var(--color-text-secondary)]">
          Download the live SQLite database, including session and reminder data.
          Confirm before exporting.
        </p>
        {error ? (
          <p className="mt-4 text-sm text-[color:var(--color-error-base)]">{error}</p>
        ) : null}
        {!confirming ? (
          <button
            className="pressable mt-5 rounded-[var(--radius-lg)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
            onClick={() => setConfirming(true)}
            type="button"
          >
            Export database
          </button>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[color:var(--color-canvas-subtle)] px-4 py-4 text-sm leading-7 text-[color:var(--color-text-secondary)]">
              You are about to download the full live database file. Continue only
              if you intend to handle the backup securely.
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                className="pressable rounded-[var(--radius-lg)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
                onClick={() => {
                  void handleConfirmDownload();
                }}
                type="button"
              >
                {isSubmitting ? 'Preparing download...' : 'Confirm download'}
              </button>
              <button
                className="pressable rounded-[var(--radius-lg)] border border-[color:var(--color-border-soft)] bg-[rgba(255,255,255,0.88)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-text-primary)] hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-canvas-subtle)]"
                onClick={() => setConfirming(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
