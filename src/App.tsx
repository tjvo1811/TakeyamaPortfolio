import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import Grid from './components/Grid';
import AdminDashboard from './components/admin/AdminDashboard';

function Portfolio() {
    return (
        <div className="relative min-h-screen bg-background before:absolute before:inset-0 before:bg-dotted-pattern before:opacity-[0.03] before:pointer-events-none before:-z-10">
            <Hero />
            <Grid />
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
