import { Router } from 'express';
import { mutationLimiter } from '../../middlewares/rateLimiters.js';
import { validate } from '../../middlewares/validate.js';
import * as taskController from './task.controller.js';
import {
  createTaskSchema,
  listTasksSchema,
  taskIdSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from './task.schema.js';

export const taskRouter = Router();

taskRouter.get('/', validate({ query: listTasksSchema }), taskController.list);
taskRouter.get('/:id', validate({ params: taskIdSchema }), taskController.getById);

taskRouter.post(
  '/',
  mutationLimiter,
  validate({ body: createTaskSchema }),
  taskController.create,
);
taskRouter.put(
  '/:id',
  mutationLimiter,
  validate({ params: taskIdSchema, body: updateTaskSchema }),
  taskController.update,
);
taskRouter.patch(
  '/:id/status',
  mutationLimiter,
  validate({ params: taskIdSchema, body: updateTaskStatusSchema }),
  taskController.updateStatus,
);
taskRouter.delete(
  '/:id',
  mutationLimiter,
  validate({ params: taskIdSchema }),
  taskController.remove,
);
