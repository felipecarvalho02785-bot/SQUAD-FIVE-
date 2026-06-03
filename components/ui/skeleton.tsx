import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  /** Quando true, renderiza várias linhas empilhadas */
  lines?: number;
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  if (lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }, (_, i) => (
          <div
            key={i}
            className={cn("skeleton h-3", i === lines - 1 && "w-2/3", className)}
            aria-hidden
          />
        ))}
      </div>
    );
  }
  return <div className={cn("skeleton h-4", className)} aria-hidden />;
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "surface-raised p-4 flex flex-col gap-3 animate-pulse",
        className,
      )}
      aria-hidden
    >
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-md" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="skeleton h-3 w-2/3" />
          <div className="skeleton h-2 w-1/2" />
        </div>
      </div>
      <div className="skeleton h-2 w-full" />
      <div className="skeleton h-2 w-3/4" />
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <SkeletonCard />
        </li>
      ))}
    </ul>
  );
}
