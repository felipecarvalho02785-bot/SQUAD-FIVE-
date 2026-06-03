import { Skeleton, SkeletonGrid } from "@/components/ui/skeleton";

export default function BibliotecaLoading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-20" />
      <Skeleton className="h-10" />
      <Skeleton className="h-10 w-2/3" />
      <SkeletonGrid count={6} />
    </div>
  );
}
