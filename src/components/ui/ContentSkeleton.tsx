/**
 * Content Skeleton Components — Gap #17
 * Shape-aware loading placeholders
 */

import { cn } from '@/lib/utils';

function Bone({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-md bg-muted', className)} />;
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-border space-y-4 animate-pulse">
      <Bone className="h-5 w-2/3" />
      <Bone className="h-3 w-full" />
      <Bone className="h-3 w-4/5" />
      <div className="flex gap-2 pt-2">
        <Bone className="h-8 w-20 rounded-lg" />
        <Bone className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 p-8 animate-pulse">
      <Bone className="h-4 w-32" />
      <Bone className="h-10 w-96 max-w-full" />
      <Bone className="h-4 w-80 max-w-full" />
      <div className="flex gap-3 mt-4">
        <Bone className="h-12 w-36 rounded-xl" />
        <Bone className="h-12 w-36 rounded-xl" />
      </div>
    </div>
  );
}

export function BlogCardSkeleton() {
  return (
    <div className="rounded-xl border border-border overflow-hidden animate-pulse">
      <Bone className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Bone className="h-3 w-20" />
        <Bone className="h-5 w-4/5" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="flex gap-4 p-3 bg-muted/30 rounded-lg">
        <Bone className="h-4 w-1/4" />
        <Bone className="h-4 w-1/4" />
        <Bone className="h-4 w-1/4" />
        <Bone className="h-4 w-1/4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-3">
          <Bone className="h-4 w-1/4" />
          <Bone className="h-4 w-1/4" />
          <Bone className="h-4 w-1/4" />
          <Bone className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
