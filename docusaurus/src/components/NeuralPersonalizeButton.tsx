import React, { useState } from 'react';
import { useSession } from '../lib/auth-client';

interface NeuralPersonalizeButtonProps {
  contentSelector?: string; 
}

export default function NeuralPersonalizeButton({ contentSelector = '.markdown' }: NeuralPersonalizeButtonProps) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [personalized, setPersonalized] = useState(false);

  const handlePersonalize = async () => {
    if (!session) {
      alert("SECURITY CLEARANCE REQUIRED. PLEASE LOG IN.");
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
        body: JSON.stringify({ content }),
        credentials: 'include'
      });
      
      if (res.ok) {
          const data = await res.json();
          const personalizedHtml = `
            <div class="border border-cb-neon-green p-6 rounded bg-cb-background/90 my-8 shadow-[0_0_20px_rgba(0,247,163,0.1)]">
                <h3 class="text-cb-neon-green font-mono text-lg mb-4 border-b border-cb-neon-green pb-2">NEURAL PERSONALIZATION ACTIVE</h3>
                <div class="prose prose-invert max-w-none text-cb-soft-mint font-sans leading-relaxed">
                    ${data.output.replace(/\n/g, '<br/>')}
                </div>
            </div>
          `;
          
          contentElement.insertAdjacentHTML('afterbegin', personalizedHtml);
          setPersonalized(true);
      }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  if (personalized) return null;

  return (
    <button
      onClick={handlePersonalize}
      disabled={loading}
      className={`
        w-full my-8 py-4 border border-dashed border-cb-neon-green text-cb-neon-green 
        font-mono uppercase tracking-widest hover:bg-cb-neon-green/10 transition-all
        ${loading ? 'animate-pulse opacity-50 cursor-wait' : ''}
      `}
    >
      {loading ? "PROCESSING NEURAL DATA..." : "[ INITIALIZE PERSONALIZATION PROTOCOL ]"}
    </button>
  );
}