import React, { useState } from 'react';
import { useSession } from '../lib/auth-client';
import { useHistory } from '@docusaurus/router';

const SettingsButton = () => {
  const { data: session } = useSession();
  const history = useHistory();
  const [showTooltip, setShowTooltip] = useState(false);

  if (!session) {
    return null; // Only show to authenticated users
  }

  const handleClick = () => {
    history.push('/onboarding');
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        onClick={handleClick}
        className="cyber-button secondary"
        style={{
          padding: '8px 12px',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          minWidth: 'auto',
          transition: 'all 0.3s ease',
          position: 'relative',
        }}
        aria-label="Update Personalization Settings"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'transform 0.6s ease',
          }}
          className="settings-gear"
        >
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
        </svg>
        <span className="hidden md:inline" style={{ letterSpacing: '0.08em' }}>
          CALIBRATE
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="absolute top-full mt-2 right-0 z-50 pointer-events-none"
          style={{
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              background: 'var(--hud-bg)',
              border: '1px solid var(--hud-accent)',
              padding: '8px 12px',
              borderRadius: '2px',
              boxShadow: '0 0 20px rgba(0, 234, 255, 0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{
              color: 'var(--hud-accent)',
              fontFamily: 'var(--ifm-font-family-monospace)',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              ⚙️ Update Neural Profile
            </div>
          </div>
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              top: '-6px',
              right: '16px',
              width: '12px',
              height: '12px',
              background: 'var(--hud-bg)',
              border: '1px solid var(--hud-accent)',
              borderBottom: 'none',
              borderRight: 'none',
              transform: 'rotate(45deg)',
            }}
          />
        </div>
      )}

      <style>{`
        .settings-gear {
          transition: transform 0.6s ease;
        }
        .cyber-button:hover .settings-gear {
          transform: rotate(90deg);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default SettingsButton;
