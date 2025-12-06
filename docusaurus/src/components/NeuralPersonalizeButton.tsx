import React, { useState } from 'react';
import { useSession } from '../lib/auth-client';

interface NeuralPersonalizeButtonProps {
  contentSelector?: string;
}

// Simple markdown to HTML converter
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 style="color: var(--hud-accent); font-size: 1.2rem; margin: 1.5rem 0 0.75rem 0; font-weight: 600;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="color: var(--hud-primary); font-size: 1.4rem; margin: 1.5rem 0 0.75rem 0; font-weight: 700;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="color: var(--hud-primary); font-size: 1.6rem; margin: 1.5rem 0 0.75rem 0; font-weight: 800;">$1</h1>');

  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--hud-primary); font-weight: 700;">$1</strong>');

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em style="color: var(--hud-text-soft);">$1</em>');

  // Code blocks
  html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(0,247,163,0.1); padding: 2px 6px; border-radius: 3px; font-family: var(--ifm-font-family-monospace); color: var(--hud-accent); font-size: 0.9em;">$1</code>');

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p style="margin: 1rem 0; line-height: 1.75;">');
  html = html.replace(/\n/g, '<br/>');

  // Wrap in paragraph
  html = '<p style="margin: 1rem 0; line-height: 1.75;">' + html + '</p>';

  return html;
}

export default function NeuralPersonalizeButton({ contentSelector = '.markdown' }: NeuralPersonalizeButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [personalized, setPersonalized] = useState(false);

  const handlePersonalize = async () => {
    if (!session) {
      alert("⚠️ SECURITY CLEARANCE REQUIRED. PLEASE LOG IN.");
      return;
    }

    const contentElement = document.querySelector(contentSelector);
    if (!contentElement) {
        console.error("Content not found");
        return;
    }

    const content = contentElement.textContent || "";
    if (!content) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/personalize-chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content,
            lesson_url: window.location.pathname  // Send URL for deterministic UUID generation
        }),
        credentials: 'include'
      });

      if (res.ok) {
          const data = await res.json();
          const renderedContent = markdownToHtml(data.output);

          const personalizedHtml = `
            <div class="cyber-card p-6 my-8" style="box-shadow: 0 0 30px rgba(0, 247, 163, 0.2), inset 0 0 20px rgba(0, 247, 163, 0.05);">
                <div class="scanline-overlay"></div>
                <div style="position: relative; z-index: 1;">
                  <div style="display: flex; align-items: center; gap: 12px; border-bottom: 1px solid var(--hud-primary); padding-bottom: 12px; margin-bottom: 16px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--hud-primary)" stroke-width="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    <h3 style="color: var(--hud-primary); font-family: var(--hud-font-display); font-size: 1.1rem; margin: 0; text-transform: uppercase; letter-spacing: 0.1em; text-shadow: 0 0 10px rgba(0,247,163,0.3);">
                      ⚡ PERSONALIZED FOR YOUR LEVEL
                    </h3>
                  </div>
                  <div style="color: var(--hud-text-soft); line-height: 1.75; font-size: 1.05rem;">
                      ${renderedContent}
                  </div>
                </div>
            </div>
          `;

          contentElement.insertAdjacentHTML('afterbegin', personalizedHtml);
          setPersonalized(true);
      }
    } catch (e) {
        console.error(e);
        alert("❌ NEURAL LINK ERROR. Please try again.");
    } finally {
        setLoading(false);
    }
  };

  if (personalized) {
    return (
      <div className="my-6 p-4 border border-green-500/30 bg-green-500/5 rounded" style={{
        boxShadow: '0 0 15px rgba(0,247,163,0.1)'
      }}>
        <div className="flex items-center gap-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--hud-primary)" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span style={{
            color: 'var(--hud-primary)',
            fontFamily: 'var(--hud-font-display)',
            fontSize: '0.9rem',
            letterSpacing: '0.05em',
            textTransform: 'uppercase'
          }}>
            Content Optimized for Your System
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-8" style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: '-2px',
        left: '-2px',
        right: '-2px',
        bottom: '-2px',
        background: 'linear-gradient(45deg, var(--hud-primary), var(--hud-accent))',
        opacity: loading ? '0.3' : '0',
        filter: 'blur(8px)',
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none',
        animation: loading ? 'pulse 2s infinite' : 'none'
      }}></div>

      <button
        onClick={handlePersonalize}
        disabled={loading}
        className="cyber-button"
        style={{
          width: '100%',
          padding: '20px 32px',
          fontSize: '1rem',
          gap: '12px',
          position: 'relative',
          overflow: 'hidden',
          background: loading
            ? 'rgba(0, 247, 163, 0.15)'
            : 'linear-gradient(135deg, rgba(0, 247, 163, 0.08), rgba(0, 234, 255, 0.08))',
          borderWidth: '2px',
          boxShadow: loading
            ? '0 0 30px rgba(0,247,163,0.3), inset 0 0 20px rgba(0,247,163,0.1)'
            : '0 0 20px rgba(0,247,163,0.2)',
        }}
      >
        {loading ? (
          <>
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
            </svg>
            <span style={{ letterSpacing: '0.15em' }}>PROCESSING NEURAL DATA...</span>
          </>
        ) : (
          <>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"/>
            </svg>
            <span style={{ letterSpacing: '0.15em' }}>⚡ PERSONALIZE CONTENT</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14m-7-7l7 7-7 7"/>
            </svg>
          </>
        )}

        {/* Scanline effect */}
        {!loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(0,247,163,0.3), transparent)',
            animation: 'scan-horizontal 3s infinite',
            pointerEvents: 'none'
          }}></div>
        )}
      </button>
    </div>
  );
}
