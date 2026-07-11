'use client';

import { cn } from '@/lib/cn';

interface HeroParticlesProps {
  count?: number;
  className?: string;
}

export const HeroParticles = ({
  count = 20,
  className,
}: HeroParticlesProps) => {
  return (
    <div
      className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${(i * 37 + 13) % 100}%`,
            top: `${(i * 73 + 7) % 100}%`,
            animationDelay: `-${(i * 1.7) % 6}s`,
            animationDuration: `${5 + (i % 4) * 1.5}s`,
          }}
        />
      ))}
    </div>
  );
};
