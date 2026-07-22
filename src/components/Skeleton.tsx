export function SkeletonCard() {
  return (
    <div className="bg-card rounded-xl border border-gray-200/70 shadow-sm p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-200" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-2.5 bg-gray-100 rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 bg-gray-100 rounded w-full" />
        <div className="h-2.5 bg-gray-100 rounded w-5/6" />
        <div className="h-2.5 bg-gray-100 rounded w-2/3" />
      </div>
      <div className="flex gap-2 pt-1">
        <div className="h-6 bg-gray-100 rounded-full w-16" />
        <div className="h-6 bg-gray-100 rounded-full w-16" />
        <div className="h-6 bg-gray-100 rounded-full w-16" />
      </div>
    </div>
  );
}

export function SkeletonLine({ width = '100%' }: { width?: string }) {
  return (
    <div className="h-3 bg-gray-200 rounded animate-pulse" style={{ width }} />
  );
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-card rounded-xl border border-gray-200/70 shadow-sm overflow-hidden animate-pulse ${className}`}>
      <div className="h-12 bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-2.5 bg-gray-100 rounded w-full" />
        <div className="h-2.5 bg-gray-100 rounded w-5/6" />
        <div className="h-2.5 bg-gray-100 rounded w-3/4" />
      </div>
    </div>
  );
}
