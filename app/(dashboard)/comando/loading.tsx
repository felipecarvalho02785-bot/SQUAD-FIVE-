import { SkeletonGrid } from "@/components/ui/skeleton";

export default function ComandoLoading() {
  return (
    <div className="flex flex-col gap-5">
      <div className="skeleton h-44 rounded-card" />
      <SkeletonGrid count={4} />
      <SkeletonGrid count={3} />
    </div>
  );
}
