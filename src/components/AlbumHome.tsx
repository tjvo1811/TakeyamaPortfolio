import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAlbums } from '../hooks/useAlbums';
import { Loader2 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const AlbumHome: React.FC = () => {
    const { albums, loading } = useAlbums();
    const sorted = [...albums].sort((a, b) => a.order - b.order);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let ctx = gsap.context(() => {
            const items = gsap.utils.toArray<HTMLElement>('.album-reveal-item');
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
        }, sectionRef);

        return () => ctx.revert();
    }, [sorted.length, loading]);

    return (
        <section
            ref={sectionRef}
            className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-32 pb-32 min-h-screen"
        >
            <div className="mb-20 border-b border-charcoal/10 pb-12">
                <p className="font-mono text-[10px] tracking-[0.35em] uppercase text-slate mb-4">Discography</p>
                <h1 className="font-serif italic text-4xl lg:text-6xl text-charcoal">Albums</h1>
                <p className="mt-6 max-w-xl font-sans text-slate text-sm leading-relaxed">
                    Curated sequences—each album is its own narrative, separate from the global grid.
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center py-32">
                    <Loader2 className="animate-spin text-slate/40" size={28} strokeWidth={1.2} />
                </div>
            ) : sorted.length === 0 ? (
                <p className="font-mono text-[10px] tracking-widest uppercase text-slate/40 py-24 text-center border border-dashed border-charcoal/10">
                    No albums yet — add one in Admin.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-16 lg:gap-x-16 lg:gap-y-24">
                    {sorted.map((album) => (
                        <article key={album.id} className="album-reveal-item group">
                            <Link to={`/albums/${album.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-charcoal/20">
                                <div className="relative overflow-hidden bg-slate/5 shadow-[0_4px_40px_rgba(0,0,0,0.04)] mb-8">
                                    <img
                                        src={album.coverUrl}
                                        alt=""
                                        className="w-full aspect-[4/5] md:aspect-[3/4] object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.02]"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-charcoal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <h2 className="font-serif italic text-3xl lg:text-4xl text-charcoal group-hover:translate-x-1 transition-transform duration-500">
                                        {album.title}
                                    </h2>
                                    {album.description && (
                                        <p className="font-sans text-slate text-sm line-clamp-2 leading-relaxed max-w-md">
                                            {album.description}
                                        </p>
                                    )}
                                    <p className="font-mono text-[10px] tracking-widest uppercase text-slate/50 mt-2">
                                        {album.photoIds.length} pieces
                                    </p>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default AlbumHome;
