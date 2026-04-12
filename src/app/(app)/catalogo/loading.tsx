import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="px-5 pt-4 pb-4 animate-pulse">
      <Skeleton className="h-6 w-28 mb-3" />
      <Skeleton className="h-12 rounded-xl mb-3" />
      <div className="flex gap-1.5 mb-3">{[1,2,3,4].map(i=><Skeleton key={i} className="h-8 w-24 rounded-full" />)}</div>
      <div className="flex gap-1.5 mb-3">{[1,2,3].map(i=><Skeleton key={i} className="h-7 w-28 rounded-full" />)}</div>
      <div className="grid grid-cols-2 gap-2.5">{[1,2,3,4,5,6].map(i=><Skeleton key={i} className="h-48 rounded-[14px]" />)}</div>
    </div>
  );
}
