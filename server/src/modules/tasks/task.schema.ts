import { z } from 'zod';

const TASK_SORT_FIELDS = ['dueDate', 'createdAt', 'priority', 'status', 'title'] as const;

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the YYYY-MM-DD format')
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid date');

export const taskIdSchema = z.object({ id: z.string().uuid('Invalid task id') }).strict();

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(3, 'Title is required').max(160),
    description: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .or(z.literal('').transform(() => undefined)),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
    dueDate: dateOnly,
    assigneeId: z
      .string()
      .uuid('Select a valid employee')
      .nullable()
      .optional()
      .or(z.literal('').transform(() => null)),
  })
  .strict();

export const updateTaskSchema = createTaskSchema
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Provide at least one field to update',
  });

export const updateTaskStatusSchema = z
  .object({ status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']) })
  .strict();

export const listTasksSchema = z
  .object({
    search: z.string().trim().max(160).optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    employeeId: z.string().uuid().optional(),
    unassigned: z.coerce.boolean().optional(),
    overdue: z.coerce.boolean().optional(),
    dueFrom: dateOnly.optional(),
    dueTo: dateOnly.optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.enum(TASK_SORT_FIELDS).default('dueDate'),
    order: z.enum(['asc', 'desc']).default('asc'),
  })
  .strict()
  .refine(
    (value) => !value.dueFrom || !value.dueTo || value.dueFrom <= value.dueTo,
    { message: 'dueFrom must be on or before dueTo', path: ['dueFrom'] },
  );

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type ListTasksQuery = z.infer<typeof listTasksSchema>;
