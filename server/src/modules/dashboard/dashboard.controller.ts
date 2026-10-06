import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as dashboardService from './dashboard.service.js';

export const summary = asyncHandler(async (_req: Request, res: Response) => {
  const data = await dashboardService.getSummary();
  res.status(200).json({ success: true, data });
});
