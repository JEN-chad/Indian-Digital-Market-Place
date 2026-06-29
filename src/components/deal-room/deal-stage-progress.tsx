import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Info, X } from "lucide-react";


export const STAGES_LIST = [
  {
    key: "due_diligence",
    label: "Due Diligence",
    description: "Buyer performs thorough verification of traffic analytics, code quality, financials, and legal standing of the digital asset."
  },
  {
    key: "agreement",
    label: "Agreement",
    description: "Both parties review, finalize, and securely e-sign the formal M&A Purchase and Transfer Agreement."
  },
  {
    key: "escrow",
    label: "Escrow",
    description: "Buyer transfers purchase funds into FMI safe custody escrow bank account. Funds are verified and secured before handover."
  },
  {
    key: "transfer",
    label: "Transfer",
    description: "Seller hands over private assets (domains, servers, credentials, databases) to the buyer and confirms receipt."
  },
  {
    key: "closed",
    label: "Closed",
    description: "FMI compliance releases verified escrow funds to the seller. Transaction is complete. Feedback is submitted."
  }
];

interface DealStageProgressProps {
  currentStage: string;
}

export function DealStageProgress({ currentStage }: DealStageProgressProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Get index of the current stage
  const currentIdx = STAGES_LIST.findIndex((s) => s.key === currentStage);

  return (
    <div className="bg-white border border-black/10 p-6 font-sans space-y-6 relative rounded-none">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-green bg-emerald-50 border border-emerald-100 px-2 py-0.5 inline-block">
            TRANSACTION PIPELINE
          </span>
          <h4 className="text-sm font-serif italic font-black">Deal Milestone Tracker</h4>
        </div>
        <span className="text-[10px] font-mono text-brand-dark/40 italic">
          Click stage circle to review requirements
        </span>
      </div>

      {/* Horizontal Line Container */}
      <div className="relative pt-4 pb-8">
        {/* Background connector line */}
        <div className="absolute top-[28px] left-6 right-6 h-[2px] bg-black/[0.08]" />
        
        {/* Fill Line for progress */}
        <div 
          className="absolute top-[28px] left-6 h-[2px] bg-brand-green transition-all duration-500" 
          style={{ 
            width: `${currentIdx >= 0 ? (currentIdx / (STAGES_LIST.length - 1)) * 100 : 0}%` 
          }}
        />

        {/* Stage Nodes */}
        <div className="relative flex justify-between items-center z-10">
          {STAGES_LIST.map((stage, idx) => {
            const isCompleted = idx < currentIdx;
            const isActive = idx === currentIdx;
            const isFuture = idx > currentIdx;

            return (
              <div key={stage.key} className="flex flex-col items-center flex-1 relative">
                {/* Node Dot */}
                <motion.button
                  type="button"
                  onClick={() => setActiveTooltip(stage.key === activeTooltip ? null : stage.key)}
                  animate={isCompleted ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                  transition={isCompleted ? { type: "spring", stiffness: 400, damping: 15 } : undefined}
                  className={`w-7 h-7 flex items-center justify-center border font-mono text-[10px] font-bold transition-all focus:outline-none cursor-pointer rounded-none ${
                    isCompleted
                      ? "bg-brand-green border-brand-green text-white"
                      : isActive
                      ? "bg-brand-cream border-brand-green text-brand-green ring-4 ring-brand-green/10"
                      : "bg-white border-black/10 text-brand-dark/30 hover:border-black/30"
                  }`}
                  title={`${stage.label}: Click to read description`}
                >
                  <AnimatePresence mode="wait">
                    {isCompleted ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 20 }}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </motion.span>
                    ) : (
                      <motion.span key="num" initial={{ scale: 1 }} animate={{ scale: 1 }}>
                        {idx + 1}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Stage Label */}
                <span 
                  className={`text-[10px] uppercase font-mono tracking-wider mt-3 font-bold text-center transition-colors px-1 ${
                    isActive 
                      ? "text-brand-green font-black" 
                      : isCompleted 
                      ? "text-brand-dark" 
                      : "text-brand-dark/30"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );

          })}
        </div>
      </div>

      {/* Stage Description Box */}
      {activeTooltip && (
        <div className="bg-brand-cream/30 border border-brand-green/20 p-4 relative animate-fade-in text-brand-dark">
          <button
            onClick={() => setActiveTooltip(null)}
            className="absolute top-3 right-3 text-brand-dark/40 hover:text-brand-dark focus:outline-none"
            aria-label="Close tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex gap-2.5 items-start">
            <Info className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-green block">
                {STAGES_LIST.find((s) => s.key === activeTooltip)?.label} (Stage {STAGES_LIST.findIndex((s) => s.key === activeTooltip) + 1})
              </span>
              <p className="text-xs leading-relaxed text-brand-dark/80">
                {STAGES_LIST.find((s) => s.key === activeTooltip)?.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
