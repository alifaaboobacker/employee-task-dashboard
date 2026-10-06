import { useQuery } from '@tanstack/react-query';
import { fetchSummary } from '@/api/dashboard';

export const useDashboardQuery = () =>
  useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: fetchSummary,
    staleTime: 30_000,
  });
