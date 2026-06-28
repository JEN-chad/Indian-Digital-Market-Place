import React from "react";
import { ListCollapse, Inbox } from "lucide-react";
import { ListingCard } from "./listing-card.tsx";
import { AssetType } from "./asset-type-badge.tsx";

interface GridItem {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  assetType: AssetType;
  industry: string;
  askingPrice: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  ndaRequired: boolean;
  isFeatured: boolean;
  coverImageUrl?: string;
}

interface ListingGridProps {
  listings: GridItem[];
  isLoading: boolean;
  onCardClick: (slug: string) => void;
}

export function ListingGrid({ listings, isLoading, onCardClick }: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border border-black/10 bg-white p-5 flex flex-col space-y-4 animate-pulse"
          >
            <div className="h-44 bg-[#F7F5F0] w-full" />
            <div className="space-y-2">
              <div className="h-3 bg-[#F7F5F0] w-1/4" />
              <div className="h-5 bg-[#F7F5F0] w-3/4" />
              <div className="h-4 bg-[#F7F5F0] w-full" />
            </div>
            <div className="h-10 bg-[#F7F5F0] w-full border-t border-b border-black/5" />
            <div className="flex justify-between items-center">
              <div className="h-3 bg-[#F7F5F0] w-1/4" />
              <div className="h-5 bg-[#F7F5F0] w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-20 bg-white border border-black/10 p-8 space-y-4">
        <div className="p-4 bg-brand-green/5 border border-brand-green/10 text-brand-green inline-block rounded-none">
          <Inbox className="w-10 h-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-serif italic font-black text-brand-dark">No Listings Match Filters</h3>
          <p className="text-xs text-brand-dark/60 max-w-md mx-auto">
            Try adjusting your asset types, search keywords, or financial filters to find suitable active listings.
          </p>
        </div>
      </div>
    );
  }

  // Ensure featured listings are sorted first
  const sortedListings = [...listings].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedListings.map((item) => (
        <ListingCard
          key={item.id}
          id={item.id}
          title={item.title}
          slug={item.slug}
          tagline={item.tagline}
          assetType={item.assetType}
          industry={item.industry}
          askingPrice={item.askingPrice}
          monthlyRevenue={item.monthlyRevenue}
          monthlyProfit={item.monthlyProfit}
          ndaRequired={item.ndaRequired}
          isFeatured={item.isFeatured}
          coverImageUrl={item.coverImageUrl}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}
