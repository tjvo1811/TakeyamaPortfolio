import React from 'react';
import { Search, Info } from 'lucide-react';

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-md bg-background/70 border-b border-charcoal/5">
            {/* Brand */}
            <div className="flex-1">
                <a href="#" className="font-sans font-medium tracking-widest text-sm uppercase lg:text-base hover:-translate-y-[1px] transition-transform block">
                    Tung Son Vo
                </a>
            </div>

            {/* Categories - Hide on smallest mobile */}
            <div className="hidden md:flex flex-1 justify-center space-x-8 text-xs lg:text-sm tracking-widest uppercase font-sans text-slate">
                <a href="#" className="hover:text-charcoal hover:-translate-y-[1px] transition-all">Street</a>
                <a href="#" className="hover:text-charcoal hover:-translate-y-[1px] transition-all">Horology</a>
                <a href="#" className="hover:text-charcoal hover:-translate-y-[1px] transition-all">Architecture</a>
                <a href="#" className="hover:text-charcoal hover:-translate-y-[1px] transition-all">Journal</a>
            </div>

            {/* Icons */}
            <div className="flex-1 flex justify-end space-x-6 text-charcoal">
                <button className="hover:-translate-y-[1px] transition-transform opacity-70 hover:opacity-100">
                    <Search size={18} strokeWidth={1.5} />
                </button>
                <button className="hover:-translate-y-[1px] transition-transform opacity-70 hover:opacity-100">
                    <Info size={18} strokeWidth={1.5} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
