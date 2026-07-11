import React from 'react';

export interface SkipLinkProps {
  /** The id of the main content area to skip to (without the #) */
  targetId?: string;
  /** The text to display in the link */
  label?: string;
}

export function SkipLink({ targetId = 'main-content', label = 'Skip to main content' }: SkipLinkProps) {
  return (
    <a href={`#${targetId}`} className="skip-link">
      {label}
    </a>
  );
}
