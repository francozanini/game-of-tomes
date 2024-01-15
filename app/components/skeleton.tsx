import { Skeleton } from "../../@/components/ui/skeleton";

export function SkeletonList() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-28 w-auto" />
      <Skeleton className="h-28 w-auto" />
      <Skeleton className="h-28 w-auto" />
    </div>
  );
}
