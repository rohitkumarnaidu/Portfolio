'use client';

interface SceneErrorFallbackProps {
  errorType: 'webgl' | 'bundle' | 'render' | 'unknown';
}

const ERROR_MESSAGES: Record<string, string> = {
  webgl: 'WebGL is not available on this device.',
  bundle: 'Failed to load 3D scene assets.',
  render: 'A rendering error occurred.',
  unknown: 'Something went wrong with the 3D scene.',
};

export const SceneErrorFallback = ({
  errorType,
}: SceneErrorFallbackProps) => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 flex items-center justify-center"
    >
      <div className="text-center max-w-md px-4">
        <p className="text-sm text-text-tertiary">
          {ERROR_MESSAGES[errorType] || ERROR_MESSAGES.unknown}
        </p>
      </div>
    </div>
  );
};
