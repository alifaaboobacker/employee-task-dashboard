import { http } from './http';
import type { DashboardSummary } from '@/types';

export const fetchSummary = async () => {
  const { data } = await http.get<{ success: true; data: DashboardSummary }>(
    '/dashboard/summary',
  );
  return data.data;
};
