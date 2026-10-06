import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import {
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  STATUS_DOTS,
  STATUS_LABELS,
  STATUS_ORDER,
} from '@/lib/constants';
import { toInputDate, todayInputDate } from '@/lib/date';
import { useCreateTask, useUpdateTask } from '@/hooks/useTasks';
import type { AssignableEmployee, Task } from '@/types';

const schema = z.object({
  title: z.string().trim().min(3, 'Give the task a clear title').max(160),
  description: z.string().trim().max(2000, 'Keep the description under 2000 characters'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  dueDate: z.string().min(1, 'Pick a due date'),
  assigneeId: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface TaskFormModalProps {
  open: boolean;
  task: Task | null;
  employees: AssignableEmployee[];
  defaultEmployeeId?: string;
  onClose: () => void;
}

export const TaskFormModal = ({
  open,
  task,
  employees,
  defaultEmployeeId,
  onClose,
}: TaskFormModalProps) => {
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;

    reset({
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'MEDIUM',
      status: task?.status ?? 'PENDING',
      dueDate: task ? toInputDate(task.dueDate) : todayInputDate(),
      assigneeId: task?.assignee?.id ?? defaultEmployeeId ?? '',
    });
  }, [open, task, defaultEmployeeId, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      priority: values.priority,
      status: values.status,
      dueDate: values.dueDate,
      assigneeId: values.assigneeId || null,
    };

    const saved = task
      ? await updateTask.mutateAsync({ id: task.id, payload }).catch(() => null)
      : await createTask.mutateAsync(payload).catch(() => null);

    if (saved) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? 'Edit task' : 'Create task'}
      description={
        task
          ? 'Update the task details, assignment or schedule.'
          : 'Describe the work, set a priority and assign it to an employee.'
      }
      footer={
        <>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="task-form" isLoading={isSubmitting}>
            {task ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <form id="task-form" onSubmit={onSubmit} noValidate className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Task title"
          placeholder="Prepare the quarterly compliance report"
          required
          wrapperClassName="sm:col-span-2"
          error={errors.title?.message}
          {...register('title')}
        />

        <Textarea
          label="Description"
          placeholder="Add the context, acceptance criteria or links the assignee needs."
          hint="Optional"
          wrapperClassName="sm:col-span-2"
          error={errors.description?.message}
          {...register('description')}
        />

        <Controller
          control={control}
          name="assigneeId"
          render={({ field }) => (
            <Select
              label="Assigned employee"
              hint={employees.length === 0 ? 'No active employees available' : 'Optional'}
              placeholder="Unassigned"
              options={[
                { value: '', label: 'Unassigned' },
                ...employees.map((employee) => ({
                  value: employee.id,
                  label: employee.name,
                  description: `${employee.employeeCode} · ${employee.department}`,
                })),
              ]}
              value={field.value}
              onChange={field.onChange}
              error={errors.assigneeId?.message}
            />
          )}
        />

        <Input
          label="Due date"
          type="date"
          required
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />

        <Controller
          control={control}
          name="priority"
          render={({ field }) => (
            <Select
              label="Priority"
              options={PRIORITY_ORDER.map((priority) => ({
                value: priority,
                label: PRIORITY_LABELS[priority],
              }))}
              value={field.value}
              onChange={field.onChange}
              error={errors.priority?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              label="Status"
              options={STATUS_ORDER.map((status) => ({
                value: status,
                label: STATUS_LABELS[status],
                dotClass: STATUS_DOTS[status],
              }))}
              value={field.value}
              onChange={field.onChange}
              error={errors.status?.message}
            />
          )}
        />
      </form>
    </Modal>
  );
};
