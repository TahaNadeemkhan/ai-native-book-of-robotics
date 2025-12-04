import React from 'react';

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
  return (
    <div className="mb-6">
      <label className="block text-cb-muted-grey text-xs font-mono tracking-wider mb-2">
        HARDWARE CONFIGURATION
      </label>
      <input
        list="hardware-suggestions"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="SELECT UNIT (e.g. JETSON ORIN)"
        className="cyber-input"
      />
      <datalist id="hardware-suggestions">
        {suggestions.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </div>
  );
}