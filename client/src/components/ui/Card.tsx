import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Card = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => <section className={cn('card-surface', className)}>{children}</section>;

export const CardHeader = ({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) => (
  <header
    className={cn(
      'flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4',
      className,
    )}
  >
    <div className="min-w-0">
      <h2 className="text-base font-semibold text-ink-900">{title}</h2>
      {subtitle ? <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p> : null}
    </div>
    {action}
  </header>
);
