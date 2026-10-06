import { ListChecks } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/States';
import { dueMeta, formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { DashboardSummary } from '@/types';

export const RecentTasks = ({ tasks }: { tasks: DashboardSummary['recentTasks'] }) => (
  <Card>
    <CardHeader
      title="Latest tasks"
      subtitle="Most recently created"
      action={
        <Link
          to="/tasks"
          className="text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          View all
        </Link>
      }
    />

    {tasks.length === 0 ? (
      <EmptyState
        icon={ListChecks}
        title="No tasks yet"
        description="Create your first task to see it appear here."
      />
    ) : (
      <ul className="divide-y divide-line">
        {tasks.map((task) => {
          const due = dueMeta(task.dueDate, task.status);

          return (
            <li key={task.id} className="px-5 py-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900">
                  {task.title}
                </p>
                <div className="flex items-center gap-1.5">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                </div>
              </div>
              <p className="mt-1 text-xs text-ink-500">
                {task.assignee ? task.assignee.name : 'Unassigned'} · {formatDate(task.dueDate)}
                <span
                  className={cn(
                    'ml-1.5 font-medium',
                    due.isOverdue
                      ? 'text-brand-800'
                      : due.isDueSoon
                        ? 'text-brand-600'
                        : 'text-ink-300',
                  )}
                >
                  {due.label}
                </span>
              </p>
            </li>
          );
        })}
      </ul>
    )}
  </Card>
);
