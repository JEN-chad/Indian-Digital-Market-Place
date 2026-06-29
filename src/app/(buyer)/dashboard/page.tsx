import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/auth-store.ts";
import { getBuyerDashboardData } from "../../../actions/dashboards.ts";
import { unsaveListingForBuyer, saveListingForBuyer } from "../../../actions/listings.ts";
import { MetricsCard } from "../../../components/shared/metrics-card.tsx";
import { ActivityFeed } from "../../../components/shared/activity-feed.tsx";
import { EmptyState } from "../../../components/shared/empty-state.tsx";
import { SavedListingCard } from "../../../components/listings/saved-listing-card.tsx";
import { ListingCard } from "../../../components/listings/listing-card.tsx";
import { 
  MetricsCardSkeleton, 
  DealCardSkeleton, 
  ListingCardSkeleton,
  ActivityFeedSkeleton 
} from "../../../components/shared/loading-skeleton.tsx";
import { 
  FileText, Handshake, Bookmark, FileCode, CheckCircle2, 
  AlertTriangle, ArrowRight, Compass, Eye, ShieldCheck, 
  MessageSquare, Sparkles 
} from "lucide-react";

export default function BuyerDashboardPage() {
  const { user } = useAuthStore();
  const userId = user?.id || "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await getBuyerDashboardData(userId);
      if (res.success) {
        setData(res.data);
        setError(null);
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

  const handleRemoveSaved = async (listingId: string) => {
    if (!userId) return;
    try {
      const res = await unsaveListingForBuyer(userId, listingId);
      if (res.success) {
        // Optimistic update
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Error unsaving listing:", err);
    }
  };

  const navigateTo = (path: string) => {
    window.location.hash = `#${path}`;
  };

  const getDealProgress = (stage: string) => {
    switch (stage) {
      case "nda": return 15;
      case "due_diligence": return 35;
      case "agreement": return 55;
      case "escrow": return 75;
      case "transfer": return 90;
      case "closed": return 100;
      case "cancelled":
      default: return 0;
    }
  };

  const getDealStageLabel = (stage: string) => {
    switch (stage) {
      case "nda": return "NDA Signing";
      case "due_diligence": return "Due Diligence";
      case "agreement": return "Legal Agreement";
      case "escrow": return "Escrow Funding";
      case "transfer": return "Asset Transfer";
      case "closed": return "Acquisition Closed";
      case "cancelled": return "Deal Cancelled";
      default: return stage.toUpperCase();
    }
  };

  const formatCurrencyLocal = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString("en-IN")}`;
  };

  // Welcome Hero Time greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Hero loading */}
        <div className="h-24 bg-white border border-black/10 p-6 flex flex-col justify-center animate-pulse">
          <div className="h-6 bg-brand-dark/10 w-48 rounded mb-2" />
          <div className="h-4 bg-brand-dark/10 w-96 rounded" />
        </div>
        {/* Stats row loading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricsCardSkeleton />
          <MetricsCardSkeleton />
          <MetricsCardSkeleton />
          <MetricsCardSkeleton />
        </div>
        {/* Body loading layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <DealCardSkeleton />
            <ListingCardSkeleton />
          </div>
          <div>
            <ActivityFeedSkeleton />
          </div>
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
        <div>
          <h1 className="text-3xl font-serif italic font-black text-brand-dark tracking-tight">
            {getGreeting()}, <span className="text-brand-green">{data?.user?.name || "Investor"}</span>
          </h1>
          <p className="text-xs font-semibold tracking-wider text-brand-dark/50 uppercase mt-1 font-mono">
            Investor Suite &bull; {data?.user?.kycStatus === "approved" ? "Verified Member" : "Verification Pending"}
          </p>
        </div>

        {/* KYC banner inside Hero */}
        {kycStatus !== "approved" && (
          <div className="bg-brand-orange/5 border border-brand-orange/20 p-4 flex items-center space-x-3 max-w-md">
            <AlertTriangle className="w-5 h-5 text-brand-orange shrink-0" />
            <div className="space-y-1">
              <h4 className="text-[10px] font-mono font-bold uppercase text-brand-orange tracking-wider">KYC Verification Needed</h4>
              <p className="text-[11px] text-brand-dark/70 font-sans leading-relaxed">
                Complete your identity checks to place offers and message sellers directly.
              </p>
              <button 
                onClick={() => navigateTo("/onboarding/role")}
                className="text-[10px] font-mono font-black text-brand-orange hover:underline uppercase block tracking-wider pt-0.5"
              >
                Submit Documents Now &rarr;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricsCard 
          number={data?.stats?.activeOffers || 0} 
          label="Active Offers" 
          icon={FileCode} 
        />
        <MetricsCard 
          number={data?.stats?.activeDeals || 0} 
          label="Active Deals" 
          icon={Handshake} 
        />
        <MetricsCard 
          number={data?.stats?.ndasSigned || 0} 
          label="NDAs Signed" 
          icon={FileText} 
        />
        <MetricsCard 
          number={data?.stats?.listingsSaved || 0} 
          label="Listings Saved" 
          icon={Bookmark} 
        />
      </div>

      {/* 3. Your Active Deals & Offers awaiting response grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Deals Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-serif italic font-black text-brand-dark tracking-tight flex items-center gap-2">
                <Handshake className="w-5 h-5 text-brand-green" />
                <span>Your Active Deals</span>
              </h2>
              <p className="text-[10px] text-brand-dark/50 font-semibold uppercase tracking-widest mt-0.5">
                Ongoing acquisitions in deal rooms
              </p>
            </div>

            {(!data?.activeDeals || data.activeDeals.length === 0) ? (
              <EmptyState 
                variant="no-deals"
                heading="No active acquisitions"
                description="When you place an offer and the seller accepts, a private secured Deal Room with escrow integration will appear here."
                ctaText="Browse Listings"
                onCtaClick={() => navigateTo("/listings")}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {data.activeDeals.map(({ deal, listing }: any) => {
                  const progress = getDealProgress(deal.stage);
                  return (
                    <div 
                      key={deal.id}
                      onClick={() => navigateTo(`/buyer/deals/${deal.id}`)}
                      className="bg-white border border-black/10 p-5 hover:border-brand-green/30 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/45">
                            {listing.industry}
                          </span>
                          <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-none border ${
                            deal.stage === "closed"
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                              : "bg-brand-green/5 border-brand-green/10 text-brand-green"
                          }`}>
                            {getDealStageLabel(deal.stage)}
                          </span>
                        </div>

                        <h3 className="text-sm font-serif italic font-black text-brand-dark group-hover:text-brand-green transition-colors line-clamp-1">
                          {listing.title}
                        </h3>

                        {/* Progress Bar */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-wide text-brand-dark/50">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <div className="h-1.5 bg-black/5 rounded-none overflow-hidden">
                            <div 
                              className="h-full bg-brand-green transition-all duration-500" 
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-black/5 pt-3 mt-4 flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50">
                        <span>Valued: {formatCurrencyLocal(Number(deal.dealValue || listing.askingPrice))}</span>
                        <span className="text-brand-green flex items-center gap-1 group-hover:gap-1.5 transition-all">
                          Enter Room &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Offers Awaiting Response Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-serif italic font-black text-brand-dark tracking-tight flex items-center gap-2">
                <FileCode className="w-5 h-5 text-brand-green" />
                <span>Offers Awaiting Response</span>
              </h2>
              <p className="text-[10px] text-brand-dark/50 font-semibold uppercase tracking-widest mt-0.5">
                Countered bids awaiting your confirmation
              </p>
            </div>

            {(!data?.offersAwaitingResponse || data.offersAwaitingResponse.length === 0) ? (
              <div className="bg-white border border-black/10 p-6 text-center text-xs text-brand-dark/50 font-mono">
                No countered offers awaiting your response.
              </div>
            ) : (
              <div className="space-y-3.5">
                {data.offersAwaitingResponse.map(({ offer, listing }: any) => (
                  <div 
                    key={offer.id}
                    className="bg-white border border-brand-green/15 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-brand-green/45 transition-colors"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-brand-dark">{listing.title}</h4>
                      <p className="text-[10px] font-sans text-brand-dark/60 mt-0.5">
                        Seller countered: <span className="font-mono text-brand-green font-bold">{formatCurrencyLocal(Number(offer.counterAmount))}</span> 
                        {offer.counterMessage && ` — "${offer.counterMessage}"`}
                      </p>
                    </div>

                    <button
                      onClick={() => navigateTo(`/buyer/offers`)}
                      className="bg-brand-green hover:bg-brand-green/90 text-white font-bold text-[9px] uppercase tracking-widest px-4 py-2 flex items-center space-x-1 cursor-pointer shrink-0"
                    >
                      <span>Review Counter</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended For You Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-xl font-serif italic font-black text-brand-dark tracking-tight flex items-center gap-2">
                  <Compass className="w-5 h-5 text-brand-green" />
                  <span>Recommended For You</span>
                </h2>
                <p className="text-[10px] text-brand-dark/50 font-semibold uppercase tracking-widest mt-0.5">
                  AI Matches matching budget & industries
                </p>
              </div>
              
              {data?.user?.kycStatus === "approved" && (
                <button
                  onClick={() => navigateTo("/buyer/settings")}
                  className="text-[9px] font-mono font-bold uppercase text-brand-green hover:underline"
                >
                  Adjust Preferences &rarr;
                </button>
              )}
            </div>

            {(!data?.recommendedListings || data.recommendedListings.length === 0) ? (
              <EmptyState 
                variant="no-listings"
                heading="No recommendations available"
                description="Create a buyer profile in settings to receive tailored digital asset matches."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {data.recommendedListings.map((listing: any) => (
                  <div key={listing.id} className="relative">
                    <span className="absolute top-3.5 right-3.5 z-10 bg-brand-green text-white font-mono font-bold uppercase tracking-widest text-[8px] px-2 py-0.5 shadow flex items-center gap-1 border border-brand-green/20">
                      <Sparkles className="w-2.5 h-2.5" />
                      Recommended
                    </span>
                    <ListingCard 
                      {...listing} 
                      onClick={(slug) => navigateTo(`/listings/${slug}`)} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saved Listings Grid */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-serif italic font-black text-brand-dark tracking-tight flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-brand-green" />
                <span>Saved Listings ({data?.savedListings?.length || 0})</span>
              </h2>
              <p className="text-[10px] text-brand-dark/50 font-semibold uppercase tracking-widest mt-0.5">
                Acquisitions you are monitoring
              </p>
            </div>

            {(!data?.savedListings || data.savedListings.length === 0) ? (
              <EmptyState 
                variant="no-listings"
                heading="Saved list is empty"
                description="Save listings from the marketplace to quickly access them here, track their stats, and sign NDAs."
                ctaText="Browse Listings"
                onCtaClick={() => navigateTo("/listings")}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {data.savedListings.map((listing: any) => {
                  const hasSigned = data.activeDeals?.some((d: any) => d.deal.listingId === listing.id) || 
                                    data.offersAwaitingResponse?.some((o: any) => o.listing.id === listing.id) || 
                                    false; // Simple check for NDA unlocks
                  return (
                    <SavedListingCard 
                      key={listing.id}
                      listing={listing}
                      hasSignedNda={hasSigned}
                      onRemove={(e) => {
                        e.stopPropagation();
                        handleRemoveSaved(listing.id);
                      }}
                      onAction={() => {
                        navigateTo(`/listings/${listing.slug}`);
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Recently Viewed Listings */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-serif italic font-black text-brand-dark tracking-tight flex items-center gap-2">
                <Eye className="w-5 h-5 text-brand-green" />
                <span>Recently Viewed</span>
              </h2>
              <p className="text-[10px] text-brand-dark/50 font-semibold uppercase tracking-widest mt-0.5">
                Last assets you analyzed
              </p>
            </div>

            {(!data?.recentlyViewed || data.recentlyViewed.length === 0) ? (
              <div className="bg-white border border-black/10 p-6 text-center text-xs text-brand-dark/50 font-mono">
                No viewed listings in this session.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {data.recentlyViewed.slice(0, 6).map((listing: any) => (
                  <div key={listing.id} className="scale-95 origin-top-left">
                    <ListingCard 
                      {...listing} 
                      onClick={(slug) => navigateTo(`/listings/${slug}`)} 
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Feed Section */}
        <div>
          <ActivityFeed userId={userId} />
        </div>
      </div>
    </div>
  );
}
