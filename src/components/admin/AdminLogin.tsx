import React, { useState, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { useAuth } from '../../hooks/useAuth';
import { isAuthenticated } from '../../lib/api';

interface AdminLoginProps {
  onLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.login-el', {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.1,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(password);
    if (isAuthenticated()) onLogin();
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative before:absolute before:inset-0 before:bg-dotted-pattern before:opacity-[0.03] before:pointer-events-none"
    >
      <div className="w-full max-w-sm">
        {/* Logo / Name */}
        <div className="text-center mb-16">
          <p className="login-el font-sans tracking-[0.3em] uppercase text-xs text-slate mb-3">
            Owner Access
          </p>
          <h1 className="login-el font-serif italic font-light text-5xl text-charcoal">
            武山松
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="login-el">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
              className="w-full bg-transparent border-b border-charcoal/20 focus:border-charcoal/60 outline-none py-3 font-sans text-sm tracking-widest text-charcoal placeholder:text-slate/40 placeholder:tracking-widest transition-colors duration-300"
            />
          </div>

          {error && (
            <p className="login-el font-mono text-[10px] tracking-widest uppercase text-red-400">
              {error}
            </p>
          )}

          <div className="login-el pt-2">
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 border border-charcoal/20 hover:border-charcoal/60 font-sans text-xs tracking-[0.3em] uppercase text-charcoal/60 hover:text-charcoal transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying…' : 'Enter'}
            </button>
          </div>
        </form>

        {/* Back link */}
        <div className="login-el mt-12 text-center">
          <a
            href="/"
            className="font-mono text-[10px] tracking-widest uppercase text-slate/30 hover:text-slate/60 transition-colors duration-300"
          >
            ← Back to Portfolio
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
