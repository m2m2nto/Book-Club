import { useState } from 'react';

export const AdminExportPage = () => {
  const [confirming, setConfirming] = useState(false);

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
            <a
              className="rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
              href="/api/admin/export-db"
            >
              Confirm download
            </a>
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
