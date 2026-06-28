import React, { useState } from "react";
import { counterOffer, OfferInput } from "../../actions/offers.ts";
import { formatCurrency } from "../../../lib/utils.ts";
import { AlertCircle, RefreshCw, X } from "lucide-react";

export interface Offer {
  id: string;
  listingId: string;
  listingTitle: string;
  listingSlug: string;
  coverImageUrl?: string;
  buyerId: string;
  buyerName?: string;
  buyerEmail?: string;
  sellerId: string;
  amount: string | number;
  upfrontPercent: string | number;
  earnoutPercent: string | number;
  earnoutTerms?: string;
  message?: string;
  status: "pending" | "countered" | "accepted" | "rejected" | "expired" | "withdrawn";
  counterAmount?: string | number;
  counterMessage?: string;
  expiresAt?: string;
  createdAt: string;
}

interface CounterOfferModalProps {
  offer: Offer;
  onSuccess: () => void;
  onClose: () => void;
}

export function CounterOfferModal({ offer, onSuccess, onClose }: CounterOfferModalProps) {
  const [counterAmount, setCounterAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const amountVal = parseFloat(counterAmount.replace(/,/g, ""));
    if (isNaN(amountVal) || amountVal <= 0) {
      setErrorMsg("Please enter a valid counter-offer amount.");
      return;
    }

    if (!message.trim()) {
      setErrorMsg("Please provide a brief counter note explaining your terms to the buyer.");
      return;
    }

    setIsLoading(true);
    const result = await counterOffer(offer.id, amountVal, message.trim());
    setIsLoading(false);

    if (result.success) {
      onSuccess();
    } else {
      setErrorMsg(result.error || "Failed to submit counter proposal.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-black/10 shadow-xl max-w-md w-full p-6 space-y-6 relative rounded-none text-brand-dark font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-brand-dark/40 hover:text-brand-dark hover:bg-black/5"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-orange bg-orange-50 px-2 py-0.5 border border-orange-100">
            PROPOSE ALTERNATIVE TERMS
          </span>
          <h3 className="text-lg font-serif italic font-black">
            Counter Proposal
          </h3>
          <p className="text-xs text-brand-dark/50">
            You are countering the offer from <strong className="text-brand-dark">{offer.buyerName || "Buyer"}</strong> on <strong className="text-brand-dark">{offer.listingTitle}</strong>.
          </p>
        </div>

        {/* Original Offer Summary */}
        <div className="bg-brand-cream/40 border border-black/5 p-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="block font-mono text-[9px] font-bold text-brand-dark/40 uppercase tracking-wider">
              Original Offer
            </span>
            <span className="text-sm font-black text-brand-dark mt-1 block">
              {formatCurrency(offer.amount)}
            </span>
          </div>
          <div>
            <span className="block font-mono text-[9px] font-bold text-brand-dark/40 uppercase tracking-wider">
              Structure
            </span>
            <span className="text-xs text-brand-dark/70 mt-1 block">
              {offer.upfrontPercent}% / {offer.earnoutPercent}%
            </span>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 text-xs flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Counter Form */}
        <form onSubmit={handleCounterSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-brand-dark/50 mb-1">
              Counter-Offer Amount (INR ₹) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-dark/40 font-mono text-sm">
                ₹
              </div>
              <input
                type="text"
                required
                disabled={isLoading}
                placeholder="e.g. 8,000,000"
                value={counterAmount}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^0-9]/g, "");
                  if (clean) {
                    setCounterAmount(Number(clean).toLocaleString("en-IN"));
                  } else {
                    setCounterAmount("");
                  }
                }}
                className="w-full pl-7 pr-3 py-2.5 bg-white border border-black/10 focus:outline-none focus:border-brand-green text-sm rounded-none font-sans disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-brand-dark/50 mb-1">
              Counter Note / Explanation *
            </label>
            <textarea
              required
              rows={3}
              disabled={isLoading}
              placeholder="Explain why you are countering and outline any adjustments you'd prefer (e.g. higher upfront, faster transition period, or adjusted multiples)."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-2.5 bg-white border border-black/10 focus:outline-none focus:border-brand-green text-xs rounded-none leading-relaxed disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2 pt-4 border-t border-black/[0.05]">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 border border-black/10 hover:border-black/30 font-bold py-2.5 px-4 text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-2.5 px-4 text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Broadcasting..." : "Counter Offer"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
