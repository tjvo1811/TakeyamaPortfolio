import React from 'react';
import { NavLink } from 'react-router-dom';

const linkClass =
    'font-sans text-xs lg:text-sm tracking-[0.2em] uppercase transition-all duration-300 hover:text-charcoal hover:-translate-y-[1px]';

const Navbar: React.FC = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12 backdrop-blur-md bg-background/70 border-b border-charcoal/5">
            <div className="flex-1" aria-hidden="true">
                {/* Spacer for centered nav */}
            </div>

            <div className="flex-1 flex justify-center gap-8 lg:gap-14 text-xs lg:text-sm font-sans text-slate">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `${linkClass} ${isActive ? 'text-charcoal' : 'text-slate/70'}`
                    }
                >
                    Home
                </NavLink>
                <NavLink
                    to="/albums"
                    className={({ isActive }) =>
                        `${linkClass} ${isActive ? 'text-charcoal' : 'text-slate/70'}`
                    }
                >
                    Albums
                </NavLink>
            </div>

            <div className="flex-1 flex justify-end" aria-hidden="true">
                {/* Spacer for visual balance */}
            </div>
        </nav>
    );
};

export default Navbar;
