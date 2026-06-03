import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function OrdensLoading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-20" />
      <div className="surface-raised p-4 flex flex-col gap-2">
        <Skeleton className="h-4 w-1/3" />
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
