import React from "react";
import { Lock, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import { AssetTypeBadge, AssetType } from "./asset-type-badge.tsx";
import { formatCurrency } from "../../../lib/utils.ts";

interface SavedListingCardProps {
  key?: string | number;
  listing: {
    id: string;
    title: string;
    slug: string;
    tagline: string;
    assetType: string;
    industry: string;
    askingPrice: number;
    ndaRequired: boolean;
    coverImageUrl?: string;
  };
  hasSignedNda: boolean;
  onRemove: (e: React.MouseEvent) => void;
  onAction: () => void; // Trigger NDA unlock modal or make offer modal
}

export function SavedListingCard({
  listing,
  hasSignedNda,
  onRemove,
  onAction
}: SavedListingCardProps) {
  const getCoverGradient = (type: string) => {
    switch (type) {
      case "saas":
        return "from-purple-950 to-indigo-950";
      case "ecommerce":
        return "from-blue-950 to-cyan-950";
      case "app":
        return "from-green-950 to-emerald-950";
      case "blog":
        return "from-orange-950 to-amber-950";
      case "domain":
        return "from-yellow-950 to-yellow-900";
      case "content_site":
        return "from-teal-900 to-slate-900";
      default:
        return "from-gray-950 to-slate-950";
    }
  };

  const navigateToListing = () => {
    window.location.hash = `#/listings/${listing.slug}`;
  };

  return (
    <div className="bg-white border border-black/10 rounded-none overflow-hidden hover:border-brand-green/30 transition-all duration-300 flex flex-col justify-between group">
      {/* Header Image or Gradient */}
      <div className="relative h-28 w-full border-b border-black/5 cursor-pointer" onClick={navigateToListing}>
        {listing.coverImageUrl ? (
          <img
            src={listing.coverImageUrl}
            alt={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getCoverGradient(listing.assetType)} flex items-center justify-center p-3 relative overflow-hidden`}>
            {/* Grid background overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:12px_12px] pointer-events-none" />
            <span className="font-serif italic text-white/20 text-xs font-black uppercase text-center block">
              {listing.industry.split(" ")[0]} &bull; {listing.assetType}
            </span>
          </div>
        )}

        <div className="absolute top-2 left-2 flex gap-1">
          <AssetTypeBadge type={listing.assetType as AssetType} size="sm" />
        </div>

        {listing.ndaRequired && (
          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white p-1" title={hasSignedNda ? "NDA Signed" : "NDA Required"}>
            {hasSignedNda ? (
              <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-1">
          <h4 
            onClick={navigateToListing}
            className="text-sm font-serif italic font-black text-brand-dark hover:text-brand-green line-clamp-1 cursor-pointer transition-colors"
          >
            {listing.title}
          </h4>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-dark/45">
            Asking: <span className="font-mono text-brand-green font-bold">{formatCurrency(listing.askingPrice)}</span>
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 pt-1 border-t border-black/5">
          {/* Quick Action Button */}
          {listing.ndaRequired && !hasSignedNda ? (
            <button
              onClick={onAction}
              className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white text-[9px] font-bold uppercase tracking-widest py-2 px-3 border border-brand-green transition-all flex items-center justify-center space-x-1 cursor-pointer rounded-none"
            >
              <Lock className="w-3 h-3 mr-0.5" />
              <span>Unlock NDA</span>
            </button>
          ) : (
            <button
              onClick={onAction}
              className="flex-1 bg-white hover:bg-brand-green/5 text-brand-green text-[9px] font-bold uppercase tracking-widest py-2 px-3 border border-brand-green/20 hover:border-brand-green/40 transition-all flex items-center justify-center space-x-1 cursor-pointer rounded-none"
            >
              <span>Make Offer</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {/* Remove Saved Button */}
          <button
            onClick={onRemove}
            title="Remove from saved"
            className="p-2 text-brand-dark/35 hover:text-rose-600 hover:bg-rose-50 border border-black/10 hover:border-rose-100 transition-colors cursor-pointer rounded-none"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default SavedListingCard;
