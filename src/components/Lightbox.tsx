import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';
import { Photo } from '../data/portfolio.config';

interface LightboxProps {
    photo: Photo | null;
    onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ photo, onClose }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (photo && overlayRef.current && imageRef.current) {
            document.body.style.overflow = 'hidden';

            const tl = gsap.timeline();
            tl.to(overlayRef.current, {
                opacity: 1,
                backdropFilter: 'blur(16px)',
                duration: 0.4,
                ease: 'power2.out'
            }).fromTo(imageRef.current, {
                scale: 0.95,
                opacity: 0
            }, {
                scale: 1,
                opacity: 1,
                duration: 0.5,
                ease: 'power3.out'
            }, "-=0.2");

        } else {
            document.body.style.overflow = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [photo]);

    if (!photo) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 opacity-0 backdrop-blur-none transition-all"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                className="absolute top-6 right-6 lg:top-12 lg:right-12 text-white/50 hover:text-white transition-colors p-2"
                onClick={onClose}
            >
                <X size={32} strokeWidth={1} />
            </button>

            {/* Main Image */}
            <div
                className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex items-center justify-center p-4 lg:p-12"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    ref={imageRef}
                    src={photo.url}
                    alt={photo.title}
                    className="max-w-full max-h-full object-contain shadow-2xl opacity-0"
                />

                {/* Minimal Info */}
                <div className="absolute bottom-12 left-12 hidden lg:block">
                    <p className="font-serif italic text-white/90 text-2xl mb-2">{photo.title}</p>
                    {photo.exif && (
                        <p className="font-mono text-xs text-white/50 tracking-widest uppercase">
                            {photo.exif.camera} • {photo.exif.lens} • {photo.exif.aperture} • {photo.exif.shutter}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Lightbox;
