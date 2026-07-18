'use client';

import React, { useRef, useState, useId, DragEvent } from 'react';
import { cn } from './cn';

/**
 * FileUpload — Drag-and-drop + click file picker (UI only).
 *
 * @see docs/FRONTEND-IMPLEMENTATION-PLAN.md §4 (Component Library)
 *
 * States: empty / uploading / uploaded / error. Calls `onFiles` with selected
 * File objects; no network/backend wiring is performed.
 */

export type UploadState = 'empty' | 'uploading' | 'uploaded' | 'error';

export interface UploadedFile {
  /** Source File object */
  file: File;
  /** Local preview URL (for images) */
  previewUrl?: string;
}

export interface FileUploadProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Allow selecting multiple files */
  multiple?: boolean;
  /** Accepted MIME types / extensions */
  accept?: string;
  /** Disable the control */
  disabled?: boolean;
  /** Visual state */
  state?: UploadState;
  /** Upload progress 0-100 (when uploading) */
  progress?: number;
  /** Error message */
  error?: string;
  /** Selected files (for uploaded/error display) */
  files?: UploadedFile[];
  /** Callback when files are chosen */
  onFiles?: (files: File[]) => void;
  /** Click to browse (default true) */
  clickToUpload?: boolean;
  /** Hint text */
  hint?: string;
}

export function FileUpload({
  multiple = false,
  accept,
  disabled = false,
  state: controlledState,
  progress = 0,
  error,
  files: controlledFiles,
  onFiles,
  clickToUpload = true,
  hint = 'Drag & drop or click to browse',
  className,
  id: externalId,
  ...props
}: FileUploadProps) {
  const baseId = useId();
  const id = externalId ?? baseId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>([]);
  const [internalState, setInternalState] = useState<UploadState>('empty');

  const files = controlledFiles ?? internalFiles;
  const state = controlledState ?? internalState;

  const handle = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const picked = Array.from(list);
    const mapped: UploadedFile[] = picked.map((f) => ({
      file: f,
      previewUrl: f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined,
    }));
    if (!controlledFiles) setInternalFiles(mapped);
    if (controlledState === undefined) setInternalState(mapped.length ? 'uploaded' : 'empty');
    onFiles?.(picked);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    handle(e.dataTransfer.files);
  };

  const stateClasses: Record<UploadState, string> = {
    empty: 'border-border-primary bg-surface-secondary hover:border-border-accent',
    uploading: 'border-accent-500 bg-accent-500/5',
    uploaded: 'border-green-500 bg-green-500/5',
    error: 'border-red-500 bg-red-500/5',
  };

  return (
    <div className={cn('w-full space-y-2', className)} {...props}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="File upload"
        aria-disabled={disabled}
        onClick={() => !disabled && clickToUpload && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && clickToUpload && 'cursor-pointer',
          dragOver && 'border-accent-500 bg-accent-500/5',
          stateClasses[state],
        )}
      >
        {state === 'uploading' ? (
          <>
            <span className="text-sm font-medium text-text-primary">Uploading… {progress}%</span>
            <div className="h-2 w-40 overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full bg-accent-500 transition-[width] duration-normal"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <svg className="h-8 w-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            <p className="text-sm text-text-primary">{hint}</p>
            {accept && <p className="text-xs text-text-tertiary">Accepted: {accept}</p>}
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          id={id}
          className="sr-only"
          multiple={multiple}
          accept={accept}
          disabled={disabled}
          onChange={(e) => handle(e.target.files)}
          tabIndex={-1}
        />
      </div>

      {state === 'error' && error && (
        <p className="text-sm text-red-500 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {state === 'uploaded' && files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f, i) => (
            <li
              key={`${f.file.name}-${i}`}
              className="flex items-center gap-3 rounded-lg border border-border-primary bg-surface-primary px-3 py-2"
            >
              {f.previewUrl ? (
                <img src={f.previewUrl} alt="" className="h-9 w-9 rounded object-cover" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded bg-surface-elevated text-text-tertiary" aria-hidden="true">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9l-8-8H7a2 2 0 00-2 2v16a2 2 0 002 2z" />
                  </svg>
                </span>
              )}
              <span className="flex-1 truncate text-sm text-text-primary">{f.file.name}</span>
              <span className="text-xs text-green-600 dark:text-green-400">Uploaded</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
