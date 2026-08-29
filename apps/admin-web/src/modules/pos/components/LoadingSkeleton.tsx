/**
 * ssrone ERP - POS Module Loading Skeleton
 * Animated, content-shaped placeholder cards replacing raw spinners.
 */

import React from "react";

interface LoadingSkeletonProps {
  count?: number;
  type?: "card" | "table" | "grid";
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 4,
  type = "grid",
}) => {
  return (
    <div
      className={
        type === "grid"
          ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          : "space-y-3"
      }
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-card/40 border border-border/50 rounded-xl p-4 animate-pulse space-y-3"
        >
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted/60 rounded w-1/2" />
          <div className="h-8 bg-muted/40 rounded-lg w-full mt-4" />
        </div>
      ))}
    </div>
  );
};
