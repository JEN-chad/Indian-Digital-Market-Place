import React from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface GlobalErrorPageProps {
  error?: Error;
  reset?: () => void;
}

export function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  const isDev = (import.meta as any).env.DEV || process.env.NODE_ENV === "development";

  const handleGoHome = () => {
    window.location.hash = "#/";
    if (reset) reset();
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white border border-black/10 p-8 shadow-sm space-y-6 text-center">
        {/* FMI Styled Icon */}
        <div className="w-16 h-16 bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-600">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-serif italic font-black text-brand-dark">
            Something went wrong
          </h2>
          <p className="text-xs text-brand-dark/65 max-w-xs mx-auto leading-relaxed">
            An unexpected client-side error occurred on the exchange. Our systems have logged this transaction audit anomaly.
          </p>
        </div>

        {/* Development Error Details */}
        {isDev && error && (
          <div className="text-left bg-rose-50/50 border border-rose-100 p-4 font-mono text-[10px] overflow-x-auto max-h-40 divide-y divide-black/5 select-text">
            <p className="font-bold text-rose-800 uppercase pb-1.5">Debug Audit logs (Dev Only)</p>
            <p className="text-rose-700 font-semibold py-1.5">{error.name}: {error.message}</p>
            {error.stack && (
              <pre className="text-gray-500 whitespace-pre pt-1.5 text-[9px] leading-tight">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          {reset && (
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-green hover:bg-brand-green/95 text-white font-bold text-xs uppercase tracking-widest border border-brand-green transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-brand-dark hover:bg-brand-dark/95 text-white font-bold text-xs uppercase tracking-widest border border-brand-dark transition-all cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default GlobalErrorPage;
