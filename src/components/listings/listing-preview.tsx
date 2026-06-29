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
    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 h-full flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <Eye className="w-4 h-4 text-amber-500" />
          <span>Live Preview</span>
        </h3>
        
        <div className="flex bg-slate-200/60 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setViewMode("card")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === "card"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Card
          </button>
          <button
            type="button"
            onClick={() => setViewMode("detail")}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
              viewMode === "detail"
                ? "bg-white text-slate-800 shadow-sm"
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
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all max-w-sm mx-auto w-full">
            {/* Cover image or placeholder */}
            <div className="h-32 bg-slate-100 relative flex items-center justify-center overflow-hidden">
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
                  <span className="text-xs font-medium uppercase tracking-wider">
                    {data.assetType ? assetTypeLabels[data.assetType] : "Asset Type"}
                  </span>
                </div>
              )}
              {data.assetType && (
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[10px] font-bold text-slate-700 px-2.5 py-1 rounded-full flex items-center space-x-1 border border-slate-100">
                  {getAssetIcon(data.assetType)}
                  <span>{assetTypeLabels[data.assetType]}</span>
                </span>
              )}
              <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                Draft
              </span>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  {data.industry || "Industry Not Specified"}
                </p>
                <h4 className="font-bold text-slate-800 text-sm line-clamp-1">
                  {data.title || "Untitled Business Listing"}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {data.tagline || "Your short, compelling tagline summarizing the acquisition will show up here."}
                </p>
              </div>

              {/* Grid with Key Metrics */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Net Profit (Monthly)</p>
                  <p className="text-xs font-bold text-slate-800">{formatCurrency(data.monthlyProfit)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Monthly Revenue</p>
                  <p className="text-xs font-bold text-slate-800">{formatCurrency(data.monthlyRevenue)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Asking Price</p>
                  <p className="text-sm font-extrabold text-amber-600">{formatCurrency(data.askingPrice)}</p>
                </div>
                {data.ndaRequired && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>NDA Required</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Detail Page Preview */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4 max-h-[400px] overflow-y-auto text-left">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full uppercase">
                  {data.assetType ? assetTypeLabels[data.assetType] : "Asset Type"}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-500">{data.industry || "Industry"}</span>
              </div>
              <h4 className="font-extrabold text-slate-800 text-base">
                {data.title || "Untitled Business Listing"}
              </h4>
              <p className="text-xs text-slate-500 italic">
                {data.tagline || "Tagline goes here"}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
              <div>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">Asking Price</p>
                <p className="text-xs font-extrabold text-amber-600">{formatCurrency(data.askingPrice)}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">Monthly Revenue</p>
                <p className="text-xs font-bold text-slate-800">{formatCurrency(data.monthlyRevenue)}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-semibold uppercase">Monthly Profit</p>
                <p className="text-xs font-bold text-slate-800">{formatCurrency(data.monthlyProfit)}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700">Business Details</p>
              <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-slate-600">
                <div className="flex justify-between">
                  <span>Established:</span>
                  <span className="font-semibold text-slate-800">{data.yearEstablished || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Team Size:</span>
                  <span className="font-semibold text-slate-800">{data.teamSize || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hours/Week:</span>
                  <span className="font-semibold text-slate-800">{data.hoursPerWeek || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Business Model:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[80px]">{data.businessModel || "N/A"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <p className="font-bold text-slate-700">Description & Reason for Sale</p>
              <p className="text-slate-500 leading-relaxed line-clamp-3">
                {data.description || "The full description of your business, operations, and target demographics will be displayed here."}
              </p>
              <p className="text-slate-500 leading-relaxed font-medium">
                <strong>Reason for Sale: </strong> {data.reasonForSale || "Not provided yet"}
              </p>
            </div>

            {data.tags && data.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {data.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-sm">
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
