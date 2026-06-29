import React from "react";
import { motion } from "motion/react";

interface TypingIndicatorProps {
  senderName: string;
}

export function TypingIndicator({ senderName }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2.5 max-w-[80%] mr-auto pl-2">
      {/* 3 typing dots */}
      <div className="w-8 h-8 rounded-full bg-brand-dark/5 border border-black/5 flex items-center justify-center text-[10px] font-mono text-brand-dark/40 font-bold">
        ...
      </div>
      <div className="flex flex-col space-y-1">
        <span className="text-[9px] font-mono font-bold text-brand-dark/40 uppercase tracking-tight">
          {senderName} is drafting a response
        </span>
        <div className="flex items-center gap-1.5 p-2 bg-white border border-black/[0.05] rounded-r-md rounded-bl-md shadow-xs">
          <div className="flex space-x-1 items-center justify-center h-2">
            <motion.div
              className="w-1.5 h-1.5 bg-brand-dark/50 rounded-full"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
            />
            <motion.div
              className="w-1.5 h-1.5 bg-brand-dark/50 rounded-full"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: 0.15 }}
            />
            <motion.div
              className="w-1.5 h-1.5 bg-brand-dark/50 rounded-full"
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, delay: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
