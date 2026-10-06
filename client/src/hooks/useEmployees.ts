import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as employeeApi from '@/api/employees';
import { ApiError } from '@/api/http';
import type { EmployeeFilters } from '@/types';

const keys = {
  all: ['employees'] as const,
  list: (filters: EmployeeFilters) => ['employees', 'list', filters] as const,
  assignable: ['employees', 'assignable'] as const,
  departments: ['employees', 'departments'] as const,
  deletionLogs: (page: number) => ['employees', 'deletion-logs', page] as const,
};

const notifyError = (error: unknown, fallback: string) => {
  toast.error(error instanceof ApiError ? error.message : fallback);
};

export const useEmployeesQuery = (filters: EmployeeFilters) =>
  useQuery({
    queryKey: keys.list(filters),
    queryFn: () => employeeApi.fetchEmployees(filters),
    placeholderData: (previous) => previous,
  });

export const useAssignableEmployeesQuery = () =>
  useQuery({
    queryKey: keys.assignable,
    queryFn: employeeApi.fetchAssignableEmployees,
    staleTime: 60_000,
  });

export const useDepartmentsQuery = () =>
  useQuery({
    queryKey: keys.departments,
    queryFn: employeeApi.fetchDepartments,
    staleTime: 60_000,
  });

export const useDeletionLogsQuery = (page: number, enabled: boolean) =>
  useQuery({
    queryKey: keys.deletionLogs(page),
    queryFn: () => employeeApi.fetchDeletionLogs({ page, limit: 8 }),
    enabled,
  });

const useInvalidateEmployees = () => {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: keys.all });
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    void queryClient.invalidateQueries({ queryKey: ['tasks'] });
  };
};

export const useCreateEmployee = () => {
  const invalidate = useInvalidateEmployees();

  return useMutation({
    mutationFn: employeeApi.createEmployee,
    onSuccess: (employee) => {
      invalidate();
      toast.success(`${employee.name} added to the directory`);
    },
    onError: (error) => notifyError(error, 'Could not add the employee'),
  });
};

export const useUpdateEmployee = () => {
  const invalidate = useInvalidateEmployees();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<employeeApi.EmployeePayload> }) =>
      employeeApi.updateEmployee(id, payload),
    onSuccess: (employee) => {
      invalidate();
      toast.success(`${employee.name} updated`);
    },
    onError: (error) => notifyError(error, 'Could not update the employee'),
  });
};

export const useDeleteEmployee = () => {
  const invalidate = useInvalidateEmployees();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: employeeApi.DeleteEmployeePayload }) =>
      employeeApi.deleteEmployee(id, payload),
    onSuccess: (result) => {
      invalidate();
      toast.success(
        result.unassignedTaskCount > 0
          ? `${result.name} removed. ${result.unassignedTaskCount} task(s) are now unassigned.`
          : `${result.name} removed from the directory`,
      );
    },
    onError: (error) => notifyError(error, 'Could not remove the employee'),
  });
};
