import { http } from './http';
import { stripEmpty } from '@/lib/utils';
import type {
  AssignableEmployee,
  DeletionLog,
  DeletionReason,
  Employee,
  EmployeeFilters,
  Paginated,
} from '@/types';

export interface EmployeePayload {
  employeeCode: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  designation: string;
  isActive: boolean;
}

export interface DeleteEmployeePayload {
  reasonCategory: DeletionReason;
  reasonDetails: string;
}

export const fetchEmployees = async (filters: EmployeeFilters) => {
  const { data } = await http.get<Paginated<Employee> & { success: true }>('/employees', {
    params: stripEmpty(filters),
  });
  return { data: data.data, meta: data.meta };
};

export const fetchAssignableEmployees = async () => {
  const { data } = await http.get<{ success: true; data: AssignableEmployee[] }>(
    '/employees/assignable',
  );
  return data.data;
};

export const fetchDepartments = async () => {
  const { data } = await http.get<{ success: true; data: string[] }>(
    '/employees/departments',
  );
  return data.data;
};

export const fetchDeletionLogs = async (params: { page?: number; limit?: number }) => {
  const { data } = await http.get<Paginated<DeletionLog> & { success: true }>(
    '/employees/deletion-logs',
    { params: stripEmpty(params) },
  );
  return { data: data.data, meta: data.meta };
};

export const createEmployee = async (payload: EmployeePayload) => {
  const { data } = await http.post<{ success: true; data: Employee }>('/employees', payload);
  return data.data;
};

export const updateEmployee = async (id: string, payload: Partial<EmployeePayload>) => {
  const { data } = await http.put<{ success: true; data: Employee }>(
    `/employees/${id}`,
    payload,
  );
  return data.data;
};

export const deleteEmployee = async (id: string, payload: DeleteEmployeePayload) => {
  const { data } = await http.delete<{
    success: true;
    data: { id: string; name: string; unassignedTaskCount: number; openTasksUnassigned: number };
  }>(`/employees/${id}`, { data: payload });
  return data.data;
};
