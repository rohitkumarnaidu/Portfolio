'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/cn';

interface FileDropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  label?: string;
  className?: string;
}

type DropState = 'idle' | 'dragover' | 'accepting' | 'rejecting';

export const FileDropZone = ({
  onFiles,
  accept,
  maxFiles = 1,
  maxSizeMB = 10,
  label = 'Drop files here or click to upload',
  className,
}: FileDropZoneProps) => {
  const [dropState, setDropState] = useState<DropState>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const validateFiles = useCallback(
    (files: FileList | File[]): File[] => {
      const valid: File[] = [];
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        if (accept && !file.type.match(accept.replace(/\*/g, '.*'))) continue;
        if (file.size > maxSizeMB * 1024 * 1024) continue;
        valid.push(file);
      }

      return valid.slice(0, maxFiles);
    },
    [accept, maxFiles, maxSizeMB],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;

      const files = validateFiles(e.dataTransfer.files);
      if (files.length > 0) {
        setDropState('accepting');
        onFiles(files);
      } else {
        setDropState('rejecting');
      }

      setTimeout(() => setDropState('idle'), 1000);
    },
    [validateFiles, onFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDragEnter = useCallback(() => {
    dragCounter.current++;
    if (dragCounter.current === 1) {
      setDropState('dragover');
    }
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDropState('idle');
    }
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = validateFiles(e.target.files || []);
      if (files.length > 0) {
        onFiles(files);
      }
      e.target.value = '';
    },
    [validateFiles, onFiles],
  );

  const stateStyles = {
    idle: 'border-border-accent',
    dragover: 'border-accent-500 bg-accent-500/5',
    accepting: 'border-semantic-success bg-semantic-success/5',
    rejecting: 'border-semantic-error bg-semantic-error/5',
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      className={cn(
        'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
        'hover:border-accent-500 focus-visible:ring-2 focus-visible:ring-accent-500',
        stateStyles[dropState],
        className,
      )}
      aria-label={label}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleFileInput}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      <svg
        className="w-8 h-8 mx-auto mb-2 text-text-tertiary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>

      <p className="text-sm text-text-secondary">{label}</p>
      {accept && <p className="text-xs text-text-tertiary mt-1">Accepted: {accept}</p>}
      <p className="text-xs text-text-tertiary">Max {maxSizeMB}MB per file</p>
    </div>
  );
};
