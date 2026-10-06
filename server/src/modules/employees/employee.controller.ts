import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as employeeService from './employee.service.js';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await employeeService.listEmployees(req.query as never);
  res.status(200).json({ success: true, ...result });
});

export const departments = asyncHandler(async (_req: Request, res: Response) => {
  const data = await employeeService.listDepartments();
  res.status(200).json({ success: true, data });
});

export const assignable = asyncHandler(async (_req: Request, res: Response) => {
  const data = await employeeService.listAssignableEmployees();
  res.status(200).json({ success: true, data });
});

export const deletionLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await employeeService.listDeletionLogs(req.query as never);
  res.status(200).json({ success: true, ...result });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const data = await employeeService.getEmployeeById(req.params.id as string);
  res.status(200).json({ success: true, data });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const data = await employeeService.createEmployee(req.body);
  res.status(201).json({ success: true, data });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const data = await employeeService.updateEmployee(req.params.id as string, req.body);
  res.status(200).json({ success: true, data });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const data = await employeeService.deleteEmployee(
    req.params.id as string,
    req.body,
    req.admin!.id,
  );
  res.status(200).json({ success: true, data });
});
