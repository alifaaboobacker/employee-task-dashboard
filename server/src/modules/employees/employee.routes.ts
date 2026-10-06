import { Router } from 'express';
import { mutationLimiter } from '../../middlewares/rateLimiters.js';
import { validate } from '../../middlewares/validate.js';
import * as employeeController from './employee.controller.js';
import {
  createEmployeeSchema,
  deleteEmployeeSchema,
  employeeIdSchema,
  listDeletionLogsSchema,
  listEmployeesSchema,
  updateEmployeeSchema,
} from './employee.schema.js';

export const employeeRouter = Router();

employeeRouter.get('/', validate({ query: listEmployeesSchema }), employeeController.list);
employeeRouter.get('/departments', employeeController.departments);
employeeRouter.get('/assignable', employeeController.assignable);
employeeRouter.get(
  '/deletion-logs',
  validate({ query: listDeletionLogsSchema }),
  employeeController.deletionLogs,
);
employeeRouter.get('/:id', validate({ params: employeeIdSchema }), employeeController.getById);

employeeRouter.post(
  '/',
  mutationLimiter,
  validate({ body: createEmployeeSchema }),
  employeeController.create,
);
employeeRouter.put(
  '/:id',
  mutationLimiter,
  validate({ params: employeeIdSchema, body: updateEmployeeSchema }),
  employeeController.update,
);
employeeRouter.delete(
  '/:id',
  mutationLimiter,
  validate({ params: employeeIdSchema, body: deleteEmployeeSchema }),
  employeeController.remove,
);
