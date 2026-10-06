import { ArrowUpDown, FilterX, LayoutGrid, Rows3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { SearchInput } from '@/components/ui/SearchInput';
import { PRIORITY_LABELS, PRIORITY_ORDER, STATUS_LABELS, STATUS_ORDER } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { AssignableEmployee, Priority, TaskFilters as Filters, TaskStatus } from '@/types';

interface TaskFiltersProps {
  filters: Filters;
  employees: AssignableEmployee[];
  searchTerm: string;
  view: 'table' | 'board';
  activeCount: number;
  onSearchChange: (value: string) => void;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  onViewChange: (view: 'table' | 'board') => void;
}

const SORT_OPTIONS = [
  { value: 'dueDate:asc', label: 'Due date, soonest first' },
  { value: 'dueDate:desc', label: 'Due date, latest first' },
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'priority:desc', label: 'Priority, high to low' },
  { value: 'title:asc', label: 'Title, A to Z' },
];

const STATUS_TABS: { label: string; value?: TaskStatus }[] = [
  { label: 'All' },
  ...STATUS_ORDER.map((status) => ({ label: STATUS_LABELS[status], value: status })),
];

export const TaskFilters = ({
  filters,
  employees,
  searchTerm,
  view,
  activeCount,
  onSearchChange,
  onChange,
  onReset,
  onViewChange,
}: TaskFiltersProps) => (
  <div className="card-surface mb-5 space-y-4 p-4 sm:p-5">
    <div className="flex flex-wrap items-center gap-3">
      <div
        role="tablist"
        aria-label="Filter by status"
        className="flex flex-1 gap-1 rounded-lg bg-surface p-1"
      >
        {STATUS_TABS.map((tab) => {
          const isActive = filters.status === tab.value;

          return (
            <button
              key={tab.label}
              role="tab"
              aria-selected={isActive}
              type="button"
              onClick={() => onChange({ status: tab.value, page: 1 })}
              className={cn(
                'flex-1 whitespace-nowrap rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 sm:text-sm',
                isActive
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-ink-500 hover:text-ink-900',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-1 rounded-lg bg-surface p-1">
        <button
          type="button"
          aria-label="Table view"
          aria-pressed={view === 'table'}
          onClick={() => onViewChange('table')}
          className={cn(
            'rounded-md p-1.5 transition-colors',
            view === 'table' ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500',
          )}
        >
          <Rows3 className="size-4" />
        </button>
        <button
          type="button"
          aria-label="Board view"
          aria-pressed={view === 'board'}
          onClick={() => onViewChange('board')}
          className={cn(
            'rounded-md p-1.5 transition-colors',
            view === 'board' ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500',
          )}
        >
          <LayoutGrid className="size-4" />
        </button>
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search title, description or assignee"
        className="lg:col-span-2"
      />

      <Select
        ariaLabel="Filter by employee"
        placeholder="All employees"
        options={[
          { value: '', label: 'All employees' },
          { value: 'unassigned', label: 'Unassigned only' },
          ...employees.map((employee) => ({
            value: employee.id,
            label: employee.name,
            description: employee.department,
          })),
        ]}
        value={filters.unassigned ? 'unassigned' : (filters.employeeId ?? '')}
        onChange={(value) =>
          onChange({
            employeeId: value && value !== 'unassigned' ? value : undefined,
            unassigned: value === 'unassigned' ? true : undefined,
            page: 1,
          })
        }
      />

      <Select
        ariaLabel="Filter by priority"
        placeholder="All priorities"
        options={[
          { value: '', label: 'All priorities' },
          ...PRIORITY_ORDER.map((priority) => ({
            value: priority,
            label: `${PRIORITY_LABELS[priority]} priority`,
          })),
        ]}
        value={filters.priority ?? ''}
        onChange={(value) =>
          onChange({ priority: (value || undefined) as Priority | undefined, page: 1 })
        }
      />
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={filters.overdue ? 'primary' : 'outline'}
        size="sm"
        onClick={() => onChange({ overdue: filters.overdue ? undefined : true, page: 1 })}
      >
        Overdue only
      </Button>

      <Select
        ariaLabel="Sort tasks"
        wrapperClassName="w-56"
        leading={<ArrowUpDown className="size-3.5 shrink-0 text-ink-300" aria-hidden />}
        options={SORT_OPTIONS}
        value={`${filters.sortBy ?? 'dueDate'}:${filters.order ?? 'asc'}`}
        onChange={(value) => {
          const [sortBy, order] = value.split(':');
          onChange({
            sortBy: sortBy as Filters['sortBy'],
            order: order as Filters['order'],
            page: 1,
          });
        }}
      />

      {activeCount > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          leftIcon={<FilterX className="size-4" />}
          className="ml-auto"
        >
          Clear {activeCount} filter{activeCount === 1 ? '' : 's'}
        </Button>
      ) : null}
    </div>
  </div>
);
