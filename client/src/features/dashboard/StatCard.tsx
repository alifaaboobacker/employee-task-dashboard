import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  caption?: string;
  icon: LucideIcon;
  tone?: 'brand' | 'mint' | 'neutral';
}

const TONES = {
  brand: 'bg-brand-50 text-brand-600',
  mint: 'bg-mint-50 text-mint-600',
  neutral: 'bg-surface text-ink-500',
};

export const StatCard = ({ label, value, caption, icon: Icon, tone = 'brand' }: StatCardProps) => (
  <div className="card-surface flex items-start gap-4 p-5">
    <span
      className={cn('flex size-10 shrink-0 items-center justify-center rounded-xl', TONES[tone])}
    >
      <Icon className="size-5" aria-hidden />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold leading-none text-ink-900">{value}</p>
      {caption ? <p className="mt-1.5 text-xs text-ink-500">{caption}</p> : null}
    </div>
  </div>
);
