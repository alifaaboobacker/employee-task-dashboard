export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type DeletionReason =
  | 'RESIGNED'
  | 'TERMINATED'
  | 'CONTRACT_ENDED'
  | 'TRANSFERRED'
  | 'DUPLICATE_RECORD'
  | 'OTHER';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string | null;
  department: string;
  designation: string;
  isActive: boolean;
  createdAt: string;
  taskCount: number;
}

export interface AssignableEmployee {
  id: string;
  name: string;
  employeeCode: string;
  department: string;
}

export interface TaskAssignee {
  id: string;
  name: string;
  employeeCode: string;
  department: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assignee: TaskAssignee | null;
}

export interface DeletionLog {
  id: string;
  employeeCode: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  reasonCategory: DeletionReason;
  reasonDetails: string;
  unassignedTaskCount: number;
  deletedAt: string;
  deletedBy: { name: string; email: string } | null;
}

export interface DashboardSummary {
  employees: { total: number; active: number; inactive: number };
  tasks: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    dueThisWeek: number;
    unassigned: number;
    completedThisWeek: number;
    completionRate: number;
  };
  byPriority: Record<Priority, number>;
  workload: {
    id: string;
    name: string;
    employeeCode: string;
    department: string;
    openTasks: number;
  }[];
  recentTasks: {
    id: string;
    title: string;
    status: TaskStatus;
    priority: Priority;
    dueDate: string;
    createdAt: string;
    assignee: { id: string; name: string } | null;
  }[];
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: 'active' | 'inactive';
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'employeeCode' | 'department' | 'createdAt';
  order?: 'asc' | 'desc';
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: Priority;
  employeeId?: string;
  unassigned?: boolean;
  overdue?: boolean;
  dueFrom?: string;
  dueTo?: string;
  page?: number;
  limit?: number;
  sortBy?: 'dueDate' | 'createdAt' | 'priority' | 'status' | 'title';
  order?: 'asc' | 'desc';
}
