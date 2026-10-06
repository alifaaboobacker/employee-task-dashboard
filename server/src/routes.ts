import { Router } from 'express';
import { authenticate } from './middlewares/authenticate.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { employeeRouter } from './modules/employees/employee.routes.js';
import { taskRouter } from './modules/tasks/task.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.status(200).json({ success: true, data: { status: 'ok', uptime: process.uptime() } });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/employees', authenticate, employeeRouter);
apiRouter.use('/tasks', authenticate, taskRouter);
apiRouter.use('/dashboard', authenticate, dashboardRouter);
