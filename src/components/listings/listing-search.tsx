import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface ListingSearchProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function ListingSearch({ value, onChange, placeholder = "Search by title, industry, tagline or keywords..." }: ListingSearchProps) {
  const [localVal, setLocalVal] = useState(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setLocalVal(nextVal);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onChange(nextVal);
    }, 300);
  };

  const handleClear = () => {
    setLocalVal("");
    onChange("");
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-dark/40">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={localVal}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full pl-11 pr-12 py-3.5 bg-white border border-black/10 text-xs font-semibold text-brand-dark placeholder-brand-dark/40 focus:outline-none focus:border-brand-green tracking-wider uppercase transition-colors rounded-none"
      />
      {localVal && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-dark/40 hover:text-rose-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
