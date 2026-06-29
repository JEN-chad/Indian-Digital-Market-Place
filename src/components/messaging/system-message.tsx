import React from "react";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";

interface SystemMessageProps {
  message: {
    id: string;
    content: string;
    createdAt: string | Date;
  };
}

export function SystemMessage({ message }: SystemMessageProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center my-4 w-full"
    >
      <div className="bg-brand-cream border border-brand-green/20 px-4 py-2 max-w-lg text-center shadow-xs">
        <div className="flex items-center justify-center gap-1.5 mb-1 text-[10px] font-mono font-bold uppercase text-brand-green tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
          <span>FMI Safe Custody Compliance Log</span>
          <span className="text-brand-dark/30 font-normal">|</span>
          <span className="text-brand-dark/40 font-normal">{formattedTime}</span>
        </div>
        <p className="text-[11px] font-sans text-brand-dark/85 leading-relaxed font-medium">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}
