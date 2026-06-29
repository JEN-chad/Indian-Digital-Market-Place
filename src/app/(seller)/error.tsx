import React from "react";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";

interface ErrorProps {
  error?: Error;
  reset?: () => void;
}

export function SellerErrorBoundaryView({ error, reset }: ErrorProps) {
  const handleBackToDashboard = () => {
    window.location.hash = "#/seller/dashboard";
    if (reset) reset();
  };

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-black/10 p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-3.5 text-rose-700">
          <AlertCircle className="w-8 h-8 shrink-0 stroke-[2]" />
          <div>
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider">
              Seller Suite Error Encountered
            </h3>
            <h2 className="text-xl font-serif italic font-black text-brand-dark mt-0.5">
              Failed to load listing workspace
            </h2>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-brand-dark/65 max-w-lg font-sans">
          An error occurred while compiling your business listings, active leads, or private documents. Please verify your internet connection or reload the session.
        </p>

        {error && (
          <div className="bg-rose-50/50 border border-rose-100 p-3.5 font-mono text-[10px] text-rose-800">
            <strong>Audit Log:</strong> {error.message}
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          {reset && (
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-green hover:bg-brand-green/95 text-white font-mono uppercase text-[10px] tracking-wider transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Load</span>
            </button>
          )}
          <button
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-dark hover:bg-brand-dark/95 text-white font-mono uppercase text-[10px] tracking-wider transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Seller Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SellerErrorBoundaryView;
