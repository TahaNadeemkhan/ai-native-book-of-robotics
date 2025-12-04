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
];

export default function HardwareInput({ value, onChange }: HardwareInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside

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

  return (
    <div className="mb-6 relative" ref={wrapperRef}>
      <label className="block text-[#9aa5b1] text-xs font-mono tracking-wider mb-2">
        HARDWARE CONFIGURATION
      </label>

      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);

            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="SELECT UNIT (e.g. JETSON ORIN)"
          className="w-full bg-[#0a0f14]/80 border border-[#9aa5b1] text-[#c4fff9] font-mono py-3 px-4 rounded focus:outline-none focus:border-[#00eaff] focus:shadow-[0_0_15px_rgba(0,234,255,0.2)] transition-all duration-300 placeholder-[#9aa5b1]/50"
        />

        {/* Custom Dropdown Arrow (Visual) */}

        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#00f7a3]">
          ▼
        </div>
      </div>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-2 bg-[#0c0f12] border border-[#00f7a3] shadow-[0_0_20px_rgba(0,247,163,0.15)] max-h-48 overflow-y-auto rounded scrollbar-thin scrollbar-thumb-[#00f7a3] scrollbar-track-[#0a0f14]">
          {suggestions

            .filter((item) => item.toLowerCase().includes(value.toLowerCase()))

            .map((item) => (
              <li
                key={item}
                onClick={() => handleSelect(item)}
                className="px-4 py-3 text-sm font-mono text-[#9aa5b1] hover:bg-[#00f7a3]/10 hover:text-[#00f7a3] cursor-pointer border-b border-[#9aa5b1]/10 last:border-0 transition-colors"
              >
                {item}
              </li>
            ))}

          {suggestions.filter((item) =>
            item.toLowerCase().includes(value.toLowerCase()),
          ).length === 0 && (
            <li className="px-4 py-3 text-xs font-mono text-[#9aa5b1]/50 italic">
              No matching hardware found...
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
