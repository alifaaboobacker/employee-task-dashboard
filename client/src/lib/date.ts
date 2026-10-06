import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';

const parse = (value: string) => {
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
};

export const formatDate = (value: string | null | undefined) => {
  if (!value) return '—';
  const parsed = parse(value);
  return parsed ? format(parsed, 'dd MMM yyyy') : '—';
};

export const formatDateTime = (value: string | null | undefined) => {
  if (!value) return '—';
  const parsed = parse(value);
  return parsed ? format(parsed, 'dd MMM yyyy, HH:mm') : '—';
};

export const toInputDate = (value: string | null | undefined) => {
  if (!value) return '';
  const parsed = parse(value);
  return parsed ? format(parsed, 'yyyy-MM-dd') : '';
};

export const todayInputDate = () => format(new Date(), 'yyyy-MM-dd');

export const relativeFromNow = (value: string | null | undefined) => {
  if (!value) return '—';
  const parsed = parse(value);
  return parsed ? `${formatDistanceToNowStrict(parsed)} ago` : '—';
};

export const dueMeta = (dueDate: string, status: string) => {
  const parsed = parse(dueDate);
  if (!parsed) return { label: '—', isOverdue: false, isDueSoon: false };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const diffDays = Math.round(
    (parsed.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000),
  );
  const isClosed = status === 'COMPLETED';

  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    const suffix = days === 1 ? '' : 's';

    return isClosed
      ? { label: `Due ${days} day${suffix} ago`, isOverdue: false, isDueSoon: false }
      : { label: `Overdue by ${days} day${suffix}`, isOverdue: true, isDueSoon: false };
  }

  if (diffDays === 0) return { label: 'Due today', isOverdue: false, isDueSoon: !isClosed };
  if (diffDays === 1) return { label: 'Due tomorrow', isOverdue: false, isDueSoon: !isClosed };

  return {
    label: `Due in ${diffDays} days`,
    isOverdue: false,
    isDueSoon: !isClosed && diffDays <= 3,
  };
};
