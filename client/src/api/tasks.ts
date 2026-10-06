import { http } from './http';
import { stripEmpty } from '@/lib/utils';
import type { Paginated, Priority, Task, TaskFilters, TaskStatus } from '@/types';

export interface TaskPayload {
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  assigneeId: string | null;
}

export const fetchTasks = async (filters: TaskFilters) => {
  const { data } = await http.get<Paginated<Task> & { success: true }>('/tasks', {
    params: stripEmpty(filters),
  });
  return { data: data.data, meta: data.meta };
};

export const createTask = async (payload: TaskPayload) => {
  const { data } = await http.post<{ success: true; data: Task }>('/tasks', payload);
  return data.data;
};

export const updateTask = async (id: string, payload: Partial<TaskPayload>) => {
  const { data } = await http.put<{ success: true; data: Task }>(`/tasks/${id}`, payload);
  return data.data;
};

export const updateTaskStatus = async (id: string, status: TaskStatus) => {
  const { data } = await http.patch<{ success: true; data: Task }>(`/tasks/${id}/status`, {
    status,
  });
  return data.data;
};

export const deleteTask = async (id: string) => {
  const { data } = await http.delete<{ success: true; data: { id: string } }>(`/tasks/${id}`);
  return data.data;
};
