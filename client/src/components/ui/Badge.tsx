import type { ReactNode } from 'react';
import { PRIORITY_LABELS, PRIORITY_STYLES, STATUS_LABELS, STATUS_STYLES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { Priority, TaskStatus } from '@/types';

export const Badge = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
      className,
    )}
  >
    {children}
  </span>
);

export const StatusBadge = ({ status }: { status: TaskStatus }) => (
  <Badge className={STATUS_STYLES[status]}>{STATUS_LABELS[status]}</Badge>
);

export const PriorityBadge = ({ priority }: { priority: Priority }) => (
  <Badge className={PRIORITY_STYLES[priority]}>{PRIORITY_LABELS[priority]}</Badge>
);

export const ActiveBadge = ({ isActive }: { isActive: boolean }) => (
  <Badge
    className={
      isActive
        ? 'bg-mint-50 text-mint-700 ring-mint-200'
        : 'bg-surface text-ink-500 ring-line'
    }
  >
    <span
      className={cn('size-1.5 rounded-full', isActive ? 'bg-mint-500' : 'bg-ink-300')}
      aria-hidden
    />
    {isActive ? 'Active' : 'Inactive'}
  </Badge>
);
