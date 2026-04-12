import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="px-5 pt-4 pb-4 animate-pulse">
      <div className="flex justify-between items-center mb-5">
        <div><Skeleton className="h-3 w-20 mb-2" /><Skeleton className="h-6 w-36" /></div>
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <Skeleton className="h-32 rounded-xl mb-5" />
      <div className="flex gap-2.5 mb-5">{[1,2,3].map(i=><Skeleton key={i} className="flex-1 h-16 rounded-xl" />)}</div>
      <Skeleton className="h-5 w-32 mb-3" />
      <div className="grid grid-cols-2 gap-2.5">{[1,2,3,4].map(i=><Skeleton key={i} className="h-48 rounded-[14px]" />)}</div>
    </div>
  );
}
