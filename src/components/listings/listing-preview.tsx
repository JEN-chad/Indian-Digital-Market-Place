import React, { useState } from "react";
import { Eye, Cloud, ShoppingCart, Smartphone, BookOpen, Globe, FileText, Briefcase, IndianRupee, HelpCircle, Calendar, Users, Clock, ShieldCheck, Tag } from "lucide-react";
import { ListingWizardState } from "../../store/listing-wizard-store.ts";

interface ListingPreviewProps {
  data: Partial<ListingWizardState>;
}

export default function ListingPreview({ data }: ListingPreviewProps) {
  const [viewMode, setViewMode] = useState<"card" | "detail">("card");

  const assetTypeLabels: Record<string, string> = {
    saas: "SaaS",
    ecommerce: "eCommerce",
    app: "Mobile App",
    blog: "Blog",
    domain: "Domain",
    content_site: "Content Site",
    service: "Service",
  };

  const getAssetIcon = (type?: string) => {
    switch (type) {
      case "saas":
        return <Cloud className="w-4 h-4" />;
      case "ecommerce":
        return <ShoppingCart className="w-4 h-4" />;
      case "app":
        return <Smartphone className="w-4 h-4" />;
      case "blog":
        return <BookOpen className="w-4 h-4" />;
      case "domain":
        return <Globe className="w-4 h-4" />;
      case "content_site":
        return <FileText className="w-4 h-4" />;
      case "service":
        return <Briefcase className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const formatCurrency = (val?: string | number) => {
    if (!val) return "₹0";
    const num = typeof val === "string" ? parseInt(val.replace(/,/g, ""), 10) || 0 : val;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (val?: string | number) => {
    if (!val) return "0";
    const num = typeof val === "string" ? parseInt(val.replace(/,/g, ""), 10) || 0 : val;
    return new Intl.NumberFormat("en-IN").format(num);
  };

  return (
    <div className="bg-brand-cream/30 rounded-none p-6 border border-black/10 h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <Eye className="w-4 h-4 text-brand-green" />
          <span>Live Preview</span>
        </h3>
        
        <div className="flex bg-[#F7F5F0] p-1 rounded-none border border-black/10">
          <button
            type="button"
            onClick={() => setViewMode("card")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-none transition-all cursor-pointer ${
              viewMode === "card"
                ? "bg-brand-green text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Card
          </button>
          <button
            type="button"
            onClick={() => setViewMode("detail")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-none transition-all cursor-pointer ${
              viewMode === "detail"
                ? "bg-brand-green text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Details
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {viewMode === "card" ? (
          /* Card View Preview */
          <div className="bg-white rounded-none border border-black/10 overflow-hidden shadow-none hover:shadow-xs transition-all max-w-sm mx-auto w-full">
            {/* Cover image or placeholder */}
            <div className="h-32 bg-[#F7F5F0] relative flex items-center justify-center overflow-hidden border-b border-black/10">
              {data.coverImageUrl ? (
                <img
                  src={data.coverImageUrl}
                  alt={data.title || "Listing preview"}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex flex-col items-center space-y-1 text-slate-400">
                  {getAssetIcon(data.assetType)}
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {data.assetType ? assetTypeLabels[data.assetType] : "Asset Type"}
                  </span>
                </div>
              )}
              {data.assetType && (
                <span className="absolute top-3 left-3 bg-[#FDFCFB] text-[10px] font-bold text-brand-dark px-2.5 py-1 rounded-none flex items-center space-x-1 border border-black/10">
                  {getAssetIcon(data.assetType)}
                  <span>{assetTypeLabels[data.assetType]}</span>
                </span>
              )}
              <span className="absolute top-3 right-3 bg-brand-orange text-white text-[9px] font-bold px-2 py-0.5 rounded-none uppercase tracking-wider">
                Draft
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-brand-green font-semibold uppercase tracking-wider">
                  {data.industry || "Industry Not Specified"}
                </p>
                <h4 className="font-serif italic font-black text-brand-dark text-base line-clamp-1">
                  {data.title || "Untitled Business Listing"}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {data.tagline || "Your short, compelling tagline summarizing the acquisition will show up here."}
                </p>
              </div>

              {/* Grid with Key Metrics */}
              <div className="grid grid-cols-2 gap-2 bg-[#F7F5F0] p-2.5 rounded-none border border-black/5">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Net Profit (Monthly)</p>
                  <p className="text-xs font-bold text-slate-800 font-mono">{formatCurrency(data.monthlyProfit)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Monthly Revenue</p>
                  <p className="text-xs font-bold text-slate-800 font-mono">{formatCurrency(data.monthlyRevenue)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-black/5">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Asking Price</p>
                  <p className="text-sm font-extrabold text-brand-green font-mono">{formatCurrency(data.askingPrice)}</p>
                </div>
                {data.ndaRequired && (
                  <span className="text-[10px] bg-brand-green/5 text-brand-green px-2 py-1 rounded-none border border-brand-green/10 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                    <span>NDA Required</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Detail Page Preview */
          <div className="bg-white rounded-none border border-black/10 p-5 shadow-none space-y-4 max-h-[400px] overflow-y-auto text-left">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-brand-green bg-brand-green/5 border border-brand-green/10 px-2.5 py-0.5 rounded-none uppercase">
                  {data.assetType ? assetTypeLabels[data.assetType] : "Asset Type"}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500">{data.industry || "Industry"}</span>
              </div>
              <h4 className="font-serif italic font-black text-brand-dark text-lg">
                {data.title || "Untitled Business Listing"}
              </h4>
              <p className="text-xs text-slate-500 italic">
                {data.tagline || "Tagline goes here"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-black/10 text-center bg-[#F7F5F0]/50">
              <div>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">Asking Price</p>
                <p className="text-xs font-extrabold text-brand-green font-mono">{formatCurrency(data.askingPrice)}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">Monthly Revenue</p>
                <p className="text-xs font-bold text-slate-800 font-mono">{formatCurrency(data.monthlyRevenue)}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">Monthly Profit</p>
                <p className="text-xs font-bold text-slate-800 font-mono">{formatCurrency(data.monthlyProfit)}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Business Details</p>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-slate-600">
                <div className="flex justify-between border-b border-black/5 pb-1">
                  <span>Established:</span>
                  <span className="font-semibold text-slate-800">{data.yearEstablished || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-1">
                  <span>Team Size:</span>
                  <span className="font-semibold text-slate-800">{data.teamSize || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-1">
                  <span>Hours/Week:</span>
                  <span className="font-semibold text-slate-800">{data.hoursPerWeek || "N/A"}</span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-1">
                  <span>Business Model:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[80px]">{data.businessModel || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Description & Reason for Sale</p>
              <p className="text-slate-500 leading-relaxed line-clamp-3">
                {data.description || "The full description of your business, operations, and target demographics will be displayed here."}
              </p>
              <p className="text-slate-500 leading-relaxed font-medium bg-[#F7F5F0] p-2 border border-black/5">
                <strong>Reason for Sale: </strong> {data.reasonForSale || "Not provided yet"}
              </p>
            </div>

            {data.tags && data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {data.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-medium bg-brand-green/5 text-brand-green border border-brand-green/10 px-2 py-0.5 rounded-none">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
