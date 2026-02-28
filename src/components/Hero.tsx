import React, { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { portfolioConfig } from '../data/portfolio.config';

const Hero = () => {
    const containerRef = useRef<HTMLDivElement>(null);
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

            {/* Curated Cluster of Pinned Images */}
            {/* We use a relative container slightly constrained. 
          The images are positioned absolutely in a cluster 
          but will stack normally on mobile. */}
            <div className="relative w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-0 lg:h-[60vh] z-20 pointer-events-none">

                {pinnedPhotos.map((photo, index) => {
                    // Dynamic classes for clustering effect on desktop
                    let clusterClasses = "relative lg:absolute w-full max-w-[90vw] sm:max-w-md lg:w-[400px]";
                    let zIndex = 20;

                    if (index === 0) {
                        clusterClasses += " lg:left-[5%] lg:-top-12 lg:-rotate-2";
                        zIndex = 10;
                    } else if (index === 1) {
                        clusterClasses += " lg:left-1/2 lg:-translate-x-1/2 lg:top-4 z-30 lg:rotate-1 lg:w-[480px]";
                        zIndex = 30;
                    } else if (index === 2) {
                        clusterClasses += " lg:right-[5%] lg:top-12 lg:rotate-3";
                        zIndex = 20;
                    }

                    return (
                        <div
                            key={photo.id}
                            className={`hero-img pointer-events-auto group ${clusterClasses}`}
                            style={{ zIndex }}
                        >
                            <div className="overflow-hidden shadow-2xl bg-white p-2 pb-8 transform transition-transform duration-700 hover:scale-[1.02] hover:z-40">
                                <img
                                    src={photo.url}
                                    alt={photo.title || photo.collection}
                                    className="w-full h-auto object-cover"
                                />

                                {/* Polaroid-style or minimal caption area below image */}
                                <div className="absolute bottom-2 inset-x-0 flex items-center justify-between px-3">
                                    <span className="font-mono text-[10px] text-slate opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {photo.collection.toUpperCase()}
                                    </span>
                                    {photo.exif && (
                                        <span className="font-mono text-[9px] text-slate tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                            {photo.exif.camera} • {photo.exif.lens}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>

        </section>
    );
};

export default Hero;
