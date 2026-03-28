import React, { useState, useRef, useCallback } from 'react';
import { Star, Trash2, Upload, ChevronUp, ChevronDown, Loader2, X } from 'lucide-react';
import { api } from '../../lib/api';
import { usePhotos } from '../../hooks/usePhotos';
import { Photo } from '../../data/portfolio.config';
import exifr from 'exifr';

interface UploadPreview {
  file: File;
  previewUrl: string;
  title: string;
  exif: Photo['exif'] | null;
}

const PhotoManager: React.FC = () => {
  const { photos, loading, refetch } = usePhotos();
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<UploadPreview | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<{ id: string; value: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File selection ────────────────────────────────────────────────────────

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    const previewUrl = URL.createObjectURL(file);

    // Extract EXIF using exifr
    let exif: Photo['exif'] | null = null;
    try {
      const raw = await exifr.parse(file, {
        pick: ['Make', 'Model', 'LensModel', 'FNumber', 'ExposureTime', 'ISO'],
      });
      if (raw) {
        const camera = [raw.Make, raw.Model].filter(Boolean).join(' ').trim();
        const aperture = raw.FNumber ? `f/${raw.FNumber}` : '';
        const shutter = raw.ExposureTime
          ? raw.ExposureTime < 1
            ? `1/${Math.round(1 / raw.ExposureTime)}s`
            : `${raw.ExposureTime}s`
          : '';
        const iso = raw.ISO ? `ISO ${raw.ISO}` : '';
        exif = {
          camera: camera || 'Unknown',
          lens: raw.LensModel || '',
          aperture,
          shutter,
          iso,
        };
      }
    } catch {
      // EXIF not available
    }

    const nameWithoutExt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    setUploadPreview({ file, previewUrl, title: nameWithoutExt, exif });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  // ── Upload to Cloudinary + save to DB ────────────────────────────────────

  const handleUpload = async () => {
    if (!uploadPreview) return;
    setUploading(true);
    try {
      // 1. Get signed upload params from our function
      const sig = await api.getUploadSignature();

      // 2. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append('file', uploadPreview.file);
      formData.append('api_key', sig.apiKey);
      formData.append('timestamp', String(sig.timestamp));
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const cloudData = await cloudRes.json();

      if (!cloudData.secure_url) {
        throw new Error(cloudData.error?.message || 'Cloudinary upload failed');
      }

      // 3. Save metadata to Supabase via our API
      const id = cloudData.public_id.split('/').pop() || cloudData.public_id;
      await api.addPhoto({
        id,
        url: cloudData.secure_url,
        title: uploadPreview.title || undefined,
        collection: 'Gallery',
        isPinned: false,
        exif: uploadPreview.exif || undefined,
        cloudinaryPublicId: cloudData.public_id,
        timestamp: cloudData.created_at ? new Date(cloudData.created_at).getTime() : undefined,
      });

      URL.revokeObjectURL(uploadPreview.previewUrl);
      setUploadPreview(null);
      await refetch();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // ── Photo actions ─────────────────────────────────────────────────────────

  const toggleHighlight = async (photo: Photo) => {
    setActionLoading(`highlight-${photo.id}`);
    try {
      const newPinned = !photo.isPinned;
      const newCollection = newPinned ? 'Highlight' : 'Gallery';
      await api.updatePhoto(photo.id, { isPinned: newPinned, collection: newCollection });
      await refetch();
    } finally {
      setActionLoading(null);
    }
  };

  const deletePhoto = async (photo: Photo) => {
    if (!confirm(`Delete "${photo.title || photo.id}"? This cannot be undone.`)) return;
    setActionLoading(`delete-${photo.id}`);
    try {
      await api.deletePhoto(photo.id);
      await refetch();
    } finally {
      setActionLoading(null);
    }
  };

  const movePhoto = async (photo: Photo, direction: 'up' | 'down') => {
    const sorted = [...photos].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex((p) => p.id === photo.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const swapPhoto = sorted[swapIdx];
    setActionLoading(`move-${photo.id}`);
    try {
      await Promise.all([
        api.updatePhoto(photo.id, { order: swapPhoto.order }),
        api.updatePhoto(swapPhoto.id, { order: photo.order }),
      ]);
      await refetch();
    } finally {
      setActionLoading(null);
    }
  };

  const saveTitle = async (id: string, title: string) => {
    setActionLoading(`title-${id}`);
    try {
      await api.updatePhoto(id, { title });
      await refetch();
      setEditingTitle(null);
    } finally {
      setActionLoading(null);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const pinnedPhotos = photos.filter((p) => p.isPinned).sort((a, b) => a.order - b.order);
  const galleryPhotos = photos.filter((p) => !p.isPinned).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-12">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-charcoal/10 pb-8">
        <div>
          <h2 className="font-serif italic text-3xl text-charcoal mb-1">Photos</h2>
          <p className="font-mono text-[10px] tracking-widest uppercase text-slate/50">
            {photos.length} total · {pinnedPhotos.length} hero highlights
          </p>
        </div>

        {/* Upload trigger */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-5 py-2.5 border border-charcoal/20 hover:border-charcoal/60 font-mono text-[10px] tracking-widest uppercase text-charcoal/60 hover:text-charcoal transition-all duration-300"
        >
          <Upload size={13} strokeWidth={1.5} />
          Upload Photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Drop zone (shows when dragging) */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded transition-all duration-300 ${
          dragOver
            ? 'border-charcoal/40 bg-charcoal/5 py-8'
            : 'border-charcoal/10 py-4'
        } text-center`}
      >
        <p className="font-mono text-[10px] tracking-widest uppercase text-slate/30">
          {dragOver ? 'Drop to upload' : 'Or drag a photo anywhere here'}
        </p>
      </div>

      {/* Upload preview modal */}
      {uploadPreview && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-background max-w-lg w-full p-8 relative shadow-2xl">
            <button
              onClick={() => { URL.revokeObjectURL(uploadPreview.previewUrl); setUploadPreview(null); }}
              className="absolute top-4 right-4 text-slate/40 hover:text-charcoal transition-colors"
            >
              <X size={16} />
            </button>

            <p className="font-mono text-[10px] tracking-widest uppercase text-slate/50 mb-6">New Photo</p>

            <img
              src={uploadPreview.previewUrl}
              alt="Preview"
              className="w-full max-h-64 object-contain mb-6 bg-slate/5"
            />

            {/* Title input */}
            <div className="mb-4">
              <label className="block font-mono text-[10px] tracking-widest uppercase text-slate/50 mb-2">Title</label>
              <input
                type="text"
                value={uploadPreview.title}
                onChange={(e) => setUploadPreview((p) => p ? { ...p, title: e.target.value } : p)}
                className="w-full bg-transparent border-b border-charcoal/20 focus:border-charcoal/60 outline-none py-2 font-sans text-sm text-charcoal transition-colors duration-300"
              />
            </div>

            {/* EXIF preview */}
            {uploadPreview.exif && (
              <div className="mb-6 p-4 bg-slate/5 font-mono text-[10px] text-slate/60 space-y-1">
                <p>{uploadPreview.exif.camera}</p>
                {uploadPreview.exif.lens && <p>{uploadPreview.exif.lens}</p>}
                <p>{[uploadPreview.exif.aperture, uploadPreview.exif.shutter, uploadPreview.exif.iso].filter(Boolean).join(' · ')}</p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full py-3 border border-charcoal/20 hover:border-charcoal/60 font-mono text-[10px] tracking-widest uppercase text-charcoal/60 hover:text-charcoal transition-all duration-300 disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><Loader2 size={13} className="animate-spin" /> Uploading…</>
              ) : (
                'Add to Portfolio'
              )}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={20} className="animate-spin text-slate/40" />
        </div>
      ) : (
        <>
          {/* Hero Highlights section */}
          {pinnedPhotos.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                <Star size={14} strokeWidth={1.5} className="text-charcoal/60" />
                <h3 className="font-mono text-[10px] tracking-widest uppercase text-charcoal/60">
                  Hero Highlights ({pinnedPhotos.length}/3)
                </h3>
              </div>
              <PhotoGrid
                photos={pinnedPhotos}
                allPhotos={photos}
                onToggleHighlight={toggleHighlight}
                onDelete={deletePhoto}
                onMove={movePhoto}
                onSaveTitle={saveTitle}
                actionLoading={actionLoading}
                editingTitle={editingTitle}
                setEditingTitle={setEditingTitle}
              />
            </section>
          )}

          {/* Gallery section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="font-mono text-[10px] tracking-widest uppercase text-charcoal/60">
                Gallery ({galleryPhotos.length})
              </h3>
            </div>
            {galleryPhotos.length === 0 ? (
              <p className="font-mono text-[10px] tracking-widest uppercase text-slate/30 py-12 text-center border border-dashed border-charcoal/10">
                No gallery photos yet
              </p>
            ) : (
              <PhotoGrid
                photos={galleryPhotos}
                allPhotos={photos}
                onToggleHighlight={toggleHighlight}
                onDelete={deletePhoto}
                onMove={movePhoto}
                onSaveTitle={saveTitle}
                actionLoading={actionLoading}
                editingTitle={editingTitle}
                setEditingTitle={setEditingTitle}
              />
            )}
          </section>
        </>
      )}
    </div>
  );
};

// ── Photo grid sub-component ─────────────────────────────────────────────────

interface PhotoGridProps {
  photos: Photo[];
  allPhotos: Photo[];
  onToggleHighlight: (p: Photo) => void;
  onDelete: (p: Photo) => void;
  onMove: (p: Photo, dir: 'up' | 'down') => void;
  onSaveTitle: (id: string, title: string) => void;
  actionLoading: string | null;
  editingTitle: { id: string; value: string } | null;
  setEditingTitle: React.Dispatch<React.SetStateAction<{ id: string; value: string } | null>>;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  allPhotos,
  onToggleHighlight,
  onDelete,
  onMove,
  onSaveTitle,
  actionLoading,
  editingTitle,
  setEditingTitle,
}) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
    {photos.map((photo, idx) => {
      const isFirst = idx === 0;
      const isLast = idx === photos.length - 1;
      const busy = actionLoading?.includes(photo.id);

      return (
        <div key={photo.id} className="group relative bg-slate/5">
          {/* Thumbnail */}
          <div className="aspect-square overflow-hidden">
            <img
              src={photo.url}
              alt={photo.title || photo.id}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Overlay controls */}
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/50 transition-all duration-300 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100">
            {/* Top row: highlight + delete */}
            <div className="flex justify-between">
              <button
                onClick={() => onToggleHighlight(photo)}
                disabled={!!busy || (!photo.isPinned && allPhotos.filter((p) => p.isPinned).length >= 3)}
                title={photo.isPinned ? 'Remove from hero' : 'Pin to hero (max 3)'}
                className={`p-1.5 rounded transition-colors ${
                  photo.isPinned
                    ? 'text-yellow-300 bg-charcoal/40'
                    : 'text-white/70 hover:text-yellow-300 bg-charcoal/40'
                } disabled:opacity-30`}
              >
                <Star size={13} fill={photo.isPinned ? 'currentColor' : 'none'} />
              </button>

              <button
                onClick={() => onDelete(photo)}
                disabled={!!busy}
                title="Delete photo"
                className="p-1.5 rounded text-white/70 hover:text-red-400 bg-charcoal/40 transition-colors disabled:opacity-30"
              >
                <Trash2 size={13} />
              </button>
            </div>

            {/* Bottom row: order arrows */}
            <div className="flex justify-center gap-1">
              <button
                onClick={() => onMove(photo, 'up')}
                disabled={!!busy || isFirst}
                title="Move earlier"
                className="p-1.5 rounded text-white/70 hover:text-white bg-charcoal/40 transition-colors disabled:opacity-20"
              >
                <ChevronUp size={13} />
              </button>
              <button
                onClick={() => onMove(photo, 'down')}
                disabled={!!busy || isLast}
                title="Move later"
                className="p-1.5 rounded text-white/70 hover:text-white bg-charcoal/40 transition-colors disabled:opacity-20"
              >
                <ChevronDown size={13} />
              </button>
            </div>
          </div>

          {/* Loading spinner */}
          {busy && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Loader2 size={16} className="animate-spin text-charcoal/60" />
            </div>
          )}

          {/* Title (editable) */}
          <div className="p-2">
            {editingTitle?.id === photo.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSaveTitle(photo.id, editingTitle.value);
                }}
                className="flex gap-1"
              >
                <input
                  autoFocus
                  type="text"
                  value={editingTitle.value}
                  onChange={(e) => setEditingTitle({ id: photo.id, value: e.target.value })}
                  onBlur={() => onSaveTitle(photo.id, editingTitle.value)}
                  className="flex-1 min-w-0 text-[10px] font-sans bg-transparent border-b border-charcoal/30 outline-none text-charcoal py-0.5"
                />
              </form>
            ) : (
              <button
                onClick={() => setEditingTitle({ id: photo.id, value: photo.title || '' })}
                className="w-full text-left font-mono text-[10px] text-slate/60 hover:text-charcoal truncate transition-colors"
                title="Click to edit title"
              >
                {photo.title || <span className="text-slate/30 italic">Add title…</span>}
              </button>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

export default PhotoManager;
