import React, { useState, useEffect } from "react";
import { ListingSearch } from "../../../components/listings/listing-search.tsx";
import { ListingFilters, FilterParams } from "../../../components/listings/listing-filters.tsx";
import { ListingGrid } from "../../../components/listings/listing-grid.tsx";
import { SlidersHorizontal } from "lucide-react";

// URL Helpers for Hash-based router
function parseHashQueryParams(): FilterParams & { search: string; sort: string; page: string } {
  const hash = window.location.hash;
  const questionIndex = hash.indexOf("?");
  const result: FilterParams & { search: string; sort: string; page: string } = {
    assetTypes: [],
    industries: [],
    minRev: "",
    maxRev: "",
    minPrice: "",
    maxPrice: "",
    age: "",
    search: "",
    sort: "newest",
    page: "1",
  };

  if (questionIndex === -1) return result;
  
  const queryString = hash.substring(questionIndex + 1);
  const urlParams = new URLSearchParams(queryString);

  const types = urlParams.get("type");
  if (types) result.assetTypes = types.split(",");

  const inds = urlParams.get("industry");
  if (inds) result.industries = inds.split(",");

  result.minRev = urlParams.get("minRev") || "";
  result.maxRev = urlParams.get("maxRev") || "";
  result.minPrice = urlParams.get("minPrice") || "";
  result.maxPrice = urlParams.get("maxPrice") || "";
  result.age = urlParams.get("age") || "";
  result.search = urlParams.get("search") || "";
  result.sort = urlParams.get("sort") || "newest";
  result.page = urlParams.get("page") || "1";

  return result;
}

function updateHashQueryParams(path: string, params: Record<string, any>) {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null && val !== "") {
      if (Array.isArray(val)) {
        if (val.length > 0) urlParams.set(key, val.join(","));
      } else {
        urlParams.set(key, String(val));
      }
    }
  });
  const queryString = urlParams.toString();
  window.location.hash = `#${path}${queryString ? "?" + queryString : ""}`;
}

export default function BrowseListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Parse state from Hash URL on mount/hashchange
  const [queryParams, setQueryParams] = useState(parseHashQueryParams());

  useEffect(() => {
    const handleHashChange = () => {
      setQueryParams(parseHashQueryParams());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Fetch from our comprehensive server API
  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const urlParams = new URLSearchParams();
      if (queryParams.assetTypes.length > 0) urlParams.set("type", queryParams.assetTypes.join(","));
      if (queryParams.industries.length > 0) urlParams.set("industry", queryParams.industries.join(","));
      if (queryParams.minRev) urlParams.set("minRevenue", queryParams.minRev);
      if (queryParams.maxRev) urlParams.set("maxRevenue", queryParams.maxRev);
      if (queryParams.minPrice) urlParams.set("minPrice", queryParams.minPrice);
      if (queryParams.maxPrice) urlParams.set("maxPrice", queryParams.maxPrice);
      if (queryParams.age) urlParams.set("age", queryParams.age);
      if (queryParams.search) urlParams.set("search", queryParams.search);
      if (queryParams.sort) urlParams.set("sort", queryParams.sort);
      if (queryParams.page) urlParams.set("page", queryParams.page);

      const res = await fetch(`/api/listings?${urlParams.toString()}`);
      if (!res.ok) throw new Error("Failed to load listings");
      const data = await res.json();
      setListings(data.listings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [queryParams]);

  const handleApplyFilters = (nextFilters: FilterParams) => {
    updateHashQueryParams("/listings", {
      ...queryParams,
      ...nextFilters,
      page: "1", // reset page
    });
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    updateHashQueryParams("/listings", {
      sort: queryParams.sort,
      search: queryParams.search,
      page: "1",
    });
    setShowMobileFilters(false);
  };

  const handleSearchChange = (val: string) => {
    updateHashQueryParams("/listings", {
      ...queryParams,
      search: val,
      page: "1",
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateHashQueryParams("/listings", {
      ...queryParams,
      sort: e.target.value,
    });
  };

  const handleCardClick = (slug: string) => {
    window.location.hash = `#/listings/${slug}`;
  };

  // Convert types mapping to renderable
  const filterParamsOnly: FilterParams = {
    assetTypes: queryParams.assetTypes,
    industries: queryParams.industries,
    minRev: queryParams.minRev,
    maxRev: queryParams.maxRev,
    minPrice: queryParams.minPrice,
    maxPrice: queryParams.maxPrice,
    age: queryParams.age,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Page Title & Tagline */}
      <div className="space-y-2 border-b border-black/10 pb-6">
        <h1 className="text-3xl md:text-4xl font-serif italic font-black text-brand-dark tracking-tight leading-none uppercase">
          Browse Businesses for Sale
        </h1>
        <p className="text-xs font-semibold tracking-wider text-brand-dark/50 uppercase">
          Explore vetted tech, D2C brands, SaaS platforms, and digital properties.
        </p>
      </div>

      {/* Control row: Search and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:max-w-md">
          <ListingSearch value={queryParams.search} onChange={handleSearchChange} />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {/* Mobile Filter Trigger */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="sm:hidden flex items-center gap-2 px-4 py-3 bg-[#F7F5F0] border border-black/10 text-xs font-bold uppercase tracking-wider text-brand-dark/80 rounded-none cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-dark/50 shrink-0">
              Sort By
            </span>
            <select
              value={queryParams.sort}
              onChange={handleSortChange}
              className="border border-black/10 bg-white px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-green rounded-none uppercase tracking-wider text-brand-dark/70"
            >
              <option value="newest">Newest Listed</option>
              <option value="highest_revenue">Highest Revenue</option>
              <option value="lowest_price">Lowest Price</option>
              <option value="highest_price">Highest Price</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid & Filters Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1">
          <ListingFilters
            filters={filterParamsOnly}
            onApply={handleApplyFilters}
            onClear={handleClearFilters}
          />
        </div>

        {/* Mobile Slide-down Filters */}
        {showMobileFilters && (
          <div className="block lg:hidden border-b border-black/10 pb-6">
            <ListingFilters
              filters={filterParamsOnly}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
            />
          </div>
        )}

        {/* Listings Grid (3 cols on lg) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold uppercase tracking-widest text-brand-dark/50 border-b border-black/[0.05] pb-2">
            <span>Market Directory</span>
            <span>Showing {listings.length} Results</span>
          </div>

          <ListingGrid
            listings={listings}
            isLoading={isLoading}
            onCardClick={handleCardClick}
          />
        </div>

      </div>
    </div>
  );
}
