import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
    <p className="text-5xl font-semibold text-brand-600">404</p>
    <div>
      <h1 className="text-lg font-semibold text-ink-900">Page not found</h1>
      <p className="mt-1 text-sm text-ink-500">
        The page you were looking for does not exist or has moved.
      </p>
    </div>
    <Link
      to="/dashboard"
      className="inline-flex h-10 items-center rounded-lg bg-brand-600 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-700"
    >
      Back to overview
    </Link>
  </div>
);

export default NotFoundPage;
