import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/auth-store.ts";
import { getSellerOffers, acceptOffer, rejectOffer, OfferInput } from "../../../actions/offers.ts";
import { OfferCard, Offer } from "../../../components/deal-room/offer-card.tsx";
import { CounterOfferModal } from "../../../components/deal-room/counter-offer-modal.tsx";
import { OfferTimeline } from "../../../components/deal-room/offer-timeline.tsx";
import { Loader2, Plus, ArrowUpRight, FolderX, HelpCircle, Shield } from "lucide-react";

export default function SellerOffersPage() {
  const { user } = useAuthStore();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "countered" | "closed">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [selectedCounterOffer, setSelectedCounterOffer] = useState<Offer | null>(null);

  const fetchOffers = async () => {
    if (!user) return;
    setLoading(true);
    const res = await getSellerOffers(user.id);
    setLoading(false);
    if (res.success && res.offers) {
      setOffers(res.offers);
    } else {
      setError(res.error || "Failed to retrieve your sales ledger.");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [user]);

  // Action handlers
  const handleAccept = async (offerId: string) => {
    if (!window.confirm("Are you sure you want to ACCEPT this offer? This will automatically reject other active bids, finalize terms, and initialize the M&A Deal Room.")) return;
    setActionLoadingId(offerId);
    const result = await acceptOffer(offerId);
    setActionLoadingId(null);
    if (result.success) {
      alert("Offer successfully accepted! Opening secure M&A Deal Room.");
      window.location.hash = `#/seller/deals`;
    } else {
      alert(result.error || "Failed to accept offer");
    }
  };

  const handleReject = async (offerId: string, reason?: string) => {
    setActionLoadingId(offerId);
    const result = await rejectOffer(offerId, reason);
    setActionLoadingId(null);
    if (result.success) {
      fetchOffers();
    } else {
      alert(result.error || "Failed to decline offer");
    }
  };

  const handleOpenCounterModal = (offer: Offer) => {
    setSelectedCounterOffer(offer);
  };

  // Filter offers by tab
  const filteredOffers = offers.filter((offer) => {
    const isExpired = offer.expiresAt ? new Date() > new Date(offer.expiresAt) : false;
    const currentStatus = isExpired && offer.status === "pending" ? "expired" : offer.status;

    if (activeTab === "all") return true;
    if (activeTab === "pending") return currentStatus === "pending";
    if (activeTab === "countered") return currentStatus === "countered";
    if (activeTab === "closed") {
      return ["accepted", "rejected", "withdrawn", "expired"].includes(currentStatus);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-brand-green" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-dark/50">
          Syncing Seller Ledger...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-brand-orange bg-orange-50 px-2 py-0.5 border border-orange-100 inline-block">
            M&A LEDGER BOARD
          </span>
          <h1 className="text-3xl font-serif italic font-black leading-tight text-brand-dark">
            Incoming Purchase Bids
          </h1>
          <p className="text-xs text-brand-dark/50">
            Review, decline, counter, or accept buy proposals from vetted digital buyers.
          </p>
        </div>
        <div className="bg-brand-cream border border-black/5 p-3 flex items-center gap-2.5 text-xs text-brand-dark/70 shrink-0">
          <Shield className="w-4 h-4 text-brand-green" />
          <span>Vetted buyer identities are masked for confidentiality.</span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 text-xs">
          {error}
        </div>
      )}

      {/* Tabs Filter */}
      <div className="flex border-b border-black/[0.08] overflow-x-auto shrink-0 scrollbar-none">
        {(["all", "pending", "countered", "closed"] as const).map((tab) => {
          const count = offers.filter((o) => {
            const isExpired = o.expiresAt ? new Date() > new Date(o.expiresAt) : false;
            const currentStatus = isExpired && o.status === "pending" ? "expired" : o.status;

            if (tab === "all") return true;
            if (tab === "pending") return currentStatus === "pending";
            if (tab === "countered") return currentStatus === "countered";
            if (tab === "closed") return ["accepted", "rejected", "withdrawn", "expired"].includes(currentStatus);
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
              <span className="capitalize">{tab === "pending" ? "New / Pending" : tab}</span>
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
          <FolderX className="w-10 h-10 mx-auto text-brand-dark/20" />
          <div className="space-y-1">
            <h3 className="text-sm font-serif italic font-bold">No incoming offers found</h3>
            <p className="text-xs text-brand-dark/50 max-w-sm mx-auto leading-relaxed">
              You do not have any incoming buy proposals under the "{activeTab}" filter at this time.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {filteredOffers.map((offer) => (
            <div key={offer.id} className="space-y-4">
              <OfferCard
                offer={offer}
                role="seller"
                onAccept={handleAccept}
                onCounter={handleOpenCounterModal}
                onReject={handleReject}
                isActionLoading={actionLoadingId === offer.id}
              />
              <div className="bg-brand-cream/10 border border-black/5 p-4">
                <OfferTimeline offer={offer} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counter Modal */}
      {selectedCounterOffer && (
        <CounterOfferModal
          offer={selectedCounterOffer}
          onSuccess={() => {
            setSelectedCounterOffer(null);
            fetchOffers();
          }}
          onClose={() => setSelectedCounterOffer(null)}
        />
      )}
    </div>
  );
}
