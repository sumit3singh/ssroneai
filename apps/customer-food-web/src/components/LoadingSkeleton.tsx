import { cn } from "@/lib/utils";

const Shimmer = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-muted rounded-xl", className)} />
);

export const MenuCardSkeleton = () => (
  <div className="card-food overflow-hidden">
    <Shimmer className="h-24 sm:h-40 rounded-none rounded-t-2xl" />
    <div className="p-2 sm:p-3 space-y-2">
      <Shimmer className="h-3 w-3/4" />
      <Shimmer className="h-2 w-1/2" />
      <div className="flex justify-between items-center">
        <Shimmer className="h-4 w-12" />
        <Shimmer className="h-6 w-6 rounded-full" />
      </div>
    </div>
  </div>
);

export const MenuGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5 sm:gap-3 md:gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <MenuCardSkeleton key={i} />
    ))}
  </div>
);

export const OrderCardSkeleton = () => (
  <div className="bg-card rounded-2xl p-4 space-y-3">
    <div className="flex justify-between">
      <div className="space-y-1">
        <Shimmer className="h-4 w-24" />
        <Shimmer className="h-3 w-16" />
      </div>
      <Shimmer className="h-6 w-20 rounded-full" />
    </div>
    <Shimmer className="h-3 w-32" />
    <div className="space-y-1">
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-3/4" />
    </div>
    <Shimmer className="h-8 w-full" />
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-4 p-4">
    <div className="flex items-center gap-4">
      <Shimmer className="h-16 w-16 rounded-full" />
      <div className="space-y-2 flex-1">
        <Shimmer className="h-5 w-32" />
        <Shimmer className="h-3 w-24" />
      </div>
    </div>
    <Shimmer className="h-24 w-full rounded-2xl" />
    <Shimmer className="h-12 w-full rounded-2xl" />
    <Shimmer className="h-12 w-full rounded-2xl" />
  </div>
);

export default Shimmer;
