import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";

interface KycWizardProps {
  currentStep: number;
  steps: { title: string; description: string }[];
  onBack: () => void;
  onNext: () => void;
  canNext: boolean;
  nextText?: string;
  children: React.ReactNode;
  loading?: boolean;
}

export function KycWizard({
  currentStep,
  steps,
  onBack,
  onNext,
  canNext,
  nextText = "Next Step",
  children,
  loading = false,
}: KycWizardProps) {
  return (
    <div className="space-y-8">
      {/* 1. Stepper Visual at Top */}
      <div className="relative">
        {/* Progress Bar Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-100 -z-10" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-[#1D4429] transition-all duration-300 -z-10"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {/* Stepper Circles */}
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = currentStep > stepNum;
            const isActive = currentStep === stepNum;

            return (
              <div key={stepNum} className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={true} // Read-only stepper to enforce linear validation
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition ${
                    isCompleted
                      ? "bg-[#1D4429] border-[#1D4429] text-white"
                      : isActive
                        ? "bg-white border-[#1D4429] text-[#1D4429] ring-4 ring-[#1D4429]/10"
                        : "bg-white border-gray-200 text-gray-400"
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                </button>
                
                {/* Step labels hidden on extra small screens for cleaner mobile design */}
                <span
                  className={`mt-2 text-[10px] font-mono tracking-wider uppercase font-medium text-center hidden sm:block ${
                    isActive ? "text-[#1D4429] font-bold" : isCompleted ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Header */}
      <div className="border-b border-black/5 pb-4">
        <span className="text-[10px] font-mono tracking-widest text-[#1A1A1A]/40 uppercase">
          Step {currentStep} of {steps.length} — {steps[currentStep - 1].title}
        </span>
        <h3 className="text-lg font-serif font-black tracking-tight mt-1 text-gray-900">
          {steps[currentStep - 1].description}
        </h3>
      </div>

      {/* 2. Animated Step Content Transition (Framer Motion slide) */}
      <div className="min-h-[250px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. Navigation Actions (Back / Next Buttons) */}
      <div className="flex items-center justify-between border-t border-black/5 pt-6 mt-8">
        <button
          type="button"
          onClick={onBack}
          disabled={currentStep === 1 || loading}
          className={`px-4 py-2.5 border border-black/15 text-xs font-medium text-gray-600 rounded-md hover:bg-gray-50 flex items-center gap-1.5 transition ${
            currentStep === 1 ? "opacity-0 pointer-events-none" : ""
          }`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canNext || loading}
          className={`px-6 py-2.5 bg-[#1D4429] hover:bg-[#15331E] text-white text-xs font-medium rounded-md shadow flex items-center gap-1.5 transition cursor-pointer ${
            (!canNext || loading) ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              {nextText} {currentStep < steps.length && <ArrowRight className="w-3.5 h-3.5" />}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
export default KycWizard;
