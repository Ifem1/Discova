'use client';

import { cn } from '@/lib/utils';

interface ScoreBarProps {
  label: string;
  score: number;
  className?: string;
}

export function ScoreBar({ label, score, className }: ScoreBarProps) {
  const percent = Math.round(score * 100);
  const color =
    percent >= 75 ? 'bg-emerald-500' :
    percent >= 50 ? 'bg-amber-500' :
    percent >= 25 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-semibold text-foreground">{percent}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
