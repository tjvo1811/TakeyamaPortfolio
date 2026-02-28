import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { portfolioConfig, Photo } from '../data/portfolio.config';
import Lightbox from './Lightbox';

gsap.registerPlugin(ScrollTrigger);

const Grid = () => {
    const [activeCollection, setActiveCollection] = useState<string>('All');
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);

    // Extract unique collections
    const collections = ['All', ...Array.from(new Set(portfolioConfig.map(p => p.collection)))];

    // Filter and sort the remaining non-pinned photos
    const gridPhotos = portfolioConfig
        .filter(p => !p.isPinned && (activeCollection === 'All' || p.collection === activeCollection))
        .sort((a, b) => a.order - b.order);

    useEffect(() => {
        // Reveal animation on load/scroll
        let ctx = gsap.context(() => {
            const items = gsap.utils.toArray<HTMLElement>('.grid-item');

            items.forEach((item, i) => {
                gsap.fromTo(item,
                    {
                        opacity: 0,
                        y: 50,
                        scale: 0.98
                    },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.8,
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
    }, [activeCollection]); // Re-run animation when collection changes

    return (
        <section className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-24 min-h-screen">

            {/* Masonry Grid */}
            <div ref={gridRef} className="masonry-grid">
                {gridPhotos.map((photo) => (
                    <div
                        key={photo.id}
                        className="grid-item masonry-item group cursor-pointer relative overflow-hidden bg-white/50"
                        onClick={() => setSelectedPhoto(photo)}
                    >
                        {/* Image container */}
                        <div className="relative overflow-hidden">
                            <img
                                src={photo.url}
                                alt={photo.title || photo.collection}
                                loading="lazy"
                                className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-[1.03] will-change-transform"
                            />

                            {/* Glass Details Hover Overlay */}
                            <div className="absolute inset-0 glass-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                <h3 className="text-white font-serif italic text-xl lg:text-3xl mb-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                    {photo.title}
                                </h3>
                                {photo.exif && (
                                    <div className="font-mono text-[10px] lg:text-xs text-white/80 tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                                        <span>{photo.exif.camera}</span> • <span>{photo.exif.lens}</span> <br className="lg:hidden" />
                                        <span className="hidden lg:inline"> • </span>
                                        <span>{photo.exif.aperture}</span> • <span>{photo.exif.shutter}</span> • <span>ISO {photo.exif.iso}</span>
                                    </div>
                                )}
                                <div className="absolute top-6 right-6 flex items-center gap-2">
                                    <span className="font-sans text-[9px] uppercase tracking-widest text-white/90 border border-white/20 px-2 py-1 rounded-sm backdrop-blur-md">
                                        {photo.collection}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
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
