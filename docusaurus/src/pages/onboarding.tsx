import React, { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import { useHistory } from "@docusaurus/router";
import { useSession } from "../lib/auth-client";
import ProficiencySelect from "../components/ProficiencySelect";
import HardwareInput from "../components/HardwareInput";

export default function OnboardingPage() {
  const { data: session, isPending } = useSession();
  const history = useHistory();

  const [programmingLevel, setProgrammingLevel] = useState("Beginner");
  const [aiLevel, setAiLevel] = useState("Beginner");
  const [hardware, setHardware] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      history.push("/");
    }
  }, [session, isPending, history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await new Promise((r) => setTimeout(r, 1000));

    try {
      const response = await fetch("/api/users/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programming_proficiency: programmingLevel,
          ai_proficiency: aiLevel,
          hardware_info: hardware,
        }),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Onboarding saved successfully:", result);

        // Add a small delay to ensure backend has committed the data
        await new Promise((r) => setTimeout(r, 500));

        // Redirect to homepage
        history.push("/docs/intro");
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to save onboarding data:", errorData);
        alert("Failed to save data. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center bg-[#0c0f12]">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-[#00f7a3] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[#00f7a3] font-mono tracking-widest text-lg animate-pulse">
              ESTABLISHING NEURAL LINK...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`Neural Onboarding`}
      description="Configure your cybernetic profile"
    >
      <div className="min-h-[calc(100vh-60px)] flex items-center justify-center px-4 py-16 bg-[#0c0f12]">
        <div
          className="w-full max-w-3xl mx-auto bg-[#0a0f14]/80 border border-[#00f7a3] rounded-xl shadow-[0_0_20px_#00f7a3] backdrop-blur relative"
          style={{ maxWidth: "800px" }}
        >
          {/* Scanline effect */}
          <div className="scanline-overlay"></div>

          {/* Header */}
          <div className="text-center space-y-4 relative z-10 px-8 pt-12 pb-8 border-b border-[#00f7a3]/20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-[#00f7a3] bg-[#00f7a3]/5 mb-4">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00f7a3" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold glitch-text text-[#00f7a3] tracking-widest mb-0"
              style={{
                fontFamily: 'var(--hud-font-display)',
                textShadow: "0 0 15px rgba(0,247,163,0.5)"
              }}
            >
              NEURAL CALIBRATION
            </h1>
            <p className="text-sm font-mono text-[#9aa5b1] tracking-[0.2em] uppercase max-w-md mx-auto">
              Optimize system parameters for personalized experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 px-12 py-10">
            <div className="space-y-10">
              <ProficiencySelect
                label="PROGRAMMING PROFICIENCY"
                value={programmingLevel}
                onChange={setProgrammingLevel}
              />

              <ProficiencySelect
                label="AI KNOWLEDGE BASE"
                value={aiLevel}
                onChange={setAiLevel}
              />

              <HardwareInput value={hardware} onChange={setHardware} />
            </div>

            <div className="mt-12 pt-8 border-t border-[#9aa5b1]/10">
              <button
                type="submit"
                disabled={loading}
                className="cyber-button w-full"
                style={{
                  padding: '18px 32px',
                  fontSize: '1rem',
                  background: loading
                    ? 'rgba(0, 247, 163, 0.15)'
                    : 'linear-gradient(135deg, rgba(0, 247, 163, 0.08), rgba(0, 234, 255, 0.08))',
                  boxShadow: '0 0 20px rgba(0,247,163,0.3)'
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3 animate-pulse">
                    <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/>
                    </svg>
                    UPLOADING DATA...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 5l7 7-7 7"/>
                    </svg>
                    INITIALIZE SYSTEM
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14m-7-7l7 7-7 7"/>
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="text-center relative z-10 px-8 pb-8">
            <div className="flex items-center justify-center gap-2 text-xs text-[#9aa5b1]/40 font-mono tracking-widest">
              <div className="w-2 h-2 rounded-full bg-[#00f7a3] animate-pulse"></div>
              SYNC RATE: 99.9%
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}