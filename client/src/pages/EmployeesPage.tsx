import { History, UserPlus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Pagination } from '@/components/ui/Pagination';
import { SearchInput } from '@/components/ui/SearchInput';
import { DeleteEmployeeModal } from '@/features/employees/DeleteEmployeeModal';
import { DeletionLogModal } from '@/features/employees/DeletionLogModal';
import { EmployeeFormModal } from '@/features/employees/EmployeeFormModal';
import { EmployeeTable } from '@/features/employees/EmployeeTable';
import { useDebounce } from '@/hooks/useDebounce';
import { useDepartmentsQuery, useEmployeesQuery } from '@/hooks/useEmployees';
import { PAGE_SIZE } from '@/lib/constants';
import type { Employee, EmployeeFilters } from '@/types';

export const EmployeesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') ?? '');
  const debouncedSearch = useDebounce(searchTerm);

  const [formState, setFormState] = useState<{ open: boolean; employee: Employee | null }>({
    open: false,
    employee: null,
  });
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isLogOpen, setIsLogOpen] = useState(false);

  const page = Number(searchParams.get('page') ?? 1);
  const department = searchParams.get('department') ?? '';
  const status = searchParams.get('status') ?? '';

  const updateParams = useCallback(
    (patch: Record<string, string | undefined>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(patch)) {
            if (value) next.set(key, value);
            else next.delete(key);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const lastSyncedSearch = useRef(debouncedSearch);

  useEffect(() => {
    if (lastSyncedSearch.current === debouncedSearch) return;
    lastSyncedSearch.current = debouncedSearch;
    updateParams({ search: debouncedSearch || undefined, page: undefined });
  }, [debouncedSearch, updateParams]);

  const filters = useMemo<EmployeeFilters>(
    () => ({
      page: Number.isFinite(page) && page > 0 ? page : 1,
      limit: PAGE_SIZE,
      sortBy: 'name',
      order: 'asc',
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(department ? { department } : {}),
      ...(status === 'active' || status === 'inactive' ? { status } : {}),
    }),
    [page, debouncedSearch, department, status],
  );

  const { data, isPending, isFetching } = useEmployeesQuery(filters);
  const { data: departments = [] } = useDepartmentsQuery();

  const hasFilters = Boolean(debouncedSearch || department || status);

  return (
    <>
      <PageHeader
        title="Employees"
        description="Manage the directory, keep records current and review removals."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setIsLogOpen(true)}
              leftIcon={<History className="size-4" />}
            >
              Removal log
            </Button>
            <Button
              onClick={() => setFormState({ open: true, employee: null })}
              leftIcon={<UserPlus className="size-4" />}
            >
              Add employee
            </Button>
          </>
        }
      />

      <Card className="mb-5 p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search name, code, email or role"
            className="lg:col-span-2"
          />
          <Select
            ariaLabel="Filter by department"
            placeholder="All departments"
            options={[
              { value: '', label: 'All departments' },
              ...departments.map((item) => ({ value: item, label: item })),
            ]}
            value={department}
            onChange={(value) => updateParams({ department: value || undefined, page: undefined })}
          />
          <Select
            ariaLabel="Filter by status"
            placeholder="All statuses"
            options={[
              { value: '', label: 'All statuses' },
              { value: 'active', label: 'Active only', dotClass: 'bg-mint-500' },
              { value: 'inactive', label: 'Inactive only', dotClass: 'bg-ink-300' },
            ]}
            value={status}
            onChange={(value) => updateParams({ status: value || undefined, page: undefined })}
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <EmployeeTable
          employees={data?.data ?? []}
          isLoading={isPending || (isFetching && !data)}
          hasFilters={hasFilters}
          onEdit={(employee) => setFormState({ open: true, employee })}
          onDelete={setEmployeeToDelete}
          onCreate={() => setFormState({ open: true, employee: null })}
        />
        {data ? (
          <Pagination
            meta={data.meta}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
          />
        ) : null}
      </Card>

      <EmployeeFormModal
        open={formState.open}
        employee={formState.employee}
        departments={departments}
        onClose={() => setFormState({ open: false, employee: null })}
      />

      <DeleteEmployeeModal
        employee={employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
      />

      <DeletionLogModal open={isLogOpen} onClose={() => setIsLogOpen(false)} />
    </>
  );
};

export default EmployeesPage;
