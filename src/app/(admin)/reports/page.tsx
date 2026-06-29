import React from "react";
import { PieChart, TrendingUp, Download, BarChart2 } from "lucide-react";

export function AdminReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-serif italic font-bold">Reports & Analytics</h2>
          <p className="text-sm text-gray-500 mt-1">Platform performance and financial metrics.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-black/10 bg-white text-xs font-bold uppercase tracking-widest hover:bg-gray-50">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-white border border-black/10 p-12 text-center">
        <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-black/5">
          <BarChart2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold mb-2">Advanced Analytics Coming Soon</h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          We are currently building comprehensive charts for user growth, deal volume over time, and revenue breakdown.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50 pointer-events-none">
        <div className="bg-white border border-black/10 p-6 h-64 flex flex-col items-center justify-center">
          <PieChart className="w-12 h-12 text-gray-300 mb-2" />
          <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Listings by Industry</p>
        </div>
        <div className="bg-white border border-black/10 p-6 h-64 flex flex-col items-center justify-center">
          <TrendingUp className="w-12 h-12 text-gray-300 mb-2" />
          <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Monthly Deal Volume</p>
        </div>
      </div>
    </div>
  );
}
