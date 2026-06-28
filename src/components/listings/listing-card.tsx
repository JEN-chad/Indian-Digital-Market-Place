import React from "react";
import { Lock, Sparkles } from "lucide-react";
import { AssetTypeBadge, AssetType } from "./asset-type-badge.tsx";
import { formatCurrency } from "../../../lib/utils.ts";

export interface ListingCardProps {
  key?: string | number;
  id: string;
  title: string;
  slug: string;
  tagline: string;
  assetType: AssetType;
  industry: string;
  askingPrice: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  ndaRequired: boolean;
  isFeatured: boolean;
  coverImageUrl?: string;
  onClick: (slug: string) => void;
}

export function ListingCard({
  id,
  title,
  slug,
  tagline,
  assetType,
  industry,
  askingPrice,
  monthlyRevenue,
  monthlyProfit,
  ndaRequired,
  isFeatured,
  coverImageUrl,
  onClick,
}: ListingCardProps) {
  // Compute ARR multiple
  const annualRevenue = monthlyRevenue * 12;
  const revMultiple = annualRevenue > 0 ? (askingPrice / annualRevenue).toFixed(1) : "N/A";

  // Helpers for NDA privacy ranges (rule: "no revenue exact if NDA required — show ranges like "₹1L–₹5L MRR")"
  const getRangeString = (val: number) => {
    if (val < 50000) return "Under ₹50k";
    if (val < 100000) return "₹50k–₹1L";
    if (val < 300000) return "₹1L–₹3L";
    if (val < 500000) return "₹3L–₹5L";
    if (val < 1000000) return "₹5L–₹10L";
    return "₹10L+";
  };

  const formattedRevenue = ndaRequired
    ? `${getRangeString(monthlyRevenue)} MRR`
    : `${formatCurrency(monthlyRevenue)} MRR`;

  const formattedProfit = ndaRequired
    ? `${getRangeString(monthlyProfit)} Net`
    : `${formatCurrency(monthlyProfit)} Profit`;

  // Cover gradient mapping
  const getCoverGradient = (type: AssetType) => {
    switch (type) {
      case "saas":
        return "from-purple-900 to-indigo-950";
      case "ecommerce":
        return "from-blue-900 to-cyan-950";
      case "app":
        return "from-green-900 to-emerald-950";
      case "blog":
        return "from-orange-950 to-amber-950";
      case "domain":
        return "from-yellow-950 to-yellow-900";
      case "content_site":
        return "from-teal-900 to-slate-900";
      case "service":
      default:
        return "from-gray-900 to-slate-950";
    }
  };

  return (
    <div
      onClick={() => onClick(slug)}
      className="group bg-white border border-black/10 flex flex-col h-full cursor-pointer transition-all hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 relative"
    >
      {/* Cover image or fallback gradient */}
      <div className="relative h-44 w-full overflow-hidden border-b border-black/10">
        {coverImageUrl ? (
          <img
            src={coverImageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${getCoverGradient(assetType)} flex items-center justify-center relative p-4 overflow-hidden`}>
            {/* Elegant grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            <span className="font-serif italic text-[#FDFCFB]/25 text-3xl font-extrabold text-center select-none tracking-wider uppercase block">
              {industry.split(" ")[0]} &bull; {assetType}
            </span>
          </div>
        )}

        {/* Badge overlays */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <AssetTypeBadge type={assetType} size="sm" />
          
          {isFeatured && (
            <span className="inline-flex items-center gap-1 bg-[#1D4429] text-white font-mono font-bold uppercase rounded-none tracking-wider px-2 py-0.5 text-[9px] border border-transparent">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Featured</span>
            </span>
          )}
        </div>

        {ndaRequired && (
          <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white p-1.5 rounded-none border border-white/10" title="NDA Required">
            <Lock className="w-3.5 h-3.5" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-dark/40 block">
            {industry}
          </span>
          <h3 className="text-base font-serif italic font-black text-brand-dark group-hover:text-brand-green line-clamp-1 transition-colors">
            {title}
          </h3>
          <p className="text-xs text-brand-dark/75 line-clamp-1">
            {tagline}
          </p>
        </div>

        {/* Metrics Row */}
        <div className="border-t border-b border-black/5 py-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/40">Revenue</p>
            <p className="text-[11px] font-bold text-brand-dark mt-0.5 truncate">{formattedRevenue}</p>
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/40">Profit</p>
            <p className="text-[11px] font-bold text-brand-green mt-0.5 truncate">{formattedProfit}</p>
          </div>
          <div>
            <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/40">Multiple</p>
            <p className="text-[11px] font-mono text-brand-dark mt-0.5">{revMultiple}x</p>
          </div>
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50">
            Asking Price
          </span>
          <span className="text-base font-serif italic font-black text-brand-green">
            {formatCurrency(askingPrice)}
          </span>
        </div>
      </div>
    </div>
  );
}
