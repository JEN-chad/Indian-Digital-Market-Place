import React from "react";
import { Users, FileText, CheckCircle, DollarSign, AlertCircle, RefreshCw } from "lucide-react";
import { formatCurrency } from "../../../lib/utils.ts";
import { motion } from "motion/react";

interface AdminStatsProps {
  stats: {
    totalUsers: number;
    activeListings: number;
    activeDeals: number;
    totalDealValue: number;
    pendingKyc: number;
    pendingListings: number;
  };
  onRefresh: () => void;
  isLoading: boolean;
}

export function AdminStatsGrid({ stats, onRefresh, isLoading }: AdminStatsProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-serif italic font-bold">Platform Overview</h2>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Real-time metrics</p>
        </div>
        <button 
          onClick={onRefresh} 
          disabled={isLoading}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-green hover:opacity-80"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-black/10 p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-brand-green/10 text-brand-green">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1">+12%</span>
          </div>
          <p className="text-2xl font-bold font-mono">{stats.totalUsers}</p>
          <p className="text-xs uppercase tracking-wider text-gray-500 mt-1">Total Users</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-black/10 p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1">+5%</span>
          </div>
          <p className="text-2xl font-bold font-mono">{stats.activeListings}</p>
          <p className="text-xs uppercase tracking-wider text-gray-500 mt-1">Active Listings</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-black/10 p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 text-purple-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1">+8%</span>
          </div>
          <p className="text-2xl font-bold font-mono">{stats.activeDeals}</p>
          <p className="text-xs uppercase tracking-wider text-gray-500 mt-1">Active Deals</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white border border-black/10 p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-yellow-50 text-yellow-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1">+15%</span>
          </div>
          <p className="text-xl font-bold font-mono">{formatCurrency(stats.totalDealValue)}</p>
          <p className="text-xs uppercase tracking-wider text-gray-500 mt-1">Total Deal Value</p>
        </motion.div>
      </div>

      {/* Action Cards */}
      <h2 className="text-xl font-serif italic font-bold mt-8">Action Queue</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#FDFCFB] border border-black/10 p-4 flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-full">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-red-600">{stats.pendingKyc}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Pending KYC</p>
          </div>
        </div>

        <div className="bg-[#FDFCFB] border border-black/10 p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-full">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-bold font-mono text-orange-600">{stats.pendingListings}</p>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Pending Listings</p>
          </div>
        </div>

      </div>
    </div>
  );
}
