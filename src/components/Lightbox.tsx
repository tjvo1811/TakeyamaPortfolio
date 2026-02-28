import React, { useEffect, useRef, useState } from 'react';
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
    const [isClosing, setIsClosing] = useState(false);

    // Entrance Animation
    useEffect(() => {
        if (photo && overlayRef.current && imageRef.current && !isClosing) {
            document.body.style.overflow = 'hidden';

            const tl = gsap.timeline();
            tl.to(overlayRef.current, {
                opacity: 1,
                backdropFilter: 'blur(16px)',
                duration: 0.6,
                ease: 'power3.out'
            }).fromTo(imageRef.current, {
                scale: 0.9,
                opacity: 0,
                y: 10
            }, {
                scale: 1,
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: 'expo.out'
            }, "-=0.4");

        } else if (!photo) {
            document.body.style.overflow = 'auto';
            setIsClosing(false); // Reset when photo becomes null
        }

        return () => {
            if (!photo) document.body.style.overflow = 'auto';
        };
    }, [photo, isClosing]);

    const handleClose = () => {
        if (!overlayRef.current || !imageRef.current) return;
        setIsClosing(true);

        const tl = gsap.timeline({
            onComplete: () => {
                document.body.style.overflow = 'auto';
                setIsClosing(false);
                onClose();
            }
        });

        tl.to(imageRef.current, {
            scale: 0.95,
            opacity: 0,
            y: -10,
            duration: 0.4,
            ease: 'power3.in'
        }).to(overlayRef.current, {
            opacity: 0,
            backdropFilter: 'blur(0px)',
            duration: 0.5,
            ease: 'power2.inOut'
        }, "-=0.2");
    };

    if (!photo) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 opacity-0 backdrop-blur-none transition-none cursor-zoom-out"
            onClick={handleClose}
        >
            {/* Close Button */}
            <button
                className="absolute top-6 right-6 lg:top-12 lg:right-12 text-white/50 hover:text-white transition-colors p-2 z-[10000]"
                onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                }}
            >
                <X size={32} strokeWidth={1} />
            </button>

            {/* Main Image */}
            <div
                className="relative w-full h-full max-w-[95vw] max-h-[95vh] flex items-center justify-center p-4 lg:p-12 cursor-default"
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
