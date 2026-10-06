import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { DELETION_REASON_LABELS } from '@/lib/constants';
import { useDeleteEmployee } from '@/hooks/useEmployees';
import type { DeletionReason, Employee } from '@/types';

const REASONS = Object.keys(DELETION_REASON_LABELS) as DeletionReason[];

const REASON_OPTIONS = REASONS.map((reason) => ({
  value: reason,
  label: DELETION_REASON_LABELS[reason],
}));

const schema = z.object({
  reasonCategory: z.enum(REASONS as [DeletionReason, ...DeletionReason[]], {
    errorMap: () => ({ message: 'Select a reason' }),
  }),
  reasonDetails: z
    .string()
    .trim()
    .min(10, 'Explain the reason in at least 10 characters')
    .max(500, 'Keep the explanation under 500 characters'),
});

type FormValues = z.infer<typeof schema>;

interface DeleteEmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
}

export const DeleteEmployeeModal = ({ employee, onClose }: DeleteEmployeeModalProps) => {
  const deleteEmployee = useDeleteEmployee();

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { reasonCategory: 'RESIGNED', reasonDetails: '' },
  });

  useEffect(() => {
    if (employee) reset({ reasonCategory: 'RESIGNED', reasonDetails: '' });
  }, [employee, reset]);

  const detailsLength = watch('reasonDetails')?.trim().length ?? 0;

  const onSubmit = handleSubmit(async (values) => {
    if (!employee) return;

    const result = await deleteEmployee
      .mutateAsync({ id: employee.id, payload: values })
      .catch(() => null);

    if (result) onClose();
  });

  return (
    <Modal
      open={Boolean(employee)}
      onClose={onClose}
      title="Remove employee"
      description="A recorded reason is required. The removal is written to the audit log and cannot be undone."
      size="sm"
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Keep employee
          </Button>
          <Button
            type="submit"
            form="delete-employee-form"
            isLoading={isSubmitting}
            className="bg-brand-800 hover:bg-brand-900"
          >
            Remove permanently
          </Button>
        </>
      }
    >
      {employee ? (
        <form id="delete-employee-form" onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="rounded-xl bg-brand-50 p-4 ring-1 ring-brand-100">
            <p className="text-sm font-semibold text-ink-900">{employee.name}</p>
            <p className="mt-0.5 text-xs text-ink-500">
              {employee.employeeCode} · {employee.designation} · {employee.department}
            </p>
          </div>

          {employee.taskCount > 0 ? (
            <div className="flex gap-3 rounded-xl bg-white p-4 ring-1 ring-brand-200">
              <AlertTriangle className="mt-0.5 size-4.5 shrink-0 text-brand-700" aria-hidden />
              <p className="text-xs leading-relaxed text-ink-700">
                <span className="font-semibold text-ink-900">
                  {employee.taskCount} task{employee.taskCount === 1 ? '' : 's'}
                </span>{' '}
                assigned to this employee will be kept and moved to{' '}
                <span className="font-semibold text-ink-900">Unassigned</span>, so no work is
                lost. Reassign them afterwards from the task list.
              </p>
            </div>
          ) : null}

          <Controller
            control={control}
            name="reasonCategory"
            render={({ field }) => (
              <Select
                label="Reason category"
                required
                options={REASON_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.reasonCategory?.message}
              />
            )}
          />

          <Textarea
            label="Reason details"
            required
            rows={4}
            placeholder="Resigned on 12 Oct 2026, notice period served and handover completed."
            hint={`${detailsLength}/500 characters — minimum 10`}
            error={errors.reasonDetails?.message}
            {...register('reasonDetails')}
          />
        </form>
      ) : null}
    </Modal>
  );
};
