import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-busy="true" aria-label="Cargando educación" className="px-5 pt-4 pb-4 animate-pulse">
      <Skeleton className="h-6 w-28 mb-5" />
      <Skeleton className="h-36 rounded-2xl mb-5" />
      {[1,2,3,4].map(i=><Skeleton key={i} className="h-16 rounded-xl mb-2" />)}
    </div>
  );
}
