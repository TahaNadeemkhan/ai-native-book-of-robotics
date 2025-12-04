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
          const res = await fetch("/users/me/onboarding", {
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
          {/* OUTER WRAPPER FOR CENTERING */}
          <div className="min-h-screen flex items-center justify-center px-4 py-8">
            {/* CARD LAYOUT - UPDATED: Increased max-w-xl and padding p-12 */}
            <div
              className="w-full max-w-xl bg-[#0a0f14]/80 border border-[#00f7a3] rounded-xl shadow-[0_0_15px_#00f7a3] p-12 backdrop-blur space-y-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Scanline Overlay */}
              <div className="scanline-overlay"></div>
              <div className="scanline-moving"></div>

              {/* Close Button - UPDATED: Moved to top-3 right-3 to clear header */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-cb-text-body hover:text-cb-alert font-mono text-2xl z-20 transition-colors leading-none"
              >
                ×
              </button>

              {/* Header - UPDATED: Added mt-4 to push text down from close button */}
              <h2
                className="text-center text-2xl glitch-text mt-4"
                style={{ color: "var(--hud-primary)" }}
              >
                IDENTITY VERIFICATION
              </h2>

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
                <div className="p-4 border border-red-500 bg-red-500/10 text-red-400 text-sm font-mono flex items-center rounded">
                  <span className="mr-2">⚠</span> ERROR: {error}
                </div>
              )}

              {/* Form - UPDATED: Increased vertical spacing to space-y-8 */}
              <div className="space-y-8 relative z-10">
                {view === "signup" && (
                  <div className="space-y-2">
                    <label className="text-sm font-mono text-cb-text-body tracking-wider">
                      OPERATOR ALIAS
                    </label>
                    <input
                      type="text"
                      placeholder="ENTER DISPLAY NAME"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="cyber-input"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-mono text-cb-text-body tracking-wider">
                    EMAIL FREQUENCY
                  </label>
                  <input
                    type="email"
                    placeholder="NAME@DOMAIN.COM"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="cyber-input"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-mono text-cb-text-body tracking-wider">
                    ACCESS CODE
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="cyber-input"
                    required
                  />
                </div>

                <button
                  onClick={handleEmailAuth}
                  disabled={loading}
                  className="cyber-button w-full mt-2"
                  style={{ height: "52px", fontSize: "15px" }}
                >
                  {loading ? (
                    <span className="flex items-center animate-pulse justify-center">
                      <span className="w-2 h-2 bg-current rounded-full mr-2"></span>
                      PROCESSING...
                    </span>
                  ) : view === "login" ? (
                    "AUTHENTICATE"
                  ) : (
                    "INITIALIZE PROTOCOL"
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex py-4 items-center z-10">
                <div className="flex-grow border-t border-cb-text-body/20"></div>
                <span className="flex-shrink mx-4 text-cb-text-body/50 text-xs font-mono uppercase tracking-widest">
                  OR EXTERNAL UPLINK
                </span>
                <div className="flex-grow border-t border-cb-text-body/20"></div>
              </div>

              {/* Social Buttons - UPDATED: Increased gap to space-y-6 */}
              <div className="space-y-6 relative z-10">
                <button
                  type="button"
                  onClick={handleGitHubLogin}
                  className="flex items-center justify-center gap-3
                    w-full py-3 px-4 rounded-lg border
                    bg-[#0a0f14]/60 hover:bg-[#0a0f14]/80
                    border-[#00f7a3] text-[#00f7a3]
                    transition-all duration-200 text-sm font-medium"
                >
                  <span className="w-5 h-5 flex-shrink-0">
                    <GitHubIcon />
                  </span>
                  Continue with GitHub
                </button>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-3
                    w-full py-3 px-4 rounded-lg border
                    bg-[#0a0f14]/60 hover:bg-[#0a0f14]/80
                    border-[#00f7a3] text-[#00f7a3]
                    transition-all duration-200 text-sm font-medium"
                >
                  <span className="w-5 h-5 flex-shrink-0">
                    <GoogleIcon />
                  </span>
                  Continue with Google
                </button>
              </div>

              {/* Footer Decoration */}
              <div className="mt-8 text-center">
                <p className="text-xs text-cb-text-body/40 font-mono tracking-[0.2em]">
                  SECURE CONNECTION ESTABLISHED v4.0
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthToggle;
