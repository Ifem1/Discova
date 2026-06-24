import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

type BadgeVariant = 'default' | 'approved' | 'revision' | 'unsupported' | 'review' | 'outline';

const variants: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary',
  approved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  revision: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  unsupported: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  review: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  outline: 'border border-border text-foreground',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function verdictToBadgeVariant(verdict: string): BadgeVariant {
  switch (verdict) {
    case 'APPROVED': return 'approved';
    case 'NEEDS_REVISION': return 'revision';
    case 'UNSUPPORTED': return 'unsupported';
    case 'NEEDS_REVIEW': return 'review';
    default: return 'default';
  }
}
