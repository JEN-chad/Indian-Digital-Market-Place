import React, { useState, useEffect } from "react";
import { ListingDetail } from "../../../../components/listings/listing-detail.tsx";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuthStore } from "../../../../store/auth-store.ts";

interface ListingDetailPageProps {
  slug: string;
}

export default function ListingDetailPage({ slug }: ListingDetailPageProps) {
  const { user } = useAuthStore();
  const [listing, setListing] = useState<any | null>(null);
  const [hasSignedNda, setHasSignedNda] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [similarListings, setSimilarListings] = useState<any[]>([]);

  const fetchListingDetail = async () => {
    setIsLoading(true);
    try {
      // Fetch gated detail using buyer ID if authenticated to check signed NDAs
      const buyerId = user?.id || "sandbox-buyer-id-abc";
      const res = await fetch(`/api/listings/${slug}?buyerId=${buyerId}`);
      if (!res.ok) throw new Error("Failed to load listing details");
      const data = await res.json();
      
      setListing(data.listing);
      setHasSignedNda(data.hasSignedNda);

      // Track listing view for recently viewed section
      if (data.listing && user?.id) {
        try {
          const { trackListingView } = await import("../../../../actions/listings.ts");
          await trackListingView(user.id, data.listing.id);
        } catch (err) {
          console.warn("Failed to track view for listing:", err);
        }
      }

      // Fetch similar listings based on asset type
      if (data.listing) {
        const simRes = await fetch(`/api/listings?type=${data.listing.assetType}`);
        if (simRes.ok) {
          const simData = await simRes.json();
          // Filter out current listing
          const filtered = (simData.listings || []).filter((l: any) => l.id !== data.listing.id);
          setSimilarListings(filtered.slice(0, 3));
        }
      }
    } catch (err) {
      console.error("Error loading listing details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListingDetail();
  }, [slug, user]);

  const handleBack = () => {
    window.location.hash = "#/listings";
  };

  const handleNavigateToListing = (nextSlug: string) => {
    window.location.hash = `#/listings/${nextSlug}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 text-brand-green animate-spin" />
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-dark/50">
          Decrypting Listing Assets...
        </span>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-xl mx-auto py-16 px-6 text-center space-y-4">
        <h2 className="text-xl font-serif italic font-black text-brand-dark">Listing Not Found</h2>
        <p className="text-xs text-brand-dark/60 leading-relaxed font-sans">
          The listing with slug <code className="bg-brand-cream px-1.5 py-0.5 border border-black/5 font-bold font-mono">"{slug}"</code> does not exist or has been archived by the platform administrator.
        </p>
        <button
          onClick={handleBack}
          className="bg-brand-green hover:bg-brand-green/90 text-white font-bold py-3 px-6 text-xs uppercase tracking-widest border border-brand-green transition-all cursor-pointer rounded-none"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const kycApproved = user?.kycStatus === "approved";

  // Formulate a beautiful buyer object for the NDA modal
  const buyerUserObj = {
    id: user?.id || "sandbox-buyer-id-abc",
    email: user?.email || "sandbox-buyer@fmi.analytics",
    name: user?.name || "Sandbox Investor",
    phone: user?.phone || "+91 98765 43210",
  };

  return (
    <div className="space-y-4">
      {/* Back Button Panel */}
      <div className="max-w-5xl mx-auto px-6 md:px-8 pt-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-brand-dark/60 hover:text-brand-green transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
      </div>

      <ListingDetail
        listing={listing}
        hasSignedNda={hasSignedNda}
        isKycApproved={kycApproved}
        buyerUser={buyerUserObj}
        similarListings={similarListings}
        onNdaSuccess={() => {
          // Re-fetch listing data to unlock content
          fetchListingDetail();
        }}
        onContactSeller={() => {
          console.log("Contact seller triggered");
        }}
        onNavigateToListing={handleNavigateToListing}
      />
    </div>
  );
}
