'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';

export interface PageWrapperProps {
  width?: 'narrow' | 'default' | 'wide' | 'full';
  paddingX?: 'none' | 'sm' | 'default' | 'lg';
  paddingY?: 'none' | 'sm' | 'default' | 'lg';
  title?: string;
  description?: string;
  hero?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function PageWrapper({
  width = 'default',
  paddingX = 'default',
  paddingY = 'default',
  title,
  description,
  hero = false,
  className,
  children,
}: PageWrapperProps) {
  const widthStyles = {
    narrow: 'max-w-3xl',
    default: 'max-w-7xl',
    wide: 'max-w-[1440px]',
    full: 'max-w-none',
  };

  const pxStyles = {
    none: 'px-0',
    sm: 'px-4',
    default: 'px-4 md:px-6 lg:px-8',
    lg: 'px-6 md:px-10 lg:px-16',
  };

  const pyStyles = {
    none: 'py-0',
    sm: 'py-8',
    default: 'py-12 md:py-16',
    lg: 'py-16 md:py-24',
  };

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col min-h-[100dvh] w-full bg-surface-primary"
    >
      {hero && title && (
        <section className="w-full bg-gradient-hero text-text-primary py-24 md:py-32 relative overflow-hidden">
          <div className="noise-overlay" aria-hidden="true" />
          <div
            className={cn(
              'mx-auto w-full relative z-10 text-center',
              widthStyles[width],
              pxStyles[paddingX],
            )}
          >
            <h1 className="font-display text-display font-bold tracking-tight mb-4 text-white">
              {title}
            </h1>
            {description && (
              <p className="text-body-lg text-white/90 max-w-2xl mx-auto text-balance">
                {description}
              </p>
            )}
          </div>
        </section>
      )}

      {!hero && title && (
        <header
          className={cn(
            'mx-auto w-full pt-16 md:pt-24 pb-8',
            widthStyles[width],
            pxStyles[paddingX],
          )}
        >
          <h1 className="font-display text-h1 font-bold tracking-tight text-text-primary">
            {title}
          </h1>
          {description && (
            <p className="mt-4 text-body-lg text-text-secondary max-w-2xl text-pretty">
              {description}
            </p>
          )}
        </header>
      )}

      <div
        className={cn(
          'flex-grow w-full mx-auto',
          widthStyles[width],
          pxStyles[paddingX],
          !hero && !title ? pyStyles[paddingY] : 'pb-16 md:pb-24',
          className,
        )}
      >
        {children}
      </div>
    </motion.main>
  );
}
