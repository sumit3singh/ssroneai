/**
 * The ssrone – Skeleton Loading Primitive
 */
import type { HTMLAttributes } from "react";
import { cn } from "../utils/cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton h-4 w-full animate-pulse bg-muted rounded-md", className)} {...props} />;
}

export function SkeletonCard() {
  return (
    <div className="kpi-card space-y-3 p-4 rounded-xl border border-border bg-card">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
