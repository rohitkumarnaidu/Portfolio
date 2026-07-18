'use client';

import React from 'react';
import { cn } from './cn';

/**
 * NotificationDot — Presence indicator with online/away/busy/offline states.
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 */

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

export interface NotificationDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Presence status */
  status?: PresenceStatus;
  /** Size in px */
  size?: number;
  /** Show pulsing ring animation (online only) */
  pulse?: boolean;
  /** Accessible label override */
  'aria-label'?: string;
}

const statusColor: Record<PresenceStatus, string> = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-zinc-400 dark:bg-zinc-600',
};

const statusLabel: Record<PresenceStatus, string> = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline',
};

export function NotificationDot({
  status = 'offline',
  size = 10,
  pulse = false,
  className,
  'aria-label': ariaLabel,
  ...props
}: NotificationDotProps) {
  const label = ariaLabel ?? statusLabel[status];
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('relative inline-flex', className)}
      style={{ width: size, height: size }}
      {...props}
    >
      {pulse && status === 'online' && (
        <span
          className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 motion-reduce:hidden',
            statusColor[status],
          )}
          aria-hidden="true"
        />
      )}
      <span
        className={cn('relative inline-flex rounded-full', statusColor[status])}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    </span>
  );
}
