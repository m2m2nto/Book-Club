import { Link } from 'react-router-dom';

export const NotFoundPage = () => {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-300">
        404
      </p>
      <h1 className="mt-4 text-4xl font-semibold text-white">Page not found</h1>
      <p className="mt-4 text-sm leading-6 text-slate-400">
        The page you were looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        className="mt-6 rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
        to="/"
      >
        Back to dashboard
      </Link>
    </div>
  );
};
