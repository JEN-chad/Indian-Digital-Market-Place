import React, { useEffect, useState } from "react";
import { ReviewQueue } from "../../../components/admin/review-queue.tsx";
import { KycReviewCard } from "../../../components/admin/kyc-review-card.tsx";
import { getAdminKyc, approveKyc, rejectKyc } from "../../../actions/admin.ts";
import { ShieldCheck, Clock } from "lucide-react";

export function AdminKycPage() {
  const [kycData, setKycData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);

  const fetchKyc = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminKyc();
      if (res.success) {
        // Flatten for the queue
        const formatted = res.kycProfiles.map((item: any) => ({
          ...item.kyc,
          user: item.user,
        }));
        setKycData(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();
  }, []);

  const handleApprove = async (userId: string) => {
    await approveKyc(userId);
    fetchKyc();
  };

  const handleReject = async (userId: string, reason: string) => {
    await rejectKyc(userId, reason);
    fetchKyc();
  };

  const renderCard = (kyc: any) => (
    <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 ${
            kyc.status === 'in_review' ? 'bg-orange-100 text-orange-700' :
            kyc.status === 'approved' ? 'bg-green-100 text-green-700' :
            kyc.status === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {kyc.status.replace("_", " ")}
          </span>
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {new Date(kyc.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h4 className="font-bold flex items-center gap-2">
          {kyc.user?.name || "Unknown User"} 
        </h4>
        <p className="text-sm text-gray-500">{kyc.user?.email}</p>
      </div>
      
      <div className="flex-1 flex gap-4 text-sm bg-gray-50 p-2 border border-black/5">
        <div>
          <span className="text-[10px] text-gray-500 uppercase block">PAN</span>
          <span className="font-bold uppercase">{kyc.panNumber || 'N/A'}</span>
        </div>
        <div>
          <span className="text-[10px] text-gray-500 uppercase block">Type</span>
          <span className="font-bold capitalize">{kyc.companyName ? "Company" : "Individual"}</span>
        </div>
      </div>

      <button 
        onClick={() => setSelectedKyc({ kyc, user: kyc.user })}
        className="px-6 py-2 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 shrink-0"
      >
        Review KYC
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif italic font-bold">KYC Review Queue</h2>
        <p className="text-sm text-gray-500 mt-1">Verify user identities and business compliance.</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-gray-500">Loading KYC profiles...</div>
      ) : (
        <ReviewQueue 
          items={kycData}
          renderCard={renderCard}
          filterOptions={["in_review", "approved", "pending", "rejected"]}
          // Search by user name for simplicity
          searchKey="panNumber" // Or we'd need a custom search in ReviewQueue for nested properties
        />
      )}

      <KycReviewCard 
        isOpen={!!selectedKyc}
        kycData={selectedKyc}
        onClose={() => setSelectedKyc(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
