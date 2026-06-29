import React from "react";
import ListingWizard from "../../../../components/listings/listing-wizard.tsx";
import { Plus } from "lucide-react";

export default function SellerNewListingPage() {
  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/10 pb-6">
        <div>
          <h1 className="text-3xl font-serif italic font-black text-brand-dark tracking-tight flex items-center space-x-2">
            <Plus className="w-6 h-6 text-brand-green" />
            <span>Create Listing Wizard</span>
          </h1>
          <p className="text-sm text-brand-dark/70">Provide accurate details about your digital business to find high-intent buyers.</p>
        </div>
      </div>
      <ListingWizard />
    </div>
  );
}
