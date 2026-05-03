import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LayoutGrid, List, ArrowLeft, Loader2 } from 'lucide-react';
import { useAlbums } from '../hooks/useAlbums';
import { usePhotos } from '../hooks/usePhotos';
import { Photo } from '../data/portfolio.config';
import Lightbox from './Lightbox';

gsap.registerPlugin(ScrollTrigger);

const AlbumView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { albums, loading: albumsLoading } = useAlbums();
    const { photos, loading: photosLoading } = usePhotos();
    const [layoutMode, setLayoutMode] = useState<'grid' | 'index'>('grid');
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    const album = id ? albums.find((a) => a.id === id) : undefined;

    const albumPhotos = useMemo(() => {
        if (!album) return [];
        return album.photoIds
            .map((pid) => photos.find((p) => p.id === pid))
            .filter((p): p is Photo => p !== undefined);
    }, [album, photos]);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const items = gsap.utils.toArray<HTMLElement>('.reveal-item');
            ScrollTrigger.getAll().forEach((t) => t.kill());

            items.forEach((item) => {
                gsap.fromTo(
                    item,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: item,
                            start: 'top 85%',
                            toggleActions: 'play none none reverse',
                        },
                    },
                );
            });
        }, gridRef);

        return () => ctx.revert();
    }, [layoutMode, albumPhotos.length]);

    const loading = albumsLoading || photosLoading;

    if (!albumsLoading && !album) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 pt-32 pb-24">
                <p className="font-serif italic text-2xl text-charcoal mb-6">Album not found</p>
                <Link
                    to="/albums"
                    className="font-mono text-[10px] tracking-widest uppercase text-slate hover:text-charcoal transition-colors"
                >
                    ← All albums
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-28 pb-32 min-h-screen">
            <Link
                to="/albums"
                className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-slate/60 hover:text-charcoal transition-colors mb-12"
            >
                <ArrowLeft size={14} strokeWidth={1.5} />
                Albums
            </Link>

            {loading && !album ? (
                <div className="flex justify-center py-24">
                    <Loader2 className="animate-spin text-slate/40" size={28} strokeWidth={1.2} />
                </div>
            ) : album ? (
                <>
                    <header className="mb-20 border-b border-charcoal/10 pb-12">
                        <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-slate mb-4">Album</p>
                        <h1 className="font-serif italic text-4xl lg:text-6xl text-charcoal mb-6">{album.title}</h1>
                        {album.description && (
                            <p className="max-w-2xl font-sans text-slate text-base leading-relaxed">{album.description}</p>
                        )}
                        <p className="font-mono text-[10px] tracking-widest uppercase text-slate/50 mt-8">
                            {albumPhotos.length} photographs
                        </p>
                    </header>

                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-charcoal/10 pb-8">
                        <div className="hidden md:flex items-center gap-6">
                            <button
                                type="button"
                                onClick={() => setLayoutMode('grid')}
                                className={`p-2 transition-all duration-300 ${
                                    layoutMode === 'grid'
                                        ? 'text-charcoal opacity-100 scale-110'
                                        : 'text-slate opacity-50 hover:opacity-100'
                                }`}
                                title="Grid View"
                            >
                                <LayoutGrid size={20} strokeWidth={1.2} />
                            </button>
                            <button
                                type="button"
                                onClick={() => setLayoutMode('index')}
                                className={`p-2 transition-all duration-300 ${
                                    layoutMode === 'index'
                                        ? 'text-charcoal opacity-100 scale-110'
                                        : 'text-slate opacity-50 hover:opacity-100'
                                }`}
                                title="List View"
                            >
                                <List size={24} strokeWidth={1.2} />
                            </button>
                        </div>
                    </div>

                    <div ref={gridRef}>
                        {albumPhotos.length === 0 ? (
                            <p className="font-mono text-[10px] tracking-widest uppercase text-slate/40 py-16 text-center border border-dashed border-charcoal/10">
                                No photos in this album — add IDs in Admin.
                            </p>
                        ) : layoutMode === 'grid' ? (
                            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 lg:gap-12 space-y-6 lg:space-y-12">
                                {albumPhotos.map((photo) => (
                                    <div
                                        key={photo.id}
                                        className="reveal-item group cursor-pointer relative break-inside-avoid"
                                        onClick={() => setSelectedPhoto(photo)}
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && setSelectedPhoto(photo)
                                        }
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="relative overflow-hidden bg-slate/5 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                                            <img
                                                src={photo.url}
                                                alt={photo.title || photo.collection}
                                                loading="lazy"
                                                className="w-full h-auto object-cover transform transition-transform duration-[1.5s] ease-out group-hover:scale-[1.03] will-change-transform"
                                            />

                                            <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]" />

                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0 text-white pointer-events-none">
                                                <h3 className="font-serif italic text-2xl mb-1">{photo.title}</h3>
                                                {photo.exif && (
                                                    <p className="font-mono text-[10px] uppercase tracking-widest text-white/80">
                                                        {photo.exif.camera} • {photo.exif.lens}
                                                        <br />
                                                        {photo.exif.aperture} • {photo.exif.shutter} •{' '}
                                                        {photo.exif.iso}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col border-t border-charcoal/10">
                                {albumPhotos.map((photo, i) => (
                                    <div
                                        key={photo.id}
                                        className="reveal-item group flex items-center justify-between py-8 md:py-12 border-b border-charcoal/10 cursor-pointer hover:bg-white/40 transition-colors px-4 -mx-4"
                                        onClick={() => setSelectedPhoto(photo)}
                                        onKeyDown={(e) => e.key === 'Enter' && setSelectedPhoto(photo)}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="flex items-center gap-6 md:gap-12 w-full md:w-auto">
                                            <span className="font-mono text-xs text-slate/40 w-6 shrink-0">
                                                {String(i + 1).padStart(2, '0')}
                                            </span>

                                            <div className="w-24 h-16 md:w-32 md:h-20 overflow-hidden bg-slate/5 shrink-0 relative">
                                                <img
                                                    src={photo.url}
                                                    alt={photo.title}
                                                    loading="lazy"
                                                    className="w-full h-full object-cover transition-all duration-[1.2s] ease-out group-hover:scale-110 filter md:grayscale md:group-hover:grayscale-0"
                                                />
                                            </div>

                                            <h3 className="font-sans text-xl md:text-3xl tracking-wide text-charcoal group-hover:translate-x-4 md:group-hover:translate-x-8 transition-transform duration-700 ease-out">
                                                {photo.title}
                                            </h3>
                                        </div>

                                        <div className="hidden lg:flex gap-24 font-mono text-xs text-slate items-center">
                                            <span className="w-24 uppercase tracking-widest text-slate/60">
                                                {photo.collection}
                                            </span>
                                            {photo.exif ? (
                                                <span className="w-48 text-right text-slate/50 uppercase">
                                                    {photo.exif.camera} • {photo.exif.lens}
                                                </span>
                                            ) : (
                                                <span className="w-48 text-right text-slate/30">—</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Lightbox
                        photo={selectedPhoto}
                        onClose={() => setSelectedPhoto(null)}
                        galleryPhotos={albumPhotos}
                        onOpenPhoto={(p) => setSelectedPhoto(p)}
                    />
                </>
            ) : null}
        </div>
    );
};

export default AlbumView;
