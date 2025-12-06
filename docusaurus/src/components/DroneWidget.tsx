import React, { useState, useRef, useEffect } from 'react';
import { useSession } from '../lib/auth-client';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

// HUD Theme Colors (matching custom.css)
const HUD = {
  bg: '#0c0f12',
  panel: '#111418',
  primary: '#00f7a3',      // Neon Green
  accent: '#00eaff',       // Cyan
  textBody: '#9aa5b1',
  textSoft: '#c4fff9',
  alert: '#ff003c',
};

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
    }, 15);

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
    const newMessages = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
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
    <div
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        fontFamily: "'JetBrains Mono', monospace",
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
            style={{
              width: '380px',
              height: '500px',
              backgroundColor: 'rgba(12, 15, 18, 0.95)',
              border: `1px solid ${HUD.primary}`,
              borderRadius: '4px',
              boxShadow: `0 0 40px rgba(0, 247, 163, 0.2), inset 0 0 30px rgba(0, 247, 163, 0.03)`,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Scanline Effect */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 10,
                background: 'linear-gradient(to bottom, transparent 50%, rgba(0, 247, 163, 0.02) 50%)',
                backgroundSize: '100% 4px'
              }}
            />

            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'rgba(0, 247, 163, 0.05)',
              borderBottom: `1px solid rgba(0, 247, 163, 0.2)`,
              position: 'relative',
              zIndex: 20,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  backgroundColor: session ? HUD.primary : HUD.alert,
                  boxShadow: `0 0 10px ${session ? HUD.primary : HUD.alert}`,
                  animation: 'pulse 2s infinite'
                }} />
                <span style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 'bold',
                  letterSpacing: '0.1em',
                  fontSize: '0.8rem',
                  color: session ? HUD.primary : HUD.alert,
                  textShadow: `0 0 10px ${session ? 'rgba(0, 247, 163, 0.5)' : 'rgba(255, 0, 60, 0.5)'}`,
                  textTransform: 'uppercase'
                }}>
                  {session ? 'DRONE.AI // ONLINE' : 'DRONE.AI // LOCKED'}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  color: HUD.textBody,
                  background: 'none',
                  border: `1px solid rgba(154, 165, 177, 0.3)`,
                  padding: '4px 10px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: '0.65rem',
                  letterSpacing: '0.05em',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = HUD.alert;
                  e.currentTarget.style.color = HUD.alert;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(154, 165, 177, 0.3)';
                  e.currentTarget.style.color = HUD.textBody;
                }}
              >
                CLOSE
              </button>
            </div>

            {/* Content Area */}
            {!session ? (
              // LOCKED STATE
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                position: 'relative',
                zIndex: 20
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  border: `2px solid ${HUD.alert}`,
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  marginBottom: '1.5rem',
                  boxShadow: `0 0 20px rgba(255, 0, 60, 0.2)`
                }}>
                  <span style={{ fontSize: '2.5rem' }}>🔒</span>
                </div>
                <div>
                  <h3 style={{
                    color: HUD.alert,
                    fontFamily: "'Orbitron', sans-serif",
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    letterSpacing: '0.1em',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase'
                  }}>ACCESS DENIED</h3>
                  <p style={{
                    color: 'rgba(255, 0, 60, 0.7)',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    fontFamily: "'JetBrains Mono', monospace"
                  }}>
                    SECURITY CLEARANCE REQUIRED.<br/>
                    ESTABLISH NEURAL LINK TO PROCEED.
                  </p>
                </div>
              </div>
            ) : (
              // UNLOCKED CHAT STATE
              <>
                <div
                  ref={scrollRef}
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1rem',
                    position: 'relative',
                    zIndex: 20
                  }}
                >
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '1rem'
                      }}
                    >
                      <div style={{
                        maxWidth: '85%',
                        padding: '0.75rem 1rem',
                        borderLeft: `2px solid ${msg.role === 'user' ? HUD.accent : HUD.primary}`,
                        fontSize: '0.85rem',
                        position: 'relative',
                        backgroundColor: msg.role === 'user'
                          ? 'rgba(0, 234, 255, 0.08)'
                          : 'rgba(0, 247, 163, 0.08)',
                        color: msg.role === 'user' ? HUD.textSoft : HUD.textSoft,
                        borderRadius: '0 4px 4px 0'
                      }}>
                        <div style={{
                          fontFamily: "'Orbitron', sans-serif",
                          fontWeight: 'bold',
                          fontSize: '0.6rem',
                          opacity: 0.7,
                          marginBottom: '0.35rem',
                          letterSpacing: '0.08em',
                          color: msg.role === 'user' ? HUD.accent : HUD.primary
                        }}>
                          {msg.role === 'user' ? '>> OPERATOR' : '>> SYSTEM'}
                        </div>
                        <div style={{ lineHeight: 1.6 }}>
                          {msg.role === 'drone' && msg.isTyping ? (
                            <TypewriterText text={msg.text} />
                          ) : (
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                      <div style={{
                        backgroundColor: 'rgba(0, 247, 163, 0.05)',
                        border: `1px solid rgba(0, 247, 163, 0.2)`,
                        padding: '1rem',
                        fontSize: '0.75rem',
                        color: HUD.primary,
                        fontFamily: "'JetBrains Mono', monospace",
                        borderRadius: '4px'
                      }}>
                        {'>'} ANALYZING NEURAL PATTERNS...<br/>
                        {'>'} QUERYING VECTOR DATABASE...
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div style={{
                  padding: '1rem',
                  borderTop: `1px solid rgba(0, 247, 163, 0.2)`,
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  zIndex: 20
                }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                    <span style={{
                      color: HUD.primary,
                      fontSize: '1.25rem',
                      textShadow: `0 0 10px ${HUD.primary}`
                    }}>{'>'}</span>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="ENTER COMMAND..."
                      style={{
                        flex: 1,
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderBottom: `1px solid rgba(0, 247, 163, 0.3)`,
                        color: HUD.textSoft,
                        fontSize: '0.85rem',
                        padding: '0.5rem 0',
                        outline: 'none',
                        resize: 'none',
                        height: '2.5rem',
                        fontFamily: "'JetBrains Mono', monospace"
                      }}
                    />
                    <button
                      onClick={handleSend}
                      disabled={loading}
                      style={{
                        color: HUD.primary,
                        border: `1px solid ${HUD.primary}`,
                        padding: '0.5rem 1rem',
                        fontSize: '0.7rem',
                        fontFamily: "'Orbitron', sans-serif",
                        fontWeight: 'bold',
                        letterSpacing: '0.08em',
                        background: 'rgba(0, 247, 163, 0.05)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        borderRadius: '2px',
                        transition: 'all 0.3s ease',
                        textTransform: 'uppercase'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) {
                          e.currentTarget.style.background = HUD.primary;
                          e.currentTarget.style.color = HUD.bg;
                          e.currentTarget.style.boxShadow = `0 0 20px rgba(0, 247, 163, 0.4)`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 247, 163, 0.05)';
                        e.currentTarget.style.color = HUD.primary;
                        e.currentTarget.style.boxShadow = 'none';
                      }}
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
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          backgroundColor: HUD.bg,
          border: `2px solid ${session ? HUD.primary : HUD.alert}`,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: session
            ? `0 0 30px rgba(0, 247, 163, 0.4), inset 0 0 15px rgba(0, 247, 163, 0.1)`
            : `0 0 30px rgba(255, 0, 60, 0.4), inset 0 0 15px rgba(255, 0, 60, 0.1)`,
          cursor: 'pointer',
          position: 'relative',
          zIndex: 50,
          transition: 'all 0.3s ease'
        }}
      >
        <span style={{
          fontSize: '1.75rem',
          filter: session ? 'none' : 'grayscale(100%)',
          opacity: session ? 1 : 0.6,
          transition: 'all 0.3s'
        }}>
          🤖
        </span>
      </motion.button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default DroneWidget;
