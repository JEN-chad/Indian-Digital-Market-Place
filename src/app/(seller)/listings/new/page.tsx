import React from "react";
import ListingWizard from "../../../../components/listings/listing-wizard.tsx";

export default function SellerNewListingPage() {
  return (
    <div className="py-4">
      <div className="max-w-5xl mx-auto px-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Create Listing Wizard</h1>
        <p className="text-sm text-slate-500">Provide accurate details about your digital business to find high-intent buyers.</p>
      </div>
      <ListingWizard />
    </div>
  );
}
