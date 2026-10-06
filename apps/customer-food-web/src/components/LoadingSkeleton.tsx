import { cn } from "@/lib/utils";

export const Shimmer = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse bg-[#E8E3DC]/60 rounded-xl", className)} />
);

export const MenuCardSkeleton = () => (
  <div className="py-3.5 px-3 border-b border-[#E8E3DC] flex items-start justify-between gap-4 rounded-2xl my-1 bg-white">
    <div className="flex-1 space-y-2 pr-1">
      <div className="flex items-center gap-2">
        <Shimmer className="w-4 h-4 rounded-[4px]" />
        <Shimmer className="w-16 h-3.5 rounded-full" />
      </div>
      <Shimmer className="h-4 w-3/4 rounded-md" />
      <Shimmer className="h-4 w-16 rounded-md" />
      <Shimmer className="h-3 w-5/6 rounded-md" />
    </div>
    <div className="flex flex-col items-center shrink-0">
      <Shimmer className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl" />
      <Shimmer className="w-20 h-7 rounded-full -mt-3.5" />
    </div>
  </div>
);

export const MenuGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="space-y-1">
    {Array.from({ length: count }).map((_, i) => (
      <MenuCardSkeleton key={i} />
    ))}
  </div>
);

export const OrderCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-[#E8E3DC] p-4 space-y-3 shadow-sm">
    <div className="flex justify-between items-center">
      <div className="space-y-1.5">
        <Shimmer className="h-4 w-28 rounded-full" />
        <Shimmer className="h-3 w-20 rounded-full" />
      </div>
      <Shimmer className="h-6 w-24 rounded-full" />
    </div>
    <Shimmer className="h-px w-full" />
    <div className="space-y-2">
      <Shimmer className="h-3.5 w-full rounded-md" />
      <Shimmer className="h-3.5 w-4/5 rounded-md" />
    </div>
    <div className="flex justify-between items-center pt-2">
      <Shimmer className="h-5 w-20 rounded-full" />
      <Shimmer className="h-9 w-28 rounded-full" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-4 p-4 max-w-lg mx-auto">
    <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#E8E3DC] shadow-sm">
      <Shimmer className="h-16 w-16 rounded-full shrink-0" />
      <div className="space-y-2 flex-1">
        <Shimmer className="h-5 w-36 rounded-full" />
        <Shimmer className="h-3.5 w-28 rounded-full" />
      </div>
    </div>
    <Shimmer className="h-28 w-full rounded-2xl shadow-sm" />
    <Shimmer className="h-14 w-full rounded-2xl shadow-sm" />
    <Shimmer className="h-14 w-full rounded-2xl shadow-sm" />
  </div>
);

export default Shimmer;
