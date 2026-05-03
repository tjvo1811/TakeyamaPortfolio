import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { Photo } from '../data/portfolio.config';

interface LightboxProps {
    photo: Photo | null;
    onClose: () => void;
    /** When set with more than one photo, prev/next and keyboard arrows are enabled */
    galleryPhotos?: Photo[];
    onOpenPhoto?: (photo: Photo) => void;
}

const Lightbox: React.FC<LightboxProps> = ({ photo, onClose, galleryPhotos, onOpenPhoto }) => {
    const overlayRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const [isClosing, setIsClosing] = useState(false);

    const index = photo && galleryPhotos?.length
        ? galleryPhotos.findIndex((p) => p.id === photo.id)
        : -1;
    const canNavigate =
        !!photo &&
        !!galleryPhotos &&
        galleryPhotos.length > 1 &&
        index >= 0 &&
        !!onOpenPhoto;

    const showPrev = canNavigate && index > 0;
    const showNext = canNavigate && index < galleryPhotos!.length - 1;

    const goPrev = useCallback(() => {
        if (!canNavigate || !showPrev || !onOpenPhoto) return;
        onOpenPhoto(galleryPhotos![index - 1]);
    }, [canNavigate, showPrev, onOpenPhoto, galleryPhotos, index]);

    const goNext = useCallback(() => {
        if (!canNavigate || !showNext || !onOpenPhoto) return;
        onOpenPhoto(galleryPhotos![index + 1]);
    }, [canNavigate, showNext, onOpenPhoto, galleryPhotos, index]);

    const handleClose = useCallback(() => {
        if (!overlayRef.current || !imageRef.current) {
            document.body.style.overflow = 'auto';
            onClose();
            return;
        }
        setIsClosing(true);

        const tl = gsap.timeline({
            onComplete: () => {
                document.body.style.overflow = 'auto';
                setIsClosing(false);
                onClose();
            },
        });

        tl.to(imageRef.current, {
            scale: 0.95,
            opacity: 0,
            y: -10,
            duration: 0.4,
            ease: 'power3.in',
        }).to(
            overlayRef.current,
            {
                opacity: 0,
                backdropFilter: 'blur(0px)',
                duration: 0.5,
                ease: 'power2.inOut',
            },
            '-=0.2',
        );
    }, [onClose]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!photo) return;
            if (e.key === 'Escape') {
                e.preventDefault();
                handleClose();
                return;
            }
            if (e.key === 'ArrowLeft' && canNavigate && showPrev) {
                e.preventDefault();
                goPrev();
                return;
            }
            if (e.key === 'ArrowRight' && canNavigate && showNext) {
                e.preventDefault();
                goNext();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [photo, canNavigate, showPrev, showNext, goPrev, goNext, handleClose]);

    // Entrance animation when photo changes
    useEffect(() => {
        if (photo && overlayRef.current && imageRef.current && !isClosing) {
            document.body.style.overflow = 'hidden';

            const tl = gsap.timeline();
            tl.to(overlayRef.current, {
                opacity: 1,
                backdropFilter: 'blur(16px)',
                duration: 0.6,
                ease: 'power3.out',
            }).fromTo(
                imageRef.current,
                { scale: 0.9, opacity: 0, y: 10 },
                {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'expo.out',
                },
                '-=0.4',
            );
        } else if (!photo) {
            document.body.style.overflow = 'auto';
            setIsClosing(false);
        }

        return () => {
            if (!photo) document.body.style.overflow = 'auto';
        };
    }, [photo, isClosing]);

    if (!photo) return null;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 opacity-0 backdrop-blur-none transition-none cursor-zoom-out"
            onClick={handleClose}
        >
            <button
                className="absolute top-6 right-6 lg:top-8 lg:right-8 text-white/50 hover:text-white transition-colors p-2 z-[10000]"
                onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                }}
                type="button"
                aria-label="Close"
            >
                <X size={28} strokeWidth={1.5} />
            </button>

            {showPrev && (
                <button
                    type="button"
                    aria-label="Previous"
                    className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-[10000] text-white/40 hover:text-white p-3 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        goPrev();
                    }}
                >
                    <ChevronLeft size={40} strokeWidth={1} />
                </button>
            )}
            {showNext && (
                <button
                    type="button"
                    aria-label="Next"
                    className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-[10000] text-white/40 hover:text-white p-3 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        goNext();
                    }}
                >
                    <ChevronRight size={40} strokeWidth={1} />
                </button>
            )}

            <div
                key={photo.id}
                ref={imageRef}
                className="relative w-full h-full max-w-[100vw] max-h-[100vh] flex flex-col lg:flex-row cursor-default opacity-0 overflow-y-auto lg:overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-full lg:flex-1 h-[60vh] lg:h-full flex items-center justify-center p-4 lg:p-12 lg:pr-6 bg-black shrink-0">
                    <img
                        src={photo.url}
                        alt={photo.title?.trim() || photo.id}
                        className="max-w-full max-h-full object-contain shadow-2xl"
                    />
                </div>

                <div className="w-full lg:w-[400px] xl:w-[480px] shrink-0 bg-[#0a0a0a] border-t lg:border-t-0 lg:border-l border-white/10 p-8 lg:p-12 flex flex-col justify-center gap-8 lg:gap-12 overflow-y-auto">
                    <div>
                        <h2 className="font-serif italic text-white/90 text-3xl lg:text-4xl mb-2">
                            {photo.title}
                        </h2>
                        <p className="font-mono text-xs text-white/40 tracking-widest uppercase">
                            {photo.collection} COLLECTION
                        </p>
                    </div>

                    {photo.exif && (
                        <div className="flex flex-col gap-6 text-sm text-white/70">
                            <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                                <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                                    Camera
                                </span>
                                <span className="font-sans font-medium text-white/90">{photo.exif.camera}</span>
                            </div>

                            <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                                <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                                    Lens
                                </span>
                                <span className="font-sans font-medium text-white/90">{photo.exif.lens}</span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 border-b border-white/5 pb-4">
                                <div className="flex flex-col gap-1">
                                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                                        Aperture
                                    </span>
                                    <span className="font-mono text-white/90">{photo.exif.aperture || '—'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                                        Shutter
                                    </span>
                                    <span className="font-mono text-white/90">{photo.exif.shutter || '—'}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                                        ISO
                                    </span>
                                    <span className="font-mono text-white/90">{photo.exif.iso || '—'}</span>
                                </div>
                            </div>

                            {photo.timestamp && (
                                <div className="flex flex-col gap-1 pt-2">
                                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
                                        Date
                                    </span>
                                    <span className="font-sans text-white/50">
                                        {new Date(photo.timestamp).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Lightbox;
