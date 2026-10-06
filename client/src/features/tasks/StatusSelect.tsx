import { Select } from '@/components/ui/Select';
import { STATUS_DOTS, STATUS_LABELS, STATUS_ORDER } from '@/lib/constants';
import type { TaskStatus } from '@/types';

const OPTIONS = STATUS_ORDER.map((status) => ({
  value: status,
  label: STATUS_LABELS[status],
  dotClass: STATUS_DOTS[status],
}));

interface StatusSelectProps {
  value: TaskStatus;
  disabled?: boolean;
  onChange: (status: TaskStatus) => void;
  className?: string;
}

export const StatusSelect = ({ value, disabled, onChange, className }: StatusSelectProps) => (
  <Select
    size="sm"
    ariaLabel="Change status"
    options={OPTIONS}
    value={value}
    disabled={disabled}
    onChange={(next) => onChange(next as TaskStatus)}
    wrapperClassName={className}
    className="w-36 font-medium"
  />
);
