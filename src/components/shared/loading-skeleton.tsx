import React from "react";
import { cn } from "../../../lib/utils.ts";

// Reusable shadcn-like Skeleton base component
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-[#1A1A1A]/5 border border-black/[0.03]", className)}
      {...props}
    />
  );
}

// 1. Metrics Card Skeleton
export function MetricsCardSkeleton() {
  return (
    <div className="bg-white border border-black/10 p-6 rounded-none space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="w-10 h-10" />
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

// 2. Listing Card Skeleton (matches exact dimensions of ListingCard)
export function ListingCardSkeleton() {
  return (
    <div className="bg-white border border-black/10 rounded-none overflow-hidden flex flex-col h-full">
      {/* Cover placeholder */}
      <Skeleton className="h-44 w-full" />
      
      {/* Card Content placeholder */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3.5 w-full" />
        </div>

        {/* Metrics Row (3 cols) */}
        <div className="border-t border-b border-black/5 py-3 grid grid-cols-3 gap-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex flex-col items-center space-y-1.5">
              <Skeleton className="h-2.5 w-12" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          ))}
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
    </div>
  );
}

// 3. Deal Card Skeleton
export function DealCardSkeleton() {
  return (
    <div className="bg-white border border-black/10 p-5 rounded-none space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      
      {/* Progress slider placeholder */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between text-xs">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-8" />
        </div>
        <Skeleton className="h-2 w-full" />
      </div>
      
      <div className="border-t border-black/5 pt-3 flex justify-between items-center">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

// 4. Offer Card Skeleton
export function OfferCardSkeleton() {
  return (
    <div className="bg-white border border-black/10 p-5 rounded-none space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>

      <div className="border-t border-b border-black/5 py-3 grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-4.5 w-24" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-4.5 w-24" />
        </div>
      </div>

      <div className="flex justify-between items-center pt-1">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

// 5. Notification Skeleton
export function NotificationSkeleton() {
  return (
    <div className="bg-white border border-black/10 p-4 rounded-none flex gap-3">
      <Skeleton className="w-1.5 h-1.5 mt-2 rounded-full shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-2.5 w-12" />
        </div>
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

// 6. Chat Message Skeleton (3 alternating left/right bubbles)
export function ChatMessageSkeleton() {
  return (
    <div className="space-y-4 p-4 min-h-[200px] flex flex-col justify-end">
      {/* 1. Left Bubble */}
      <div className="flex justify-start">
        <div className="space-y-1 max-w-[70%]">
          <Skeleton className="h-10 w-64 rounded-xl rounded-tl-none bg-black/5" />
          <Skeleton className="h-2 w-12" />
        </div>
      </div>
      
      {/* 2. Right Bubble */}
      <div className="flex justify-end">
        <div className="space-y-1 max-w-[70%] items-end flex flex-col">
          <Skeleton className="h-8 w-48 rounded-xl rounded-tr-none bg-brand-green/10" />
          <Skeleton className="h-2 w-12" />
        </div>
      </div>

      {/* 3. Left Bubble */}
      <div className="flex justify-start">
        <div className="space-y-1 max-w-[70%]">
          <Skeleton className="h-12 w-80 rounded-xl rounded-tl-none bg-black/5" />
          <Skeleton className="h-2 w-12" />
        </div>
      </div>
    </div>
  );
}

// 7. Table Row Skeleton
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-black/5">
      <td className="p-4"><Skeleton className="h-4 w-12" /></td>
      <td className="p-4"><Skeleton className="h-4 w-48" /></td>
      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
      <td className="p-4"><Skeleton className="h-4 w-16" /></td>
      <td className="p-4"><Skeleton className="h-7 w-20" /></td>
    </tr>
  );
}

// 8. KYC Status Skeleton
export function KycStatusSkeleton() {
  return (
    <div className="bg-white border border-black/10 p-6 rounded-none space-y-6">
      <div className="flex items-center gap-4 border-b border-black/5 pb-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-black/[0.05] p-4 space-y-2.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// 9. Dashboard Stats Skeleton (4 cards)
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <MetricsCardSkeleton />
      <MetricsCardSkeleton />
      <MetricsCardSkeleton />
      <MetricsCardSkeleton />
    </div>
  );
}

// Combined export containing all skeletons
const Skeletons = {
  Skeleton,
  MetricsCardSkeleton,
  ListingCardSkeleton,
  DealCardSkeleton,
  OfferCardSkeleton,
  NotificationSkeleton,
  ChatMessageSkeleton,
  TableRowSkeleton,
  KycStatusSkeleton,
  DashboardStatsSkeleton
};

export default Skeletons;
