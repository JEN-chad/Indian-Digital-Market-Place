import React, { useState } from "react";
import { Lock, FileText, CheckCircle2, Globe, Users, Clock, Building, ArrowRight, ShieldAlert, Sparkles, MessageSquare } from "lucide-react";
import { AssetTypeBadge } from "./asset-type-badge.tsx";
import { MetricsBar } from "./metrics-bar.tsx";
import { NdaModal } from "../documents/nda-modal.tsx";
import { formatCurrency, formatDate } from "../../../lib/utils.ts";
import { ListingCard } from "./listing-card.tsx";
import { OfferForm } from "../deal-room/offer-form.tsx";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  url: string;
  isPrivate: boolean;
}

interface DetailListing {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  assetType: "saas" | "ecommerce" | "app" | "blog" | "domain" | "content_site" | "service";
  industry: string;
  businessModel: string;
  yearEstablished: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  monthlyTraffic: number;
  trafficSources?: string;
  askingPrice: number;
  ndaRequired: boolean;
  ndaFee: number;
  businessUrl?: string;
  businessNamePrivate?: string;
  teamSize?: number;
  hoursPerWeek?: number;
  isFeatured: boolean;
  coverImageUrl?: string;
  createdAt: string;
  documents?: DocumentItem[];
}

interface ListingDetailProps {
  listing: DetailListing;
  hasSignedNda: boolean;
  isKycApproved: boolean;
  buyerUser: { email: string; name: string; phone?: string; id?: string } | null;
  similarListings: any[];
  onNdaSuccess: () => void;
  onContactSeller?: () => void;
  onNavigateToListing: (slug: string) => void;
}

