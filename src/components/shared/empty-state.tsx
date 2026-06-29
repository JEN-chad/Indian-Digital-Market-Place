import React from "react";
import { 
  LucideIcon, Plus, Search, MessageSquare, Handshake, 
  BellOff, Bookmark, ShieldCheck, FileSpreadsheet, RefreshCw 
} from "lucide-react";

interface EmptyStateProps {
  variant: 
    | "no-listings" 
    | "no-offers" 
    | "no-deals" 
    | "no-messages" 
    | "no-notifications" 
    | "no-saved-listings" 
    | "no-incoming-offers" 
    | "no-pending-kyc" 
    | "no-pending-listings" 
    | "no-active-deals" 
    | "no-results";
  heading: string;
  description: string;
  ctaText?: string;
  onCtaClick?: () => void;
  ctaIcon?: LucideIcon;
}

export function EmptyState({
  variant,
  heading,
  description,
  ctaText,
  onCtaClick,
  ctaIcon: CtaIcon
}: EmptyStateProps) {
  
  // Render inline custom premium illustrations
  const renderIllustration = () => {
    switch (variant) {
      case "no-listings":
        return (
          <svg className="w-16 h-16 text-brand-green/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
      case "no-saved-listings":
        return (
          <svg className="w-16 h-16 text-brand-green/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        );
      case "no-offers":
      case "no-incoming-offers":
        return (
          <svg className="w-16 h-16 text-brand-orange/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l2-2 4 4m0-7l-4 4-2-2m-3 8h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "no-deals":
      case "no-active-deals":
        return (
          <svg className="w-16 h-16 text-brand-green/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "no-messages":
        return (
          <svg className="w-16 h-16 text-brand-green/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case "no-pending-kyc":
        return (
          <svg className="w-16 h-16 text-brand-green/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case "no-pending-listings":
        return (
          <svg className="w-16 h-16 text-brand-green/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
          </svg>
        );
      case "no-results":
        return (
          <svg className="w-16 h-16 text-brand-dark/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case "no-notifications":
      default:
        return (
          <svg className="w-16 h-16 text-brand-dark/15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const getFallbackIcon = () => {
    switch (variant) {
      case "no-listings":
        return Plus;
      case "no-saved-listings":
        return Bookmark;
      case "no-offers":
      case "no-incoming-offers":
        return Plus;
      case "no-deals":
      case "no-active-deals":
        return Handshake;
      case "no-messages":
        return MessageSquare;
      case "no-pending-kyc":
        return ShieldCheck;
      case "no-pending-listings":
        return FileSpreadsheet;
      case "no-results":
        return RefreshCw;
      case "no-notifications":
      default:
        return BellOff;
    }
  };

  const DefaultCtaIcon = getFallbackIcon();

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-black/10 rounded-none min-h-[300px] w-full">
      <div className="p-4 bg-brand-green/[0.02] border border-black/5 flex items-center justify-center mb-5">
        {renderIllustration()}
      </div>
      
      <h4 className="text-sm font-serif italic font-black text-brand-dark tracking-tight">
        {heading}
      </h4>
      
      <p className="text-xs text-brand-dark/50 max-w-sm leading-relaxed mt-2 font-sans">
        {description}
      </p>

      {ctaText && onCtaClick && (
        <button
          onClick={onCtaClick}
          className="mt-6 bg-brand-green hover:bg-brand-green/95 text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-none flex items-center space-x-2 border border-brand-green transition-all cursor-pointer"
        >
          {CtaIcon ? <CtaIcon className="w-4 h-4" /> : <DefaultCtaIcon className="w-4 h-4" />}
          <span>{ctaText}</span>
        </button>
      )}
    </div>
  );
}

export default EmptyState;
