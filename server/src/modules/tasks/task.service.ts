import type { Prisma, TaskStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../utils/AppError.js';
import { buildMeta, toSkipTake } from '../../utils/pagination.js';
import type {
  CreateTaskInput,
  ListTasksQuery,
  UpdateTaskInput,
  UpdateTaskStatusInput,
} from './task.schema.js';

const taskSelect = {
  id: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  dueDate: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
  assignee: {
    select: { id: true, name: true, employeeCode: true, department: true },
  },
} satisfies Prisma.TaskSelect;

const startOfToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const completionPatch = (status: TaskStatus) => ({
  completedAt: status === 'COMPLETED' ? new Date() : null,
});

const ensureAssigneeExists = async (assigneeId: string) => {
  const employee = await prisma.employee.findUnique({
    where: { id: assigneeId },
    select: { id: true, isActive: true },
  });

  if (!employee) {
    throw AppError.badRequest('The selected employee does not exist');
  }
  if (!employee.isActive) {
    throw AppError.badRequest('Tasks cannot be assigned to an inactive employee');
  }
};

const buildWhere = (query: ListTasksQuery): Prisma.TaskWhereInput => {
  const dueDate: Prisma.DateTimeFilter = {};

  if (query.dueFrom) dueDate.gte = new Date(`${query.dueFrom}T00:00:00.000Z`);
  if (query.dueTo) dueDate.lte = new Date(`${query.dueTo}T00:00:00.000Z`);
  if (query.overdue) dueDate.lt = startOfToday();

  return {
    ...(query.status
      ? { status: query.status }
      : query.overdue
        ? { status: { not: 'COMPLETED' } }
        : {}),
    ...(query.priority ? { priority: query.priority } : {}),
    ...(query.employeeId ? { assigneeId: query.employeeId } : {}),
    ...(query.unassigned ? { assigneeId: null } : {}),
    ...(Object.keys(dueDate).length > 0 ? { dueDate } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { assignee: { name: { contains: query.search, mode: 'insensitive' } } },
          ],
        }
      : {}),
  };
};

const buildOrderBy = (query: ListTasksQuery): Prisma.TaskOrderByWithRelationInput[] => [
  { [query.sortBy]: query.order },
  ...(query.sortBy === 'dueDate' ? [] : [{ dueDate: 'asc' as const }]),
];

export const listTasks = async (query: ListTasksQuery) => {
  const where = buildWhere(query);

  const [data, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      select: taskSelect,
      orderBy: buildOrderBy(query),
      ...toSkipTake(query),
    }),
    prisma.task.count({ where }),
  ]);

  return { data, meta: buildMeta(query, total) };
};

export const getTaskById = async (id: string) => {
  const task = await prisma.task.findUnique({
    where: { id },
    select: { ...taskSelect, createdBy: { select: { name: true, email: true } } },
  });

  if (!task) {
    throw AppError.notFound('Task not found');
  }

  return task;
};

export const createTask = async (input: CreateTaskInput, createdById: string) => {
  if (input.assigneeId) {
    await ensureAssigneeExists(input.assigneeId);
  }

  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      priority: input.priority,
      status: input.status,
      dueDate: new Date(`${input.dueDate}T00:00:00.000Z`),
      assigneeId: input.assigneeId ?? null,
      createdById,
      ...completionPatch(input.status),
    },
    select: taskSelect,
  });
};

export const updateTask = async (id: string, input: UpdateTaskInput) => {
  if (input.assigneeId) {
    await ensureAssigneeExists(input.assigneeId);
  }

  const data: Prisma.TaskUpdateInput = {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description ?? null } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.dueDate !== undefined
      ? { dueDate: new Date(`${input.dueDate}T00:00:00.000Z`) }
      : {}),
    ...(input.assigneeId !== undefined
      ? {
          assignee: input.assigneeId
            ? { connect: { id: input.assigneeId } }
            : { disconnect: true },
        }
      : {}),
    ...(input.status !== undefined
      ? { status: input.status, ...completionPatch(input.status) }
      : {}),
  };

  return prisma.task.update({ where: { id }, data, select: taskSelect });
};

export const updateTaskStatus = async (id: string, { status }: UpdateTaskStatusInput) =>
  prisma.task.update({
    where: { id },
    data: { status, ...completionPatch(status) },
    select: taskSelect,
  });

export const deleteTask = async (id: string) => {
  await prisma.task.delete({ where: { id } });
  return { id };
};
