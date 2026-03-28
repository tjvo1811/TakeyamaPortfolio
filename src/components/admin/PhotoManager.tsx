import React, { useState, useRef, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Star, Trash2, Upload, Loader2, X, GripVertical } from 'lucide-react';
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

// ── Sortable photo card ───────────────────────────────────────────────────────

interface CardProps {
  photo: Photo;
  allPinnedCount: number;
  onToggleHighlight: (p: Photo) => void;
  onDelete: (p: Photo) => void;
  onSaveTitle: (id: string, title: string) => void;
  actionLoading: string | null;
}

const SortablePhotoCard: React.FC<CardProps> = ({
  photo,
  allPinnedCount,
  onToggleHighlight,
  onDelete,
  onSaveTitle,
  actionLoading,
}) => {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(photo.title || '');
  const busy = actionLoading?.includes(photo.id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const handleTitleBlur = () => {
    if (titleValue !== (photo.title || '')) {
      onSaveTitle(photo.id, titleValue);
    }
    setEditingTitle(false);
  };

  const canPin = !photo.isPinned && allPinnedCount >= 3;

  return (
    <div ref={setNodeRef} style={style} className="bg-slate/5 flex flex-col">
      {/* Top bar: drag handle + actions */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-charcoal/8">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-charcoal/30 hover:text-charcoal/60 transition-colors touch-none p-1"
          title="Drag to reorder"
        >
          <GripVertical size={14} strokeWidth={1.5} />
        </button>

        <div className="flex items-center gap-1">
          {/* Star / highlight toggle */}
          <button
            onClick={() => onToggleHighlight(photo)}
            disabled={!!busy || canPin}
            title={photo.isPinned ? 'Remove from hero' : canPin ? 'Max 3 hero highlights' : 'Pin to hero'}
            className={`p-1.5 rounded transition-colors disabled:opacity-30 ${
              photo.isPinned
                ? 'text-yellow-500'
                : 'text-charcoal/30 hover:text-yellow-500'
            }`}
          >
            <Star size={13} fill={photo.isPinned ? 'currentColor' : 'none'} />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(photo)}
            disabled={!!busy}
            title="Delete photo"
            className="p-1.5 rounded text-charcoal/30 hover:text-red-400 transition-colors disabled:opacity-30"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={photo.url}
          alt={photo.title || photo.id}
          className="w-full h-full object-cover"
          loading="lazy"
          draggable={false}
        />
        {busy && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <Loader2 size={16} className="animate-spin text-charcoal/60" />
          </div>
        )}
      </div>

      {/* Title — always visible, tap to edit */}
      <div className="px-2 py-2 min-h-[32px]">
        {editingTitle ? (
          <input
            autoFocus
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
            className="w-full text-[11px] font-sans bg-transparent border-b border-charcoal/30 outline-none text-charcoal py-0.5"
          />
        ) : (
          <button
            onPointerDown={(e) => {
              // Prevent drag from triggering when tapping title
              e.stopPropagation();
            }}
            onClick={() => {
              setTitleValue(photo.title || '');
              setEditingTitle(true);
            }}
            className="w-full text-left font-mono text-[10px] text-slate/60 hover:text-charcoal active:text-charcoal truncate transition-colors"
          >
            {photo.title || <span className="text-slate/30 italic">Tap to add title…</span>}
          </button>
        )}
      </div>
    </div>
  );
};

// ── Main PhotoManager ─────────────────────────────────────────────────────────

