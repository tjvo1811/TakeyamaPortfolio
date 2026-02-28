import React from 'react';
import Hero from './components/Hero';
import Grid from './components/Grid';

function App() {
    return (
        <div className="relative min-h-screen bg-background before:absolute before:inset-0 before:bg-dotted-pattern before:opacity-[0.03] before:pointer-events-none before:-z-10">
            <Hero />
            <Grid />
        </div>
    );
}

export default App;
