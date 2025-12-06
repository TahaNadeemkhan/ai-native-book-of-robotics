import React, { useState, useRef, useEffect } from "react";

interface HardwareInputProps {
  value: string;
  onChange: (value: string) => void;
}

const suggestions = [
  "Nvidia Jetson Nano",
  "Nvidia Jetson Orin",
  "Raspberry Pi 4",
  "Raspberry Pi 5",
  "Intel NUC",
  "Arduino",
  "ESP32",
  "Custom Rig",
];

export default function HardwareInput({ value, onChange }: HardwareInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: string) => {
    onChange(item);
    setIsOpen(false);
  };

  // If value exactly matches an option → show full list
  const isExactMatch = suggestions.includes(value);

  const filteredSuggestions = isExactMatch
    ? suggestions
    : suggestions.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase()),
      );

  return (
    <div ref={wrapperRef}>
      <label className="block text-[#9aa5b1] text-sm font-mono tracking-[0.15em] mb-5 hover:text-[#00f7a3] transition-colors duration-300 flex items-center gap-2">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        HARDWARE CONFIGURATION
      </label>

      {/* INPUT + ARROW */}
      <div
        className="flex items-center w-full bg-[#0a0f14]/60 border-2 border-[#9aa5b1]/30
                   rounded px-6 py-5 cursor-text group
                   focus-within:border-[#00eaff] focus-within:bg-[#0a0f14]
                   focus-within:shadow-[0_0_25px_rgba(0,234,255,0.2)]
                   transition-all duration-300"
        onClick={() => setIsOpen(true)}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="SELECT UNIT (e.g. JETSON ORIN)"
          className="flex-1 bg-transparent text-[#c4fff9] font-mono text-base placeholder-[#9aa5b1]/40
                     focus:outline-none"
          style={{ letterSpacing: '0.02em' }}
        />

        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`ml-4 text-[#00f7a3] cursor-pointer transition-transform duration-300
                      hover:text-[#00eaff] ${isOpen ? "rotate-180" : "rotate-0"}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>

      {/* DROPDOWN */}
      {isOpen && (
        <ul
          className="w-full mt-3 bg-[#0a0f14] border-2 border-[#00eaff] rounded
                     shadow-[0_0_30px_rgba(0,234,255,0.2)] max-h-64 overflow-y-auto
                     scrollbar-thin scrollbar-thumb-[#00eaff] scrollbar-track-[#0c0f12]"
        >
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((item) => (
              <li
                key={item}
                onClick={() => handleSelect(item)}
                className="px-6 py-4 text-base font-mono text-[#9aa5b1] cursor-pointer
                           border-b border-[#9aa5b1]/10 last:border-0
                           hover:bg-[#00eaff]/10 hover:text-[#00eaff] hover:pl-8
                           transition-all duration-200 flex items-center gap-3"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-50">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                {item}
              </li>
            ))
          ) : (
            <li className="px-6 py-4 text-sm font-mono text-[#9aa5b1]/40 italic flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              NO HARDWARE DETECTED...
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
