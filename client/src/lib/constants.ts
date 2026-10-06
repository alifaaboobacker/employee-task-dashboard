import type { DeletionReason, Priority, TaskStatus } from '@/types';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
};

export const STATUS_ORDER: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

export const STATUS_STYLES: Record<TaskStatus, string> = {
  PENDING: 'bg-brand-50 text-brand-700 ring-brand-200',
  IN_PROGRESS: 'bg-brand-100 text-brand-800 ring-brand-300',
  COMPLETED: 'bg-mint-50 text-mint-700 ring-mint-200',
};

export const STATUS_DOTS: Record<TaskStatus, string> = {
  PENDING: 'bg-brand-300',
  IN_PROGRESS: 'bg-brand-600',
  COMPLETED: 'bg-mint-500',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const PRIORITY_ORDER: Priority[] = ['HIGH', 'MEDIUM', 'LOW'];

export const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: 'bg-mint-50 text-mint-700 ring-mint-200',
  MEDIUM: 'bg-brand-50 text-brand-700 ring-brand-200',
  HIGH: 'bg-brand-800 text-white ring-brand-800',
};

export const DELETION_REASON_LABELS: Record<DeletionReason, string> = {
  RESIGNED: 'Resigned',
  TERMINATED: 'Terminated',
  CONTRACT_ENDED: 'Contract ended',
  TRANSFERRED: 'Transferred',
  DUPLICATE_RECORD: 'Duplicate record',
  OTHER: 'Other',
};

export const PAGE_SIZE = 10;
