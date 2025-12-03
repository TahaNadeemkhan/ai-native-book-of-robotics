import React, { useState, useRef, useEffect } from 'react';
import { useSession } from '../lib/auth-client';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const DroneWidget: React.FC = () => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'drone'; text: string }[]>([
    { role: 'drone', text: 'Greetings. I am the Automated Assistant Drone. How may I assist your robotics research?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/api/drone/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMsg }),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Link Failure');

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'drone', text: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'drone', text: '[ERROR]: Unable to connect to knowledge base.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return null; // Only visible to authenticated users

  return (
    <div className="fixed bottom-8 right-8 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-96 h-[500px] bg-[#0c0f12] border border-[#00f7a3] rounded-lg shadow-[0_0_30px_rgba(0,247,163,0.2)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#00f7a3]/10 p-3 border-b border-[#00f7a3]/30 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00f7a3] rounded-full animate-pulse" />
                <span className="text-[#00f7a3] font-orbitron text-sm tracking-wider">DRONE LINK V1</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#00f7a3] hover:text-white">✖</button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#00f7a3]/20" ref={scrollRef}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    msg.role === 'user' 
                      ? 'bg-[#00eaff]/10 border border-[#00eaff]/30 text-[#c4fff9]' 
                      : 'bg-[#111418] border border-[#00f7a3]/30 text-[#9aa5b1]'
                  }`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[#111418] border border-[#00f7a3]/30 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#00f7a3] rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#00f7a3] rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-[#00f7a3] rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[#00f7a3]/20 bg-[#080a0c]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Query Knowledge Base..."
                  className="flex-1 bg-[#111418] border border-[#00f7a3]/30 rounded p-2 text-sm text-white focus:outline-none focus:border-[#00f7a3]"
                />
                <button 
                  onClick={handleSend}
                  disabled={loading}
                  className="bg-[#00f7a3]/10 border border-[#00f7a3] text-[#00f7a3] px-3 py-2 rounded hover:bg-[#00f7a3]/20 disabled:opacity-50"
                >
                  ▶
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#0c0f12] border-2 border-[#00f7a3] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,247,163,0.4)] hover:shadow-[0_0_30px_rgba(0,247,163,0.6)] transition-shadow"
      >
        <span className="text-2xl">🤖</span>
      </motion.button>
    </div>
  );
};

export default DroneWidget;
