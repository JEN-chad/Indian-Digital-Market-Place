import React, { useState, useEffect } from "react";
import { Plus, ListCollapse, Loader2, Landmark, AlertCircle, Calendar, ShieldCheck, ArrowRight, Eye } from "lucide-react";
import { useAuthStore } from "../../../store/auth-store.ts";
import { getSellerListings } from "../../../actions/listings.ts";
import { PageHeader } from "../../../components/layout/page-header.tsx";

export default function SellerListingsPage() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigateTo = (path: string) => {
    window.location.hash = `#${path}`;
  };

  const fetchListings = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getSellerListings(user.id);
      if (result.success && result.listings) {
        setListings(result.listings);
      } else {
        setError(result.error || "Failed to fetch your listings from cloud database.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while loading listings.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [user]);

  const formatCurrency = (val?: string | number) => {
    if (!val) return "₹0";
    const num = typeof val === "string" ? parseInt(val.replace(/,/g, ""), 10) || 0 : val;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "live":
        return "bg-brand-green/5 border-brand-green/20 text-brand-green";
      case "in_review":
        return "bg-brand-orange/5 border-brand-orange/20 text-brand-orange";
      case "approved":
        return "bg-[#1D4429]/10 border-brand-green/20 text-brand-green";
      case "paused":
        return "bg-[#F7F5F0] border-black/10 text-brand-dark/60";
      case "sold":
        return "bg-brand-green text-white border-transparent";
      case "rejected":
        return "bg-rose-50 border-rose-200 text-rose-800";
      case "draft":
      default:
        return "bg-brand-orange/5 border-brand-orange/20 text-brand-orange";
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      <PageHeader 
        title="My Business Listings" 
        breadcrumbs={[{ label: "Seller Dashboard", path: "/seller/dashboard" }, { label: "My Listings" }]}
        actionSlot={
          <button
            onClick={() => navigateTo("/seller/listings/new")}
            className="bg-brand-green hover:bg-brand-green/95 text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-none flex items-center space-x-2 border border-brand-green transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Listing</span>
          </button>
        }
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 text-brand-dark/60">
          <Loader2 className="w-10 h-10 animate-spin text-brand-green" />
          <p className="text-sm font-semibold">Retrieving your business listings from cloud...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-none flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-black/10 rounded-none p-8 space-y-4">
          <div className="p-4 bg-brand-green/5 border border-brand-green/10 text-brand-green inline-block rounded-none">
            <ListCollapse className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-serif italic font-black text-brand-dark">No Listings Found</h3>
            <p className="text-sm text-brand-dark/60 max-w-md mx-auto">
              You haven't created any business listings yet. Launch our wizard to start listing your SaaS, eCommerce, or service agency.
            </p>
          </div>
          <button
            onClick={() => navigateTo("/seller/listings/new")}
            className="bg-brand-green hover:bg-brand-green/90 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-none inline-flex items-center space-x-1.5 transition-colors cursor-pointer border border-brand-green"
          >
            <span>Create Your First Listing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-none border border-black/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-black/10 bg-[#F7F5F0] text-brand-dark/50 text-[10px] font-bold uppercase tracking-widest">
                  <th className="py-4 px-6">Listing details</th>
                  <th className="py-4 px-6 text-center">Asset Type</th>
                  <th className="py-4 px-6 text-right">Asking price</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Created on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-sm">
                {listings.map((item) => (
                  <tr key={item.id} className="hover:bg-brand-green/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <p className="font-bold text-brand-dark line-clamp-1">{item.title}</p>
                        <p className="text-xs text-brand-dark/50 font-medium capitalize">{item.industry}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-2.5 py-1 bg-brand-green/5 border border-brand-green/10 text-brand-green text-[10px] font-bold uppercase tracking-wider rounded-none">
                        {item.assetType}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-extrabold text-brand-dark font-mono">
                      {formatCurrency(item.askingPrice)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block px-2.5 py-1 border text-[10px] font-bold uppercase tracking-wider rounded-none capitalize ${getStatusStyle(item.status)}`}>
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-xs text-brand-dark/50 font-mono">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
