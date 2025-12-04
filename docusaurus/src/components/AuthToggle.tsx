import React, { useState, useEffect } from 'react';
import { useSession, signOut } from '@site/src/lib/auth-client';
import { useHistory } from '@docusaurus/router';

const AuthToggle: React.FC = () => {
  const { data: session, isPending } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<'login' | 'signup'>('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const history = useHistory();

  // Onboarding Redirect Check
  useEffect(() => {
    const checkOnboarding = async () => {
      if (session && !isPending) {
        try {
           const res = await fetch('/users/me/onboarding', {
               credentials: 'include'
           });
           if (res.ok) {
               const data = await res.json();
               if (!data || Object.keys(data).length === 0) {
                   if (window.location.pathname !== '/onboarding') {
                       history.push('/onboarding');
                   }
               }
           }
        } catch (e) {
            console.error("Failed to check onboarding status", e);
        }
      }
    };
    checkOnboarding();
  }, [session, isPending, history]);

  const handleLogout = async () => {
    await signOut();
    window.location.reload();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      // Simulate "AI Processing" delay for effect
      await new Promise(r => setTimeout(r, 800));

      const endpoint = view === 'login' 
        ? '/api/auth/sign-in/email' 
        : '/api/auth/sign-up/email';
      
      const payload = view === 'login'
        ? { email, password }
        : { email, password, name };

      try {
          const res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
              credentials: 'include'
          });

          const data = await res.json();

          if (!res.ok) {
              throw new Error(data.detail || 'Authentication failed');
          }

          window.location.reload(); 
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  const handleGoogleLogin = () => {
      fetch('/api/auth/sign-in/social', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ provider: 'google', callbackURL: window.location.href })
      })
      .then(res => res.json())
      .then(data => {
          if (data.url) window.location.href = data.url;
      });
  };

  const handleGitHubLogin = () => {
       window.location.href = "/api/auth/sign-in/github";
  };

  if (isPending) return (
    <button className="cyber-button">
        <span className="animate-pulse">INITIALIZING...</span>
    </button>
  );

  return (
    <>
      {/* NAVBAR TOGGLE BUTTON */}
      <button
        className={`cyber-button ${session ? '' : 'offline'}`}
        onClick={() => session ? handleLogout() : setShowModal(true)}
        title={session ? "Sever Neural Link" : "Establish Neural Link"}
        style={{ marginLeft: '15px' }}
      >
        <span className="cyber-indicator" />
        {session ? "NEURAL LINK: ACTIVE" : "SYSTEM: OFFLINE"}
      </button>

      {/* AUTH MODAL */}
      {showModal && !session && (
        <div className="cyber-modal-backdrop" onClick={() => setShowModal(false)}>
          <div 
            className="cyber-card w-full max-w-sm p-8 m-4"
            onClick={e => e.stopPropagation()} 
          >
            {/* Scanline Overlay */}
            <div className="scanline-overlay"></div>
            <div className="scanline-moving"></div>

            {/* Close Button */}
            <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-cb-text-body hover:text-cb-alert font-mono text-xl z-20 transition-colors"
            >
                [X]
            </button>

            {/* Header */}
            <h2 className="text-center mb-6 glitch-text" style={{ color: 'var(--hud-primary)' }}>
                IDENTITY VERIFICATION
            </h2>

            {/* Tabs */}
            <div className="cyber-tabs">
                <div 
                    className={`cyber-tab ${view === 'login' ? 'active' : ''}`}
                    onClick={() => setView('login')}
                >
                    LOGIN
                </div>
                <div 
                    className={`cyber-tab ${view === 'signup' ? 'active' : ''}`}
                    onClick={() => setView('signup')}
                >
                    REGISTER
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-3 border border-red-500 bg-red-500/10 text-red-400 text-xs font-mono flex items-center">
                    <span className="mr-2">⚠</span> ERROR: {error}
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-5 relative z-10">
                {view === 'signup' && (
                    <div className="space-y-1">
                        <label className="text-xs font-mono text-cb-text-body tracking-wider">OPERATOR ALIAS</label>
                        <input 
                            type="text" 
                            placeholder="ENTER DISPLAY NAME"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="cyber-input"
                            required
                        />
                    </div>
                )}
                
                <div className="space-y-1">
                    <label className="text-xs font-mono text-cb-text-body tracking-wider">EMAIL FREQUENCY</label>
                    <input 
                        type="email" 
                        placeholder="NAME@DOMAIN.COM"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="cyber-input"
                        required
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-mono text-cb-text-body tracking-wider">ACCESS CODE</label>
                    <input 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="cyber-input"
                        required
                    />
                </div>

                <button 
                    type="submit"
                    disabled={loading}
                    className="cyber-button w-full mt-4"
                    style={{ height: '48px' }}
                >
                    {loading ? (
                        <span className="flex items-center animate-pulse justify-center">
                            <span className="w-2 h-2 bg-current rounded-full mr-2"></span>
                            PROCESSING...
                        </span>
                    ) : (
                        view === 'login' ? 'AUTHENTICATE' : 'INITIALIZE PROTOCOL'
                    )}
                </button>
            </form>

            {/* Divider */}
            <div className="relative flex py-6 items-center z-10">
                <div className="flex-grow border-t border-cb-text-body/20"></div>
                <span className="flex-shrink mx-4 text-cb-text-body/50 text-[10px] font-mono uppercase tracking-widest">
                    OR EXTERNAL UPLINK
                </span>
                <div className="flex-grow border-t border-cb-text-body/20"></div>
            </div>

            {/* Social Buttons */}
            <div className="space-y-3 relative z-10">
                <button 
                    type="button" 
                    onClick={handleGitHubLogin} 
                    className="cyber-button secondary w-full flex items-center justify-center"
                >
                    <span className="mr-2">::</span> GITHUB <span className="ml-2">::</span>
                </button>
                <button 
                    type="button" 
                    onClick={handleGoogleLogin} 
                    className="cyber-button secondary w-full flex items-center justify-center"
                >
                    <span className="mr-2">::</span> GOOGLE <span className="ml-2">::</span>
                </button>
            </div>
            
            {/* Footer Decoration */}
            <div className="mt-6 text-center">
                <p className="text-[10px] text-cb-text-body/40 font-mono tracking-[0.2em]">
                    SECURE CONNECTION ESTABLISHED v4.0
                </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthToggle;
