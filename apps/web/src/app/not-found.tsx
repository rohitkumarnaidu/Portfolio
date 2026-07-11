import React from 'react';
import Link from 'next/link';
import { Button } from '@portfolio/ui';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-[70vh] items-center justify-center px-4 text-center">
      <div className="space-y-6 max-w-lg">
        <h1 className="text-display font-display text-accent-500 tracking-tight">
          404
        </h1>
        
        <h2 className="text-h2 font-display text-text-primary">
          Page not found
        </h2>
        
        <p className="text-body-lg text-text-secondary">
          Sorry, I could not find the page you are looking for. It might have been moved or deleted.
        </p>

        <div className="pt-8">
          <Link href="/" className="inline-block">
            <Button variant="primary" size="lg">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
