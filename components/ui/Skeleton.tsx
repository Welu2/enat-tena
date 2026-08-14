// =============================================================================
// Skeleton Loader Primitives
// =============================================================================

interface SkeletonProps {
  className?: string;
}

export function SkeletonLine({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`h-4 bg-[#E4DCD0] rounded-lg animate-shimmer ${className}`}
    />
  );
}

export function SkeletonCircle({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`w-10 h-10 bg-[#E4DCD0] rounded-full animate-shimmer ${className}`}
    />
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-[#FAF7F2] border border-[#E4DCD0] rounded-3xl p-4 space-y-3 animate-shimmer ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#E4DCD0] rounded-2xl" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-[#E4DCD0] rounded-lg w-3/4" />
          <div className="h-3 bg-[#E4DCD0] rounded-lg w-1/2" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full-page skeleton matching the app's layout:
 * top header area + multiple skeleton cards.
 */
export function PageSkeleton() {
  return (
    <div className="flex-1 flex flex-col px-6 sm:px-7 pt-20 pb-7 space-y-4 animate-fadeIn">
      {/* Header placeholder */}
      <div className="space-y-2">
        <SkeletonLine className="w-1/3 h-3" />
        <SkeletonLine className="w-2/3 h-6" />
      </div>

      {/* Card skeletons */}
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
