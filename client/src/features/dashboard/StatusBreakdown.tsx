import { Link } from 'react-router-dom';
import { Card, CardHeader } from '@/components/ui/Card';
import { PRIORITY_LABELS, PRIORITY_ORDER, STATUS_LABELS, STATUS_ORDER } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { DashboardSummary } from '@/types';

const STATUS_BARS: Record<string, string> = {
  PENDING: 'bg-brand-300',
  IN_PROGRESS: 'bg-brand-600',
  COMPLETED: 'bg-mint-500',
};

const PRIORITY_BARS: Record<string, string> = {
  HIGH: 'bg-brand-800',
  MEDIUM: 'bg-brand-400',
  LOW: 'bg-mint-400',
};

interface MeterRowProps {
  label: string;
  value: number;
  total: number;
  barClass: string;
  to: string;
}

const MeterRow = ({ label, value, total, barClass, to }: MeterRowProps) => {
  const percent = total === 0 ? 0 : Math.round((value / total) * 100);

  return (
    <Link to={to} className="group block rounded-lg px-1 py-2 transition-colors hover:bg-surface">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-ink-700 group-hover:text-brand-700">{label}</span>
        <span className="tabular-nums text-ink-500">
          {value} <span className="text-ink-300">({percent}%)</span>
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-50">
        <div
          className={cn('h-full rounded-full transition-[width] duration-500', barClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </Link>
  );
};

export const StatusBreakdown = ({ summary }: { summary: DashboardSummary }) => (
  <div className="grid gap-5 lg:grid-cols-2">
    <Card>
      <CardHeader title="Tasks by status" subtitle="Select a row to open it in the task list" />
      <div className="space-y-1 px-4 py-3">
        {STATUS_ORDER.map((status) => (
          <MeterRow
            key={status}
            label={STATUS_LABELS[status]}
            value={
              status === 'PENDING'
                ? summary.tasks.pending
                : status === 'IN_PROGRESS'
                  ? summary.tasks.inProgress
                  : summary.tasks.completed
            }
            total={summary.tasks.total}
            barClass={STATUS_BARS[status] ?? 'bg-brand-400'}
            to={`/tasks?status=${status}`}
          />
        ))}
      </div>
    </Card>

    <Card>
      <CardHeader title="Tasks by priority" subtitle="Across every open and closed task" />
      <div className="space-y-1 px-4 py-3">
        {PRIORITY_ORDER.map((priority) => (
          <MeterRow
            key={priority}
            label={PRIORITY_LABELS[priority]}
            value={summary.byPriority[priority]}
            total={summary.tasks.total}
            barClass={PRIORITY_BARS[priority] ?? 'bg-brand-400'}
            to={`/tasks?priority=${priority}`}
          />
        ))}
      </div>
    </Card>
  </div>
);
