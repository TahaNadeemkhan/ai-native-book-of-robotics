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
    <div className="mb-8 group">
      <label className="block text-[#9aa5b1] text-xs font-mono tracking-widest mb-4 group-hover:text-[#00f7a3] transition-colors duration-300">
        {label}
      </label>
      <div className="flex gap-4">
        {levels.map((level) => {
          const isActive = value === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`
                flex-1 py-4 px-2 border font-mono text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 relative overflow-hidden rounded
                ${
                  isActive
                    ? "border-[#00f7a3] bg-[#00f7a3]/10 text-[#00f7a3] shadow-[0_0_20px_rgba(0,247,163,0.3)] scale-[1.02]"
                    : "border-[#9aa5b1]/20 text-[#9aa5b1]/60 hover:border-[#00eaff] hover:text-[#00eaff] hover:bg-[#00eaff]/5"
                }
              `}
            >
              <span className="relative z-10 font-bold">{level}</span>

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
