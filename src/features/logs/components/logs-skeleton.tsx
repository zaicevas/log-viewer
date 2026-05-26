import { Skeleton } from "@/shared/components/ui/skeleton";

export function LogsSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-64 w-full rounded-lg" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-7 w-48" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
