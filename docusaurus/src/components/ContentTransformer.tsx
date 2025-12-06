import React, { useState, useEffect } from 'react';
import { useLocation } from '@docusaurus/router';
import { useSession } from '../lib/auth-client';
import ReactMarkdown from 'react-markdown';

type ContentMode = 'original' | 'summary' | 'urdu';

// Create a global event emitter for mode changes
const modeChangeEvents = new EventTarget();

export function setGlobalContentMode(mode: ContentMode) {
  modeChangeEvents.dispatchEvent(new CustomEvent('modechange', { detail: mode }));
}

interface ContentTransformerProps {
  contentSelector?: string;
}

export default function ContentTransformer({ contentSelector = '.markdown' }: ContentTransformerProps) {
  const { data: session } = useSession();
  const location = useLocation();
  const [mode, setMode] = useState<ContentMode>('original');
  const [originalContent, setOriginalContent] = useState<string>('');
  const [summaryContent, setSummaryContent] = useState<string>('');
  const [urduContent, setUrduContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Reset mode when location changes
  useEffect(() => {
    setMode('original');
    setSummaryContent('');
    setUrduContent('');
    setGlobalContentMode('original');
  }, [location.pathname]);

  // Extract original content
  useEffect(() => {
    const timer = setTimeout(() => {
      const contentElement = document.querySelector(contentSelector);
      if (contentElement) {
        const text = contentElement.textContent || '';
        setOriginalContent(text);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [contentSelector, location.pathname]);

  // Listen for mode changes from navbar
  useEffect(() => {
    const handleModeChange = (event: CustomEvent) => {
      const newMode = event.detail as ContentMode;
      setMode(newMode);

      if (newMode !== 'original' && newMode !== mode) {
        handleTransform(newMode);
      }
    };

    modeChangeEvents.addEventListener('modechange', handleModeChange as EventListener);

    return () => {
      modeChangeEvents.removeEventListener('modechange', handleModeChange as EventListener);
    };
  }, [mode, originalContent, summaryContent, urduContent]);

  const handleTransform = async (targetMode: 'summary' | 'urdu') => {
    if (!session) {
      alert("⚠️ SECURITY CLEARANCE REQUIRED. PLEASE LOG IN.");
      setMode('original');
      setGlobalContentMode('original');
      return;
    }

    // Check if we already have the content
    if (targetMode === 'summary' && summaryContent) {
      return; // Content already loaded
    }

    if (targetMode === 'urdu' && urduContent) {
      return; // Content already loaded
    }

    setLoading(true);

    try {
      const endpoint = targetMode === 'summary' ? '/api/ai/summarize' : '/api/ai/translate';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: originalContent,
          lesson_url: window.location.pathname
        }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error(`Neural Link Failed: ${res.statusText}`);

      const data = await res.json();

      if (targetMode === 'summary') {
        setSummaryContent(data.output);
      } else {
        setUrduContent(data.output);
      }
    } catch (err: any) {
      console.error('Transform error:', err);
      alert(`❌ NEURAL LINK ERROR: ${err.message}`);
      setMode('original');
      setGlobalContentMode('original');
    } finally {
      setLoading(false);
    }
  };

  // Hide/show original content based on mode
  useEffect(() => {
    const contentElement = document.querySelector(contentSelector);
    if (contentElement) {
      if (mode === 'original') {
        (contentElement as HTMLElement).style.display = 'block';
      } else {
        (contentElement as HTMLElement).style.display = 'none';
      }
    }
  }, [mode, contentSelector]);

  // Cybernetic Markdown Components
  const markdownComponents = {
    p: ({ node, ...props }) => <p className="mb-4 text-lg leading-relaxed text-[#9aa5b1]" {...props} />,
    h1: ({ node, ...props }) => <h1 className="text-3xl font-orbitron text-[#00f7a3] mb-6 mt-8 border-b border-[#00f7a3]/30 pb-2 uppercase tracking-wide" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-2xl font-orbitron text-[#c4fff9] mb-4 mt-6" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-xl font-orbitron text-[#00eaff] mb-3 mt-5" {...props} />,
    strong: ({ node, ...props }) => <strong className="text-[#c4fff9] font-weight: bold" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 text-[#9aa5b1] marker:text-[#00f7a3]" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 text-[#9aa5b1]" {...props} />,
    li: ({ node, ...props }) => <li className="mb-2 pl-2" {...props} />,
    code: ({ node, inline, ...props }) =>
      inline ? (
        <code className="bg-[#00eaff]/10 border border-[#00eaff]/20 text-[#00eaff] px-1.5 py-0.5 rounded-sm font-mono text-sm" {...props} />
      ) : (
        <code className="block bg-[#0a0e12] border border-[#00eaff]/30 text-[#00eaff] p-4 rounded-md font-mono text-sm overflow-x-auto my-4" {...props} />
      ),
    pre: ({ node, ...props }) => <pre className="my-4" {...props} />,
  };

  const getDisplayContent = () => {
    if (mode === 'summary') return summaryContent;
    if (mode === 'urdu') return urduContent;
    return '';
  };

  const getTitle = () => {
    if (mode === 'summary') return 'INTELLIGENCE SUMMARY';
    if (mode === 'urdu') return 'URDU UPLINK';
    return '';
  };

  if (mode === 'original') {
    return null; // Don't render anything when showing original
  }

  return (
    <>
      <div
        style={{
          animation: 'fadeIn 0.5s ease-out',
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(12,15,18,0.98), rgba(17,20,24,0.98))',
          border: '2px solid var(--hud-primary)',
          borderRadius: '12px',
          marginBottom: '32px',
          boxShadow: '0 0 30px rgba(0,247,163,0.2)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '2px solid var(--hud-primary)',
          paddingBottom: '16px',
          marginBottom: '28px',
          animation: 'slideInFromTop 0.5s ease-out',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--hud-primary)" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          <h2 style={{
            color: 'var(--hud-primary)',
            fontFamily: 'var(--hud-font-display)',
            fontSize: '1.4rem',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            textShadow: '0 0 20px rgba(0,247,163,0.5)',
          }}>
            ⚡ {getTitle()} ACTIVE
          </h2>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              border: '4px solid var(--hud-primary)',
              borderTop: '4px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }}></div>
            <div style={{
              fontFamily: 'var(--hud-font-display)',
              fontSize: '1rem',
              color: 'var(--hud-primary)',
              letterSpacing: '0.2em',
            }}>
              PROCESSING NEURAL DATA...
            </div>
          </div>
        ) : getDisplayContent() ? (
          <div style={{
            animation: 'fadeIn 0.7s ease-out',
            minHeight: '200px',
          }}>
            <ReactMarkdown components={markdownComponents as any}>
              {getDisplayContent()}
            </ReactMarkdown>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--hud-text-soft)',
            fontFamily: 'var(--hud-font-display)',
            fontSize: '0.9rem',
            letterSpacing: '0.1em',
          }}>
            GENERATING CONTENT...
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
