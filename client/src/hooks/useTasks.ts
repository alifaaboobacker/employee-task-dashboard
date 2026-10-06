import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiError } from '@/api/http';
import * as taskApi from '@/api/tasks';
import { STATUS_LABELS } from '@/lib/constants';
import type { TaskFilters, TaskStatus } from '@/types';

const keys = {
  all: ['tasks'] as const,
  list: (filters: TaskFilters) => ['tasks', 'list', filters] as const,
};

const notifyError = (error: unknown, fallback: string) => {
  toast.error(error instanceof ApiError ? error.message : fallback);
};

export const useTasksQuery = (filters: TaskFilters) =>
  useQuery({
    queryKey: keys.list(filters),
    queryFn: () => taskApi.fetchTasks(filters),
    placeholderData: (previous) => previous,
  });

const useInvalidateTasks = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: keys.all });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    void queryClient.invalidateQueries({ queryKey: ['employees'] });
  };
};

export const useCreateTask = () => {
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: (task) => {
      invalidate();
      toast.success(`Task "${task.title}" created`);
    },
    onError: (error) => notifyError(error, 'Could not create the task'),
  });
};

export const useUpdateTask = () => {
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<taskApi.TaskPayload> }) =>
      taskApi.updateTask(id, payload),
    onSuccess: (task) => {
      invalidate();
      toast.success(`Task "${task.title}" updated`);
    },
    onError: (error) => notifyError(error, 'Could not update the task'),
  });
};

export const useUpdateTaskStatus = () => {
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      taskApi.updateTaskStatus(id, status),
    onSuccess: (task) => {
      invalidate();
      toast.success(`Moved to ${STATUS_LABELS[task.status]}`);
    },
    onError: (error) => notifyError(error, 'Could not change the status'),
  });
};

export const useDeleteTask = () => {
  const invalidate = useInvalidateTasks();

  return useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      invalidate();
      toast.success('Task deleted');
    },
    onError: (error) => notifyError(error, 'Could not delete the task'),
  });
};
