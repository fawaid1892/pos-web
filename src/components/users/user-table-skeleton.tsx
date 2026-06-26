/** Skeleton loading untuk tabel user */
export function UserTableSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {/* Header row skeleton */}
      <div className="flex items-center gap-4 px-4 py-3">
        {[40, 24, 32, 24].map((w, i) => (
          <div key={i} className="h-4 bg-muted rounded" style={{ width: `${w}%` }} />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
          <div className="h-4 w-28 bg-muted rounded hidden sm:block" />
          <div className="h-6 w-20 bg-muted rounded-full" />
          <div className="h-4 w-16 bg-muted rounded hidden md:block" />
        </div>
      ))}
    </div>
  );
}
