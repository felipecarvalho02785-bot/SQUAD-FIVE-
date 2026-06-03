import { Skeleton } from "@/components/ui/skeleton";

export default function PelotaoLoading() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-20" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="surface-deep p-3 flex flex-col gap-2 min-h-[200px]">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
