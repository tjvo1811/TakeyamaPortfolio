import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Photo } from '../data/portfolio.config';
import Lightbox from './Lightbox';
import { LayoutGrid, List } from 'lucide-react';
import { usePhotos } from '../hooks/usePhotos';
import { useContent } from '../hooks/useContent';

gsap.registerPlugin(ScrollTrigger);

const Grid = () => {
    const [layoutMode, setLayoutMode] = useState<'grid' | 'index'>('grid');
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const { photos } = usePhotos();
    const { content } = useContent();

    // Filter and sort the remaining non-pinned photos
    const gridPhotos = photos
        .filter(p => !p.isPinned)
        .sort((a, b) => a.order - b.order);

    useEffect(() => {
        // Reveal animation on load/scroll
        let ctx = gsap.context(() => {
            const items = gsap.utils.toArray<HTMLElement>('.reveal-item');

            // Kill existing scroll triggers to prevent duplicate animations when switching layout modes
            ScrollTrigger.getAll().forEach(t => t.kill());

            items.forEach((item) => {
                gsap.fromTo(item,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: item,
                            start: "top 85%", // Trigger when top of element hits 85% down viewport
                            toggleActions: "play none none reverse"
                        }
                    }
                );
            });
        }, gridRef);

        return () => ctx.revert();
    }, [layoutMode]); // Re-run animation when layout mode changes

    return (
        <section className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-32 min-h-screen">

            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 border-b border-charcoal/10 pb-12">
                <div>
                    <h2 className="font-serif italic text-4xl lg:text-5xl text-charcoal mb-8">{content.grid_title}</h2>
                </div>

                {/* Layout Switcher (Desktop Only) */}
                <div className="hidden md:flex items-center gap-6 mt-8 md:mt-0">
                    <button
                        onClick={() => setLayoutMode('grid')}
                        className={`p-2 transition-all duration-300 ${layoutMode === 'grid' ? 'text-charcoal opacity-100 scale-110' : 'text-slate opacity-50 hover:opacity-100'}`}
                        title="Grid View"
                    >
                        <LayoutGrid size={20} strokeWidth={1.2} />
                    </button>
                    <button
                        onClick={() => setLayoutMode('index')}
                        className={`p-2 transition-all duration-300 ${layoutMode === 'index' ? 'text-charcoal opacity-100 scale-110' : 'text-slate opacity-50 hover:opacity-100'}`}
                        title="List View"
                    >
                        <List size={24} strokeWidth={1.2} />
                    </button>
                </div>
            </div>

            {/* The Gallery */}
            <div ref={gridRef}>
                {layoutMode === 'grid' ? (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 lg:gap-12 space-y-6 lg:space-y-12">
                        {gridPhotos.map((photo) => (
                            <div
                                key={photo.id}
                                className="reveal-item group cursor-pointer relative break-inside-avoid"
                                onClick={() => setSelectedPhoto(photo)}
                            >
                                <div className="relative overflow-hidden bg-slate/5 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                                    <img
                                        src={photo.url}
                                        alt={photo.title || photo.collection}
                                        loading="lazy"
                                        className="w-full h-auto object-cover transform transition-transform duration-[1.5s] ease-out group-hover:scale-[1.03] will-change-transform"
                                    />

                                    {/* Hover Overlay Detail */}
                                    <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]" />

                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0 text-white pointer-events-none">
                                        <h3 className="font-serif italic text-2xl mb-1">{photo.title}</h3>
                                        {photo.exif && (
                                            <p className="font-mono text-[10px] uppercase tracking-widest text-white/80">
                                                {photo.exif.camera} • {photo.exif.lens} <br />
                                                {photo.exif.aperture} • {photo.exif.shutter} • {photo.exif.iso}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // ============================================
                    // 2. THE INTERACTIVE TYPOGRAPHY INDEX (ARCHIVE)
                    // High-end minimalist list focused on text over images.
                    // ============================================
                    <div className="flex flex-col border-t border-charcoal/10">
                        {gridPhotos.map((photo, i) => (
                            <div
                                key={photo.id}
                                className="reveal-item group flex items-center justify-between py-8 md:py-12 border-b border-charcoal/10 cursor-pointer hover:bg-white/40 transition-colors px-4 -mx-4"
                                onClick={() => setSelectedPhoto(photo)}
                            >
                                <div className="flex items-center gap-6 md:gap-12 w-full md:w-auto">
                                    <span className="font-mono text-xs text-slate/40 w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>

                                    <div className="w-24 h-16 md:w-32 md:h-20 overflow-hidden bg-slate/5 shrink-0 relative">
                                        <img
                                            src={photo.url}
                                            alt={photo.title}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-all duration-[1.2s] ease-out group-hover:scale-110 filter md:grayscale md:group-hover:grayscale-0"
                                        />
                                    </div>

                                    <h3 className="font-sans text-xl md:text-3xl tracking-wide text-charcoal group-hover:translate-x-4 md:group-hover:translate-x-8 transition-transform duration-700 ease-out">{photo.title}</h3>
                                </div>

                                <div className="hidden lg:flex gap-24 font-mono text-xs text-slate items-center">
                                    <span className="w-24 uppercase tracking-widest text-slate/60">{photo.collection}</span>
                                    {photo.exif ? (
                                        <span className="w-48 text-right text-slate/50 uppercase">{photo.exif.camera} • {photo.exif.lens}</span>
                                    ) : (
                                        <span className="w-48 text-right text-slate/30">—</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox Portal */}
            <Lightbox
                photo={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
            />


        </section>
    );
};

export default Grid;
