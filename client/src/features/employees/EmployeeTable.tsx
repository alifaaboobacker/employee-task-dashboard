import { ListChecks, Pencil, Trash2, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActiveBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState, TableSkeleton } from '@/components/ui/States';
import { formatDate } from '@/lib/date';
import type { Employee } from '@/types';

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
  hasFilters: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onCreate: () => void;
}

export const EmployeeTable = ({
  employees,
  isLoading,
  hasFilters,
  onEdit,
  onDelete,
  onCreate,
}: EmployeeTableProps) => {
  if (isLoading) return <TableSkeleton rows={6} columns={5} />;

  if (employees.length === 0) {
    return (
      <EmptyState
        icon={UserPlus}
        title={hasFilters ? 'No employees match these filters' : 'No employees yet'}
        description={
          hasFilters
            ? 'Try a different search term, department or status.'
            : 'Add your first employee to start assigning tasks.'
        }
        action={
          hasFilters ? undefined : (
            <Button onClick={onCreate} leftIcon={<UserPlus className="size-4" />}>
              Add employee
            </Button>
          )
        }
      />
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-surface/60 text-xs uppercase tracking-wide text-ink-500">
              <th className="px-5 py-3 font-medium">Employee</th>
              <th className="px-5 py-3 font-medium">Department</th>
              <th className="px-5 py-3 font-medium">Contact</th>
              <th className="px-5 py-3 font-medium">Tasks</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Added</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {employees.map((employee) => (
              <tr key={employee.id} className="transition-colors hover:bg-surface/70">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={employee.name} size="sm" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink-900">{employee.name}</p>
                      <p className="truncate text-xs text-ink-500">{employee.employeeCode}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <p className="text-ink-700">{employee.department}</p>
                  <p className="text-xs text-ink-500">{employee.designation}</p>
                </td>
                <td className="px-5 py-3.5">
                  <p className="truncate text-ink-700">{employee.email}</p>
                  <p className="text-xs text-ink-500">{employee.phone ?? '—'}</p>
                </td>
                <td className="px-5 py-3.5">
                  <Link
                    to={`/tasks?employeeId=${employee.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
                  >
                    <ListChecks className="size-3.5" aria-hidden />
                    {employee.taskCount}
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <ActiveBadge isActive={employee.isActive} />
                </td>
                <td className="px-5 py-3.5 text-xs text-ink-500">
                  {formatDate(employee.createdAt)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${employee.name}`}
                      onClick={() => onEdit(employee)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${employee.name}`}
                      onClick={() => onDelete(employee)}
                      className="hover:bg-brand-50 hover:text-brand-800"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-line md:hidden">
        {employees.map((employee) => (
          <li key={employee.id} className="space-y-3 px-4 py-4">
            <div className="flex items-start gap-3">
              <Avatar name={employee.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink-900">{employee.name}</p>
                <p className="truncate text-xs text-ink-500">
                  {employee.employeeCode} · {employee.designation}
                </p>
                <p className="mt-0.5 truncate text-xs text-ink-500">{employee.email}</p>
              </div>
              <ActiveBadge isActive={employee.isActive} />
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <span className="rounded-md bg-surface px-2 py-1">{employee.department}</span>
                <Link
                  to={`/tasks?employeeId=${employee.id}`}
                  className="rounded-md bg-brand-50 px-2 py-1 font-medium text-brand-700"
                >
                  {employee.taskCount} tasks
                </Link>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Edit ${employee.name}`}
                  onClick={() => onEdit(employee)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Remove ${employee.name}`}
                  onClick={() => onDelete(employee)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};
