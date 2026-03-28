import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Hero from './components/Hero';
import Grid from './components/Grid';
import AdminDashboard from './components/admin/AdminDashboard';

function Portfolio() {
    return (
        <div className="relative min-h-screen bg-background before:absolute before:inset-0 before:bg-dotted-pattern before:opacity-[0.03] before:pointer-events-none before:-z-10">
            <Hero />
            <Grid />
            {/* Owner access — fixed bottom-right corner */}
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

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Portfolio />} />
                <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
