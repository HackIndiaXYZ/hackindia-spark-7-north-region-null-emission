import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = location.pathname === '/';

  const navLinks = [
    { path: '/',            label: 'Home' },
    { path: '/calculator',  label: 'Calculator' },
    ...(user ? [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/history',   label: 'History' },
    ] : [])
  ];

  const baseStyle = {
    position: 'sticky', top: 0, zIndex: 100,
    background: isHome ? 'rgba(13,31,26,0.88)' : 'rgba(13,31,26,0.97)',
    borderBottom: '1px solid rgba(127,255,0,0.15)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    fontFamily: "'DM Mono', 'JetBrains Mono', monospace",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
        .nav-link {
          font-family: 'DM Mono', monospace; font-size: 12px;
          text-transform: uppercase; letter-spacing: 0.12em;
          color: #a0b8a8; text-decoration: none; padding: 6px 12px;
          border-radius: 3px; transition: color 0.15s, background 0.15s;
        }
        .nav-link:hover, .nav-link.active { color: #7fff00; background: rgba(127,255,0,0.07); }
        .nav-btn-signin {
          font-family: 'DM Mono', monospace; font-size: 12px;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #7fff00; background: transparent; padding: 6px 14px;
          border: 1px solid rgba(127,255,0,0.4); border-radius: 3px;
          cursor: pointer; text-decoration: none; transition: border-color 0.15s, background 0.15s;
        }
        .nav-btn-signin:hover { border-color: #7fff00; background: rgba(127,255,0,0.08); }
        .nav-btn-start {
          font-family: 'Bebas Neue', sans-serif; font-size: 16px; letter-spacing: 0.08em;
          color: #0d1f1a; background: #7fff00; padding: 7px 18px;
          border: none; border-radius: 2px; cursor: pointer; text-decoration: none;
          transition: opacity 0.15s, transform 0.15s;
        }
        .nav-btn-start:hover { opacity: 0.9; transform: translateY(-1px); }
      `}</style>
      <nav style={baseStyle}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Wordmark */}
          <Link to="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 26, color: '#7fff00', letterSpacing: '0.2em' }}>
              LLUMEN
            </span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {navLinks.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`nav-link${location.pathname === path ? ' active' : ''}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <button onClick={() => base44.auth.logout()} className="nav-btn-signin">
                Logout
              </button>
            ) : (
              <>
                <button onClick={() => base44.auth.redirectToLogin()} className="nav-btn-signin">
                  Sign In
                </button>
                <button onClick={() => base44.auth.redirectToLogin()} className="nav-btn-start">
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}