import React, { useMemo, useState } from 'react';
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
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Loader2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../../lib/api';
import { useAlbums } from '../../hooks/useAlbums';
import { usePhotos } from '../../hooks/usePhotos';
import { Album, Photo } from '../../data/portfolio.config';

// ── Sortable album tile ───────────────────────────────────────────────────────

interface SortableAlbumTileProps {
  album: Album;
  busyId: string | null;
  photosById: Map<string, Photo | undefined>;
  allPhotosSorted: Photo[];
  onReorderTracks: (albumId: string, newPhotoIds: string[]) => Promise<void>;
  onUpdateMeta: (
    albumId: string,
    updates: Partial<Pick<Album, 'title' | 'description' | 'coverUrl'>>,
  ) => Promise<void>;
  onAppendPhoto: (albumId: string, photoId: string) => Promise<void>;
  onRemovePhoto: (albumId: string, photoId: string) => Promise<void>;
  onDeleteAlbum: (album: Album) => Promise<void>;
}

const SortableAlbumTile: React.FC<SortableAlbumTileProps> = ({
  album,
  busyId,
  photosById,
  allPhotosSorted,
  onReorderTracks,
  onUpdateMeta,
  onAppendPhoto,
  onRemovePhoto,
  onDeleteAlbum,
}) => {
  const [open, setOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState(album.title);
  const [descDraft, setDescDraft] = useState(album.description || '');
  const [addSelect, setAddSelect] = useState('');

  const busy = busyId === album.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: album.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  React.useEffect(() => {
    setTitleDraft(album.title);
    setDescDraft(album.description || '');
  }, [album.id, album.title, album.description]);

  const resolvedTracks = album.photoIds
    .map((id) => photosById.get(id))
    .filter(Boolean) as Photo[];

  const sortedAlbumList = [...allPhotosSorted].sort((a, b) =>
    (a.title || a.id).localeCompare(b.title || b.id),
  );
  const candidates = sortedAlbumList.filter((p) => !album.photoIds.includes(p.id));

  const trackSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const handleTrackDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = album.photoIds.indexOf(String(active.id));
    const newIndex = album.photoIds.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(album.photoIds, oldIndex, newIndex);
    await onReorderTracks(album.id, next);
  };

  const saveMeta = async () => {
    await onUpdateMeta(album.id, {
      title: titleDraft.trim() || album.title,
      description: descDraft.trim() || undefined,
    });
  };

  return (
    <div ref={setNodeRef} style={style} className="border border-charcoal/10 bg-background">
      <div className="flex items-stretch">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="shrink-0 px-3 border-r border-charcoal/10 text-charcoal/25 hover:text-charcoal/55 cursor-grab active:cursor-grabbing touch-none"
          title="Drag to reorder albums"
          aria-label="Reorder album"
        >
          <GripVertical size={14} strokeWidth={1.5} />
        </button>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex flex-1 items-center gap-3 px-4 py-4 text-left min-w-0"
        >
          <div className="w-14 h-14 shrink-0 overflow-hidden bg-slate/5 border border-charcoal/5">
            <img src={album.coverUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-serif italic text-lg text-charcoal truncate">{album.title}</p>
            <p className="font-mono text-[9px] tracking-widest uppercase text-slate/40 truncate">
              {album.photoIds.length} photos
            </p>
          </div>
          <span className="text-slate/40">{open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span>
        </button>

        <button
          type="button"
          onClick={() => onDeleteAlbum(album)}
          disabled={busy}
          className="px-4 text-charcoal/20 hover:text-red-400 shrink-0 border-l border-charcoal/10"
          aria-label="Delete album"
          title="Delete album"
        >
          <Trash2 size={14} strokeWidth={1.5} />
        </button>
      </div>

      {open && (
        <div className="border-t border-charcoal/10 p-6 space-y-6 bg-charcoal/[0.02]">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="font-mono text-[10px] tracking-widest uppercase text-slate/50 mb-2 block">
                  Title
                </label>
                <input
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={() => saveMeta()}
                  className="w-full bg-transparent border-b border-charcoal/15 focus:border-charcoal/50 outline-none py-2 text-sm transition-colors duration-300"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] tracking-widest uppercase text-slate/50 mb-2 block">
                  Description
                </label>
                <textarea
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  rows={4}
                  onBlur={() => saveMeta()}
                  className="w-full bg-transparent border border-charcoal/10 focus:border-charcoal/30 outline-none p-3 text-sm leading-relaxed transition-colors duration-300"
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="font-mono text-[10px] tracking-widest uppercase text-slate/50 mb-2 block">
                Cover Image
              </label>
              <select
                value={album.coverUrl}
                disabled={busy}
                onChange={async (e) => {
                  await onUpdateMeta(album.id, { coverUrl: e.target.value });
                }}
                className="w-full bg-background border border-charcoal/15 text-sm px-3 py-2 outline-none focus:border-charcoal/40 transition-colors duration-300"
              >
                {allPhotosSorted.map((p) => (
                  <option key={p.id} value={p.url}>
                    {p.title?.trim() || p.id}
                  </option>
                ))}
              </select>
              <div className="aspect-video overflow-hidden bg-slate/5 border border-charcoal/10">
                <img src={album.coverUrl} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <h4 className="font-mono text-[10px] tracking-widest uppercase text-charcoal/60">
                Photos in Album
              </h4>
              <span className="font-mono text-[9px] text-slate/30">
                Drag to reorder
              </span>
            </div>

            <DndContext
              sensors={trackSensors}
              collisionDetection={closestCenter}
              onDragEnd={handleTrackDragEnd}
            >
              <SortableContext items={album.photoIds} strategy={rectSortingStrategy}>
                <div className="flex flex-wrap gap-2 mb-6">
                  {resolvedTracks.map((p) => (
                    <SortableThumb
                      key={p.id}
                      id={p.id}
                      thumbUrl={p.url}
                      busy={busy}
                      onRemove={() => onRemovePhoto(album.id, p.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <label className="font-mono text-[10px] tracking-widest uppercase text-slate/50 mb-2 block">
                  Add Photo
                </label>
                <select
                  className="w-full bg-background border border-charcoal/15 text-sm px-3 py-2 outline-none focus:border-charcoal/40 transition-colors duration-300"
                  value={addSelect}
                  onChange={(e) => setAddSelect(e.target.value)}
                >
                  <option value="">Select a photo…</option>
                  {candidates.map((p) => (
                    <option key={p.id} value={p.id}>
                      {(p.title || p.id).slice(0, 80)}{p.collection ? ` — ${p.collection}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                disabled={!addSelect || busy}
                onClick={async () => {
                  if (!addSelect) return;
                  await onAppendPhoto(album.id, addSelect);
                  setAddSelect('');
                }}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 border border-charcoal/20 hover:border-charcoal/50 font-mono text-[10px] tracking-widest uppercase text-charcoal/70 hover:text-charcoal transition-all duration-300 disabled:opacity-30"
              >
                <Plus size={14} strokeWidth={1.5} />
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Sortable track thumb ────────────────────────────────────────────────────────

const SortableThumb: React.FC<{
  id: string;
  thumbUrl: string;
  busy: boolean;
  onRemove: () => void;
}> = ({ id, thumbUrl, busy, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative w-20 h-20 border border-charcoal/10 overflow-hidden group bg-slate/5"
    >
      <img src={thumbUrl} alt="" className="w-full h-full object-cover" loading="lazy" draggable={false} />
      <button
        type="button"
        {...listeners}
        className="absolute bottom-0 left-0 p-1.5 bg-charcoal/70 text-white/90 cursor-grab active:cursor-grabbing touch-none hover:bg-charcoal transition-colors"
        aria-label="Drag to reorder photo"
        title="Drag"
      >
        <GripVertical size={12} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={() => onRemove()}
        className="absolute top-1 right-1 bg-black/55 text-white/90 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove from album"
      >
        <Trash2 size={10} />
      </button>
    </div>
  );
};

// ── Main AlbumManager ─────────────────────────────────────────────────────────

const AlbumManager: React.FC = () => {
  const { albums, loading, refetch } = useAlbums();
  const { photos } = usePhotos();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const photosById = useMemo(() => {
    const m = new Map<string, Photo>();
    photos.forEach((p) => m.set(p.id, p));
    return m;
  }, [photos]);

  const sortedAlbums = useMemo(
    () => [...albums].sort((a, b) => a.order - b.order),
    [albums],
  );

  const handleAlbumDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedAlbums.findIndex((a) => a.id === active.id);
    const newIndex = sortedAlbums.findIndex((a) => a.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(sortedAlbums, oldIndex, newIndex);
    setBusyId('reorder-albums');
    try {
      await Promise.all(
        reordered.map((a, idx) => api.updateAlbum(a.id, { order: idx + 1 })),
      );
      await refetch();
    } finally {
      setBusyId(null);
    }
  };

  const onReorderTracks = async (albumId: string, newPhotoIds: string[]) => {
    setBusyId(albumId);
    try {
      await api.updateAlbum(albumId, { photoIds: newPhotoIds });
      await refetch();
    } finally {
      setBusyId(null);
    }
  };

  const onUpdateMeta = async (
    albumId: string,
    updates: Partial<Pick<Album, 'title' | 'description' | 'coverUrl'>>,
  ) => {
    setBusyId(albumId);
    try {
      await api.updateAlbum(albumId, updates);
      await refetch();
    } finally {
      setBusyId(null);
    }
  };

  const onAppendPhoto = async (albumId: string, photoId: string) => {
    const a = albums.find((x) => x.id === albumId);
    if (!a) return;
    if (a.photoIds.includes(photoId)) return;
    setBusyId(albumId);
    try {
      await api.updateAlbum(albumId, { photoIds: [...a.photoIds, photoId] });
      await refetch();
    } finally {
      setBusyId(null);
    }
  };

  const onRemovePhoto = async (albumId: string, photoId: string) => {
    const a = albums.find((x) => x.id === albumId);
    if (!a) return;
    setBusyId(albumId);
    try {
      await api.updateAlbum(albumId, { photoIds: a.photoIds.filter((id) => id !== photoId) });
      await refetch();
    } finally {
      setBusyId(null);
    }
  };

  const onDeleteAlbum = async (album: Album) => {
    if (!confirm(`Delete album “${album.title}”? This cannot be undone.`)) return;
    setBusyId(album.id);
    try {
      await api.deleteAlbum(album.id);
      await refetch();
    } finally {
      setBusyId(null);
    }
  };

  const handleCreate = async () => {
    const sortedLib = [...photos].sort((a, b) => a.order - b.order);
    if (!sortedLib[0]) {
      alert('Add at least one photo before creating an album.');
      return;
    }
    const title = newTitle.trim() || 'Untitled Album';
    const id = `album-${Date.now()}`;
    const first = sortedLib[0];
    setCreating(true);
    try {
      await api.createAlbum({
        id,
        title,
        description: newDesc.trim() || undefined,
        coverUrl: first.url,
        photoIds: [first.id],
        createdAt: Date.now(),
      });
      setNewTitle('');
      setNewDesc('');
      await refetch();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to create album');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-charcoal/10 pb-8">
        <div>
          <h2 className="font-serif italic text-3xl text-charcoal mb-1">Albums</h2>
          <p className="font-mono text-[10px] tracking-widest uppercase text-slate/50">
            {sortedAlbums.length} album{sortedAlbums.length === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <section className="border border-charcoal/10 p-6 space-y-4">
        <h3 className="font-mono text-[10px] tracking-widest uppercase text-charcoal/60">New Album</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-transparent border-b border-charcoal/15 focus:border-charcoal/50 outline-none py-2 text-sm"
          />
          <input
            placeholder="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full bg-transparent border-b border-charcoal/15 focus:border-charcoal/50 outline-none py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="inline-flex items-center gap-2 px-5 py-2.5 border border-charcoal/20 hover:border-charcoal/50 font-mono text-[10px] tracking-widest uppercase text-charcoal/70 hover:text-charcoal transition-all duration-300 disabled:opacity-40"
        >
          {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} strokeWidth={1.5} />}
          Create Album
        </button>
        <p className="font-mono text-[9px] text-slate/35 leading-relaxed">
          New albums start with your first library photo as cover; open an album to change cover, order, and membership.
        </p>
      </section>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 size={22} className="animate-spin text-slate/40" />
        </div>
      ) : sortedAlbums.length === 0 ? (
        <p className="font-mono text-[10px] tracking-widest uppercase text-slate/30 py-12 text-center border border-dashed border-charcoal/10">
          No albums yet — create one above.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleAlbumDragEnd}>
          <SortableContext items={sortedAlbums.map((a) => a.id)} strategy={rectSortingStrategy}>
            <div className="space-y-4">
              {sortedAlbums.map((album) => (
                <SortableAlbumTile
                  key={album.id}
                  album={album}
                  busyId={busyId}
                  photosById={photosById}
                  allPhotosSorted={[...photos].sort((a, b) => a.order - b.order)}
                  onReorderTracks={onReorderTracks}
                  onUpdateMeta={onUpdateMeta}
                  onAppendPhoto={onAppendPhoto}
                  onRemovePhoto={onRemovePhoto}
                  onDeleteAlbum={onDeleteAlbum}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default AlbumManager;
