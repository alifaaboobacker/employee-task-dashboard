import { History } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState, TableSkeleton } from '@/components/ui/States';
import { DELETION_REASON_LABELS } from '@/lib/constants';
import { formatDateTime } from '@/lib/date';
import { useDeletionLogsQuery } from '@/hooks/useEmployees';

export const DeletionLogModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [page, setPage] = useState(1);
  const { data, isPending } = useDeletionLogsQuery(page, open);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Removal audit log"
      description="Every employee removal with the reason recorded at the time."
      size="lg"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="-mx-5 -my-4">
        {isPending ? (
          <TableSkeleton rows={4} columns={3} />
        ) : !data || data.data.length === 0 ? (
          <EmptyState
            icon={History}
            title="No removals recorded"
            description="Removed employees and their reasons will be listed here."
          />
        ) : (
          <>
            <ul className="divide-y divide-line">
              {data.data.map((log) => (
                <li key={log.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900">{log.employeeName}</p>
                      <p className="text-xs text-ink-500">
                        {log.employeeCode} · {log.department} · {log.employeeEmail}
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
                      {DELETION_REASON_LABELS[log.reasonCategory]}
                    </span>
                  </div>

                  <p className="mt-2 rounded-lg bg-surface px-3 py-2 text-xs leading-relaxed text-ink-700">
                    {log.reasonDetails}
                  </p>

                  <p className="mt-2 text-xs text-ink-500">
                    {formatDateTime(log.deletedAt)} by {log.deletedBy?.name ?? 'Unknown admin'}
                    {log.unassignedTaskCount > 0
                      ? ` · ${log.unassignedTaskCount} task(s) unassigned`
                      : ''}
                  </p>
                </li>
              ))}
            </ul>
            <Pagination meta={data.meta} onPageChange={setPage} />
          </>
        )}
      </div>
    </Modal>
  );
};
