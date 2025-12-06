import React from "react";

interface ProficiencySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const levels = ["Beginner", "Intermediate", "Expert"];

export default function ProficiencySelect({
  label,
  value,
  onChange,
}: ProficiencySelectProps) {
  return (
    <div className="group">
      <label className="block text-[#9aa5b1] text-sm font-mono tracking-[0.15em] mb-5 group-hover:text-[#00f7a3] transition-colors duration-300 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
        {label}
      </label>
      <div className="grid grid-cols-3 gap-4">
        {levels.map((level) => {
          const isActive = value === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`
                py-5 px-4 border-2 font-mono text-sm uppercase tracking-wider transition-all duration-300 relative overflow-hidden rounded
                ${
                  isActive
                    ? "border-[#00f7a3] bg-[#00f7a3]/10 text-[#00f7a3] shadow-[0_0_25px_rgba(0,247,163,0.4)] scale-[1.03]"
                    : "border-[#9aa5b1]/20 text-[#9aa5b1]/70 hover:border-[#00eaff] hover:text-[#00eaff] hover:bg-[#00eaff]/5 hover:scale-[1.01]"
                }
              `}
            >
              <span className="relative z-10 font-bold flex items-center justify-center gap-2">
                {isActive && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
                {level}
              </span>

              {/* Background Scanline animation for active state */}
              {isActive && (
                <div className="absolute inset-0 bg-[linear-gradient(transparent,rgba(0,247,163,0.1),transparent)] bg-[length:100%_4px] animate-scanline pointer-events-none"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
