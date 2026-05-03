import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import Hero from './components/Hero';
import Grid from './components/Grid';
import Navbar from './components/Navbar';
import AlbumHome from './components/AlbumHome';
import AlbumView from './components/AlbumView';
import AdminDashboard from './components/admin/AdminDashboard';

function PublicLayout() {
    const year = new Date().getFullYear();
    return (
        <div className="relative flex flex-col min-h-screen bg-background before:absolute before:inset-0 before:bg-dotted-pattern before:opacity-[0.03] before:pointer-events-none before:-z-10">
            <Navbar />
            <main className="flex-1 w-full flex flex-col relative z-10">
                <Outlet />
            </main>
            <footer className="relative z-10 border-t border-charcoal/10 py-10 px-6 lg:px-12 max-w-[1400px] mx-auto w-full mt-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="font-mono text-[10px] tracking-widest uppercase text-slate/40">
                    © {year} Tung Son Vo
                </p>
                <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] tracking-widest uppercase text-slate/40 hover:text-charcoal transition-colors duration-300"
                >
                    Instagram
                </a>
            </footer>
            <Link
                to="/admin"
                className="fixed bottom-3 right-3 z-50 w-7 h-7 flex items-center justify-center font-serif text-xs font-bold text-charcoal/25 hover:text-charcoal/70 transition-colors duration-300 select-none"
                title="Owner login"
            >
                ©
            </Link>
        </div>
    );
}

function HomePage() {
    return (
        <>
            <Hero />
            <Grid />
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/albums" element={<AlbumHome />} />
                    <Route path="/albums/:id" element={<AlbumView />} />
                </Route>
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
