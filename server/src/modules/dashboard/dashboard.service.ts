import type { Priority, TaskStatus } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';

const STATUSES: TaskStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH'];

const utcStartOfToday = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

const addDays = (date: Date, days: number) =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const countByKey = <T extends string>(
  groups: { key: T; count: number }[],
  keys: readonly T[],
) => {
  const totals = Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
  for (const group of groups) {
    totals[group.key] = group.count;
  }
  return totals;
};

export const getSummary = async () => {
  const today = utcStartOfToday();
  const weekEnd = addDays(today, 7);
  const lastWeek = addDays(today, -7);

  return prisma.$transaction(async (tx) => {
    const [
      totalEmployees,
      activeEmployees,
      totalTasks,
      statusGroups,
      priorityGroups,
      overdue,
      dueThisWeek,
      unassigned,
      completedThisWeek,
      workloadGroups,
      recentTasks,
    ] = await Promise.all([
      tx.employee.count(),
      tx.employee.count({ where: { isActive: true } }),
      tx.task.count(),
      tx.task.groupBy({ by: ['status'], _count: { _all: true }, orderBy: undefined }),
      tx.task.groupBy({ by: ['priority'], _count: { _all: true }, orderBy: undefined }),
      tx.task.count({ where: { dueDate: { lt: today }, status: { not: 'COMPLETED' } } }),
      tx.task.count({
        where: { dueDate: { gte: today, lt: weekEnd }, status: { not: 'COMPLETED' } },
      }),
      tx.task.count({ where: { assigneeId: null } }),
      tx.task.count({ where: { status: 'COMPLETED', completedAt: { gte: lastWeek } } }),
      tx.task.groupBy({
        by: ['assigneeId'],
        where: { assigneeId: { not: null }, status: { not: 'COMPLETED' } },
        _count: { _all: true },
        orderBy: { _count: { assigneeId: 'desc' } },
        take: 6,
      }),
      tx.task.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          createdAt: true,
          assignee: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ]);

    const workloadIds = workloadGroups
      .map((group) => group.assigneeId)
      .filter((id): id is string => id !== null);

    const workloadEmployees = workloadIds.length
      ? await tx.employee.findMany({
          where: { id: { in: workloadIds } },
          select: { id: true, name: true, employeeCode: true, department: true },
        })
      : [];

    const employeeById = new Map(
      workloadEmployees.map((employee) => [employee.id, employee] as const),
    );

    const byStatus = countByKey(
      statusGroups.map((group) => ({ key: group.status, count: group._count._all })),
      STATUSES,
    );

    return {
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: totalEmployees - activeEmployees,
      },
      tasks: {
        total: totalTasks,
        pending: byStatus.PENDING,
        inProgress: byStatus.IN_PROGRESS,
        completed: byStatus.COMPLETED,
        overdue,
        dueThisWeek,
        unassigned,
        completedThisWeek,
        completionRate:
          totalTasks === 0 ? 0 : Math.round((byStatus.COMPLETED / totalTasks) * 100),
      },
      byPriority: countByKey(
        priorityGroups.map((group) => ({ key: group.priority, count: group._count._all })),
        PRIORITIES,
      ),
      workload: workloadGroups.flatMap((group) => {
        const employee = group.assigneeId ? employeeById.get(group.assigneeId) : undefined;
        return employee ? [{ ...employee, openTasks: group._count._all }] : [];
      }),
      recentTasks,
    };
  });
};
