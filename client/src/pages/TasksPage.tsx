import { ListPlus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Pagination } from '@/components/ui/Pagination';
import { TaskBoard } from '@/features/tasks/TaskBoard';
import { TaskFilters } from '@/features/tasks/TaskFilters';
import { TaskFormModal } from '@/features/tasks/TaskFormModal';
import { TaskTable } from '@/features/tasks/TaskTable';
import { useAssignableEmployeesQuery } from '@/hooks/useEmployees';
import { useDebounce } from '@/hooks/useDebounce';
import { useDeleteTask, useTasksQuery, useUpdateTaskStatus } from '@/hooks/useTasks';
import { PAGE_SIZE } from '@/lib/constants';
import type { Priority, Task, TaskFilters as Filters, TaskStatus } from '@/types';

const PARAM_KEYS = [
  'search',
  'status',
  'priority',
  'employeeId',
  'unassigned',
  'overdue',
  'sortBy',
  'order',
  'page',
] as const;

const STATUS_VALUES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
const PRIORITY_VALUES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

export const TasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '');
  const debouncedSearch = useDebounce(searchTerm);

  const [view, setView] = useState<'table' | 'board'>('table');
  const [formState, setFormState] = useState<{ open: boolean; task: Task | null }>({
    open: false,
    task: null,
  });
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const deleteTask = useDeleteTask();
  const updateStatus = useUpdateTaskStatus();
  const { data: employees = [] } = useAssignableEmployeesQuery();

  const updateParams = useCallback(
    (patch: Record<string, string | undefined>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(patch)) {
            if (value) next.set(key, value);
            else next.delete(key);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const lastSyncedSearch = useRef(debouncedSearch);

  useEffect(() => {
    if (lastSyncedSearch.current === debouncedSearch) return;
    lastSyncedSearch.current = debouncedSearch;
    updateParams({ search: debouncedSearch || undefined, page: undefined });
  }, [debouncedSearch, updateParams]);

  const statusParam = searchParams.get('status');
  const priorityParam = searchParams.get('priority');
  const pageParam = Number(searchParams.get('page') ?? 1);

  const filters = useMemo<Filters>(() => {
    const status = STATUS_VALUES.find((value) => value === statusParam);
    const priority = PRIORITY_VALUES.find((value) => value === priorityParam);

    return {
      page: Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1,
      limit: view === 'board' ? 60 : PAGE_SIZE,
      sortBy: (searchParams.get('sortBy') as Filters['sortBy']) ?? 'dueDate',
      order: (searchParams.get('order') as Filters['order']) ?? 'asc',
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(searchParams.get('employeeId') ? { employeeId: searchParams.get('employeeId')! } : {}),
      ...(searchParams.get('unassigned') === 'true' ? { unassigned: true } : {}),
      ...(searchParams.get('overdue') === 'true' ? { overdue: true } : {}),
    };
  }, [searchParams, statusParam, priorityParam, pageParam, debouncedSearch, view]);

  const { data, isPending, isFetching } = useTasksQuery(filters);

  const activeFilterCount = [
    filters.search,
    filters.status,
    filters.priority,
    filters.employeeId,
    filters.unassigned,
    filters.overdue,
  ].filter(Boolean).length;

  const handleFilterChange = (patch: Partial<Filters>) => {
    updateParams(
      Object.fromEntries(
        Object.entries(patch).map(([key, value]) => [
          key,
          value === undefined || value === false ? undefined : String(value),
        ]),
      ),
    );
  };

  const resetFilters = () => {
    setSearchTerm('');
    updateParams(Object.fromEntries(PARAM_KEYS.map((key) => [key, undefined])));
  };

  const handleViewChange = (nextView: 'table' | 'board') => {
    setView(nextView);
    updateParams({ page: undefined });
  };

  const handleStatusChange = (task: Task, status: TaskStatus) => {
    if (status !== task.status) updateStatus.mutate({ id: task.id, status });
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    await deleteTask.mutateAsync(taskToDelete.id).catch(() => null);
    setTaskToDelete(null);
  };

  const isLoading = isPending || (isFetching && !data);
  const pendingStatusId = updateStatus.isPending ? updateStatus.variables?.id : undefined;

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Create work, assign it, and track progress from pending to completed."
        actions={
          <Button
            onClick={() => setFormState({ open: true, task: null })}
            leftIcon={<ListPlus className="size-4" />}
          >
            Create task
          </Button>
        }
      />

      <TaskFilters
        filters={filters}
        employees={employees}
        searchTerm={searchTerm}
        view={view}
        activeCount={activeFilterCount}
        onSearchChange={setSearchTerm}
        onChange={handleFilterChange}
        onReset={resetFilters}
        onViewChange={handleViewChange}
      />

      <Card className="overflow-hidden">
        {view === 'table' ? (
          <>
            <TaskTable
              tasks={data?.data ?? []}
              isLoading={isLoading}
              hasFilters={activeFilterCount > 0}
              pendingStatusId={pendingStatusId}
              onStatusChange={handleStatusChange}
              onEdit={(task) => setFormState({ open: true, task })}
              onDelete={setTaskToDelete}
              onCreate={() => setFormState({ open: true, task: null })}
            />
            {data ? (
              <Pagination
                meta={data.meta}
                onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
              />
            ) : null}
          </>
        ) : (
          <TaskBoard
            tasks={data?.data ?? []}
            isLoading={isLoading}
            pendingStatusId={pendingStatusId}
            onStatusChange={handleStatusChange}
            onEdit={(task) => setFormState({ open: true, task })}
            onDelete={setTaskToDelete}
          />
        )}
      </Card>

      <TaskFormModal
        open={formState.open}
        task={formState.task}
        employees={employees}
        defaultEmployeeId={filters.employeeId}
        onClose={() => setFormState({ open: false, task: null })}
      />

      <ConfirmDialog
        open={Boolean(taskToDelete)}
        title="Delete task"
        description={taskToDelete ? `"${taskToDelete.title}" will be removed permanently.` : ''}
        confirmLabel="Delete task"
        isLoading={deleteTask.isPending}
        onConfirm={confirmDelete}
        onClose={() => setTaskToDelete(null)}
      />
    </>
  );
};

export default TasksPage;
