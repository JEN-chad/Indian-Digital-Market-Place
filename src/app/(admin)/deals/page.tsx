import React, { useEffect, useState } from "react";
import { DealMonitorTable } from "../../../components/admin/deal-monitor-table.tsx";
import { getAdminDeals } from "../../../actions/admin.ts";


export function AdminDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminDeals();
      if (res.success) {
        setDeals(res.deals);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleViewDeal = (dealId: string) => {
    // Navigate to admin deal view or simply let admin use the standard buyer deal view but bypass restrictions.
    // For now, we route to standard deal view, which we will update to allow admins.
    window.location.hash = `/deals/${dealId}`; 
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif italic font-bold">Deal Monitor</h2>
        <p className="text-sm text-gray-500 mt-1">Track all active M&A transactions across the platform.</p>
      </div>

      <DealMonitorTable 
        data={deals} 
        isLoading={isLoading} 
        onViewDeal={handleViewDeal} 
      />
    </div>
  );
}
