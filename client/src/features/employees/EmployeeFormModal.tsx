import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';
import { Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/useEmployees';
import type { Employee } from '@/types';

const schema = z.object({
  employeeCode: z
    .string()
    .trim()
    .min(2, 'Employee code is required')
    .max(20, 'Keep it under 20 characters')
    .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers and hyphens only'),
  name: z.string().trim().min(2, 'Name is required').max(120),
  email: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{6,19}$/, 'Enter a valid phone number')
    .optional()
    .or(z.literal('')),
  department: z.string().trim().min(2, 'Department is required').max(80),
  designation: z.string().trim().min(2, 'Designation is required').max(80),
  isActive: z.enum(['true', 'false']),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  employeeCode: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  isActive: 'true',
};

const STATUS_OPTIONS = [
  { value: 'true', label: 'Active', description: 'Can be assigned new tasks' },
  { value: 'false', label: 'Inactive', description: 'Kept on record, no new assignments' },
];

interface EmployeeFormModalProps {
  open: boolean;
  employee: Employee | null;
  departments: string[];
  onClose: () => void;
}

export const EmployeeFormModal = ({
  open,
  employee,
  departments,
  onClose,
}: EmployeeFormModalProps) => {
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: EMPTY });

  useEffect(() => {
    if (!open) return;

    reset(
      employee
        ? {
            employeeCode: employee.employeeCode,
            name: employee.name,
            email: employee.email,
            phone: employee.phone ?? '',
            department: employee.department,
            designation: employee.designation,
            isActive: employee.isActive ? 'true' : 'false',
          }
        : EMPTY,
    );
  }, [open, employee, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      employeeCode: values.employeeCode.toUpperCase(),
      name: values.name,
      email: values.email,
      department: values.department,
      designation: values.designation,
      isActive: values.isActive === 'true',
      ...(values.phone ? { phone: values.phone } : {}),
    };

    const saved = employee
      ? await updateEmployee.mutateAsync({ id: employee.id, payload }).catch(() => null)
      : await createEmployee.mutateAsync(payload).catch(() => null);

    if (saved) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={employee ? 'Edit employee' : 'Add employee'}
      description={
        employee
          ? 'Update the directory record for this employee.'
          : 'Create a directory record so tasks can be assigned to this person.'
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="employee-form" isLoading={isSubmitting}>
            {employee ? 'Save changes' : 'Add employee'}
          </Button>
        </>
      }
    >
      <form
        id="employee-form"
        onSubmit={onSubmit}
        noValidate
        className="grid gap-4 sm:grid-cols-2"
      >
        <Input
          label="Employee code"
          placeholder="EMP-1007"
          required
          error={errors.employeeCode?.message}
          {...register('employeeCode')}
        />
        <Input
          label="Full name"
          placeholder="Priya Sharma"
          required
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Work email"
          type="email"
          placeholder="priya.sharma@company.com"
          required
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone"
          placeholder="+91 98450 00000"
          hint="Optional"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Controller
          control={control}
          name="department"
          render={({ field }) => (
            <Combobox
              label="Department"
              placeholder="Search or add a department"
              required
              options={departments}
              value={field.value}
              onChange={field.onChange}
              error={errors.department?.message}
            />
          )}
        />

        <Input
          label="Designation"
          placeholder="Backend Engineer"
          required
          error={errors.designation?.message}
          {...register('designation')}
        />

        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Select
              label="Directory status"
              options={STATUS_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              wrapperClassName="sm:col-span-2"
              error={errors.isActive?.message}
            />
          )}
        />
      </form>
    </Modal>
  );
};
