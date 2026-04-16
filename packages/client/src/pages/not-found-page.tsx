import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
      <p className="eyebrow text-[color:var(--color-text-accent)]">404</p>
      <h1 className="editorial-title mt-4 text-balance max-w-3xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-xl text-sm leading-7 text-[color:var(--color-text-secondary)]">
        The page you were looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        className="pressable mt-6 rounded-[var(--radius-lg)] border border-[color:var(--color-accent-primary)] bg-[color:var(--color-accent-primary)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-text-inverse)] hover:bg-[color:var(--color-accent-primary-hover)]"
        to="/"
      >
        Back to dashboard
      </Link>
    </div>
  );
};
