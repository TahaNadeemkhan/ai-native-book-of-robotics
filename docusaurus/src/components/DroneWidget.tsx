import React, { useState, useRef, useEffect } from 'react';
import { useSession } from '../lib/auth-client';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

// Typing effect component for the bot
const TypewriterText = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  const index = useRef(0);

  useEffect(() => {
    index.current = 0;
    setDisplayedText('');
    
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index.current));
      index.current++;
      if (index.current >= text.length) {
        clearInterval(intervalId);
        if (onComplete) onComplete();
      }
    }, 15); // Typing speed

    return () => clearInterval(intervalId);
  }, [text]);

  return <span>{displayedText}</span>;
};

const DroneWidget: React.FC = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'drone'; text: string; isTyping?: boolean }[]>([
    { role: 'drone', text: 'SYSTEM ONLINE. NEURAL LINK ESTABLISHED. WAITING FOR INPUT.', isTyping: false }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("DroneWidget Mounted. Session:", session);
  }, [session]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (loading || !input.trim()) return;
    
    const userMsg = input;
    // Optimistically add user message
    const newMessages = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Prepare history for backend (exclude the one we just added if you want, 
      // but actually we should send previous messages. 
      // The backend sees "history" + "current query". 
      // So send `messages` (current state before this new one) as history.
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await fetch('http://localhost:8000/api/drone/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userMsg,
          history: history
        }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Link Failure');

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'drone', text: data.answer, isTyping: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'drone', text: '[CRITICAL ERROR]: CONNECTION SEVERED.', isTyping: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Force fixed positioning with inline styles to guarantee placement
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '2rem', 
        right: '2rem', 
        zIndex: 9999,
        fontFamily: 'monospace',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '1rem'
      }}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="backdrop-blur-md"
            style={{
              width: '350px',
              height: '480px',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid #06b6d4', // cyan-500
              borderTopLeftRadius: '1rem',
              borderBottomRightRadius: '1rem',
              boxShadow: '0 0 40px rgba(6,182,212,0.3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Scanline Effect */}
            <div 
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
                background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))',
                backgroundSize: '100% 4px, 6px 100%'
              }} 
            />

            {/* Header */}
            <div className="flex justify-between items-center" style={{ padding: '1rem', backgroundColor: 'rgba(22, 78, 99, 0.2)', borderBottom: '1px solid rgba(6, 182, 212, 0.5)', position: 'relative', zIndex: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '0.125rem', backgroundColor: session ? '#22d3ee' : '#ef4444' }} className="animate-ping" />
                <span style={{ fontWeight: 'bold', letterSpacing: '0.1em', fontSize: '0.875rem', color: session ? '#22d3ee' : '#ef4444', textShadow: '0 0 5px rgba(34,211,238,0.8)' }}>
                  {session ? 'DRONE.AI // V2.0' : 'DRONE.AI // LOCKED'}
                </span>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ color: '#06b6d4', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:text-white">
                [TERMINATE]
              </button>
            </div>

            {/* Content Area */}
            {!session ? (
               // LOCKED STATE
               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', textAlign: 'center', position: 'relative', zIndex: 20 }}>
                 <div style={{ width: '6rem', height: '6rem', border: '2px solid #ef4444', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '1.5rem' }}>
                    <div style={{ position: 'absolute', inset: 0, border: '1px solid #ef4444', borderRadius: '9999px', opacity: 0.5 }} className="animate-ping"></div>
                    <span style={{ fontSize: '3rem' }}>🔒</span>
                 </div>
                 <div>
                   <h3 style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.25rem', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>ACCESS DENIED</h3>
                   <p style={{ color: 'rgba(248, 113, 113, 0.7)', fontSize: '0.875rem' }}>SECURITY CLEARANCE REQUIRED.<br/>ESTABLISH NEURAL LINK TO PROCEED.</p>
                 </div>
               </div>
            ) : (
              // UNLOCKED CHAT STATE
              <>
                <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', position: 'relative', zIndex: 20 }} className="space-y-4 scrollbar-thin scrollbar-thumb-cyan-700 scrollbar-track-black">
                  {messages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ 
                        maxWidth: '85%', 
                        padding: '0.75rem', 
                        borderLeft: '2px solid', 
                        fontSize: '0.875rem', 
                        position: 'relative',
                        borderColor: msg.role === 'user' ? '#ec4899' : '#06b6d4',
                        backgroundColor: msg.role === 'user' ? 'rgba(236, 72, 153, 0.1)' : 'rgba(6, 182, 212, 0.1)',
                        color: msg.role === 'user' ? '#fbcfe8' : '#cffafe'
                      }}>
                        <div style={{ fontWeight: 'bold', fontSize: '0.625rem', opacity: 0.7, marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                          {msg.role === 'user' ? '>> OPERATOR' : '>> SYSTEM'}
                        </div>
                        {msg.role === 'drone' && msg.isTyping ? (
                          <TypewriterText text={msg.text} />
                        ) : (
                          <ReactMarkdown>{msg.text}</ReactMarkdown>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{ backgroundColor: 'rgba(22, 78, 99, 0.2)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '1rem', fontSize: '0.75rem', color: '#22d3ee', fontFamily: 'monospace' }} className="animate-pulse">
                        {'>'} ANALYZING NEURAL PATTERNS...<br/>
                        {'>'} QUERYING VECTOR DATABASE...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div style={{ padding: '1rem', borderTop: '1px solid rgba(6, 182, 212, 0.3)', backgroundColor: 'rgba(0, 0, 0, 0.5)', position: 'relative', zIndex: 20 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                    <span style={{ color: '#06b6d4', fontSize: '1.25rem' }} className="animate-pulse">{'>'}</span>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Enter command..."
                      style={{ flex: 1, backgroundColor: 'transparent', borderBottom: '1px solid rgba(6, 182, 212, 0.5)', color: '#cffafe', fontSize: '0.875rem', padding: '0.5rem', outline: 'none', resize: 'none', height: '2.5rem' }}
                    />
                    <button 
                      onClick={handleSend}
                      disabled={loading}
                      style={{ color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.5)', padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '0.05em', background: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}
                      className="hover:bg-cyan-500/10"
                    >
                      SEND
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '4rem',
          height: '4rem',
          backgroundColor: 'black',
          border: '2px solid',
          borderColor: session ? '#22d3ee' : '#ef4444',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: session ? '0 0 30px rgba(6,182,212,0.6)' : '0 0 30px rgba(239,68,68,0.6)',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 50
        }}
      >
        <div style={{ position: 'absolute', inset: 0, borderRadius: '9999px', border: '1px solid', borderColor: session ? '#06b6d4' : '#ef4444', opacity: 0.2 }} className="animate-ping" />
        <span style={{ fontSize: '1.5rem', filter: session ? 'none' : 'grayscale(100%)', opacity: session ? 1 : 0.5, transition: 'all 0.3s' }}>
          🤖
        </span>
      </motion.button>
    </div>
  );
};

export default DroneWidget;
