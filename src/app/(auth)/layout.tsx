import React from "react";
import { motion } from "framer-motion";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans antialiased flex flex-col selection:bg-brand-green/20 selection:text-brand-green">
      {/* Brand Header */}
      <header className="py-6 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 bg-[#1D4429] flex items-center justify-center text-white font-serif italic font-extrabold text-lg shadow-sm">
            F
          </div>
          <div>
            <span className="text-md font-serif font-black tracking-tight uppercase block">FMI</span>
            <span className="text-[8px] font-mono tracking-widest text-[#1A1A1A]/40 uppercase block -mt-1">
              Digital Exchange
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white border border-black/10 p-8 shadow-sm rounded-lg"
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-[11px] text-gray-400">
        &copy; {new Date().getFullYear()} FMI Exchange. Secure Indian Mergers & Acquisitions.
      </footer>
    </div>
  );
}

export default AuthLayout;
