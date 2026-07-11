'use client';

import { useState } from 'react';
import { useMediaAssets, useUploadMediaAsset, useDeleteMediaAsset } from '@/lib/hooks/useMedia';
import { FileUpload } from '@/components/admin/FileUpload';
import { Modal, Button, useToast } from '@portfolio/ui';

export default function MediaPage() {
  const [page, setPage] = useState(1);
  const { data: assets, isLoading } = useMediaAssets({ page, per_page: 24 });
  const uploadMutation = useUploadMediaAsset();
  const deleteMutation = useDeleteMediaAsset();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewAsset, setViewAsset] = useState<{ id: string; fileName: string; filePath: string; mimeType: string; fileSizeBytes: number; altText: string | null; width: number | null; height: number | null } | null>(null);
  const { addToast } = useToast();

  const handleUpload = async (file: File, altText?: string) => {
    await uploadMutation.mutateAsync({ file, altText });
    addToast({ variant: 'success', title: `${file.name} uploaded` });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      addToast({ variant: 'success', title: 'Asset deleted' });
      setDeleteTarget(null);
    } catch { addToast({ variant: 'error', title: 'Failed to delete asset' }); }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImage = (mime: string) => mime.startsWith('image/');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-h2 text-text-primary">Media Library</h1>
          <p className="text-body-sm text-text-secondary mt-1">Upload and manage images, videos, and documents</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="font-display text-h4 text-text-primary mb-4">Upload New</h2>
        <FileUpload onUpload={handleUpload} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-surface-secondary border border-border-primary animate-pulse" />
          ))}
        </div>
      ) : !assets?.length ? (
        <div className="text-center py-16">
          <p className="text-body text-text-secondary">No media assets yet. Upload your first file above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {assets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => setViewAsset(asset)}
              className="group relative aspect-square rounded-xl bg-surface-secondary border border-border-primary overflow-hidden hover:border-border-accent transition-all duration-200"
            >
              {isImage(asset.mimeType) ? (
                <img src={asset.filePath} alt={asset.altText || asset.fileName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                <p className="text-xs text-white truncate">{asset.fileName}</p>
                <p className="text-[10px] text-white/70">{formatSize(asset.fileSizeBytes)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setDeleteTarget(asset.id); }}
                className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-semantic-error"
                aria-label="Delete"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {assets && assets.length > 0 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-primary">
          <p className="text-sm text-text-tertiary">Page {page}</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>Previous</Button>
            <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={assets.length < 24}>Next</Button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Asset" size="sm">
        <p className="text-sm text-text-secondary">Are you sure you want to delete this asset? This action cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={confirmDelete}>Delete</Button>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={!!viewAsset} onClose={() => setViewAsset(null)} title={viewAsset?.fileName || ''} size="lg">
        {viewAsset && (
          <div className="space-y-4">
            {isImage(viewAsset.mimeType) ? (
              <img src={viewAsset.filePath} alt={viewAsset.altText || ''} className="max-h-96 w-full object-contain rounded-xl bg-surface-elevated" />
            ) : (
              <div className="h-48 flex items-center justify-center bg-surface-elevated rounded-xl">
                <svg className="w-16 h-16 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-text-tertiary">Type:</span> <span className="text-text-primary">{viewAsset.mimeType}</span></div>
              <div><span className="text-text-tertiary">Size:</span> <span className="text-text-primary">{formatSize(viewAsset.fileSizeBytes)}</span></div>
              {viewAsset.width && <div><span className="text-text-tertiary">Dimensions:</span> <span className="text-text-primary">{viewAsset.width} x {viewAsset.height}</span></div>}
              {viewAsset.altText && <div className="col-span-2"><span className="text-text-tertiary">Alt Text:</span> <span className="text-text-primary">{viewAsset.altText}</span></div>}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(viewAsset.filePath); addToast({ variant: 'success', title: 'URL copied' }); }}>Copy URL</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
