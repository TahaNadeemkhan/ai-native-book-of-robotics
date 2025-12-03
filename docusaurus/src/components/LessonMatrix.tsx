import React, { useState, useEffect } from 'react';
import { useSession } from '../lib/auth-client';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface LessonMatrixProps {
  originalContent: string;
}

type TabMode = 'original' | 'summarize' | 'personalized' | 'urdu';

const LessonMatrix: React.FC<LessonMatrixProps> = ({ originalContent }) => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabMode>('original');
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs: { id: TabMode; label: string; locked: boolean }[] = [
    { id: 'original', label: 'ORIGINAL DATA', locked: false },
    { id: 'summarize', label: 'INTELLIGENCE SUMMARY', locked: !session },
    { id: 'personalized', label: 'NEURAL ADAPTATION', locked: !session },
    { id: 'urdu', label: 'URDU UPLINK', locked: !session },
  ];

  useEffect(() => {
    if (activeTab === 'original' || !session || contentMap[activeTab]) return;

    const fetchAI = async () => {
      setLoading(true);
      setError(null);
      try {
        let endpoint = '';
        let body = { content: originalContent, context: '' };

        switch (activeTab) {
          case 'summarize':
            endpoint = '/api/ai/summarize';
            break;
          case 'personalized':
            endpoint = '/api/ai/personalize';
            body.context = "Robotics Student specializing in Autonomous Drones";
            break;
          case 'urdu':
            endpoint = '/api/ai/translate';
            break;
        }

        const res = await fetch(`http://localhost:8000${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          credentials: 'include', 
        });

        if (!res.ok) throw new Error(`Neural Uplink Failed: ${res.statusText}`);

        const data = await res.json();
        setContentMap((prev) => ({ ...prev, [activeTab]: data.output }));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAI();
  }, [activeTab, session, originalContent, contentMap]);

  // Cybernetic Markdown Components
  const markdownComponents = {
    p: ({node, ...props}) => <p className="mb-4 text-lg leading-relaxed text-[#9aa5b1]" {...props} />,
    h1: ({node, ...props}) => <h1 className="text-3xl font-orbitron text-[#00f7a3] mb-6 mt-8 border-b border-[#00f7a3]/30 pb-2 uppercase tracking-wide" {...props} />,
    h2: ({node, ...props}) => <h2 className="text-2xl font-orbitron text-[#c4fff9] mb-4 mt-6" {...props} />,
    h3: ({node, ...props}) => <h3 className="text-xl font-orbitron text-[#00eaff] mb-3 mt-5" {...props} />,
    strong: ({node, ...props}) => <strong className="text-[#c4fff9] font-bold" {...props} />,
    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4 text-[#9aa5b1] marker:text-[#00f7a3]" {...props} />,
    li: ({node, ...props}) => <li className="mb-2 pl-2" {...props} />,
    code: ({node, ...props}) => <code className="bg-[#00eaff]/10 border border-[#00eaff]/20 text-[#00eaff] px-1.5 py-0.5 rounded-sm font-mono text-sm" {...props} />,
  };

  const renderContent = () => {
    if (!session && activeTab !== 'original') {
      return (
        <div className="flex flex-col items-center justify-center h-64 border border-[#ff003c]/30 bg-[#ff003c]/5 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5"></div>
          <div className="text-5xl mb-4 animate-pulse text-[#ff003c]">🔒</div>
          <h3 className="text-[#ff003c] font-orbitron text-xl mb-2 tracking-widest">SECURITY CLEARANCE REQUIRED</h3>
          <p className="text-[#9aa5b1] mb-4 max-w-md">Link your neural interface (Log In) to decrypt classified data streams.</p>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="p-12 flex flex-col items-center justify-center h-64 border border-[#00f7a3]/20 bg-[#00f7a3]/5">
           <div className="w-12 h-12 border-2 border-[#00f7a3]/30 border-t-[#00f7a3] rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(0,247,163,0.3)]"></div>
           <div className="font-mono text-sm text-[#00f7a3] animate-pulse tracking-widest">[ PROCESSING DATA STREAM ]</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 border border-[#ff003c] bg-[#ff003c]/10 text-[#ff003c] font-mono tracking-tight">
          [SYSTEM ERROR]: {error}
        </div>
      );
    }

    const content = activeTab === 'original' ? originalContent : contentMap[activeTab];

    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="p-8 border border-[#00f7a3]/20 bg-[#0c0f12] min-h-[300px] relative"
      >
        {/* Status Line */}
        <div className="flex justify-between items-center border-b border-[#00f7a3]/20 pb-3 mb-6 font-mono text-xs tracking-widest">
          <span className="text-[#00eaff] opacity-80">[ MODULE: {activeTab.toUpperCase()} ]</span>
          <span className="text-[#00f7a3] drop-shadow-[0_0_5px_rgba(0,247,163,0.8)]">● STATUS: ONLINE</span>
        </div>
        
        <ReactMarkdown components={markdownComponents}>
          {content || ''}
        </ReactMarkdown>
      </motion.div>
    );
  };

  return (
    <div className="my-12 backdrop-blur-sm">
      {/* Tab Header */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-5 py-2 font-orbitron text-xs tracking-widest transition-all duration-200 border border-transparent clip-path-slant uppercase',
              activeTab === tab.id
                ? 'bg-[#00eaff]/10 border-[#00eaff] text-[#00eaff] shadow-[0_0_10px_rgba(0,234,255,0.2)]'
                : 'bg-[#111418] border-[#111418] text-[#9aa5b1] hover:border-[#00eaff]/50 hover:text-[#c4fff9]',
              tab.locked && 'opacity-60 cursor-not-allowed'
            )}
            style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
          >
            <span className="flex items-center gap-2">
              {tab.locked && <span className="text-[#ff003c]">🔒</span>}
              {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content Area Wrapper */}
      <div className="relative p-[1px] bg-gradient-to-b from-[#00f7a3]/30 to-transparent">
        <div className="bg-[#0c0f12]">
           {/* Content Render */}
           <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LessonMatrix;
