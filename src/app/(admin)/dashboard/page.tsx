import React, { useEffect, useState } from "react";
import { AdminStatsGrid } from "../../../components/admin/admin-stats-grid.tsx";
import { getAdminStats } from "../../../actions/admin.ts";
import { Activity } from "lucide-react";

export function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    activeDeals: 0,
    totalDealValue: 0,
    pendingKyc: 0,
    pendingListings: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-12">
      <AdminStatsGrid stats={stats} onRefresh={fetchStats} isLoading={isLoading} />

      {/* Activity Feed Placeholder */}
      <div className="bg-white border border-black/10 p-6">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-black/10">
          <Activity className="w-5 h-5 text-brand-green" />
          <h2 className="text-lg font-serif italic font-bold">Recent Platform Activity</h2>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 border border-black/5 text-sm">
            <span className="font-bold">System</span> - AI Valuation service was updated. (This is a mock activity feed)
          </div>
          <div className="p-4 bg-gray-50 border border-black/5 text-sm">
            <span className="font-bold">Rahul S.</span> submitted a new listing for review.
          </div>
          <div className="p-4 bg-gray-50 border border-black/5 text-sm">
            <span className="font-bold">Priya D.</span> initiated escrow for Deal #1042.
          </div>
          <div className="p-4 bg-gray-50 border border-black/5 text-sm">
            <span className="font-bold">Admin</span> approved 3 KYC applications.
          </div>
        </div>
      </div>
    </div>
  );
}
