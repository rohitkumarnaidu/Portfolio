'use client';

import React from 'react';
import { Skeleton } from '@portfolio/ui';

/**
 * Root Loading Boundary
 * Displayed while server components are resolving (e.g. fetching initial data).
 * Provides a smooth skeleton layout to avoid CLS.
 */
export default function RootLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center pt-20">
        <div className="section-container flex flex-col items-center justify-center text-center space-y-8 w-full">
          {/* Hero skeleton */}
          <div className="space-y-4 w-full max-w-3xl mx-auto flex flex-col items-center">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-16 md:h-24 w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4 rounded-lg" />
          </div>
          
          <div className="flex items-center gap-4 pt-4">
            <Skeleton className="h-12 w-32 rounded-lg" />
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full pt-16">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
