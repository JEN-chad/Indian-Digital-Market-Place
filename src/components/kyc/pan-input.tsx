import React from "react";
import { Check, AlertCircle } from "lucide-react";

interface PanInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function PanInput({ value, onChange, disabled }: PanInputProps) {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const isValid = panRegex.test(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    onChange(val);
  };

  return (
    <div className="relative">
      <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
        PAN Card Number
      </label>
      <div className="relative flex items-center">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="ABCDE1234F"
          maxLength={10}
          className={`w-full bg-white border ${
            isValid 
              ? "border-emerald-600 focus:ring-emerald-500" 
              : value.length === 10 
                ? "border-rose-500 focus:ring-rose-500" 
                : "border-black/15 focus:ring-emerald-800"
          } px-4 py-3 rounded-md text-sm font-mono tracking-widest focus:outline-none focus:ring-1 transition`}
        />
        <div className="absolute right-3 flex items-center">
          {isValid && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-600">
              <Check className="w-3.5 h-3.5" />
            </span>
          )}
          {value.length === 10 && !isValid && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-50 text-rose-500" title="Invalid format">
              <AlertCircle className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
      <p className="mt-1.5 text-[11px] text-gray-400 font-sans">
        Format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
      </p>
    </div>
  );
}
export default PanInput;
