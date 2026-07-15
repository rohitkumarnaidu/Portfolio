export function BlogDetailSkeleton() {
  return (
    <div className="pt-32 pb-24 section-container">
      <div className="animate-pulse space-y-6 max-w-3xl">
        <div className="h-4 w-32 bg-surface-elevated rounded" />
        <div className="h-10 w-3/4 bg-surface-elevated rounded" />
        <div className="h-6 w-1/2 bg-surface-elevated rounded" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-4 w-full bg-surface-elevated rounded"
              style={{ width: `${70 + Math.random() * 30}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
