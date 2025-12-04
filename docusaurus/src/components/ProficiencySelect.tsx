import React from 'react';

interface ProficiencySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const levels = ['Beginner', 'Intermediate', 'Expert'];

export default function ProficiencySelect({ label, value, onChange }: ProficiencySelectProps) {
  return (
    <div className="mb-6">
      <label className="block text-cb-muted-grey text-xs font-mono tracking-wider mb-2">
        {label}
      </label>
      <div className="flex space-x-2">
        {levels.map((level) => {
          const isActive = value === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`
                flex-1 py-3 px-2 border font-mono text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-300
                ${isActive 
                  ? 'border-cb-neon-green bg-cb-neon-green/10 text-cb-neon-green shadow-[0_0_15px_rgba(0,247,163,0.2)]' 
                  : 'border-cb-muted-grey/30 text-cb-muted-grey/50 hover:border-cb-cyan-accent hover:text-cb-cyan-accent hover:bg-cb-cyan-accent/5'
                }
              `}
            >
              {level}
            </button>
          );
        })}
      </div>
    </div>
  );
}