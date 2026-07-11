'use client';

export const SceneFallback = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-accent-500/30 border-t-accent-500 animate-spin" />
        <span className="text-sm text-text-tertiary">Loading scene...</span>
      </div>
    </div>
  );
};