const PhotoManager: React.FC = () => {
  const { photos, loading, refetch } = usePhotos();
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<UploadPreview | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // dnd-kit sensors: pointer (desktop) + touch (mobile)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  // ── File selection ──────────────────────────────────────────────────────

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;

    const previewUrl = URL.createObjectURL(file);
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
        exif = { camera: camera || 'Unknown', lens: raw.LensModel || '', aperture, shutter, iso };
      }
    } catch { /* EXIF not available */ }

    const nameWithoutExt = file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    setUploadPreview({ file, previewUrl, title: nameWithoutExt, exif });
  }, []);

  // ── Upload ──────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!uploadPreview) return;
    setUploading(true);
    try {
      const sig = await api.getUploadSignature();
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
      if (!cloudData.secure_url) throw new Error(cloudData.error?.message || 'Upload failed');

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

  // ── Photo actions ───────────────────────────────────────────────────────

  const toggleHighlight = async (photo: Photo) => {
    setActionLoading(`highlight-${photo.id}`);
    try {
      await api.updatePhoto(photo.id, {
        isPinned: !photo.isPinned,
        collection: !photo.isPinned ? 'Highlight' : 'Gallery',
      });
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

  const saveTitle = async (id: string, title: string) => {
    setActionLoading(`title-${id}`);
    try {
      await api.updatePhoto(id, { title });
      await refetch();
    } finally {
      setActionLoading(null);
    }
  };

  // ── Drag end handler ────────────────────────────────────────────────────

  const handleDragEnd = async (event: DragEndEvent, section: 'pinned' | 'gallery') => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sectionPhotos = section === 'pinned'
      ? [...photos].filter(p => p.isPinned).sort((a, b) => a.order - b.order)
      : [...photos].filter(p => !p.isPinned).sort((a, b) => a.order - b.order);

    const oldIndex = sectionPhotos.findIndex(p => p.id === active.id);
    const newIndex = sectionPhotos.findIndex(p => p.id === over.id);
    const reordered = arrayMove(sectionPhotos, oldIndex, newIndex);

    // Persist new orders in parallel
    const baseOrder = section === 'pinned' ? 1 : photos.filter(p => p.isPinned).length + 1;
    await Promise.all(
      reordered.map((photo, idx) =>
        api.updatePhoto(photo.id, { order: baseOrder + idx })
      )
    );
    await refetch();
  };

  // ── Render ──────────────────────────────────────────────────────────────

  const pinnedPhotos = photos.filter(p => p.isPinned).sort((a, b) => a.order - b.order);
  const galleryPhotos = photos.filter(p => !p.isPinned).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-charcoal/10 pb-8">
        <div>
          <h2 className="font-serif italic text-3xl text-charcoal mb-1">Photos</h2>
          <p className="font-mono text-[10px] tracking-widest uppercase text-slate/50">
            {photos.length} total · {pinnedPhotos.length} hero highlights
          </p>
        </div>
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

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded transition-all duration-300 text-center ${
          dragOver ? 'border-charcoal/40 bg-charcoal/5 py-8' : 'border-charcoal/10 py-4'
        }`}
      >
        <p className="font-mono text-[10px] tracking-widest uppercase text-slate/30">
          {dragOver ? 'Drop to upload' : 'Or drag a photo here to upload'}
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
            <img src={uploadPreview.previewUrl} alt="Preview" className="w-full max-h-64 object-contain mb-6 bg-slate/5" />
            <div className="mb-4">
              <label className="block font-mono text-[10px] tracking-widest uppercase text-slate/50 mb-2">Title</label>
              <input
                type="text"
                value={uploadPreview.title}
                onChange={(e) => setUploadPreview(p => p ? { ...p, title: e.target.value } : p)}
                className="w-full bg-transparent border-b border-charcoal/20 focus:border-charcoal/60 outline-none py-2 font-sans text-sm text-charcoal transition-colors duration-300"
              />
            </div>
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
              {uploading ? <><Loader2 size={13} className="animate-spin" /> Uploading…</> : 'Add to Portfolio'}
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
          {/* Hero Highlights */}
          {pinnedPhotos.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Star size={13} strokeWidth={1.5} className="text-yellow-500" />
                <h3 className="font-mono text-[10px] tracking-widest uppercase text-charcoal/60">
                  Hero Highlights ({pinnedPhotos.length}/3)
                </h3>
                <span className="font-mono text-[9px] text-slate/30">— hold & drag to reorder</span>
              </div>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'pinned')}>
                <SortableContext items={pinnedPhotos.map(p => p.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {pinnedPhotos.map(photo => (
                      <SortablePhotoCard
                        key={photo.id}
                        photo={photo}
                        allPinnedCount={pinnedPhotos.length}
                        onToggleHighlight={toggleHighlight}
                        onDelete={deletePhoto}
                        onSaveTitle={saveTitle}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </section>
          )}

          {/* Gallery */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="font-mono text-[10px] tracking-widest uppercase text-charcoal/60">
                Gallery ({galleryPhotos.length})
              </h3>
              {galleryPhotos.length > 0 && (
                <span className="font-mono text-[9px] text-slate/30">— hold & drag to reorder</span>
              )}
            </div>
            {galleryPhotos.length === 0 ? (
              <p className="font-mono text-[10px] tracking-widest uppercase text-slate/30 py-12 text-center border border-dashed border-charcoal/10">
                No gallery photos yet
              </p>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEnd(e, 'gallery')}>
                <SortableContext items={galleryPhotos.map(p => p.id)} strategy={rectSortingStrategy}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {galleryPhotos.map(photo => (
                      <SortablePhotoCard
                        key={photo.id}
                        photo={photo}
                        allPinnedCount={pinnedPhotos.length}
                        onToggleHighlight={toggleHighlight}
                        onDelete={deletePhoto}
                        onSaveTitle={saveTitle}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default PhotoManager;
