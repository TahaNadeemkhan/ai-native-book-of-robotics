import React, { useState, useEffect } from "react";
import Layout from "@theme/Layout";
import { useHistory } from "@docusaurus/router";
import { useSession } from "../lib/auth-client";
import ProficiencySelect from "../components/ProficiencySelect";
import HardwareInput from "../components/HardwareInput";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function OnboardingPage() {
  const { siteConfig } = useDocusaurusContext();
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
      const response = await fetch("/users/onboarding", {
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
        history.push("/docs/intro");
      } else {
        console.error("Failed to save onboarding data");
        alert("Failed to save data. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred.");
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
      <div className="min-h-[calc(100vh-60px)] flex items-center justify-center px-4 py-12 bg-[#0c0f12]">
        {/* FIXED: Changed max-w-xl to max-w-lg and added style maxWidth: '550px' to force constraint */}
        <div
          className="w-full max-w-lg mx-auto bg-[#0a0f14]/80 border border-[#00f7a3] rounded-xl shadow-[0_0_15px_#00f7a3] p-10 backdrop-blur space-y-8 relative"
          style={{ maxWidth: "550px" }}
        >
          {/* Scanline effect */}
          <div className="scanline-overlay"></div>
          <div className="scanline-moving"></div>

          {/* Header */}
          <div className="text-center space-y-3 relative z-10">
            <h1
              className="text-2xl sm:text-3xl font-bold glitch-text text-[#00f7a3] tracking-widest mb-0"
              style={{ textShadow: "0 0 10px rgba(0,247,163,0.5)" }}
            >
              NEURAL CALIBRATION
            </h1>
            <p className="text-[10px] sm:text-xs font-mono text-[#9aa5b1] tracking-[0.3em] uppercase">
              Configure Parameters for Optimization
            </p>
            <div className="w-24 h-0.5 bg-[#00f7a3]/30 mx-auto mt-4"></div>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
            <div className="space-y-2">
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

            <div className="pt-4 border-t border-[#9aa5b1]/10">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded border border-[#00f7a3] bg-[#00f7a3]/10 text-[#00f7a3] font-mono font-bold tracking-[0.2em] uppercase hover:bg-[#00f7a3] hover:text-[#0c0f12] transition-all duration-300 shadow-[0_0_15px_rgba(0,247,163,0.2)] hover:shadow-[0_0_25px_rgba(0,247,163,0.6)]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3 animate-pulse">
                    <span className="w-2 h-2 bg-current rounded-full"></span>
                    UPLOADING DATA...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    INITIALIZE SYSTEM
                    <span className="text-lg leading-none">→</span>
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="text-center relative z-10">
            <p className="text-[10px] text-[#9aa5b1]/30 font-mono tracking-[0.4em]">
              SYNC RATE: 99.9%
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