export function ListingDetail({
  listing,
  hasSignedNda,
  isKycApproved,
  buyerUser,
  similarListings,
  onNdaSuccess,
  onContactSeller,
  onNavigateToListing,
}: ListingDetailProps) {
  const [isNdaModalOpen, setIsNdaModalOpen] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [showOfferForm, setShowOfferForm] = useState(false);

  const isLocked = listing.ndaRequired && !hasSignedNda;

  // Truncate description at 200 chars if NDA is required and not signed
  const displayedDescription = isLocked
    ? `${listing.description?.substring(0, 200)}...`
    : listing.description;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isKycApproved) return;
    setContactSuccess(true);
    setContactMessage("");
    setTimeout(() => {
      setContactSuccess(false);
    }, 5000);
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto p-6 md:p-8">
      {/* 1. ABOVE-THE-FOLD HEADER */}
      <div className="space-y-4 border-b border-black/10 pb-6">
        <div className="flex flex-wrap gap-2 items-center">
          <AssetTypeBadge type={listing.assetType} />
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FDFCFB] bg-brand-green px-2 py-0.5">
            {listing.industry}
          </span>
          {listing.isFeatured && (
            <span className="inline-flex items-center gap-1 bg-brand-orange text-white font-mono font-bold uppercase rounded-none tracking-wider px-2 py-0.5 text-[9px]">
              <Sparkles className="w-2.5 h-2.5" />
              <span>Featured Asset</span>
            </span>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-serif italic font-black text-brand-dark tracking-tight leading-none">
            {isLocked ? listing.title : listing.businessNamePrivate || listing.title}
          </h1>
          <p className="text-sm text-brand-dark/70 font-sans max-w-2xl leading-relaxed">
            {listing.tagline}
          </p>
        </div>
      </div>

      {/* 2. METRICS BAR */}
      <MetricsBar
        monthlyRevenue={listing.monthlyRevenue}
        monthlyProfit={listing.monthlyProfit}
        askingPrice={listing.askingPrice}
        monthlyTraffic={listing.monthlyTraffic}
        hideDetails={isLocked}
      />

      {/* 3. TWO COLUMN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left, 2 cols on lg) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Business Overview & Description */}
          <div className="space-y-4">
            <h2 className="text-lg font-serif italic font-black text-brand-dark border-b border-black/10 pb-2 uppercase tracking-wide">
              Business Overview
            </h2>
            <p className="text-xs text-brand-dark/85 leading-relaxed font-sans whitespace-pre-line">
              {displayedDescription}
            </p>
          </div>

          {/* GATED GUEST LOCK OUT / SIGN NDA CALLOUT */}
          {isLocked && (
            <div className="bg-[#F7F5F0] border border-black/10 p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-brand-green/5 border border-brand-green/10 text-brand-green shrink-0">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-2 text-center md:text-left flex-1">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-dark">
                  Unlock Full Details &amp; Financial Sheets
                </h3>
                <p className="text-xs text-brand-dark/70 font-sans leading-relaxed">
                  To view verified URLs, detailed traffic breakdowns, exact P&amp;L spreadsheets, and private files, you must sign the digital Mutual Non-Disclosure Agreement.
                </p>
              </div>
              <button
                onClick={() => setIsNdaModalOpen(true)}
                className="bg-brand-green hover:bg-brand-green/95 text-white font-bold text-xs uppercase tracking-widest px-6 py-3 border border-brand-green transition-all cursor-pointer whitespace-nowrap rounded-none"
              >
                Sign NDA to Unlock
              </button>
            </div>
          )}

          {/* UNLOCKED GATED INFORMATION */}
          {!isLocked && (
            <div className="space-y-8 animate-fade-in">
              
              {/* Private Financial Details */}
              <div className="space-y-4">
                <h2 className="text-lg font-serif italic font-black text-brand-dark border-b border-black/10 pb-2 uppercase tracking-wide">
                  Verified Operational &amp; Traffic Breakdowns
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="border border-black/5 p-4 bg-white">
                    <span className="text-[10px] font-mono font-bold uppercase text-brand-dark/40 tracking-widest block">
                      Operational URL
                    </span>
                    <a
                      href={listing.businessUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-green hover:underline mt-1 inline-flex items-center gap-1.5"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{listing.businessUrl || "No URL Registered"}</span>
                    </a>
                  </div>

                  <div className="border border-black/5 p-4 bg-white">
                    <span className="text-[10px] font-mono font-bold uppercase text-brand-dark/40 tracking-widest block">
                      Target Traffic Sources
                    </span>
                    <p className="text-xs font-semibold text-brand-dark mt-1">
                      {listing.trafficSources || "Organic search, word-of-mouth, direct marketing"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verified Attachments Section */}
              <div className="space-y-4">
                <h2 className="text-lg font-serif italic font-black text-brand-dark border-b border-black/10 pb-2 uppercase tracking-wide">
                  Verified Audit Documents
                </h2>
                <div className="space-y-2">
                  {listing.documents && listing.documents.length > 0 ? (
                    listing.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="group flex items-center justify-between p-4 bg-[#F7F5F0] border border-black/5 transition-all hover:bg-brand-green/[0.02]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-brand-green/5 border border-brand-green/10 text-brand-green">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-brand-dark group-hover:text-brand-green transition-colors">
                              {doc.name}
                            </p>
                            <p className="text-[9px] font-mono font-bold text-brand-dark/50 uppercase tracking-wider mt-0.5">
                              {doc.type} &bull; SECURE PLATFORM WATERMARK APPLIED
                            </p>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-brand-green text-white font-bold text-[10px] uppercase tracking-widest px-4 py-2 border border-brand-green hover:bg-brand-green/90 transition-all rounded-none"
                        >
                          View Document
                        </a>
                      </div>
                    ))
                  ) : (
                    <div className="border border-dashed border-black/10 p-6 text-center text-xs text-brand-dark/50 font-mono uppercase tracking-widest">
                      No additional files uploaded for this listing.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Sidebar Panel (Right, 1 col on lg) */}
        <div className="space-y-6">
          
          {/* Operational Quick Stats */}
          <div className="bg-white border border-black/10 p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-dark border-b border-black/10 pb-3">
              Operational Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-dark/50 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  <span>Business Model</span>
                </span>
                <span className="font-bold text-brand-dark capitalize">
                  {listing.businessModel || "Subscription"}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-dark/50 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Established</span>
                </span>
                <span className="font-bold text-brand-dark font-mono">
                  {listing.yearEstablished || "2022"}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-dark/50 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Team Size</span>
                </span>
                <span className="font-bold text-brand-dark font-mono">
                  {listing.teamSize !== undefined ? listing.teamSize : "2"} members
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-brand-dark/50 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Operational Hours</span>
                </span>
                <span className="font-bold text-brand-dark font-mono">
                  {listing.hoursPerWeek !== undefined ? listing.hoursPerWeek : "10"} hrs / wk
                </span>
              </div>
            </div>
          </div>

          {/* Contact Seller Action Card */}
          <div className="bg-white border border-black/10 p-5 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-dark border-b border-black/10 pb-3">
              Initiate Offer / Contact
            </h3>
            
            {/* If KYC not approved, show barrier */}
            {!isKycApproved ? (
              <div className="p-4 bg-rose-50 border border-rose-100/60 text-rose-800 space-y-2">
                <div className="flex items-start gap-2 text-xs font-semibold">
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>Contact Blocked</span>
                </div>
                <p className="text-[10px] leading-relaxed text-rose-950/70">
                  You must obtain verified **KYC Approval** to message sellers, initiate acquisitions, or submit written financial bids. Complete your investor profile from dashboard.
                </p>
              </div>
            ) : isLocked ? (
              <div className="p-4 bg-brand-cream/10 border border-black/5 text-brand-dark/60 text-xs text-center space-y-2">
                <Lock className="w-5 h-5 mx-auto text-brand-dark/40" />
                <p className="font-mono text-[10px] uppercase tracking-wider">
                  NDA Agreement Pending
                </p>
                <p className="text-[10px] leading-normal font-sans">
                  Complete the NDA first to activate direct communication channels with the asset seller.
                </p>
              </div>
            ) : showOfferForm ? (
              <OfferForm
                listingId={listing.id}
                listingTitle={listing.title}
                onCancel={() => setShowOfferForm(false)}
                onSuccess={() => setShowOfferForm(false)}
              />
            ) : (
              <div className="space-y-4">
                <form onSubmit={handleContactSubmit} className="space-y-3">
                  <textarea
                    required
                    placeholder="Introduce yourself, proof-of-funds range, and any questions you'd like to ask the seller about this asset..."
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full bg-white border border-black/10 p-3 text-xs focus:outline-none focus:border-brand-green rounded-none"
                  />
                  
                  {contactSuccess ? (
                    <div className="p-3 bg-brand-green/5 border border-brand-green/10 text-brand-green text-[10px] uppercase font-mono tracking-wider font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Inquiry Sent Successfully!</span>
                    </div>
                  ) : (
                    <button
                      type="submit"
                      className="w-full bg-brand-green hover:bg-brand-green/90 text-white font-bold py-3 text-xs uppercase tracking-widest border border-brand-green transition-all cursor-pointer rounded-none flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Contact Seller</span>
                    </button>
                  )}
                </form>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-black/10"></div>
                  <span className="flex-shrink mx-4 text-brand-dark/40 text-[9px] font-mono uppercase tracking-widest font-bold">OR</span>
                  <div className="flex-grow border-t border-black/10"></div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowOfferForm(true)}
                  className="w-full bg-brand-cream border border-brand-green text-brand-green hover:bg-brand-cream/80 font-black py-3 text-xs uppercase tracking-widest transition-all cursor-pointer rounded-none flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Submit Formal M&A Offer</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 4. SIMILAR LISTINGS */}
      <div className="space-y-6 pt-6 border-t border-black/10">
        <h2 className="text-xl font-serif italic font-black text-brand-dark uppercase tracking-wide">
          Similar Digital Assets
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similarListings.length > 0 ? (
            similarListings.map((item) => (
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
                onClick={onNavigateToListing}
              />
            ))
          ) : (
            <div className="col-span-1 md:col-span-3 border border-dashed border-black/10 p-8 text-center text-xs text-brand-dark/50 font-mono uppercase tracking-widest">
              No matching similar assets found in sandbox.
            </div>
          )}
        </div>
      </div>

      {/* NDA SIGNING MODAL CONTROL */}
      {buyerUser && (
        <NdaModal
          isOpen={isNdaModalOpen}
          onClose={() => setIsNdaModalOpen(false)}
          listingId={listing.id}
          listingTitle={listing.title}
          ndaFee={listing.ndaFee}
          buyerEmail={buyerUser.email}
          buyerName={buyerUser.name}
          buyerPhone={buyerUser.phone}
          onSuccess={() => {
            setIsNdaModalOpen(false);
            onNdaSuccess();
          }}
        />
      )}
    </div>
  );
}
