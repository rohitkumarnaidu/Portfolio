'use client';

import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { track } from '@/lib/analytics';

interface TrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  event: string;
  properties?: Record<string, unknown>;
  children?: ReactNode;
}

/**
 * Drop-in `<a>` replacement that records one cookieless event on click and
 * then lets the browser navigate normally — it never calls `preventDefault`.
 * Every other anchor attribute is forwarded unchanged.
 */
export function TrackedLink({
  href,
  event,
  properties,
  onClick,
  children,
  ...anchorProps
}: TrackedLinkProps) {
  return (
    <a
      href={href}
      onClick={(clickEvent) => {
        track(event, properties);
        onClick?.(clickEvent);
      }}
      {...anchorProps}
    >
      {children}
    </a>
  );
}
