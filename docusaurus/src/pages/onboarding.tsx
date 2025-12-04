import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useHistory } from '@docusaurus/router';
import { authClient, useSession } from '../lib/auth-client';
import ProficiencySelect from '../components/ProficiencySelect';
import HardwareInput from '../components/HardwareInput';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function OnboardingPage() {
  const { siteConfig } = useDocusaurusContext();
  const { data: session, isPending } = useSession();
  const history = useHistory();
  
  const [programmingLevel, setProgrammingLevel] = useState('Beginner');
  const [aiLevel, setAiLevel] = useState('Beginner');
  const [hardware, setHardware] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
       history.push('/');
    }
  }, [session, isPending, history]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await new Promise(r => setTimeout(r, 1000));
    
    try {
       const response = await fetch('/users/onboarding', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({
               programming_proficiency: programmingLevel,
               ai_proficiency: aiLevel,
               hardware_info: hardware
           }),
           credentials: 'include' 
       });
       
       if (response.ok) {
           history.push('/docs/intro'); 
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
              <div className="container flex items-center justify-center h-[50vh]">
                  <p className="text-cb-text-soft font-mono animate-pulse tracking-widest">
                      ESTABLISHING NEURAL LINK...
                  </p>
              </div>
          </Layout>
      );
  }

  return (
    <Layout
      title={`Neural Onboarding`}
      description="Configure your cybernetic profile">
      <div className="container max-w-2xl py-16 flex items-center justify-center min-h-[80vh]">
        <div className="cyber-card p-8 w-full">
            
            {/* Scanline effect */}
            <div className="scanline-overlay"></div>
            <div className="scanline-moving"></div>

            <h1 className="text-3xl mb-2 text-center glitch-text" style={{color: 'var(--hud-primary)'}}>
                NEURAL CALIBRATION
            </h1>
            <p className="text-center mb-8 font-mono text-sm text-cb-text-body/70 tracking-wider">
                CONFIGURE PARAMETERS FOR OPTIMAL KNOWLEDGE TRANSFER
            </p>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
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

                <HardwareInput 
                    value={hardware} 
                    onChange={setHardware} 
                />

                <div className="mt-8 pt-4 border-t border-cb-text-body/20">
                    <button
                        type="submit"
                        disabled={loading}
                        className="cyber-button w-full h-12 text-lg"
                    >
                        {loading ? (
                            <span className="flex items-center animate-pulse justify-center">
                                <span className="w-2 h-2 bg-current rounded-full mr-2"></span>
                                UPLOADING...
                            </span>
                        ) : (
                            <>
                                INITIALIZE SYSTEM
                                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
            
            <div className="mt-4 text-center">
                <p className="text-[10px] text-cb-text-body/30 font-mono tracking-[0.3em]">
                    SYNC RATE: 99.9%
                </p>
            </div>
        </div>
      </div>
    </Layout>
  );
}
