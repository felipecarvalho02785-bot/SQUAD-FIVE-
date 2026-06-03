import { Skeleton, SkeletonGrid } from "@/components/ui/skeleton";

export default function BriefingsLoading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-20" />
      <Skeleton className="h-16" />
      <SkeletonGrid count={6} />
    </div>
  );
}
