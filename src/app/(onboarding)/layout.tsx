import React from "react";
import { motion } from "framer-motion";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export function OnboardingLayout({ children, currentPath = "" }: OnboardingLayoutProps) {
  // Determine onboarding step for the header indicator
  let stepText = "Step 1 of 3: Define Role";
  let progressPercent = 33;

  if (currentPath.includes("kyc")) {
    stepText = "Step 2 of 3: Identity Verification";
    progressPercent = 66;
  } else if (currentPath.includes("interests")) {
    stepText = "Step 3 of 3: Specify Interests";
    progressPercent = 100;
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans antialiased flex flex-col selection:bg-brand-green/20 selection:text-brand-green">
      {/* 1. Header with FMI Logo, Step Indicator, and Skip Button */}
      <header className="border-b border-black/5 bg-white/85 backdrop-blur sticky top-0 z-40 py-4 px-6 md:px-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1D4429] flex items-center justify-center text-white font-serif italic font-extrabold text-md shadow-sm">
              F
            </div>
            <div>
              <span className="text-sm font-serif font-black tracking-tight uppercase block">FMI</span>
              <span className="text-[7px] font-mono tracking-widest text-[#1A1A1A]/40 uppercase block -mt-1">
                Digital Exchange
              </span>
            </div>
          </div>

          {/* Progress / Step text */}
          <div className="hidden md:flex flex-col items-center">
            <span className="text-[10px] font-mono tracking-wider text-gray-400 uppercase">
              Onboarding Progress
            </span>
            <span className="text-xs font-semibold text-gray-800">{stepText}</span>
          </div>

          {/* Skip for now goes to main exchange dashboard */}
          <a
            href="#/"
            className="text-xs font-medium text-gray-400 hover:text-gray-900 transition flex items-center gap-1 font-mono uppercase tracking-wider"
          >
            Skip for now &rarr;
          </a>
        </div>

        {/* Minimal progress bar on top */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-100">
          <div
            className="h-full bg-[#1D4429] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-2xl bg-white border border-black/10 p-6 md:p-10 shadow-sm rounded-lg"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-black/5 text-center text-[11px] text-gray-400 bg-white">
        &copy; {new Date().getFullYear()} FMI Exchange. Vetted Digital Acquisitions in India.
      </footer>
    </div>
  );
}
export default OnboardingLayout;
