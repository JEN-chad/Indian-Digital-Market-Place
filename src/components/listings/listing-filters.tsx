import React, { useState, useEffect } from "react";
import { Filter, X, Search, ChevronDown, RotateCcw } from "lucide-react";
import { ASSET_TYPES, INDUSTRIES } from "../../../config/constants.ts";

export interface FilterParams {
  assetTypes: string[];
  industries: string[];
  minRev: string;
  maxRev: string;
  minPrice: string;
  maxPrice: string;
  age: string;
}

interface ListingFiltersProps {
  filters: FilterParams;
  onApply: (filters: FilterParams) => void;
  onClear: () => void;
}

export function ListingFilters({ filters, onApply, onClear }: ListingFiltersProps) {
  // Local states for inputs before applying
  const [assetTypes, setAssetTypes] = useState<string[]>(filters.assetTypes);
  const [industries, setIndustries] = useState<string[]>(filters.industries);
  const [minRev, setMinRev] = useState(filters.minRev);
  const [maxRev, setMaxRev] = useState(filters.maxRev);
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const [age, setAge] = useState(filters.age);

  // Search filter for industries list
  const [industrySearch, setIndustrySearch] = useState("");
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);

  // Update local states when parent filters change
  useEffect(() => {
    setAssetTypes(filters.assetTypes);
    setIndustries(filters.industries);
    setMinRev(filters.minRev);
    setMaxRev(filters.maxRev);
    setMinPrice(filters.minPrice);
    setMaxPrice(filters.maxPrice);
    setAge(filters.age);
  }, [filters]);

  const handleAssetTypeChange = (value: string) => {
    setAssetTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const handleIndustryChange = (value: string) => {
    setIndustries((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  };

  const handleApply = () => {
    onApply({
      assetTypes,
      industries,
      minRev,
      maxRev,
      minPrice,
      maxPrice,
      age,
    });
  };

  const handleReset = () => {
    setAssetTypes([]);
    setIndustries([]);
    setMinRev("");
    setMaxRev("");
    setMinPrice("");
    setMaxPrice("");
    setAge("");
    onClear();
  };

  const filteredIndustries = INDUSTRIES.filter((ind) =>
    ind.toLowerCase().includes(industrySearch.toLowerCase())
  );

  return (
    <div className="bg-white border border-black/10 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/10 pb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-green" />
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-brand-dark">
            Filter Listings
          </span>
        </div>
        <button
          onClick={handleReset}
          className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50 hover:text-rose-600 flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Clear All</span>
        </button>
      </div>

      {/* Asset Types Checkboxes */}
      <div className="space-y-3">
        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50 block">
          Asset Type
        </label>
        <div className="grid grid-cols-1 gap-2">
          {ASSET_TYPES.map((type) => {
            const isChecked = assetTypes.includes(type.value);
            return (
              <label
                key={type.value}
                className={`flex items-center gap-3 px-3 py-2 border cursor-pointer select-none transition-all ${
                  isChecked
                    ? "border-brand-green bg-brand-green/5 text-brand-green font-bold"
                    : "border-black/5 hover:bg-[#F7F5F0] text-brand-dark/70"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleAssetTypeChange(type.value)}
                  className="hidden"
                />
                <span
                  className={`w-3.5 h-3.5 border flex items-center justify-center transition-all ${
                    isChecked ? "border-brand-green bg-brand-green" : "border-black/20 bg-white"
                  }`}
                >
                  {isChecked && <span className="w-1.5 h-1.5 bg-white" />}
                </span>
                <span className="text-xs uppercase tracking-wider">{type.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Monthly Revenue Filter */}
      <div className="space-y-3">
        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50 block">
          Monthly Revenue (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-brand-dark/40 font-mono">₹</span>
            <input
              type="number"
              placeholder="Min"
              value={minRev}
              onChange={(e) => setMinRev(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-white border border-black/10 text-xs font-semibold focus:outline-none focus:border-brand-green rounded-none"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-brand-dark/40 font-mono">₹</span>
            <input
              type="number"
              placeholder="Max"
              value={maxRev}
              onChange={(e) => setMaxRev(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-white border border-black/10 text-xs font-semibold focus:outline-none focus:border-brand-green rounded-none"
            />
          </div>
        </div>
      </div>

      {/* Asking Price Filter */}
      <div className="space-y-3">
        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50 block">
          Asking Price (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-brand-dark/40 font-mono">₹</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-white border border-black/10 text-xs font-semibold focus:outline-none focus:border-brand-green rounded-none"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-brand-dark/40 font-mono">₹</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full pl-7 pr-3 py-2 bg-white border border-black/10 text-xs font-semibold focus:outline-none focus:border-brand-green rounded-none"
            />
          </div>
        </div>
      </div>

      {/* Searchable Industry Dropdown/Checkboxes */}
      <div className="space-y-3 relative">
        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50 block">
          Industry
        </label>
        <button
          type="button"
          onClick={() => setIsIndustryDropdownOpen(!isIndustryDropdownOpen)}
          className="w-full border border-black/10 bg-white px-3 py-2.5 text-xs font-semibold text-left flex items-center justify-between hover:bg-[#F7F5F0] transition-colors rounded-none uppercase tracking-wider text-brand-dark/70"
        >
          <span>
            {industries.length === 0
              ? "All Industries"
              : `${industries.length} Selected`}
          </span>
          <ChevronDown className="w-4 h-4 text-brand-dark/50" />
        </button>

        {isIndustryDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-black/10 z-20 shadow-lg p-3 space-y-2 max-h-60 overflow-y-auto rounded-none">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-brand-dark/40" />
              <input
                type="text"
                placeholder="Search Industry..."
                value={industrySearch}
                onChange={(e) => setIndustrySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-white border border-black/10 text-xs font-semibold focus:outline-none focus:border-brand-green rounded-none uppercase tracking-wider"
              />
            </div>
            <div className="space-y-1 pt-1">
              {filteredIndustries.map((ind) => {
                const isSelected = industries.includes(ind);
                return (
                  <label
                    key={ind}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-[#F7F5F0] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleIndustryChange(ind)}
                      className="rounded border-black/10 text-brand-green focus:ring-brand-green"
                    />
                    <span className="text-brand-dark/80">{ind}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Business Age Filter */}
      <div className="space-y-3">
        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50 block">
          Business Age
        </label>
        <select
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="w-full border border-black/10 bg-white px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-brand-green rounded-none uppercase tracking-wider text-brand-dark/70"
        >
          <option value="">Any Age</option>
          <option value="0-1">0 - 1 Year</option>
          <option value="1-3">1 - 3 Years</option>
          <option value="3-5">3 - 5 Years</option>
          <option value="5+">5+ Years</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleApply}
          className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-bold py-3 text-xs uppercase tracking-widest border border-brand-green transition-all cursor-pointer rounded-none"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
