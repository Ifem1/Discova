import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getVerdictColor(verdict: string): string {
  switch (verdict) {
    case 'APPROVED': return 'text-emerald-600 dark:text-emerald-400';
    case 'NEEDS_REVISION': return 'text-amber-600 dark:text-amber-400';
    case 'UNSUPPORTED': return 'text-red-600 dark:text-red-400';
    case 'NEEDS_REVIEW': return 'text-blue-600 dark:text-blue-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
}

export function getVerdictBg(verdict: string): string {
  switch (verdict) {
    case 'APPROVED': return 'bg-emerald-100 dark:bg-emerald-900/30';
    case 'NEEDS_REVISION': return 'bg-amber-100 dark:bg-amber-900/30';
    case 'UNSUPPORTED': return 'bg-red-100 dark:bg-red-900/30';
    case 'NEEDS_REVIEW': return 'bg-blue-100 dark:bg-blue-900/30';
    default: return 'bg-gray-100 dark:bg-gray-900/30';
  }
}

export function scoreToPercent(score: number): number {
  return Math.round(score * 100);
}
