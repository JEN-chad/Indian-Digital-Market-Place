import React from "react";
import { Plus, Sparkles, Landmark, FileText, BadgePercent, ArrowRight } from "lucide-react";
import { useAuthStore } from "../../../store/auth-store.ts";

export default function SellerDashboardPage() {
  const { user } = useAuthStore();

  const navigateTo = (path: string) => {
    window.location.hash = `#${path}`;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <h1 className="text-3xl font-serif italic font-black text-brand-dark tracking-tight">
            Welcome, <span className="text-brand-green">{user?.name || "Seller"}</span>!
          </h1>
          <p className="text-xs font-semibold tracking-wider text-brand-dark/60 uppercase mt-1">
            FMI Exchange Seller Suite &bull; Sandbox Mode
          </p>
        </div>
        <button
          onClick={() => navigateTo("/seller/listings/new")}
          className="bg-brand-green hover:bg-brand-green/95 text-[#FDFCFB] font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-none flex items-center space-x-2 border border-brand-green transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Business Listing</span>
        </button>
      </div>

      {/* Analytics Mock Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-none p-6 border border-black/10 flex items-center space-x-4">
          <div className="p-3 bg-brand-green/5 text-brand-green border border-brand-green/10">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-dark/50 uppercase tracking-widest">My Listings</p>
            <p className="text-2xl font-serif italic font-black text-brand-green">0</p>
          </div>
        </div>

        <div className="bg-white rounded-none p-6 border border-black/10 flex items-center space-x-4">
          <div className="p-3 bg-brand-orange/5 text-brand-orange border border-brand-orange/10">
            <BadgePercent className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-dark/50 uppercase tracking-widest">Offers Received</p>
            <p className="text-2xl font-serif italic font-black text-brand-dark">₹0</p>
          </div>
        </div>

        <div className="bg-white rounded-none p-6 border border-black/10 flex items-center space-x-4">
          <div className="p-3 bg-brand-green/5 text-brand-green border border-brand-green/10">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-brand-dark/50 uppercase tracking-widest">Active Deals</p>
            <p className="text-2xl font-serif italic font-black text-brand-green">0</p>
          </div>
        </div>
      </div>

      {/* Primary Call To Action */}
      <div className="bg-white rounded-none border border-black/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 text-brand-green/5 pointer-events-none">
          <Sparkles className="w-32 h-32" />
        </div>

        <div className="space-y-3 relative z-10 text-center md:text-left">
          <div className="inline-flex items-center space-x-1.5 bg-brand-green/5 text-brand-green border border-brand-green/10 px-3 py-1 text-[9px] font-mono font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 4 Launchpad</span>
          </div>
          <h2 className="text-xl font-serif italic font-black text-brand-dark tracking-tight">Create your business listing draft</h2>
          <p className="text-xs text-brand-dark/70 max-w-lg leading-relaxed font-sans">
            Ready to list your SaaS, e-commerce store, or digital agency? Use our 6-step creation wizard. Save drafts as you go, consult our smart AI valuation model, and upload your verified P&L reports.
          </p>
        </div>

        <button
          onClick={() => navigateTo("/seller/listings/new")}
          className="bg-brand-green hover:bg-brand-green/90 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-none inline-flex items-center space-x-2 transition-all relative z-10 cursor-pointer border border-brand-green shrink-0"
        >
          <span>Get Started Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
