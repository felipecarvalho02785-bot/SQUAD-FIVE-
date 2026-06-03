import { Skeleton, SkeletonGrid } from "@/components/ui/skeleton";

export default function RecrutasLoading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-20" />
      <Skeleton className="h-10 w-1/2" />
      <SkeletonGrid count={9} />
    </div>
  );
}
