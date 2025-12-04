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
    <div className="mb-8" ref={wrapperRef}>
      <label className="block text-[#9aa5b1] text-xs font-mono tracking-widest mb-4 hover:text-[#00f7a3] transition-colors duration-300">
        HARDWARE CONFIGURATION
      </label>

      {/* INPUT + ARROW */}
      <div
        className="flex items-center w-full bg-[#0a0f14]/60 border border-[#9aa5b1]/30
                   rounded px-5 py-4 cursor-text group
                   focus-within:border-[#00eaff] focus-within:bg-[#0a0f14]
                   focus-within:shadow-[0_0_20px_rgba(0,234,255,0.15)]
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
          className="flex-1 bg-transparent text-[#c4fff9] font-mono placeholder-[#9aa5b1]/30
                     focus:outline-none"
        />

        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className={`ml-4 text-[#00f7a3] cursor-pointer transition-transform duration-300
                      hover:text-[#00eaff] ${isOpen ? "rotate-180" : "rotate-0"}`}
        >
          ▼
        </div>
      </div>

      {/* DROPDOWN */}
      {isOpen && (
        <ul
          className="w-full mt-2 bg-[#0a0f14] border border-[#00eaff] rounded
                     shadow-[0_0_30px_rgba(0,234,255,0.1)] max-h-60 overflow-y-auto
                     scrollbar-thin scrollbar-thumb-[#00eaff] scrollbar-track-[#0c0f12]"
        >
          {filteredSuggestions.length > 0 ? (
            filteredSuggestions.map((item) => (
              <li
                key={item}
                onClick={() => handleSelect(item)}
                className="px-5 py-3 text-sm font-mono text-[#9aa5b1] cursor-pointer
                           border-b border-[#9aa5b1]/10 last:border-0
                           hover:bg-[#00eaff]/10 hover:text-[#00eaff] hover:pl-7
                           transition-all duration-200"
              >
                {item}
              </li>
            ))
          ) : (
            <li className="px-5 py-3 text-xs font-mono text-[#9aa5b1]/40 italic">
              NO HARDWARE DETECTED...
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
