import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/auth-store.ts";
import { getBuyerOffers, withdrawOffer, acceptCounter, OfferInput } from "../../../actions/offers.ts";
import { OfferCard, Offer } from "../../../components/deal-room/offer-card.tsx";
import { OfferTimeline } from "../../../components/deal-room/offer-timeline.tsx";
import { Search, Loader2, Sparkles, Filter, ChevronRight, FileX } from "lucide-react";
import { PageHeader } from "../../../components/layout/page-header.tsx";

export default function BuyerOffersPage() {
  const { user } = useAuthStore();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "countered" | "accepted" | "rejected">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchOffers = async () => {
    if (!user) return;
    setLoading(true);
    const res = await getBuyerOffers(user.id);
    setLoading(false);
    if (res.success && res.offers) {
      setOffers(res.offers);
    } else {
      setError(res.error || "Failed to retrieve your offers ledger.");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [user]);

  // Action handlers
  const handleWithdraw = async (offerId: string) => {
    if (!window.confirm("Are you sure you want to withdraw this offer?")) return;
    setActionLoadingId(offerId);
    const result = await withdrawOffer(offerId);
    setActionLoadingId(null);
    if (result.success) {
      fetchOffers();
    } else {
      alert(result.error || "Failed to withdraw offer");
    }
  };

  const handleAcceptCounter = async (offerId: string) => {
    if (!window.confirm("Do you accept the seller's counter proposal terms? This will create a binding Deal Room.")) return;
    setActionLoadingId(offerId);
    const result = await acceptCounter(offerId);
    setActionLoadingId(null);
    if (result.success) {
      alert("Counter-offer accepted! Secure Deal Room created.");
      window.location.hash = `#/buyer/deals`;
    } else {
      alert(result.error || "Failed to accept counter-offer");
    }
  };

  // Filter offers by tab
  const filteredOffers = offers.filter((offer) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return offer.status === "pending";
    if (activeTab === "countered") return offer.status === "countered";
    if (activeTab === "accepted") return offer.status === "accepted";
    if (activeTab === "rejected") return offer.status === "rejected" || offer.status === "expired" || offer.status === "withdrawn";
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-dark/50">
          Syncing Buyer Ledger...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto px-4 py-6">
      <PageHeader 
        title="My Sent Offers" 
        breadcrumbs={[{ label: "Buyer Dashboard", path: "/buyer/dashboard" }, { label: "Offers" }]}
        actionSlot={
          <button
            onClick={() => (window.location.hash = "#/listings")}
            className="bg-brand-green hover:bg-brand-green/90 text-white font-bold py-2.5 px-5 text-xs uppercase tracking-widest transition-colors border border-brand-green rounded-none cursor-pointer flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Browse Listings</span>
          </button>
        }
      />

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 text-xs">
          {error}
        </div>
      )}

      {/* Tabs Filter */}
      <div className="flex border-b border-black/[0.08] overflow-x-auto shrink-0 scrollbar-none">
        {(["all", "pending", "countered", "accepted", "rejected"] as const).map((tab) => {
          const count = offers.filter((o) => {
            if (tab === "all") return true;
            if (tab === "pending") return o.status === "pending";
            if (tab === "countered") return o.status === "countered";
            if (tab === "accepted") return o.status === "accepted";
            if (tab === "rejected") return o.status === "rejected" || o.status === "expired" || o.status === "withdrawn";
            return false;
          }).length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-4 text-xs font-mono uppercase tracking-wider border-b-2 transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                activeTab === tab
                  ? "border-brand-green text-brand-green font-black"
                  : "border-transparent text-brand-dark/40 hover:text-brand-dark"
              }`}
            >
              <span className="capitalize">{tab}</span>
              <span className="bg-black/5 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Offers Layout Grid */}
      {filteredOffers.length === 0 ? (
        <div className="border border-dashed border-black/10 p-12 text-center space-y-4 bg-brand-cream/10">
          <FileX className="w-10 h-10 mx-auto text-brand-dark/20" />
          <div className="space-y-1">
            <h3 className="text-sm font-serif italic font-bold">No proposals found</h3>
            <p className="text-xs text-brand-dark/50 max-w-sm mx-auto leading-relaxed">
              You do not have any {activeTab !== "all" ? `"${activeTab}" ` : ""}offers registered under this account profile.
            </p>
          </div>
          {activeTab === "all" && (
            <button
              onClick={() => (window.location.hash = "#/listings")}
              className="border border-black/10 hover:border-black/30 text-brand-dark hover:bg-black/5 px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-none cursor-pointer"
            >
              Explore Active Listings
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {filteredOffers.map((offer) => (
            <div key={offer.id} className="space-y-4">
              <OfferCard
                offer={offer}
                role="buyer"
                onWithdraw={handleWithdraw}
                onAcceptCounter={handleAcceptCounter}
                isActionLoading={actionLoadingId === offer.id}
              />
              <div className="bg-brand-cream/10 border border-black/5 p-4">
                <OfferTimeline offer={offer} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
