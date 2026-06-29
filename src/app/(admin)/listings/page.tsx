import React, { useEffect, useState } from "react";
import { ReviewQueue } from "../../../components/admin/review-queue.tsx";
import { ListingReviewModal } from "../../../components/admin/listing-review-modal.tsx";
import { getAdminListings, approveListing, rejectListing } from "../../../actions/admin.ts";
import { formatCurrency } from "../../../../lib/utils.ts";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-react";

export function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<any | null>(null);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminListings();
      if (res.success) {
        // Flatten the data structure slightly for the queue
        const formatted = res.listings.map((item: any) => ({
          ...item.listing,
          seller: item.seller,
        }));
        setListings(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleApprove = async (id: string) => {
    await approveListing(id);
    fetchListings();
  };

  const handleReject = async (id: string, reason: string) => {
    await rejectListing(id, reason);
    fetchListings();
  };

  const renderCard = (listing: any) => (
    <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 ${
            listing.status === 'in_review' ? 'bg-orange-100 text-orange-700' :
            listing.status === 'live' ? 'bg-green-100 text-green-700' :
            listing.status === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {listing.status.replace("_", " ")}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {new Date(listing.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h4 className="font-bold">{listing.title}</h4>
        <p className="text-sm text-gray-500">{listing.seller?.name || listing.seller?.email || "Unknown Seller"}</p>
      </div>
      
      <div className="flex-1 flex gap-4 text-sm bg-gray-50 p-2 border border-black/5">
        <div>
          <span className="text-[10px] text-gray-500 uppercase block">Asking Price</span>
          <span className="font-bold">{formatCurrency(listing.askingPrice)}</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 uppercase block">Asset Type</span>
          <span className="font-bold capitalize">{listing.assetType}</span>
        </div>
      </div>

      <button 
        onClick={() => setSelectedListing(listing)}
        className="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 shrink-0"
      >
        Review
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif italic font-bold">Listing Moderation Queue</h2>
        <p className="text-sm text-gray-500 mt-1">Review, approve, or reject business listings.</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Loading listings...</div>
      ) : (
        <ReviewQueue 
          items={listings}
          renderCard={renderCard}
          filterOptions={["in_review", "live", "draft", "rejected"]}
          searchKey="title"
        />
      )}

      <ListingReviewModal 
        isOpen={!!selectedListing}
        listing={selectedListing}
        onClose={() => setSelectedListing(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
