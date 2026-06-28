import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function OtpInput({ length = 6, value, onChange, disabled = false }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Split value into an array of characters
  const values = value.split("").slice(0, length);
  while (values.length < length) {
    values.push("");
  }

  const focusInput = (index: number) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index]?.focus();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!val) return;

    // Grab the last character of the input value to support overwrites
    const digit = val.slice(-1);
    
    const newValues = [...values];
    newValues[index] = digit;
    const combinedValue = newValues.join("");
    onChange(combinedValue);

    // Auto-focus next input box
    if (index < length - 1 && digit !== "") {
      focusInput(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      // If current box is empty, go to previous and clear it
      if (!values[index] && index > 0) {
        const newValues = [...values];
        newValues[index - 1] = "";
        onChange(newValues.join(""));
        focusInput(index - 1);
      } else {
        // Clear current box
        const newValues = [...values];
        newValues[index] = "";
        onChange(newValues.join(""));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    // Filter out non-digits
    const digitsOnly = pastedData.replace(/\D/g, "").slice(0, length);
    if (digitsOnly) {
      onChange(digitsOnly);
      // Focus on the last filled box or last box
      const focusIndex = Math.min(digitsOnly.length, length - 1);
      focusInput(focusIndex);
    }
  };

  return (
    <div className="flex justify-between items-center gap-2 max-w-sm mx-auto" onPaste={handlePaste}>
      {values.map((digit, idx) => (
        <div key={idx} className="relative flex-1 aspect-square max-w-[56px]">
          <input
            ref={(el) => { inputRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            disabled={disabled}
            className={`w-full h-full text-center text-xl font-mono font-bold border rounded-md focus:outline-none transition-all duration-200 ${
              digit 
                ? "border-brand-green bg-brand-green/5 text-brand-green" 
                : "border-black/10 bg-white focus:border-brand-green"
            } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
          />
          {digit === "" && (
            <motion.div
              layoutId={`otp-focus-bar-${idx}`}
              className="absolute bottom-1.5 left-3 right-3 h-0.5 bg-brand-green/30 opacity-0 focus-within:opacity-100 transition-opacity"
            />
          )}
        </div>
      ))}
    </div>
  );
}
export default OtpInput;
