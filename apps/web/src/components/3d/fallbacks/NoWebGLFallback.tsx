'use client';

export const NoWebGLFallback = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 flex items-center justify-center"
    >
      <div className="text-center max-w-md px-4">
        <p className="text-sm text-text-tertiary">
          Your browser does not support WebGL.
        </p>
      </div>
    </div>
  );
};
