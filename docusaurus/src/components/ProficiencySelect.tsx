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
    <div className="mb-6">
      <label className="block text-[#9aa5b1] text-xs font-mono tracking-wider mb-3">
        {label}
      </label>

      <div className="flex gap-3">
        {levels.map((level) => {
          const isActive = value === level;

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`

                flex-1 py-3 px-2 border font-mono text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300 relative overflow-hidden group rounded

                ${
                  isActive
                    ? "border-[#00f7a3] bg-[#00f7a3]/10 text-[#00f7a3] shadow-[0_0_15px_#00f7a3]"
                    : "border-[#9aa5b1]/30 text-[#9aa5b1]/50 hover:border-[#00eaff] hover:text-[#00eaff] hover:bg-[#00eaff]/5"
                }

              `}
            >
              <span className="relative z-10">{level}</span>

              {isActive && (
                <div className="absolute inset-0 bg-[#00f7a3]/5 animate-pulse"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
