import { cn } from "@/lib/cn";

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn("bg-border/50 rounded-lg animate-pulse", className)} />
);
