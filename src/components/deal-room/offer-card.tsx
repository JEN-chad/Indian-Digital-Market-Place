import React, { useState } from "react";
import { formatCurrency } from "../../../lib/utils.ts";
import { Calendar, Clock, ArrowRight, Check, X, ShieldAlert, AlertCircle, RefreshCw } from "lucide-react";

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
  dealId?: string | null;
}

interface OfferCardProps {
  offer: Offer;
  role: "buyer" | "seller";
  onAccept?: (offerId: string) => void;
  onCounter?: (offer: Offer) => void;
  onReject?: (offerId: string) => void;
  onWithdraw?: (offerId: string) => void;
  onAcceptCounter?: (offerId: string) => void;
  isActionLoading?: boolean;
}

export function OfferCard({
  offer,
  role,
  onAccept,
  onCounter,
  onReject,
  onWithdraw,
  onAcceptCounter,
  isActionLoading = false,
}: OfferCardProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const amountVal = Number(offer.amount);
  const upfrontVal = Number(offer.upfrontPercent);
  const earnoutVal = Number(offer.earnoutPercent);
  const counterAmountVal = offer.counterAmount ? Number(offer.counterAmount) : 0;

  // Determine expiration
  const isExpired = offer.expiresAt ? new Date() > new Date(offer.expiresAt) : false;
  const currentStatus = isExpired && offer.status === "pending" ? "expired" : offer.status;

  // Calculate days ago/remaining
  const getDaysDiff = (dateStr: string) => {
    const diffTime = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getDaysAgo = (dateStr: string) => {
    const diffTime = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    return `${days} days ago`;
  };

  const daysAgo = getDaysAgo(offer.createdAt);
  const daysRemaining = offer.expiresAt ? getDaysDiff(offer.expiresAt) : 0;

  // Status Badge styles
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "accepted":
        return { bg: "bg-emerald-50 text-emerald-800 border-emerald-200", label: "Accepted" };
      case "countered":
        return { bg: "bg-blue-50 text-blue-800 border-blue-200", label: "Countered" };
      case "rejected":
        return { bg: "bg-rose-50 text-rose-800 border-rose-200", label: "Declined" };
      case "withdrawn":
        return { bg: "bg-zinc-100 text-zinc-600 border-zinc-200", label: "Withdrawn" };
      case "expired":
        return { bg: "bg-orange-50 text-orange-800 border-orange-200", label: "Expired" };
      default:
        return { bg: "bg-amber-50 text-amber-800 border-amber-200", label: "Pending Review" };
    }
  };

  const statusStyles = getStatusStyles(currentStatus);

  const handleNavigateToDeal = () => {
    if (offer.dealId) {
      window.location.hash = `#/${role}/deals`;
    } else {
      window.location.hash = `#/${role}/deals`;
    }
  };

  return (
    <div className="bg-white border border-black/10 shadow-sm p-6 space-y-6 transition-all hover:border-black/20 flex flex-col justify-between">
      {/* Top Header Row */}
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/40">
              {role === "seller" ? `${offer.buyerName || "Buyer"}` : "PROPOSAL TO SELLER"}
            </span>
            <h3 className="text-sm font-serif italic font-black text-brand-dark leading-snug hover:text-brand-green transition-colors cursor-pointer" onClick={() => window.location.hash = `#/listings/${offer.listingSlug}`}>
              {offer.listingTitle}
            </h3>
          </div>
          <span className={`px-2.5 py-1 text-[10px] font-mono font-black uppercase tracking-wider border ${statusStyles.bg}`}>
            {statusStyles.label}
          </span>
        </div>

        {/* Pricing Layout */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-black/[0.05]">
          <div>
            <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-brand-dark/40">
              Offer Value
            </span>
            <span className="text-xl font-sans font-black text-brand-dark">
              {formatCurrency(amountVal)}
            </span>
          </div>
          <div>
            <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-brand-dark/40">
              Deal Structure
            </span>
            <span className="text-xs font-semibold text-brand-dark/80 block mt-1">
              {upfrontVal}% Upfront / {earnoutVal}% Earn-out
            </span>
          </div>
        </div>

        {/* Earnout terms details if earnout exists */}
        {earnoutVal > 0 && offer.earnoutTerms && (
          <div className="bg-brand-cream/40 border border-black/5 p-3 text-xs">
            <span className="block font-mono text-[9px] font-bold text-brand-dark/50 uppercase tracking-widest mb-1">
              Earnout Terms
            </span>
            <p className="text-brand-dark/70 font-sans leading-relaxed">{offer.earnoutTerms}</p>
          </div>
        )}

        {/* Messages */}
        {offer.message && (
          <div className="text-xs space-y-1">
            <span className="block font-mono text-[9px] font-bold text-brand-dark/50 uppercase tracking-widest">
              Buyer Message
            </span>
            <blockquote className="border-l-2 border-brand-green pl-3 text-brand-dark/70 italic font-sans leading-relaxed">
              "{offer.message}"
            </blockquote>
          </div>
        )}

        {/* Counter Info if exists */}
        {currentStatus === "countered" && offer.counterAmount && (
          <div className="bg-blue-50/40 border border-blue-100 p-4 space-y-2 mt-4">
            <div className="flex items-center gap-2 text-blue-900 font-mono text-[9px] font-bold uppercase tracking-wider">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Seller Counter Proposal</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-brand-dark/60 block">Proposed Amount</span>
                <span className="text-lg font-sans font-black text-blue-900">
                  {formatCurrency(counterAmountVal)}
                </span>
              </div>
              <div className="text-right text-xs max-w-xs">
                <span className="text-brand-dark/60 block">Seller Note</span>
                <p className="text-brand-dark/80 italic">"{offer.counterMessage || "No message provided."}"</p>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Metadata */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 items-center text-[10px] font-mono text-brand-dark/50 pt-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Submitted {daysAgo}</span>
          </div>
          {currentStatus === "pending" && offer.expiresAt && (
            <div className="flex items-center gap-1 text-amber-700 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {daysRemaining > 0 ? `Expires in ${daysRemaining} days` : "Expires today"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Section */}
      <div className="mt-6 pt-4 border-t border-black/[0.05]">
        {isActionLoading ? (
          <div className="flex items-center justify-center py-2 text-xs font-mono font-bold uppercase tracking-widest text-brand-dark/50">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            <span>Syncing Deal Ledger...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Seller Actioning Pending Offer */}
            {role === "seller" && currentStatus === "pending" && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => onAccept?.(offer.id)}
                    className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white font-bold py-2.5 px-4 text-xs uppercase tracking-wider transition-colors border border-brand-green rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Offer</span>
                  </button>
                  <button
                    onClick={() => onCounter?.(offer)}
                    className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2.5 px-4 text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Counter Offer</span>
                  </button>
                </div>
                {!showRejectInput ? (
                  <button
                    onClick={() => setShowRejectInput(true)}
                    className="w-full border border-black/10 hover:border-black/30 text-brand-dark/70 font-bold py-2.5 px-4 text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer"
                  >
                    Decline Offer
                  </button>
                ) : (
                  <div className="space-y-2 border border-rose-100 p-3 bg-rose-50/20">
                    <label className="block text-[9px] font-mono font-bold uppercase tracking-wider text-rose-800">
                      Reason for Declining
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Asking price too low, unfavorable structure..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="w-full border border-black/10 bg-white p-2 text-xs rounded-none focus:outline-none focus:border-rose-500"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowRejectInput(false)}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-dark/60 hover:text-brand-dark"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (onReject) onReject(offer.id);
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors rounded-none cursor-pointer"
                      >
                        Confirm Decline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Buyer Actioning Countered Offer */}
            {role === "buyer" && currentStatus === "countered" && (
              <div className="flex gap-2">
                <button
                  onClick={() => onAcceptCounter?.(offer.id)}
                  className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white font-bold py-2.5 px-4 text-xs uppercase tracking-wider transition-colors border border-brand-green rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept Counter</span>
                </button>
                <button
                  onClick={() => onWithdraw?.(offer.id)}
                  className="flex-1 border border-black/10 hover:border-black/30 text-brand-dark/70 font-bold py-2.5 px-4 text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  <span>Withdraw Offer</span>
                </button>
              </div>
            )}

            {/* Buyer Actioning Pending Offer (Withdraw option) */}
            {role === "buyer" && currentStatus === "pending" && (
              <button
                onClick={() => onWithdraw?.(offer.id)}
                className="w-full border border-black/10 hover:border-black/30 text-brand-dark/70 hover:text-rose-600 font-bold py-2.5 px-4 text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer"
              >
                Withdraw Active Offer
              </button>
            )}

            {/* Any role accepted offer → View Deal */}
            {currentStatus === "accepted" && (
              <button
                onClick={handleNavigateToDeal}
                className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-black py-3 px-4 text-xs uppercase tracking-widest transition-all rounded-none cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View Deal Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
