import { ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/States';
import { STATUS_DOTS, STATUS_LABELS, STATUS_ORDER } from '@/lib/constants';
import { dueMeta, formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types';

interface TaskBoardProps {
  tasks: Task[];
  isLoading: boolean;
  pendingStatusId?: string;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  PENDING: 'IN_PROGRESS',
  IN_PROGRESS: 'COMPLETED',
  COMPLETED: 'PENDING',
};

export const TaskBoard = ({
  tasks,
  isLoading,
  pendingStatusId,
  onStatusChange,
  onEdit,
  onDelete,
}: TaskBoardProps) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 p-4 lg:grid-cols-3">
        {STATUS_ORDER.map((status) => (
          <div key={status} className="space-y-3">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4 lg:grid-cols-3">
      {STATUS_ORDER.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);

        return (
          <section key={status} className="rounded-xl bg-surface/70 p-3">
            <header className="mb-3 flex items-center gap-2 px-1">
              <span className={cn('size-2 rounded-full', STATUS_DOTS[status])} aria-hidden />
              <h3 className="text-sm font-semibold text-ink-900">{STATUS_LABELS[status]}</h3>
              <span className="ml-auto rounded-md bg-white px-2 py-0.5 text-xs font-medium text-ink-500 ring-1 ring-line">
                {columnTasks.length}
              </span>
            </header>

            {columnTasks.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line bg-white/60 px-3 py-6 text-center text-xs text-ink-300">
                Nothing here
              </p>
            ) : (
              <ul className="space-y-2.5">
                {columnTasks.map((task) => {
                  const due = dueMeta(task.dueDate, task.status);

                  return (
                    <li
                      key={task.id}
                      className="group rounded-xl border border-line bg-white p-3.5 shadow-sm transition-shadow hover:shadow-card"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug text-ink-900">
                          {task.title}
                        </p>
                        <PriorityBadge priority={task.priority} />
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        {task.assignee ? (
                          <>
                            <Avatar name={task.assignee.name} size="sm" />
                            <span className="min-w-0 truncate text-xs text-ink-500">
                              {task.assignee.name}
                            </span>
                          </>
                        ) : (
                          <span className="rounded-md bg-surface px-2 py-1 text-xs text-ink-500">
                            Unassigned
                          </span>
                        )}
                      </div>

                      <p
                        className={cn(
                          'mt-2.5 text-xs',
                          due.isOverdue
                            ? 'font-medium text-brand-800'
                            : due.isDueSoon
                              ? 'font-medium text-brand-600'
                              : 'text-ink-500',
                        )}
                      >
                        {formatDate(task.dueDate)} · {due.label}
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-1 border-t border-line pt-2.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={pendingStatusId === task.id}
                          onClick={() => onStatusChange(task, NEXT_STATUS[status])}
                          className="px-2 text-xs"
                        >
                          Move to {STATUS_LABELS[NEXT_STATUS[status]]}
                          <ArrowRight className="size-3.5" />
                        </Button>
                        <div className="flex gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${task.title}`}
                            onClick={() => onEdit(task)}
                            className="size-8"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ${task.title}`}
                            onClick={() => onDelete(task)}
                            className="size-8 hover:bg-brand-50 hover:text-brand-800"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
};
