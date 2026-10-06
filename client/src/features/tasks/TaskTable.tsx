import { ListPlus, Pencil, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState, TableSkeleton } from '@/components/ui/States';
import { dueMeta, formatDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import { StatusSelect } from './StatusSelect';
import type { Task, TaskStatus } from '@/types';

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  hasFilters: boolean;
  pendingStatusId?: string;
  onStatusChange: (task: Task, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onCreate: () => void;
}

export const TaskTable = ({
  tasks,
  isLoading,
  hasFilters,
  pendingStatusId,
  onStatusChange,
  onEdit,
  onDelete,
  onCreate,
}: TaskTableProps) => {
  if (isLoading) return <TableSkeleton rows={6} columns={5} />;

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={ListPlus}
        title={hasFilters ? 'No tasks match these filters' : 'No tasks yet'}
        description={
          hasFilters
            ? 'Adjust the status, employee or priority filters to widen the search.'
            : 'Create a task and assign it to an employee to get started.'
        }
        action={
          hasFilters ? undefined : (
            <Button onClick={onCreate} leftIcon={<ListPlus className="size-4" />}>
              Create task
            </Button>
          )
        }
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface/60 text-xs uppercase tracking-wide text-ink-500">
              <th className="px-5 py-3 font-medium">Task</th>
              <th className="px-5 py-3 font-medium">Assignee</th>
              <th className="px-5 py-3 font-medium">Priority</th>
              <th className="px-5 py-3 font-medium">Due</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tasks.map((task) => {
              const due = dueMeta(task.dueDate, task.status);

              return (
                <tr key={task.id} className="transition-colors hover:bg-surface/70">
                  <td className="max-w-80 px-5 py-3.5">
                    <p className="truncate font-medium text-ink-900">{task.title}</p>
                    {task.description ? (
                      <p className="truncate text-xs text-ink-500">{task.description}</p>
                    ) : null}
                  </td>
                  <td className="px-5 py-3.5">
                    {task.assignee ? (
                      <div className="flex items-center gap-2.5">
                        <Avatar name={task.assignee.name} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-ink-700">{task.assignee.name}</p>
                          <p className="truncate text-xs text-ink-500">
                            {task.assignee.department}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="rounded-md bg-surface px-2 py-1 text-xs text-ink-500">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-ink-700">{formatDate(task.dueDate)}</p>
                    <p
                      className={cn(
                        'text-xs',
                        due.isOverdue
                          ? 'font-medium text-brand-800'
                          : due.isDueSoon
                            ? 'font-medium text-brand-600'
                            : 'text-ink-500',
                      )}
                    >
                      {due.label}
                    </p>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusSelect
                      value={task.status}
                      disabled={pendingStatusId === task.id}
                      onChange={(status) => onStatusChange(task, status)}
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${task.title}`}
                        onClick={() => onEdit(task)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${task.title}`}
                        onClick={() => onDelete(task)}
                        className="hover:bg-brand-50 hover:text-brand-800"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line lg:hidden">
        {tasks.map((task) => {
          const due = dueMeta(task.dueDate, task.status);

          return (
            <li key={task.id} className="space-y-3 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">{task.title}</p>
                  {task.description ? (
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-ink-500">
                      {task.description}
                    </p>
                  ) : null}
                </div>
                <PriorityBadge priority={task.priority} />
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
                <span>{task.assignee ? task.assignee.name : 'Unassigned'}</span>
                <span aria-hidden>·</span>
                <span>{formatDate(task.dueDate)}</span>
                <span
                  className={cn(
                    'font-medium',
                    due.isOverdue
                      ? 'text-brand-800'
                      : due.isDueSoon
                        ? 'text-brand-600'
                        : 'text-ink-300',
                  )}
                >
                  {due.label}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <StatusSelect
                  value={task.status}
                  disabled={pendingStatusId === task.id}
                  onChange={(status) => onStatusChange(task, status)}
                />
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Edit ${task.title}`}
                    onClick={() => onEdit(task)}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`Delete ${task.title}`}
                    onClick={() => onDelete(task)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
};
