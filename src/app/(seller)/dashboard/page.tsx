import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/auth-store.ts";
import { getSellerDashboardData } from "../../../actions/dashboards.ts";
import { MetricsCard } from "../../../components/shared/metrics-card.tsx";
import { EmptyState } from "../../../components/shared/empty-state.tsx";
import { 
  MetricsCardSkeleton, 
  DealCardSkeleton, 
  ListingCardSkeleton 
} from "../../../components/shared/loading-skeleton.tsx";
import { 
  CircleDollarSign, FileText, BadgePercent, Handshake, 
  Plus, Eye, FileSpreadsheet, Lock, CheckCircle2, 
  AlertTriangle, ArrowRight, TrendingUp, BarChart4 
} from "lucide-react";

export default function SellerDashboardPage() {
  const { user, setUser } = useAuthStore();
  const userId = user?.id || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await getSellerDashboardData(userId);
      if (res.success) {
        // res.data is the full server response: { success, user, stats, ... }
        setData(res.data);
        setError(null);
        // Sync the authoritative kycStatus from DB into the auth store
        // so the layout KYC banner always reflects the live DB value
        if (res.data?.user?.kycStatus && user) {
          setUser({ ...user, kycStatus: res.data.user.kycStatus });
        }
      } else {
        setError(res.error || "Failed to load dashboard data");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const navigateTo = (path: string) => {
    window.location.hash = `#${path}`;
  };

  const formatCurrencyLocal = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "live":
        return "bg-emerald-50 border-emerald-100 text-emerald-700";
      case "in_review":
        return "bg-amber-50 border-amber-100 text-amber-700";
      case "draft":
        return "bg-gray-100 border-gray-200 text-gray-600";
      case "sold":
        return "bg-blue-50 border-blue-100 text-blue-700";
      case "rejected":
        return "bg-rose-50 border-rose-100 text-rose-700";
      default:
        return "bg-gray-50 border-gray-100 text-gray-700";
    }
  };

  const getDealStageLabel = (stage: string) => {
    switch (stage) {
      case "nda": return "NDA Signing";
      case "due_diligence": return "Due Diligence";
      case "agreement": return "Agreement Phase";
      case "escrow": return "Escrow Funding";
      case "transfer": return "Transferring Assets";
      case "closed": return "Closed";
      case "cancelled": return "Cancelled";
      default: return stage.toUpperCase();
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="h-24 bg-white border border-black/10 p-6 flex flex-col justify-center animate-pulse">
          <div className="h-6 bg-brand-dark/10 w-48 rounded mb-2" />
          <div className="h-4 bg-brand-dark/10 w-96 rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricsCardSkeleton />
          <MetricsCardSkeleton />
          <MetricsCardSkeleton />
          <MetricsCardSkeleton />
        </div>
        <div className="space-y-6">
          <DealCardSkeleton />
          <ListingCardSkeleton />
        </div>
      </div>
    );
  }

  const kycStatus = data?.user?.kycStatus || "not_started";

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Welcome Hero */}
      <div className="bg-white border border-black/10 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[#1D4429]/[0.01] pointer-events-none" />
        <div className="space-y-2">
          <h1 className="text-3xl font-serif italic font-black text-brand-dark tracking-tight">
            {data?.user?.name || "Seller"}'s Listings
          </h1>
          <p className="text-xs font-semibold tracking-wider text-brand-dark/50 uppercase font-mono">
            Seller Hub &bull; {data?.user?.kycStatus === "approved" ? "Verified Seller" : "Verification Pending"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0 w-full sm:w-auto">
          {/* KYC Status Card inside Hero */}
          {kycStatus !== "approved" && (
            <div className="bg-brand-orange/5 border border-brand-orange/20 p-4 flex items-center space-x-3 max-w-md">
              <AlertTriangle className="w-5 h-5 text-brand-orange shrink-0" />
              <div className="space-y-1">
                <h4 className="text-[10px] font-mono font-bold uppercase text-brand-orange tracking-wider">KYC Verification Needed</h4>
                <p className="text-[11px] text-brand-dark/70 font-sans leading-relaxed">
                  Listings require KYC verification to go live.
                </p>
                <button 
                  onClick={() => navigateTo("/onboarding/role")}
                  className="text-[10px] font-mono font-black text-brand-orange hover:underline uppercase block tracking-wider pt-0.5"
                >
                  Verify KYC Now &rarr;
                </button>
              </div>
            </div>
          )}

          <button
            onClick={() => navigateTo("/seller/listings/new")}
            className="bg-brand-green hover:bg-brand-green/95 text-[#FDFCFB] font-bold text-xs uppercase tracking-widest px-5 py-4 rounded-none flex items-center justify-center space-x-2 border border-brand-green transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Create Listing</span>
          </button>
        </div>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricsCard 
          number={data?.stats?.totalRevenue || 0} 
          label="Total Revenue" 
          icon={CircleDollarSign} 
          isCurrency={true}
        />
        <MetricsCard 
          number={data?.stats?.activeListings || 0} 
          label="Active Listings" 
          icon={FileText} 
        />
        <MetricsCard 
          number={data?.stats?.pendingOffers || 0} 
          label="Pending Offers" 
          icon={BadgePercent} 
        />
        <MetricsCard 
          number={data?.stats?.activeDeals || 0} 
          label="Active Deals" 
          icon={Handshake} 
        />
      </div>

      {/* 3. Listing Performance Section */}
      <div className="bg-white border border-black/10 p-6 rounded-none space-y-6">
        <div>
          <h2 className="text-xl font-serif italic font-black text-brand-dark tracking-tight flex items-center gap-2">
            <BarChart4 className="w-5 h-5 text-brand-green" />
            <span>Listing Performance</span>
          </h2>
          <p className="text-[10px] text-brand-dark/50 font-semibold uppercase tracking-widest mt-0.5">
            Real-time analytics and interest indicators
          </p>
        </div>

        {(!data?.listingPerformance || data.listingPerformance.length === 0) ? (
          <div className="py-8 text-center text-xs text-brand-dark/50 font-mono">
            No active listings to show analytics.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.listingPerformance.map((item: any) => (
              <div 
                key={item.id}
                className="border border-black/10 p-5 space-y-4 hover:border-brand-green/20 transition-colors"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-brand-dark line-clamp-1">{item.title}</h4>
                  <p className="text-[9px] font-mono text-brand-dark/50 capitalize">Status: {item.status}</p>
                </div>

                {/* Analytical counts */}
                <div className="grid grid-cols-3 gap-4 border-t border-black/5 pt-4">
                  <div className="text-center">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/40 block">Views</span>
                    <span className="text-sm font-bold text-brand-dark flex items-center justify-center gap-1 mt-1">
                      <Eye className="w-3.5 h-3.5 text-brand-dark/30" />
                      {item.viewCount || 0}
                    </span>
                  </div>
                  <div className="text-center border-l border-r border-black/5">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/40 block">NDAs</span>
                    <span className="text-sm font-bold text-brand-green flex items-center justify-center gap-1 mt-1">
                      <Lock className="w-3.5 h-3.5 text-brand-green/30" />
                      {item.ndasUnlocked || 0}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/40 block">Offers</span>
                    <span className="text-sm font-bold text-brand-dark flex items-center justify-center gap-1 mt-1">
                      <BadgePercent className="w-3.5 h-3.5 text-brand-dark/30" />
                      {item.offersReceived || 0}
                    </span>
                  </div>
                </div>

                {/* Mini bar chart representation */}
                <div className="h-10 flex items-end justify-between px-2 pt-2 border-t border-black/5 gap-1.5">
                  <div className="w-full flex flex-col items-center">
                    <div 
                      className="bg-brand-dark/15 w-full transition-all duration-500 hover:bg-brand-green" 
                      style={{ height: `${Math.min(100, ((item.viewCount || 0) * 5))}px`, minHeight: "4px" }}
                      title={`Views: ${item.viewCount}`}
                    />
                    <span className="text-[7px] font-mono text-brand-dark/40 uppercase mt-1">Views</span>
                  </div>
                  <div className="w-full flex flex-col items-center">
                    <div 
                      className="bg-brand-green w-full transition-all duration-500 hover:bg-brand-green/80" 
                      style={{ height: `${Math.min(100, ((item.ndasUnlocked || 0) * 15))}px`, minHeight: "4px" }}
                      title={`NDAs: ${item.ndasUnlocked}`}
                    />
                    <span className="text-[7px] font-mono text-brand-dark/40 uppercase mt-1">NDAs</span>
                  </div>
                  <div className="w-full flex flex-col items-center">
                    <div 
                      className="bg-brand-dark w-full transition-all duration-500 hover:bg-brand-green" 
                      style={{ height: `${Math.min(100, ((item.offersReceived || 0) * 25))}px`, minHeight: "4px" }}
                      title={`Offers: ${item.offersReceived}`}
                    />
                    <span className="text-[7px] font-mono text-brand-dark/40 uppercase mt-1">Offers</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Offers Requiring Action Section */}
      <div className="bg-white border border-black/10 p-6 rounded-none space-y-4">
        <div>
          <h2 className="text-xl font-serif italic font-black text-brand-dark tracking-tight flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-brand-green" />
            <span>Offers Requiring Action</span>
          </h2>
          <p className="text-[10px] text-brand-dark/50 font-semibold uppercase tracking-widest mt-0.5">
            Acquisition offers awaiting your response
          </p>
        </div>

        {(!data?.offersRequiringAction || data.offersRequiringAction.length === 0) ? (
          <div className="py-6 text-center text-xs text-brand-dark/50 font-mono">
            No pending offers needing seller response.
          </div>
        ) : (
          <div className="space-y-3">
            {data.offersRequiringAction.map(({ offer, listing, buyer }: any) => (
              <div 
                key={offer.id}
                className="border border-black/10 p-4.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-green/20 transition-all"
              >
                <div>
                  <h4 className="text-xs font-bold text-brand-dark">{listing.title}</h4>
                  <p className="text-xs text-brand-dark/70 mt-1">
                    Buyer <span className="font-bold text-brand-green">{buyer.name || "Investor"}</span> offered{" "}
                    <span className="font-mono font-bold text-brand-green">{formatCurrencyLocal(Number(offer.amount))}</span>
                    {offer.message && ` — "${offer.message}"`}
                  </p>
                </div>

                <button
                  onClick={() => navigateTo(`/seller/offers`)}
                  className="bg-brand-green hover:bg-brand-green/95 text-white font-bold text-[9px] uppercase tracking-widest px-4 py-2 flex items-center space-x-1 shrink-0"
                >
                  <span>Review Offer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Active Deals Section */}
      <div className="bg-white border border-black/10 p-6 rounded-none space-y-4">
        <div>
          <h2 className="text-xl font-serif italic font-black text-brand-dark tracking-tight flex items-center gap-2">
            <Handshake className="w-5 h-5 text-brand-green" />
            <span>Active Deal Rooms</span>
          </h2>
          <p className="text-[10px] text-brand-dark/50 font-semibold uppercase tracking-widest mt-0.5">
            Contracting and Escrow Transactions
          </p>
        </div>

        {(!data?.activeDeals || data.activeDeals.length === 0) ? (
          <EmptyState 
            variant="no-deals"
            heading="No active transactions"
            description="Deals will appear here when you accept a buyer's offer. The platform will guide both parties through legal NDAs, checklists, contracts, and secure Escrow transactions."
          />
        ) : (
          <div className="border border-black/10 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-black/[0.02] border-b border-black/10 text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/50">
                  <th className="p-4">Listing Title</th>
                  <th className="p-4">Buyer</th>
                  <th className="p-4">Deal Value</th>
                  <th className="p-4">Current Stage</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-xs text-brand-dark">
                {data.activeDeals.map(({ deal, listing, buyer }: any) => (
                  <tr key={deal.id} className="hover:bg-brand-cream/5 transition-colors">
                    <td className="p-4 font-bold">{listing.title}</td>
                    <td className="p-4">{buyer.name || "Investor"}</td>
                    <td className="p-4 font-mono font-bold text-brand-green">{formatCurrencyLocal(Number(deal.dealValue))}</td>
                    <td className="p-4">
                      <span className="bg-brand-green/5 border border-brand-green/10 text-brand-green px-2 py-0.5 font-mono font-bold text-[10px] uppercase">
                        {getDealStageLabel(deal.stage)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigateTo(`/seller/deals/${deal.id}`)}
                        className="text-[10px] font-mono font-bold text-brand-green hover:underline uppercase tracking-wider cursor-pointer"
                      >
                        Enter Room &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Listing Status Table */}
      <div className="bg-white border border-black/10 p-6 rounded-none space-y-4">
        <div>
          <h2 className="text-xl font-serif italic font-black text-brand-dark tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-brand-green" />
            <span>My Listings Status</span>
          </h2>
          <p className="text-[10px] text-brand-dark/50 font-semibold uppercase tracking-widest mt-0.5">
            Curation and review pipelines
          </p>
        </div>

        {(!data?.listingsStatusList || data.listingsStatusList.length === 0) ? (
          <div className="text-center py-6 text-xs text-brand-dark/40 font-mono">
            You have not created any listings yet.
          </div>
        ) : (
          <div className="border border-black/10 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-black/[0.02] border-b border-black/10 text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/50">
                  <th className="p-4">Listing Title</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4">Asking Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 text-xs text-brand-dark">
                {data.listingsStatusList.map((listing: any) => (
                  <tr key={listing.id} className="hover:bg-brand-cream/5 transition-colors">
                    <td className="p-4 font-bold">{listing.title}</td>
                    <td className="p-4 font-mono text-[10px] text-brand-dark/50">
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 font-mono font-bold text-brand-green">
                      {formatCurrencyLocal(listing.askingPrice)}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 border text-[9px] font-mono font-bold uppercase ${getStatusBadgeClass(listing.status)}`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button
                        onClick={() => navigateTo(`/listings/${listing.slug}`)}
                        className="text-[10px] font-mono font-bold text-brand-dark/60 hover:text-brand-dark uppercase tracking-wider cursor-pointer"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => navigateTo(`/seller/listings`)}
                        className="text-[10px] font-mono font-bold text-brand-green hover:underline uppercase tracking-wider cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
