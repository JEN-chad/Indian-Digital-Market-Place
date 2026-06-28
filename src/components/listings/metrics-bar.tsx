import React from "react";
import { formatCurrency } from "../../../lib/utils.ts";

interface MetricsBarProps {
  monthlyRevenue: number;
  monthlyProfit: number;
  askingPrice: number;
  monthlyTraffic?: number;
  hideDetails?: boolean;
}

export function MetricsBar({
  monthlyRevenue,
  monthlyProfit,
  askingPrice,
  monthlyTraffic = 0,
  hideDetails = false,
}: MetricsBarProps) {
  // Calculations
  const profitMargin = monthlyRevenue > 0 ? Math.round((monthlyProfit / monthlyRevenue) * 100) : 0;
  const annualRevenue = monthlyRevenue * 12;
  const revMultiple = annualRevenue > 0 ? (askingPrice / annualRevenue).toFixed(1) : "N/A";

  // Helpers for hidden/ranges to comply with rule: "Listing cards show ONLY public info (no revenue exact if NDA required — show ranges like "₹1L–₹5L MRR")"
  const formatRange = (val: number) => {
    if (val < 50000) return "Under ₹50k";
    if (val < 100000) return "₹50k - ₹1L";
    if (val < 300000) return "₹1L - ₹3L";
    if (val < 500000) return "₹3L - ₹5L";
    if (val < 1000000) return "₹5L - ₹10L";
    return "₹10L+";
  };

  const metrics = [
    {
      label: "Monthly Revenue",
      value: hideDetails ? `${formatRange(monthlyRevenue)} MRR` : formatCurrency(monthlyRevenue),
      highlight: true,
    },
    {
      label: "Monthly Profit",
      value: hideDetails ? `${formatRange(monthlyProfit)} Net` : formatCurrency(monthlyProfit),
      highlight: true,
    },
    {
      label: "Profit Margin",
      value: `${profitMargin}%`,
      highlight: false,
    },
    {
      label: "Asking Price",
      value: formatCurrency(askingPrice),
      highlight: true,
    },
    {
      label: "Revenue Multiple",
      value: `${revMultiple}x ARR`,
      highlight: false,
    },
    {
      label: "Monthly Traffic",
      value: monthlyTraffic > 0 ? monthlyTraffic.toLocaleString("en-IN") : "N/A",
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border border-black/10 divide-x divide-y divide-black/10 bg-white">
      {metrics.map((metric, i) => (
        <div
          key={i}
          className={`p-4 flex flex-col justify-center ${
            metric.highlight ? "bg-brand-cream/10" : ""
          } border-black/10`}
          style={{
            borderLeft: i % 2 === 0 && i !== 0 ? "none" : undefined,
            borderTop: i < 2 ? "none" : undefined,
          }}
        >
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-dark/50">
            {metric.label}
          </span>
          <span
            className={`mt-1 font-serif font-black tracking-tight ${
              metric.highlight ? "text-brand-green text-lg md:text-xl" : "text-brand-dark text-base"
            }`}
          >
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  );
}
