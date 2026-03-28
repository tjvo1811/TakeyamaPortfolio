import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminLogin from './AdminLogin';
import PhotoManager from './PhotoManager';
import ContentEditor from './ContentEditor';

type Tab = 'photos' | 'content';

const AdminDashboard: React.FC = () => {
  const { authed, logout, login, loading, error } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('photos');

  if (!authed) {
    return (
      <AdminLogin
        onLogin={() => {
          // useAuth state updates automatically via localStorage check
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background before:fixed before:inset-0 before:bg-dotted-pattern before:opacity-[0.03] before:pointer-events-none relative">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-charcoal/8">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-serif italic text-xl text-charcoal">武山松</span>
            <span className="font-mono text-[10px] tracking-widest uppercase text-slate/40">Admin</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Tabs */}
            <nav className="hidden sm:flex items-center gap-1">
              {(['photos', 'content'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-all duration-300 ${
                    activeTab === tab
                      ? 'text-charcoal border-b border-charcoal'
                      : 'text-slate/50 hover:text-slate'
                  }`}
                >
                  {tab === 'photos' ? 'Photos' : 'Site Text'}
                </button>
              ))}
            </nav>

            <button
              onClick={logout}
              className="font-mono text-[10px] tracking-widest uppercase text-slate/40 hover:text-slate transition-colors duration-300"
            >
              Log out
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="sm:hidden flex border-t border-charcoal/8">
          {(['photos', 'content'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 font-mono text-[10px] tracking-widest uppercase transition-colors duration-300 ${
                activeTab === tab ? 'text-charcoal bg-charcoal/5' : 'text-slate/40'
              }`}
            >
              {tab === 'photos' ? 'Photos' : 'Site Text'}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {activeTab === 'photos' && <PhotoManager />}
        {activeTab === 'content' && <ContentEditor />}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-6 pb-12 mt-8">
        <a
          href="/"
          className="font-mono text-[10px] tracking-widest uppercase text-slate/30 hover:text-slate/60 transition-colors duration-300"
        >
          ← View Portfolio
        </a>
      </footer>
    </div>
  );
};

export default AdminDashboard;
