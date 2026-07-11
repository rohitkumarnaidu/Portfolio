export function ProjectDetailSkeleton() {
  return (
    <div className="pt-32 pb-24 section-container">
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-32 bg-surface-elevated rounded" />
        <div className="h-10 w-3/4 bg-surface-elevated rounded" />
        <div className="h-6 w-1/2 bg-surface-elevated rounded" />
        <div className="aspect-[21/9] bg-surface-elevated rounded-xl" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-surface-elevated rounded" />
          <div className="h-4 w-5/6 bg-surface-elevated rounded" />
          <div className="h-4 w-4/6 bg-surface-elevated rounded" />
        </div>
      </div>
    </div>
  );
}
