'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/cn';

interface FileUploadProps {
  onUpload: (file: File, altText?: string) => Promise<void>;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUpload({ onUpload, accept = 'image/*,video/*,application/pdf', maxSizeMB = 50 }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setError('');
    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }
    setFile(f);
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }, [maxSizeMB]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await onUpload(file, altText || undefined);
      setFile(null);
      setPreview(null);
      setAltText('');
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
          dragOver ? 'border-accent-500 bg-accent-500/5' : 'border-border-primary hover:border-border-accent hover:bg-surface-elevated/50',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <svg className="w-10 h-10 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <p className="text-sm text-text-secondary">Drag & drop or click to browse</p>
            <p className="text-xs text-text-tertiary">Images, videos, PDFs up to {maxSizeMB}MB</p>
          </div>
        )}
      </div>

      {file && (
        <div className="space-y-3 bg-surface-secondary rounded-xl p-4 border border-border-primary">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{file.name}</p>
              <p className="text-xs text-text-tertiary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Alt text (for accessibility)"
            className="w-full rounded-lg border border-border-primary bg-surface-primary px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary/50"
          />
          <div className="flex gap-2">
            <button onClick={handleUpload} disabled={uploading} className="flex-1 px-4 py-2 rounded-xl bg-accent-500 text-white text-sm font-medium hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Uploading...
                </span>
              ) : 'Upload'}
            </button>
            <button onClick={() => { setFile(null); setPreview(null); setAltText(''); }} disabled={uploading} className="px-4 py-2 rounded-xl bg-surface-elevated text-text-secondary text-sm font-medium hover:text-text-primary transition-colors disabled:opacity-50">Cancel</button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-semantic-error bg-semantic-error-bg rounded-lg px-3 py-2">{error}</p>
      )}
    </div>
  );
}
