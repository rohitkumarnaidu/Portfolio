'use client';

import React, { useRef, useState } from 'react';
import { Button } from '@portfolio/ui';

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  error?: string;
  label?: string;
}

export function ImageUpload({ value, onChange, error, label = 'Upload Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('admin_access_token');
      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      const json = await res.json();
      
      // Assume the API returns { data: { id, filePath, imageUrl } } or similar
      // Depending on the exact media service implementation, we might need to adjust this
      const fileUrl = json.data?.imageUrl || json.data?.filePath || json.data?.url;
      if (fileUrl) {
        onChange(fileUrl);
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {label && <label className="block text-sm font-medium text-text-primary">{label}</label>}
      <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors ${error ? 'border-red-500 bg-red-500/5' : 'border-border-primary hover:border-accent-500 bg-surface-secondary'}`}>
        {value ? (
          <div className="relative w-full aspect-video rounded overflow-hidden mb-4 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Uploaded" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
               <Button size="sm" onClick={() => fileInputRef.current?.click()} type="button">Change</Button>
               <Button size="sm" variant="danger" onClick={() => onChange('')} type="button">Remove</Button>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-text-tertiary mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} isLoading={uploading} type="button">
              {uploading ? 'Uploading...' : 'Browse files'}
            </Button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
