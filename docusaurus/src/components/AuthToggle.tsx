import React, { useState, useEffect } from "react";
import { useSession, signOut } from "@site/src/lib/auth-client";
import { useHistory } from "@docusaurus/router";

// Inline SVG for Google Icon
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path
      d="M12.0003 12.7937L12.0003 11.2063L23.1098 11.2063C23.1362 11.9056 23.1843 12.4495 23.1843 13.1111C23.1843 15.0855 22.6514 17.7001 20.8175 19.5781C18.9836 21.4561 16.3315 22.5623 12.0003 22.5623C6.31936 22.5623 1.50024 17.9048 1.50024 12.1667C1.50024 6.42858 6.31936 1.77109 12.0003 1.77109C14.6974 1.77109 16.8978 2.89312 18.3972 4.30132L17.1523 5.48529C16.142 4.45642 14.5097 3.52834 12.0003 3.52834C7.30066 3.52834 3.32837 7.2023 3.32837 12.1667C3.32837 17.1311 7.30066 20.8051 12.0003 20.8051C15.6053 20.8051 17.8422 19.1624 18.9568 18.0055C19.6738 17.2541 20.1554 16.2758 20.4079 15.1118L12.0003 15.1118L12.0003 12.7937Z"
      fill="currentColor"
    ></path>
  </svg>
);

// Inline SVG for GitHub Icon
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 0C5.372 0 0 5.372 0 12c0 5.309 3.438 9.8 8.205 11.385.6.11.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.725-4.04-1.612-4.04-1.612-.546-1.387-1.332-1.756-1.332-1.756-1.09-.744.083-.728.083-.728 1.205.085 1.838 1.237 1.838 1.237 1.07 1.83 2.805 1.302 3.49.998.108-.775.42-1.303.762-1.603-2.665-.304-5.466-1.334-5.466-5.932 0-1.31.465-2.38 1.235-3.22-.125-.304-.535-1.524.117-3.18 0 0 1.008-.322 3.301 1.23A11.49 11.49 0 0112 5.86c1.02.002 2.046.136 3.003.402 2.29-1.554 3.297-1.23 3.297-1.23.653 1.657.243 2.876.12 3.18.77.84 1.233 1.91 1.233 3.22 0 4.61-2.805 5.624-5.475 5.92.43.37.817 1.102.817 2.22 0 1.605-.015 2.895-.015 3.284 0 .32.22.695.825.577C20.564 21.8 24 17.308 24 12c0-6.628-5.372-12-12-12z"
    ></path>
  </svg>
);

