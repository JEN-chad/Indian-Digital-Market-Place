import React, { useState } from "react";
import { Search, Compass, AlertCircle } from "lucide-react";

export function NotFoundPage() {
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.hash = `#/listings?search=${encodeURIComponent(query.trim())}`;
    }
  };

  const handleBrowseAll = () => {
    window.location.hash = "#/listings";
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col justify-between font-sans">
      {/* Navbar placeholder branding */}
      <nav className="border-b border-black/10 py-5 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.hash = "#/"}>
            <div className="w-10 h-10 bg-brand-green flex items-center justify-center text-white font-serif italic font-extrabold text-xl shadow-md">
              F
            </div>
            <div>
              <span className="text-xl font-serif font-black tracking-tight uppercase block">FMI</span>
              <span className="text-[9px] font-mono tracking-widest text-[#1A1A1A]/40 uppercase block -mt-1">Digital Exchange</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 bg-brand-green/5 border border-brand-green/10 flex items-center justify-center text-brand-green">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-serif italic font-black text-brand-dark tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-brand-dark/50 max-w-xs leading-relaxed">
            The private acquisition URL you requested does not exist or has been archived by our compliance registry.
          </p>
        </div>

        {/* Listings Search Form */}
        <form onSubmit={handleSearchSubmit} className="w-full relative">
          <input
            type="text"
            placeholder="Search active businesses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-4 pr-12 py-3.5 border border-black/10 bg-white focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all text-xs rounded-none"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 p-1.5 text-brand-green hover:text-brand-green/80 transition-colors cursor-pointer"
            aria-label="Submit search"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
        </form>

        {/* Browse All CTA */}
        <button
          onClick={handleBrowseAll}
          className="bg-brand-green hover:bg-brand-green/95 text-white font-bold text-xs uppercase tracking-widest px-6 py-3.5 rounded-none flex items-center justify-center space-x-2 border border-brand-green transition-all w-full cursor-pointer"
        >
          <Compass className="w-4 h-4" />
          <span>Browse All Listings</span>
        </button>
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-black/5 py-6 px-6 text-center bg-[#F7F5F0]">
        <p className="text-[10px] font-mono text-brand-dark/30 uppercase tracking-widest">
          © {new Date().getFullYear()} FMI Exchange • India's Premiere Acquisition Network
        </p>
      </footer>
    </div>
  );
}

export default NotFoundPage;
