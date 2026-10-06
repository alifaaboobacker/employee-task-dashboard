import {
  AlertOctagon,
  CalendarClock,
  CircleDashed,
  ClipboardList,
  Timer,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { EmptyState, Skeleton } from '@/components/ui/States';
import { RecentTasks } from '@/features/dashboard/RecentTasks';
import { StatCard } from '@/features/dashboard/StatCard';
import { StatusBreakdown } from '@/features/dashboard/StatusBreakdown';
import { WorkloadList } from '@/features/dashboard/WorkloadList';
import { useDashboardQuery } from '@/hooks/useDashboard';

export const DashboardPage = () => {
  const { data, isPending, isError } = useDashboardQuery();

  if (isPending) {
    return (
      <>
        <PageHeader title="Overview" description="Live snapshot of your team and their work." />
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <Skeleton className="mt-5 h-72" />
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        <PageHeader title="Overview" />
        <Card>
          <EmptyState
            icon={AlertOctagon}
            title="Could not load the summary"
            description="Check that the API is running and refresh the page."
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Overview"
        description="Live snapshot of your team, their workload and task progress."
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Employees"
          value={data.employees.total}
          caption={`${data.employees.active} active · ${data.employees.inactive} inactive`}
          icon={Users}
        />
        <StatCard
          label="Total tasks"
          value={data.tasks.total}
          caption={`${data.tasks.unassigned} unassigned`}
          icon={ClipboardList}
        />
        <StatCard
          label="Completion rate"
          value={`${data.tasks.completionRate}%`}
          caption={`${data.tasks.completedThisWeek} completed in the last 7 days`}
          icon={TrendingUp}
          tone="mint"
        />
        <StatCard
          label="Overdue"
          value={data.tasks.overdue}
          caption={`${data.tasks.dueThisWeek} due within 7 days`}
          icon={AlertOctagon}
          tone={data.tasks.overdue > 0 ? 'brand' : 'neutral'}
        />
        <StatCard label="Pending" value={data.tasks.pending} icon={CircleDashed} />
        <StatCard label="In progress" value={data.tasks.inProgress} icon={Timer} />
        <StatCard label="Completed" value={data.tasks.completed} icon={UserCheck} tone="mint" />
        <StatCard
          label="Due this week"
          value={data.tasks.dueThisWeek}
          icon={CalendarClock}
          tone="neutral"
        />
      </div>

      <div className="mt-5">
        <StatusBreakdown summary={data} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <WorkloadList workload={data.workload} />
        <RecentTasks tasks={data.recentTasks} />
      </div>
    </>
  );
};

export default DashboardPage;
