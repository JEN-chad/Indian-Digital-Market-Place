import React, { useEffect, useState } from "react";
import { getActiveDeals } from "../../../actions/deals.ts";
import { Shield, ArrowRight, Loader2, Coins, Landmark, Calendar, User } from "lucide-react";

export default function BuyerDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      const result = await getActiveDeals("buyer");
      if (result.success) {
        setDeals(result.deals || []);
      } else {
        setError(result.error || "Failed to load active transaction records.");
      }
      setLoading(false);
    };

    fetchDeals();
  }, []);

  const getStagePercentage = (stage: string) => {
    const stages = ["due_diligence", "agreement", "escrow", "transfer", "closed"];
    const idx = stages.indexOf(stage);
    if (idx === -1) return 0;
    return Math.round(((idx + 1) / stages.length) * 100);
  };

  const getStageLabel = (stage: string) => {
    return stage.replace("_", " ").toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-sans">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <p className="text-xs text-brand-dark/50 mt-4 font-mono">LOADING SECURED M&A WORKSPACES...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans space-y-8">
      <div className="border-b border-black/[0.06] pb-5 space-y-1">
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-green bg-emerald-50 border border-emerald-100 px-2 py-0.5 inline-block">
          BUYER FINANCIAL REGISTRY
        </span>
        <h1 className="text-2xl font-serif italic font-black text-brand-dark">Active Acquisition Deals</h1>
        <p className="text-xs text-brand-dark/60">
          List of digital businesses and enterprise assets currently in legal, escrow, or asset handover proceedings.
        </p>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-800 p-4 text-xs font-mono">
          🚨 {error}
        </div>
      )}

      {deals.length === 0 ? (
        <div className="border border-black/[0.08] bg-brand-cream/5 p-12 text-center space-y-4">
          <Shield className="w-10 h-10 text-brand-dark/20 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-serif italic font-bold text-brand-dark text-base">No Active Transactions</h3>
            <p className="text-xs text-brand-dark/50 max-w-sm mx-auto">
              You do not have any active transaction agreements. Transactions are initiated when a seller accepts your submitted purchase offer.
            </p>
          </div>
          <button
            onClick={() => window.location.hash = "#/listings"}
            className="px-5 py-2.5 bg-brand-dark text-white text-xs font-mono uppercase tracking-widest hover:bg-brand-green transition-colors"
          >
            Explore Listings
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deals.map((deal) => {
            const progress = getStagePercentage(deal.stage);
            return (
              <div
                key={deal.id}
                className="bg-white border border-black/10 p-6 flex flex-col justify-between hover:border-black/20 hover:shadow-sm transition-all space-y-6"
              >
                {/* Upper section */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-mono text-brand-dark/40 font-bold uppercase">
                      ID: {deal.id.slice(0, 12).toUpperCase()}
                    </span>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 border ${
                      deal.stage === "closed"
                        ? "bg-emerald-50 border-emerald-100 text-brand-green"
                        : deal.stage === "escrow"
                        ? "bg-amber-50 border-amber-100 text-amber-800"
                        : "bg-brand-cream/40 border-brand-green/20 text-brand-dark"
                    }`}>
                      {getStageLabel(deal.stage)}
                    </span>
                  </div>

                  <h3 className="text-base font-serif italic font-black text-brand-dark tracking-tight">
                    {deal.listingTitle || "Digital Enterprise Asset"}
                  </h3>

                  {/* Details summary list */}
                  <div className="space-y-2 text-xs font-mono text-brand-dark/60 border-t border-black/[0.04] pt-3.5">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-brand-dark/40" /> Seller Name:</span>
                      <span className="font-bold text-brand-dark">{deal.partyName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-dark/40" /> Date Opened:</span>
                      <span className="font-bold text-brand-dark">
                        {new Date(deal.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5"><Coins className="w-3.5 h-3.5 text-brand-dark/40" /> Deal Value:</span>
                      <span className="font-mono font-bold text-brand-green">
                        ₹{Number(deal.dealValue).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mid section: Pipeline completion meter */}
                <div className="space-y-2 border-t border-black/[0.04] pt-4">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-brand-dark/40 uppercase">
                    <span>STAGE COMPLETION</span>
                    <span>{progress}%</span>
                  </div>
                  {/* Outer bar */}
                  <div className="w-full h-1.5 bg-black/[0.05]">
                    {/* Inner bar */}
                    <div
                      className="h-full bg-brand-green transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Action button */}
                <button
                  onClick={() => window.location.hash = `#/buyer/deals/${deal.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-black/10 hover:border-black/20 bg-brand-cream/10 hover:bg-brand-cream/30 text-brand-dark font-mono text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  <span>Launch Secure Deal Room</span>
                  <ArrowRight className="w-4 h-4 text-brand-green" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
