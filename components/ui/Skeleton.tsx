import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  height?: string;
}

export function Skeleton({ height = 'h-4', className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={['animate-pulse bg-navy/10 rounded-lg', height, className].join(' ')}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-card p-4 shadow-sm border border-navy/5 space-y-3">
      <Skeleton height="h-5" className="w-2/3" />
      <Skeleton height="h-4" className="w-full" />
      <Skeleton height="h-4" className="w-4/5" />
    </div>
  );
}
