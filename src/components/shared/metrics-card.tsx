import React, { useEffect, useRef } from "react";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";

interface MetricsCardProps {
  number: number;
  label: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon?: LucideIcon;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
}

export function MetricsCard({
  number,
  label,
  trend,
  icon: Icon,
  prefix = "",
  suffix = "",
  isCurrency = false
}: MetricsCardProps) {
  const numberRef = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    motionValue.set(number);
  }, [number, motionValue]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (numberRef.current) {
        let displayVal = Math.round(latest);
        if (isCurrency) {
          // Format as Indian Rupee style (Lakhs/Crores if large)
          if (displayVal >= 10000000) {
            numberRef.current.textContent = `₹${(displayVal / 10000000).toFixed(2)} Cr`;
          } else if (displayVal >= 100000) {
            numberRef.current.textContent = `₹${(displayVal / 100000).toFixed(2)} L`;
          } else {
            numberRef.current.textContent = `₹${displayVal.toLocaleString("en-IN")}`;
          }
        } else {
          numberRef.current.textContent = `${prefix}${displayVal.toLocaleString()}${suffix}`;
        }
      }
    });
  }, [springValue, isCurrency, prefix, suffix]);

  return (
    <div className="bg-white border border-black/10 p-6 rounded-none relative overflow-hidden transition-all duration-300 hover:border-brand-green/30 group">
      {/* Background Micro-animation Highlight */}
      <div className="absolute inset-0 bg-brand-green/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="flex justify-between items-start">
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-brand-dark/50 uppercase tracking-widest">
            {label}
          </p>
          <div className="flex items-baseline space-x-1.5">
            <span 
              ref={numberRef} 
              className="text-3xl font-serif italic font-black text-brand-dark"
            >
              {isCurrency ? `₹${number.toLocaleString("en-IN")}` : `${prefix}${number}${suffix}`}
            </span>
          </div>
        </div>

        {Icon && (
          <div className="p-3 bg-brand-green/5 text-brand-green border border-brand-green/10 group-hover:bg-brand-green group-hover:text-white transition-all duration-300">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center space-x-1.5 text-xs">
          <span
            className={`inline-flex items-center font-bold px-1.5 py-0.5 rounded-none font-mono text-[10px] ${
              trend.isPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-rose-50 text-rose-700 border border-rose-100"
            }`}
          >
            {trend.isPositive ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            )}
            {trend.value}%
          </span>
          <span className="text-[10px] font-semibold text-brand-dark/50 uppercase tracking-wider">
            {trend.label || "vs last period"}
          </span>
        </div>
      )}
    </div>
  );
}
export default MetricsCard;
