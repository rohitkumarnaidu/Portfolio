'use client';

import { cn } from '@/lib/cn';

interface AIBreathingRingProps {
  isThinking: boolean;
  className?: string;
}

export const AIBreathingRing = ({ isThinking, className }: AIBreathingRingProps) => {
  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          'relative flex items-center justify-center transition-all duration-300',
          isThinking ? 'opacity-100 scale-100' : 'opacity-0 scale-80 pointer-events-none',
          className
        )}
      >
        <div
          className={cn(
            'w-5 h-5 rounded-full border-2 border-accent-500 transition-all duration-300',
            isThinking ? 'animate-breath' : ''
          )}
        />
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes breath {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(1.05); }
          }
          .animate-breath {
            animation: breath 1.5s ease-in-out infinite;
          }
        `
      }} />
    </>
  );
};
