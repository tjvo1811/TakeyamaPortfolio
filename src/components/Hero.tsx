import React, { useState, useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { portfolioConfig, Photo } from '../data/portfolio.config';
import Lightbox from './Lightbox';

const Hero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const pinnedPhotos = portfolioConfig.filter(p => p.isPinned).sort((a, b) => a.order - b.order);

    useLayoutEffect(() => {
        let ctx = gsap.context(() => {
            // Text reveal
            gsap.from(".hero-text", {
                y: 40,
                opacity: 0,
                duration: 1.2,
                stagger: 0.1,
                ease: "power3.out",
                delay: 0.2
            });

            // Images stagger in
            gsap.from(".hero-img", {
                y: 60,
                opacity: 0,
                scale: 0.95,
                duration: 1.4,
                stagger: 0.15,
                ease: "power3.out",
                delay: 0.5
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={containerRef} className="relative w-full min-h-screen flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden px-6 lg:px-12">

            {/* Editorial Typography */}
            <div className="z-10 text-center mb-16 lg:mb-24 flex flex-col items-center pointer-events-none mt-12">
                <p className="hero-text font-sans tracking-[0.3em] uppercase text-xs sm:text-sm lg:text-base text-slate mb-4">
                    Portfolio
                </p>
                <h1 className="hero-text font-serif italic font-light text-6xl sm:text-8xl md:text-9xl lg:text-[12rem] leading-none tracking-tight text-charcoal">
                    武山松
                </h1>
            </div>

            {/* Curated Row of Pinned Images */}
            <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 z-20 pointer-events-none mt-8 lg:mt-0">

                {pinnedPhotos.map((photo, index) => {
                    // Give the center image slightly more emphasis and size
                    let sizeClasses = "w-full max-w-[90vw] sm:max-w-md lg:w-1/3";

                    if (index === 1 && pinnedPhotos.length > 1) {
                        sizeClasses = "w-full max-w-[90vw] sm:max-w-md lg:w-2/5 lg:-translate-y-8";
                    }

                    return (
                        <div
                            key={photo.id}
                            className={`hero-img pointer-events-auto group relative ${sizeClasses} cursor-pointer`}
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <div className="relative overflow-hidden shadow-xl bg-white p-3 transform transition-all duration-700 hover:scale-[1.03] hover:shadow-2xl">
                                <img
                                    src={photo.url}
                                    alt={photo.collection}
                                    className="w-full h-auto object-cover max-h-[60vh] lg:max-h-[70vh]"
                                />

                                {/* Hover Overlay Detail (Same as Grid) */}
                                <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-[2px]" />

                                <div className="absolute inset-x-0 bottom-0 top-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8 translate-y-4 group-hover:translate-y-0 text-white pointer-events-none">
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
                    );
                })}

            </div>

            {/* Lightbox Portal */}
            <Lightbox
                photo={selectedPhoto}
                onClose={() => setSelectedPhoto(null)}
            />

        </section>
    );
};

export default Hero;
