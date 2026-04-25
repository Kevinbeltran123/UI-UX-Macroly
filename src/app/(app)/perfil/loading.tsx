import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Cargando perfil" className="px-5 pt-4 pb-4 animate-pulse">
      <Skeleton className="h-6 w-24 mb-3.5" />
      <Skeleton className="h-28 rounded-[14px] mb-3.5" />
      <Skeleton className="h-5 w-28 mb-2" />
      <div className="grid grid-cols-2 gap-2 mb-3.5">{[1,2,3,4].map(i=><Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      <Skeleton className="h-24 rounded-[14px] mb-3.5" />
      <Skeleton className="h-48 rounded-[14px]" />
    </div>
  );
}
