import React from "react";
import { formatCurrency } from "../../../lib/utils.ts";
import { Check, X, RefreshCw, Send, AlertTriangle, HelpCircle } from "lucide-react";

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
  updatedAt?: string;
}

interface OfferTimelineProps {
  offer: Offer;
}

export function OfferTimeline({ offer }: OfferTimelineProps) {
  const events: {
    id: string;
    title: string;
    description: string;
    timestamp: string;
    icon: React.ReactNode;
    color: string;
  }[] = [];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 1. Creation Event
  events.push({
    id: "submitted",
    title: "Proposal Submitted",
    description: `Buyer submitted initial offer of ${formatCurrency(offer.amount)} (${offer.upfrontPercent}% Upfront / ${offer.earnoutPercent}% Earn-out).`,
    timestamp: formatDate(offer.createdAt),
    icon: <Send className="w-3.5 h-3.5 text-brand-green" />,
    color: "bg-brand-green/10 border-brand-green/30 text-brand-green",
  });

  // 2. Countered Event
  if (offer.status === "countered" && offer.counterAmount) {
    events.push({
      id: "countered",
      title: "Seller Counter-Proposal",
      description: `Seller proposed counter-offer of ${formatCurrency(offer.counterAmount)}. Note: "${offer.counterMessage || "No additional message."}"`,
      timestamp: offer.updatedAt ? formatDate(offer.updatedAt) : "Just now",
      icon: <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin-once" />,
      color: "bg-blue-50 border-blue-100 text-blue-600",
    });
  }

  // 3. Final Status Event (Accepted, Rejected, Withdrawn, Expired)
  if (offer.status === "accepted") {
    events.push({
      id: "accepted",
      title: "Proposal Accepted",
      description: `Proposal successfully locked at ${formatCurrency(offer.amount)}. Secure M&A Deal Room initialized.`,
      timestamp: offer.updatedAt ? formatDate(offer.updatedAt) : "Just now",
      icon: <Check className="w-3.5 h-3.5 text-emerald-600" />,
      color: "bg-emerald-50 border-emerald-100 text-emerald-600 font-bold",
    });
  } else if (offer.status === "rejected") {
    events.push({
      id: "rejected",
      title: "Proposal Declined",
      description: "Seller has declined the offer. Negotiation round closed.",
      timestamp: offer.updatedAt ? formatDate(offer.updatedAt) : "Just now",
      icon: <X className="w-3.5 h-3.5 text-rose-600" />,
      color: "bg-rose-50 border-rose-100 text-rose-600",
    });
  } else if (offer.status === "withdrawn") {
    events.push({
      id: "withdrawn",
      title: "Proposal Withdrawn",
      description: "Buyer has formally withdrawn this active offer.",
      timestamp: offer.updatedAt ? formatDate(offer.updatedAt) : "Just now",
      icon: <X className="w-3.5 h-3.5 text-zinc-500" />,
      color: "bg-zinc-50 border-zinc-200 text-zinc-500",
    });
  } else if (offer.status === "expired") {
    events.push({
      id: "expired",
      title: "Proposal Expired",
      description: "Offer validity period has lapsed. This offer is no longer valid.",
      timestamp: offer.expiresAt ? formatDate(offer.expiresAt) : "Just now",
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
      color: "bg-amber-50 border-amber-100 text-amber-600",
    });
  }

  return (
    <div className="space-y-4 text-brand-dark font-sans">
      <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-dark/40 border-b border-black/5 pb-2">
        Negotiation Ledger Timeline
      </h4>
      <div className="relative pl-6 space-y-6 before:absolute before:inset-y-1 before:left-3 before:w-[1px] before:bg-black/10">
        {events.map((event, idx) => (
          <div key={event.id} className="relative space-y-1">
            {/* Event marker dot */}
            <div
              className={`absolute -left-6 top-0.5 w-6 h-6 rounded-none border flex items-center justify-center transform -translate-x-1/2 ${event.color}`}
            >
              {event.icon}
            </div>

            <div>
              <span className="text-xs font-semibold block text-brand-dark">
                {event.title}
              </span>
              <p className="text-[11px] text-brand-dark/60 leading-relaxed mt-0.5">
                {event.description}
              </p>
              <span className="text-[9px] font-mono text-brand-dark/40 block mt-1">
                {event.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
