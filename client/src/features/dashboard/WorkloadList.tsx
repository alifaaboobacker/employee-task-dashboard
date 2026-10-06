import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import type { DashboardSummary } from '@/types';

export const WorkloadList = ({ workload }: { workload: DashboardSummary['workload'] }) => {
  const peak = Math.max(...workload.map((row) => row.openTasks), 1);

  return (
    <Card>
      <CardHeader title="Open workload" subtitle="Employees with unfinished tasks" />

      {workload.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No open workload"
          description="Every assigned task has been completed."
        />
      ) : (
        <ul className="divide-y divide-line">
          {workload.map((row) => (
            <li key={row.id}>
              <Link
                to={`/tasks?employeeId=${row.id}`}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface"
              >
                <Avatar name={row.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">{row.name}</p>
                  <p className="truncate text-xs text-ink-500">
                    {row.employeeCode} · {row.department}
                  </p>
                </div>
                <div className="flex w-28 items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-50">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(row.openTasks / peak) * 100}%` }}
                    />
                  </div>
                  <span className="w-5 text-right text-sm font-semibold tabular-nums text-ink-700">
                    {row.openTasks}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
