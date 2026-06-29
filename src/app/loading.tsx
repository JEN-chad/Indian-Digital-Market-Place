import React from "react";
import { Loader2 } from "lucide-react";

export function GlobalLoading() {
  return (
    <div className="fixed inset-0 bg-[#FDFCFB]/85 backdrop-blur-xs flex flex-col items-center justify-center z-50 font-sans">
      <div className="flex flex-col items-center space-y-4 p-6 text-center animate-fade-in">
        {/* Animated FMI Logo Box */}
        <div className="relative">
          <div className="w-14 h-14 bg-brand-dark flex items-center justify-center text-white font-serif italic font-extrabold text-2xl shadow-lg border border-white/10 relative z-10">
            F
          </div>
          {/* Subtle spinning accent outline */}
          <div className="absolute -inset-2.5 border border-brand-green/20 rounded-full animate-spin-slow pointer-events-none" />
        </div>

        <div className="space-y-1 pt-2">
          <span className="text-sm font-serif italic font-black text-brand-dark tracking-tight uppercase block">
            FMI Exchange
          </span>
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-mono tracking-widest text-[#1A1A1A]/40 uppercase">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-green" />
            <span>Establishing Secure Tunnel...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalLoading;
