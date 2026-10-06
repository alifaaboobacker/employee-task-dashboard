import { PrismaClient, type Priority, type TaskStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { env } from '../src/config/env.js';

const prisma = new PrismaClient();

const employees = [
  {
    employeeCode: 'EMP-1001',
    name: 'Aarav Menon',
    email: 'aarav.menon@company.com',
    phone: '+91 98450 11223',
    department: 'Engineering',
    designation: 'Senior Backend Engineer',
  },
  {
    employeeCode: 'EMP-1002',
    name: 'Divya Rajan',
    email: 'divya.rajan@company.com',
    phone: '+91 98450 44556',
    department: 'Engineering',
    designation: 'Frontend Engineer',
  },
  {
    employeeCode: 'EMP-1003',
    name: 'Rahul Verma',
    email: 'rahul.verma@company.com',
    phone: '+91 98450 77889',
    department: 'Quality Assurance',
    designation: 'QA Lead',
  },
  {
    employeeCode: 'EMP-1004',
    name: 'Sneha Pillai',
    email: 'sneha.pillai@company.com',
    phone: '+91 98450 33221',
    department: 'Design',
    designation: 'Product Designer',
  },
  {
    employeeCode: 'EMP-1005',
    name: 'Imran Khan',
    email: 'imran.khan@company.com',
    phone: '+91 98450 66554',
    department: 'Operations',
    designation: 'Operations Analyst',
  },
  {
    employeeCode: 'EMP-1006',
    name: 'Meera Nair',
    email: 'meera.nair@company.com',
    phone: '+91 98450 99001',
    department: 'Human Resources',
    designation: 'HR Executive',
    isActive: false,
  },
];

const dayOffset = (days: number) => {
  const now = new Date();
  const base = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return new Date(base + days * 24 * 60 * 60 * 1000);
};

const tasks: {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueInDays: number;
  assigneeCode: string | null;
}[] = [
  {
    title: 'Harden authentication rate limiting',
    description: 'Tune the login throttle thresholds and add alerting for repeated failures.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    dueInDays: 3,
    assigneeCode: 'EMP-1001',
  },
  {
    title: 'Migrate reports module to the new API',
    description: 'Replace the legacy endpoints used by the reporting screens.',
    priority: 'HIGH',
    status: 'PENDING',
    dueInDays: -2,
    assigneeCode: 'EMP-1001',
  },
  {
    title: 'Rebuild the employee list table',
    description: 'Add sorting, pagination and a responsive card layout for small screens.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    dueInDays: 5,
    assigneeCode: 'EMP-1002',
  },
  {
    title: 'Accessibility audit of the dashboard',
    description: 'Check focus order, contrast ratios and screen reader labels.',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueInDays: 9,
    assigneeCode: 'EMP-1002',
  },
  {
    title: 'Write regression suite for task filters',
    description: 'Cover status, priority, employee and date range combinations.',
    priority: 'HIGH',
    status: 'PENDING',
    dueInDays: 1,
    assigneeCode: 'EMP-1003',
  },
  {
    title: 'Verify the employee deletion audit trail',
    description: 'Confirm every deletion stores a reason and unassigns open tasks.',
    priority: 'MEDIUM',
    status: 'COMPLETED',
    dueInDays: -5,
    assigneeCode: 'EMP-1003',
  },
  {
    title: 'Design the task detail drawer',
    description: 'Cover empty, loading and overdue states in the handoff file.',
    priority: 'LOW',
    status: 'COMPLETED',
    dueInDays: -8,
    assigneeCode: 'EMP-1004',
  },
  {
    title: 'Refresh the dashboard summary cards',
    description: 'Align the stat tiles with the latest spacing and type scale.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    dueInDays: 4,
    assigneeCode: 'EMP-1004',
  },
  {
    title: 'Quarterly asset reconciliation',
    description: 'Match the asset register against the procurement records.',
    priority: 'LOW',
    status: 'PENDING',
    dueInDays: 14,
    assigneeCode: 'EMP-1005',
  },
  {
    title: 'Vendor invoice follow-up',
    description: 'Chase the three pending invoices from the facilities vendor.',
    priority: 'MEDIUM',
    status: 'PENDING',
    dueInDays: -1,
    assigneeCode: 'EMP-1005',
  },
  {
    title: 'Draft the onboarding checklist',
    description: 'Prepare a reusable checklist for new engineering hires.',
    priority: 'LOW',
    status: 'PENDING',
    dueInDays: 11,
    assigneeCode: null,
  },
  {
    title: 'Document the deployment runbook',
    description: 'Capture the release steps, rollback plan and health checks.',
    priority: 'HIGH',
    status: 'PENDING',
    dueInDays: 7,
    assigneeCode: null,
  },
];

const main = async () => {
  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env before seeding');
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, env.BCRYPT_ROUNDS);

  const admin = await prisma.admin.upsert({
    where: { email: env.ADMIN_EMAIL },
    update: { passwordHash, name: env.ADMIN_NAME ?? 'Administrator' },
    create: {
      email: env.ADMIN_EMAIL,
      name: env.ADMIN_NAME ?? 'Administrator',
      passwordHash,
    },
    select: { id: true, email: true },
  });

  for (const employee of employees) {
    await prisma.employee.upsert({
      where: { employeeCode: employee.employeeCode },
      update: employee,
      create: employee,
    });
  }

  const employeeIdByCode = new Map(
    (
      await prisma.employee.findMany({ select: { id: true, employeeCode: true } })
    ).map((employee) => [employee.employeeCode, employee.id]),
  );

  const existingTaskTitles = new Set(
    (await prisma.task.findMany({ select: { title: true } })).map((task) => task.title),
  );

  const newTasks = tasks.filter((task) => !existingTaskTitles.has(task.title));

  if (newTasks.length > 0) {
    await prisma.task.createMany({
      data: newTasks.map((task) => ({
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: dayOffset(task.dueInDays),
        completedAt: task.status === 'COMPLETED' ? dayOffset(task.dueInDays) : null,
        assigneeId: task.assigneeCode ? employeeIdByCode.get(task.assigneeCode) : null,
        createdById: admin.id,
      })),
    });
  }

  const [employeeCount, taskCount] = await Promise.all([
    prisma.employee.count(),
    prisma.task.count(),
  ]);

  console.log(`Seed complete: admin ${admin.email}, ${employeeCount} employees, ${taskCount} tasks`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
