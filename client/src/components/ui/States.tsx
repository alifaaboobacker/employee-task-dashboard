import { Inbox, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-md bg-brand-50', className)} />
);

export const TableSkeleton = ({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) => (
  <div className="divide-y divide-line">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4 px-5 py-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((__, columnIndex) => (
          <Skeleton key={columnIndex} className={cn('h-4', columnIndex === 0 && 'w-3/4')} />
        ))}
      </div>
    ))}
  </div>
);

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
    <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-brand-50 text-brand-500">
      <Icon className="size-5.5" aria-hidden />
    </span>
    <p className="text-sm font-semibold text-ink-900">{title}</p>
    {description ? (
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-500">{description}</p>
    ) : null}
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
);
