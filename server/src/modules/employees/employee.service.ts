import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { buildMeta, toSkipTake } from '../../utils/pagination.js';
import type {
  CreateEmployeeInput,
  DeleteEmployeeInput,
  ListDeletionLogsQuery,
  ListEmployeesQuery,
  UpdateEmployeeInput,
} from './employee.schema.js';

const listSelect = {
  id: true,
  employeeCode: true,
  name: true,
  email: true,
  phone: true,
  department: true,
  designation: true,
  isActive: true,
  createdAt: true,
  _count: { select: { tasks: true } },
} satisfies Prisma.EmployeeSelect;

type EmployeeRow = Prisma.EmployeeGetPayload<{ select: typeof listSelect }>;

const toEmployee = ({ _count, ...employee }: EmployeeRow) => ({
  ...employee,
  taskCount: _count.tasks,
});

const buildWhere = (query: ListEmployeesQuery): Prisma.EmployeeWhereInput => ({
  ...(query.department ? { department: { equals: query.department, mode: 'insensitive' } } : {}),
  ...(query.status ? { isActive: query.status === 'active' } : {}),
  ...(query.search
    ? {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { employeeCode: { contains: query.search, mode: 'insensitive' } },
          { designation: { contains: query.search, mode: 'insensitive' } },
        ],
      }
    : {}),
});

export const listEmployees = async (query: ListEmployeesQuery) => {
  const where = buildWhere(query);

  const [rows, total] = await prisma.$transaction([
    prisma.employee.findMany({
      where,
      select: listSelect,
      orderBy: { [query.sortBy]: query.order },
      ...toSkipTake(query),
    }),
    prisma.employee.count({ where }),
  ]);

  return { data: rows.map(toEmployee), meta: buildMeta(query, total) };
};

export const listDepartments = async () => {
  const rows = await prisma.employee.findMany({
    distinct: ['department'],
    select: { department: true },
    orderBy: { department: 'asc' },
  });

  return rows.map((row) => row.department);
};

export const listAssignableEmployees = async () =>
  prisma.employee.findMany({
    where: { isActive: true },
    select: { id: true, name: true, employeeCode: true, department: true },
    orderBy: { name: 'asc' },
  });

export const getEmployeeById = async (id: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id },
    select: {
      ...listSelect,
      updatedAt: true,
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
        },
        orderBy: { dueDate: 'asc' },
        take: 20,
      },
    },
  });

  if (!employee) {
    throw AppError.notFound('Employee not found');
  }

  const { tasks, updatedAt, ...rest } = employee;
  return { ...toEmployee(rest), updatedAt, tasks };
};

export const createEmployee = async (input: CreateEmployeeInput) =>
  toEmployee(await prisma.employee.create({ data: input, select: listSelect }));

export const updateEmployee = async (id: string, input: UpdateEmployeeInput) =>
  toEmployee(await prisma.employee.update({ where: { id }, data: input, select: listSelect }));

export const deleteEmployee = async (
  id: string,
  input: DeleteEmployeeInput,
  deletedById: string,
) =>
  prisma.$transaction(async (tx) => {
    const employee = await tx.employee.findUnique({
      where: { id },
      select: {
        id: true,
        employeeCode: true,
        name: true,
        email: true,
        department: true,
        _count: { select: { tasks: true } },
      },
    });

    if (!employee) {
      throw AppError.notFound('Employee not found');
    }

    const openTasks = await tx.task.count({
      where: { assigneeId: id, status: { not: 'COMPLETED' } },
    });

    await tx.employeeDeletionLog.create({
      data: {
        employeeId: employee.id,
        employeeCode: employee.employeeCode,
        employeeName: employee.name,
        employeeEmail: employee.email,
        department: employee.department,
        reasonCategory: input.reasonCategory,
        reasonDetails: input.reasonDetails,
        unassignedTaskCount: employee._count.tasks,
        deletedById,
      },
    });

    await tx.employee.delete({ where: { id } });

    return {
      id: employee.id,
      name: employee.name,
      unassignedTaskCount: employee._count.tasks,
      openTasksUnassigned: openTasks,
    };
  });

export const listDeletionLogs = async (query: ListDeletionLogsQuery) => {
  const [data, total] = await prisma.$transaction([
    prisma.employeeDeletionLog.findMany({
      select: {
        id: true,
        employeeCode: true,
        employeeName: true,
        employeeEmail: true,
        department: true,
        reasonCategory: true,
        reasonDetails: true,
        unassignedTaskCount: true,
        deletedAt: true,
        deletedBy: { select: { name: true, email: true } },
      },
      orderBy: { deletedAt: 'desc' },
      ...toSkipTake(query),
    }),
    prisma.employeeDeletionLog.count(),
  ]);

  return { data, meta: buildMeta(query, total) };
};
