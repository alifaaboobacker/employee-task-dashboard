import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as taskService from './task.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await taskService.listTasks(req.query as never);
  res.status(200).json({ success: true, ...result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const data = await taskService.getTaskById(req.params.id as string);
  res.status(200).json({ success: true, data });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await taskService.createTask(req.body, req.admin!.id);
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await taskService.updateTask(req.params.id as string, req.body);
  res.status(200).json({ success: true, data });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const data = await taskService.updateTaskStatus(req.params.id as string, req.body);
  res.status(200).json({ success: true, data });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const data = await taskService.deleteTask(req.params.id as string);
  res.status(200).json({ success: true, data });
});
