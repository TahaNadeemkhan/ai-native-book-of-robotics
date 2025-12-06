import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { useSession } from '../lib/auth-client';
import { setGlobalContentMode } from './ContentTransformer';

export default function NavbarAIControls() {
  const { data: session } = useSession();
  const location = useLocation();
  const [activeMode, setActiveMode] = React.useState<'original' | 'summary' | 'urdu'>('original');

  // Reset state when location changes
  useEffect(() => {
    setActiveMode('original');
  }, [location.pathname]);

  const handleModeChange = (mode: 'original' | 'summary' | 'urdu') => {
    if (!session && mode !== 'original') {
      alert("⚠️ SECURITY CLEARANCE REQUIRED. PLEASE LOG IN.");
      return;
    }

    // Toggle functionality
    if (activeMode === mode) {
      setActiveMode('original');
      setGlobalContentMode('original');
    } else {
      setActiveMode(mode);
      setGlobalContentMode(mode);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginLeft: '16px',
    }}>
      {/* Intelligence Summary Button */}
      <button
        onClick={() => handleModeChange('summary')}
        disabled={!session}
        title={!session ? "Login required" : activeMode === 'summary' ? "Return to original" : "View Intelligence Summary"}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          background: activeMode === 'summary'
            ? 'linear-gradient(135deg, rgba(0,247,163,0.25), rgba(0,234,255,0.25))'
            : 'transparent',
          border: `1.5px solid ${activeMode === 'summary' ? 'var(--hud-primary)' : 'rgba(0,247,163,0.3)'}`,
          borderRadius: '6px',
          color: activeMode === 'summary' ? 'var(--hud-primary)' : '#9aa5b1',
          fontFamily: 'var(--hud-font-display)',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          letterSpacing: '0.08em',
          cursor: !session ? 'not-allowed' : 'pointer',
          opacity: !session ? 0.4 : 1,
          transition: 'all 0.3s ease',
          textTransform: 'uppercase',
          boxShadow: activeMode === 'summary' ? '0 0 15px rgba(0,247,163,0.4)' : 'none',
        }}
        onMouseEnter={(e) => {
          if (session) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'var(--hud-primary)';
            e.currentTarget.style.color = 'var(--hud-primary)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          if (activeMode !== 'summary') {
            e.currentTarget.style.borderColor = 'rgba(0,247,163,0.3)';
            e.currentTarget.style.color = '#9aa5b1';
          }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
        <span>Summary</span>
        {!session && <span style={{ fontSize: '0.6rem' }}>🔒</span>}
      </button>

      {/* Urdu Uplink Button */}
      <button
        onClick={() => handleModeChange('urdu')}
        disabled={!session}
        title={!session ? "Login required" : activeMode === 'urdu' ? "Return to original" : "View Urdu Translation"}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 14px',
          background: activeMode === 'urdu'
            ? 'linear-gradient(135deg, rgba(0,234,255,0.25), rgba(196,255,249,0.25))'
            : 'transparent',
          border: `1.5px solid ${activeMode === 'urdu' ? 'var(--hud-accent)' : 'rgba(0,234,255,0.3)'}`,
          borderRadius: '6px',
          color: activeMode === 'urdu' ? 'var(--hud-accent)' : '#9aa5b1',
          fontFamily: 'var(--hud-font-display)',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          letterSpacing: '0.08em',
          cursor: !session ? 'not-allowed' : 'pointer',
          opacity: !session ? 0.4 : 1,
          transition: 'all 0.3s ease',
          textTransform: 'uppercase',
          boxShadow: activeMode === 'urdu' ? '0 0 15px rgba(0,234,255,0.4)' : 'none',
        }}
        onMouseEnter={(e) => {
          if (session) {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'var(--hud-accent)';
            e.currentTarget.style.color = 'var(--hud-accent)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          if (activeMode !== 'urdu') {
            e.currentTarget.style.borderColor = 'rgba(0,234,255,0.3)';
            e.currentTarget.style.color = '#9aa5b1';
          }
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
        </svg>
        <span>Urdu</span>
        {!session && <span style={{ fontSize: '0.6rem' }}>🔒</span>}
      </button>

      {/* Active Indicator Dot */}
      {activeMode !== 'original' && (
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: activeMode === 'summary' ? 'var(--hud-primary)' : 'var(--hud-accent)',
          boxShadow: `0 0 10px ${activeMode === 'summary' ? 'var(--hud-primary)' : 'var(--hud-accent)'}`,
          animation: 'pulse 2s infinite',
        }}></div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