const AuthToggle = () => {
  const { data: session, isPending } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  // Onboarding Redirect Check
  useEffect(() => {
    const checkOnboarding = async () => {
      if (session && !isPending) {
        try {
          const res = await fetch("/api/users/me/onboarding", {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            if (!data || Object.keys(data).length === 0) {
              if (window.location.pathname !== "/onboarding") {
                history.push("/onboarding");
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

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 800));

    const endpoint =
      view === "login" ? "/api/auth/sign-in/email" : "/api/auth/sign-up/email";

    const payload =
      view === "login" ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

          const data = await res.json();

          if (!res.ok) {
              throw new Error(data.detail || "Authentication failed");
          }

          // Manual Cookie Fallback for Localhost Stability
          if (data.token) {
              document.cookie = `session_token=${data.token}; path=/; samesite=lax; max-age=1800`;
          }

          window.location.reload(); 
      } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    fetch("/api/auth/sign-in/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        provider: "google",
        callbackURL: window.location.href,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) window.location.href = data.url;
      });
  };

  const handleGitHubLogin = () => {
    window.location.href = "/api/auth/sign-in/github";
  };

  if (isPending)
    return (
      <button className="cyber-button">
        <span className="animate-pulse">INITIALIZING...</span>
      </button>
    );

  return (
    <>
      {/* NAVBAR TOGGLE BUTTON */}
      <button
        className={`cyber-button ${session ? "" : "offline"}`}
        onClick={() => (session ? handleLogout() : setShowModal(true))}
        title={session ? "Sever Neural Link" : "Establish Neural Link"}
        style={{ marginLeft: "15px" }}
      >
        <span className="cyber-indicator" />
        {session ? "NEURAL LINK: ACTIVE" : "SYSTEM: OFFLINE"}
      </button>

      {/* AUTH MODAL */}
      {showModal && !session && (
        <div
          className="cyber-modal-backdrop"
          onClick={() => setShowModal(false)}
        >
          <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div
              className="w-full max-w-2xl bg-[#0a0f14]/90 border border-[#00f7a3] rounded-xl shadow-[0_0_25px_#00f7a3] backdrop-blur relative"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: "650px" }}
            >
              {/* Scanline Overlay */}
              <div className="scanline-overlay"></div>

              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-[#9aa5b1] hover:text-[#ff003c] font-mono text-3xl z-20 transition-colors leading-none w-10 h-10 flex items-center justify-center rounded hover:bg-[#ff003c]/10"
                title="Close"
              >
                ×
              </button>

              {/* Header */}
              <div className="text-center px-8 pt-10 pb-8 border-b border-[#00f7a3]/20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#00f7a3] bg-[#00f7a3]/5 mb-5">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00f7a3" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <h2
                  className="text-3xl glitch-text"
                  style={{
                    color: "var(--hud-primary)",
                    fontFamily: 'var(--hud-font-display)',
                    textShadow: "0 0 15px rgba(0,247,163,0.5)"
                  }}
                >
                  IDENTITY VERIFICATION
                </h2>
                <p className="text-sm font-mono text-[#9aa5b1] tracking-[0.15em] uppercase mt-3">
                  Secure Neural Link Protocol
                </p>
              </div>

              {/* Tabs */}
              <div className="cyber-tabs">
                <div
                  className={`cyber-tab ${view === "login" ? "active" : ""}`}
                  onClick={() => setView("login")}
                >
                  LOGIN
                </div>
                <div
                  className={`cyber-tab ${view === "signup" ? "active" : ""}`}
                  onClick={() => setView("signup")}
                >
                  REGISTER
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mx-10 mt-6 p-4 border-2 border-[#ff003c] bg-[#ff003c]/10 text-[#ff003c] text-sm font-mono flex items-center rounded">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-3">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>ERROR: {error}</span>
                </div>
              )}

              {/* Form */}
              <div className="px-10 py-8 space-y-8 relative z-10">
                {view === "signup" && (
                  <div className="space-y-3">
                    <label className="text-sm font-mono text-[#9aa5b1] tracking-[0.12em] flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      OPERATOR ALIAS
                    </label>
                    <input
                      type="text"
                      placeholder="ENTER DISPLAY NAME"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="cyber-input"
                      style={{ padding: '14px 16px', fontSize: '15px' }}
                      required
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-sm font-mono text-[#9aa5b1] tracking-[0.12em] flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    EMAIL FREQUENCY
                  </label>
                  <input
                    type="email"
                    placeholder="NAME@DOMAIN.COM"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="cyber-input"
                    style={{ padding: '14px 16px', fontSize: '15px' }}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-mono text-[#9aa5b1] tracking-[0.12em] flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    ACCESS CODE
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="cyber-input"
                    style={{ padding: '14px 16px', fontSize: '15px' }}
                    required
                  />
                </div>

                <button
                  onClick={handleEmailAuth}
                  disabled={loading}
                  className="cyber-button w-full mt-6"
                  style={{
                    padding: '16px 32px',
                    fontSize: '15px',
                    background: loading
                      ? 'rgba(0, 247, 163, 0.15)'
                      : 'linear-gradient(135deg, rgba(0, 247, 163, 0.08), rgba(0, 234, 255, 0.08))',
                    boxShadow: '0 0 20px rgba(0,247,163,0.3)'
                  }}
                >
                  {loading ? (
                    <span className="flex items-center animate-pulse justify-center gap-2">
                      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                      </svg>
                      PROCESSING...
                    </span>
                  ) : view === "login" ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
                      </svg>
                      AUTHENTICATE
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12.5 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6"/>
                      </svg>
                      INITIALIZE PROTOCOL
                    </span>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex py-2 items-center z-10 px-10">
                <div className="flex-grow border-t border-[#9aa5b1]/20"></div>
                <span className="flex-shrink mx-5 text-[#9aa5b1]/50 text-xs font-mono uppercase tracking-[0.2em]">
                  OR EXTERNAL UPLINK
                </span>
                <div className="flex-grow border-t border-[#9aa5b1]/20"></div>
              </div>

              {/* Social Buttons */}
              <div className="space-y-4 relative z-10 px-10 pb-10">
                <button
                  type="button"
                  onClick={handleGitHubLogin}
                  className="cyber-button secondary w-full"
                  style={{
                    padding: '14px 24px',
                    fontSize: '14px',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                >
                  <span className="w-5 h-5 flex-shrink-0">
                    <GitHubIcon />
                  </span>
                  <span className="tracking-wider">Continue with GitHub</span>
                </button>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="cyber-button secondary w-full"
                  style={{
                    padding: '14px 24px',
                    fontSize: '14px',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                >
                  <span className="w-5 h-5 flex-shrink-0">
                    <GoogleIcon />
                  </span>
                  <span className="tracking-wider">Continue with Google</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthToggle;
