import React from "react";
import { DollarSign, Landmark, TrendingUp, HelpCircle, AlertCircle } from "lucide-react";

interface FinancialInputGroupProps {
  monthlyRevenue: string;
  monthlyProfit: string;
  monthlyTraffic: string;
  trafficSources: string[];
  onRevenueChange: (val: string) => void;
  onProfitChange: (val: string) => void;
  onTrafficChange: (val: string) => void;
  onTrafficSourcesChange: (sources: string[]) => void;
  errors?: Record<string, string>;
}

const availableTrafficSources = ["SEO (Organic Search)", "Direct Traffic", "Paid Ads (Google/Meta)", "Social Media", "Email Marketing", "Referrals / Affiliates"];

export default function FinancialInputGroup({
  monthlyRevenue,
  monthlyProfit,
  monthlyTraffic,
  trafficSources,
  onRevenueChange,
  onProfitChange,
  onTrafficChange,
  onTrafficSourcesChange,
  errors = {},
}: FinancialInputGroupProps) {
  
  // Parse numeric values to check if profit > revenue
  const revNum = parseInt(monthlyRevenue.replace(/,/g, ""), 10) || 0;
  const profNum = parseInt(monthlyProfit.replace(/,/g, ""), 10) || 0;
  const profitWarning = profNum > revNum && revNum > 0;

  const handleSourceToggle = (source: string) => {
    if (trafficSources.includes(source)) {
      onTrafficSourcesChange(trafficSources.filter((s) => s !== source));
    } else {
      onTrafficSourcesChange([...trafficSources, source]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-brand-green/5 border border-brand-green/10 rounded-none p-4 flex items-start space-x-3 text-brand-green">
        <Landmark className="w-5 h-5 mt-0.5 text-brand-green shrink-0" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-brand-green">Important currency notice</p>
          <p className="text-brand-dark/80">
            All financials on FMI Exchange are recorded and displayed in **Indian Rupees (INR / ₹)**. Please enter values carefully without including decimals.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Revenue Input */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-slate-700" htmlFor="monthly-revenue">
            <span>Average Monthly Revenue (₹)</span>
            <span className="text-rose-500 ml-1">*</span>
          </label>
          <div className="relative rounded-none shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="text-sm font-semibold">₹</span>
            </div>
            <input
              id="monthly-revenue"
              type="text"
              pattern="[0-9]*"
              placeholder="e.g. 5,00,000"
              value={monthlyRevenue}
              onChange={(e) => onRevenueChange(e.target.value.replace(/\D/g, ""))}
              className={`block w-full pl-8 pr-12 py-3 rounded-none border bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.monthlyRevenue
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : "border-black/10 focus:border-brand-green focus:ring-brand-green/10"
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <span className="text-xs">INR</span>
            </div>
          </div>
          {errors.monthlyRevenue ? (
            <p className="text-xs text-rose-600 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.monthlyRevenue}</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400">Monthly gross sales averaged over last 6-12 months</p>
          )}
        </div>

        {/* Monthly Profit Input */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-slate-700" htmlFor="monthly-profit">
            <span>Average Monthly Net Profit (₹)</span>
            <span className="text-rose-500 ml-1">*</span>
          </label>
          <div className="relative rounded-none shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <span className="text-sm font-semibold">₹</span>
            </div>
            <input
              id="monthly-profit"
              type="text"
              pattern="[0-9]*"
              placeholder="e.g. 2,00,000"
              value={monthlyProfit}
              onChange={(e) => onProfitChange(e.target.value.replace(/\D/g, ""))}
              className={`block w-full pl-8 pr-12 py-3 rounded-none border bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.monthlyProfit
                  ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200"
                  : "border-black/10 focus:border-brand-green focus:ring-brand-green/10"
              }`}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <span className="text-xs">INR</span>
            </div>
          </div>
          {errors.monthlyProfit ? (
            <p className="text-xs text-rose-600 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.monthlyProfit}</span>
            </p>
          ) : profitWarning ? (
            <p className="text-xs text-brand-orange flex items-center space-x-1 font-medium bg-brand-orange/5 p-1.5 border border-brand-orange/10 rounded-none">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Notice: Net profit is greater than gross revenue. Double check your entries!</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400">Monthly profit (revenue minus all operational costs & founder SDE)</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Traffic Input */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-semibold text-slate-700" htmlFor="monthly-traffic">
            <span>Average Monthly Traffic (Uniques)</span>
          </label>
          <div className="relative rounded-none shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <input
              id="monthly-traffic"
              type="text"
              pattern="[0-9]*"
              placeholder="e.g. 50,000"
              value={monthlyTraffic}
              onChange={(e) => onTrafficChange(e.target.value.replace(/\D/g, ""))}
              className="block w-full pl-10 pr-4 py-3 rounded-none border border-black/10 focus:border-brand-green focus:ring-2 focus:ring-brand-green/10 bg-white focus:outline-none transition-all"
            />
          </div>
          <p className="text-xs text-slate-400">Unique visitors per month from GA/Search Console</p>
        </div>

        {/* Traffic Sources Multi-select */}
        <div className="space-y-2">
          <span className="block text-sm font-semibold text-slate-700">Primary Traffic Sources</span>
          <div className="flex flex-wrap gap-2 pt-1">
            {availableTrafficSources.map((source) => {
              const isSelected = trafficSources.includes(source);
              return (
                <button
                  type="button"
                  key={source}
                  onClick={() => handleSourceToggle(source)}
                  className={`px-3 py-1.5 rounded-none text-xs font-medium border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-brand-green/5 border-brand-green/20 text-brand-green font-bold"
                      : "bg-white border-black/10 text-slate-600 hover:border-black/20"
                  }`}
                >
                  {source}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
