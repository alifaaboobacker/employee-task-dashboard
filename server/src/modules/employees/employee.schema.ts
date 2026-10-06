import { z } from 'zod';

const EMPLOYEE_SORT_FIELDS = ['name', 'employeeCode', 'department', 'createdAt'] as const;

export const employeeIdSchema = z
  .object({ id: z.string().uuid('Invalid employee id') })
  .strict();

export const createEmployeeSchema = z
  .object({
    employeeCode: z
      .string()
      .trim()
      .toUpperCase()
      .min(2, 'Employee code is required')
      .max(20)
      .regex(/^[A-Z0-9-]+$/, 'Use letters, numbers and hyphens only'),
    name: z.string().trim().min(2, 'Name is required').max(120),
    email: z.string().trim().toLowerCase().email('Enter a valid email address').max(180),
    phone: z
      .string()
      .trim()
      .regex(/^[+\d][\d\s-]{6,19}$/, 'Enter a valid phone number')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    department: z.string().trim().min(2, 'Department is required').max(80),
    designation: z.string().trim().min(2, 'Designation is required').max(80),
    isActive: z.boolean().default(true),
  })
  .strict();

export const updateEmployeeSchema = createEmployeeSchema.partial().strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: 'Provide at least one field to update' },
);

export const deleteEmployeeSchema = z
  .object({
    reasonCategory: z.enum([
      'RESIGNED',
      'TERMINATED',
      'CONTRACT_ENDED',
      'TRANSFERRED',
      'DUPLICATE_RECORD',
      'OTHER',
    ]),
    reasonDetails: z
      .string()
      .trim()
      .min(10, 'Explain the reason in at least 10 characters')
      .max(500),
  })
  .strict();

export const listEmployeesSchema = z
  .object({
    search: z.string().trim().max(120).optional(),
    department: z.string().trim().max(80).optional(),
    status: z.enum(['active', 'inactive']).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    sortBy: z.enum(EMPLOYEE_SORT_FIELDS).default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
  })
  .strict();

export const listDeletionLogsSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  })
  .strict();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type DeleteEmployeeInput = z.infer<typeof deleteEmployeeSchema>;
export type ListEmployeesQuery = z.infer<typeof listEmployeesSchema>;
export type ListDeletionLogsQuery = z.infer<typeof listDeletionLogsSchema>;
