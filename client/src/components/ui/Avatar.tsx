import { cn, initials } from '@/lib/utils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md';
  tone?: 'brand' | 'mint';
  className?: string;
}

export const Avatar = ({ name, size = 'md', tone = 'brand', className }: AvatarProps) => (
  <span
    aria-hidden
    className={cn(
      'inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ring-inset',
      tone === 'brand'
        ? 'bg-brand-50 text-brand-700 ring-brand-200'
        : 'bg-mint-50 text-mint-700 ring-mint-200',
      size === 'sm' ? 'size-7 text-[0.65rem]' : 'size-9 text-xs',
      className,
    )}
  >
    {initials(name)}
  </span>
);
