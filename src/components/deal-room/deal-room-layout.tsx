import React, { useState, useEffect } from "react";
import { DealStageProgress } from "./deal-stage-progress.tsx";
import { getDealDetail, DealStage } from "../../actions/deals.ts";
import { getPusherClient } from "../../../lib/pusher.ts";
import { Shield, FileText, MessageSquare, CheckSquare, Calendar, DollarSign, ArrowRight, User } from "lucide-react";

interface DealRoomLayoutProps {
  dealId: string;
  activeTab: "overview" | "documents" | "messages" | "checklist";
  role: "buyer" | "seller";
  children: React.ReactNode;
}

export function DealRoomLayout({ dealId, activeTab, role, children }: DealRoomLayoutProps) {
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDealData = async () => {
    const result = await getDealDetail(dealId);
    if (result.success) {
      setDeal(result.deal);
      setError(null);
    } else {
      setError(result.error || "Failed to load deal room.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDealData();

    // 1. Setup polling as reliable backup
    const interval = setInterval(fetchDealData, 5000);

    // 2. Setup Pusher real-time listening
    let channel: any = null;
    try {
      const pusher = getPusherClient();
      channel = pusher.subscribe(`deal-${dealId}`);
      
      const handleUpdate = () => {
        fetchDealData();
      };

      channel.bind("stage-changed", handleUpdate);
      channel.bind("checklist-updated", handleUpdate);
      channel.bind("agreement-signed", handleUpdate);
      channel.bind("escrow-updated", handleUpdate);
      channel.bind("escrow-approval-updated", handleUpdate);
      channel.bind("document-uploaded", handleUpdate);
      channel.bind("new-message", handleUpdate);
    } catch (err) {
      console.warn("Pusher subscription failed in DealRoomLayout:", err);
    }

    return () => {
      clearInterval(interval);
      if (channel) {
        try {
          const pusher = getPusherClient();
          pusher.unsubscribe(`deal-${dealId}`);
        } catch (e) {}
      }
    };
  }, [dealId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
        <p className="text-xs text-brand-dark/50 mt-4 font-mono">ESTABLISHING SECURE TRANSACTION CONNECTION...</p>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="max-w-4xl mx-auto p-8 font-sans">
        <div className="border border-red-200 bg-red-50 p-6 space-y-4">
          <h3 className="font-serif italic font-bold text-red-800 text-lg">Access Prohibited</h3>
          <p className="text-sm text-red-700">{error || "This transaction room could not be accessed."}</p>
          <button 
            onClick={() => window.location.hash = `#/${role}/dashboard`}
            className="px-4 py-2 bg-brand-dark text-white text-xs font-mono uppercase tracking-widest"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const otherPartyLabel = role === "buyer" ? "Seller" : "Buyer";
  const otherPartyName = role === "buyer" ? deal.sellerName : deal.buyerName;
  const otherPartyEmail = role === "buyer" ? deal.sellerEmail : deal.buyerEmail;

  const tabs = [
    { id: "overview", label: "Overview", icon: Shield, path: `/${role}/deals/${dealId}` },
    { id: "documents", label: "Documents", icon: FileText, path: `/${role}/deals/${dealId}/documents` },
    { id: "messages", label: "Messages", icon: MessageSquare, path: `/${role}/deals/${dealId}/messages` },
    { id: "checklist", label: "Checklist", icon: CheckSquare, path: `/${role}/deals/${dealId}/checklist` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans space-y-8">
      {/* 1. Header Banner */}
      <div className="bg-brand-dark text-white p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-green border border-brand-green/30 px-2 py-0.5">
                SECURE ROOM
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-white/10 text-white/70 px-2 py-0.5">
                ID: {deal.id.slice(0, 13).toUpperCase()}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif italic font-black text-brand-cream tracking-tight">
              {deal.listing?.title || "Digital Enterprise Acquisition"}
            </h1>
            <p className="text-xs text-brand-cream/60 max-w-2xl">
              FMI Escrow and M&A Deal Room. Fully compliant escrow flow, automated due diligence checklist, and legal e-signing.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 space-y-1 shrink-0 md:text-right min-w-[200px]">
            <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest block">DEAL VALUE</span>
            <span className="text-2xl font-mono font-bold text-brand-cream">
              ₹{Number(deal.dealValue).toLocaleString("en-IN")}
            </span>
            <div className="text-[10px] font-mono text-brand-green uppercase font-bold flex items-center md:justify-end gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
              Stage: {deal.stage.replace("_", " ").toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Timeline Progress Bar */}
      <DealStageProgress currentStage={deal.stage} />

      {/* 3. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Tabs + Active Component */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-black/10 bg-white overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => window.location.hash = `#${tab.path}`}
                  className={`flex items-center gap-2 py-3.5 px-5 text-xs font-mono uppercase tracking-wider font-bold shrink-0 transition-all border-b-2 cursor-pointer focus:outline-none ${
                    isActive
                      ? "border-brand-green text-brand-green bg-brand-cream/10"
                      : "border-transparent text-brand-dark/40 hover:text-brand-dark"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content Container */}
          <div className="bg-white border border-black/10 p-6 space-y-6 min-h-[350px]">
            {/* Inject deal context so children don't have to refetch */}
            {React.cloneElement(children as React.ReactElement, { deal, refresh: fetchDealData })}
          </div>
        </div>

        {/* Right Column: Dynamic Transaction Sidebar */}
        <div className="space-y-6">
          
          {/* Summary Card */}
          <div className="bg-brand-cream/10 border border-brand-green/20 p-6 font-sans space-y-6">
            <h3 className="font-serif italic font-black text-brand-dark text-lg border-b border-black/10 pb-3">
              Deal Summary
            </h3>

            {/* Parties */}
            <div className="space-y-4">
              <div>
                <span className="text-[9px] font-mono text-brand-dark/50 uppercase tracking-widest block">YOUR ROLE</span>
                <span className="text-xs font-bold font-mono text-brand-green uppercase">
                  {role.toUpperCase()}
                </span>
              </div>

              <div className="flex items-start gap-3 bg-white border border-black/[0.05] p-3">
                <User className="w-5 h-5 text-brand-green shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-brand-dark/50 uppercase tracking-widest block">
                    COUNTERPARTY ({otherPartyLabel})
                  </span>
                  <p className="text-xs font-bold text-brand-dark">{otherPartyName}</p>
                  <p className="text-[10px] font-mono text-brand-dark/60">{otherPartyEmail}</p>
                </div>
              </div>
            </div>

            {/* Metadata Stats */}
            <div className="grid grid-cols-2 gap-4 border-t border-black/10 pt-4">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-brand-dark/50 uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-brand-green" /> CREATED
                </span>
                <p className="text-xs font-mono font-bold">
                  {new Date(deal.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-brand-dark/50 uppercase tracking-widest flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-brand-green" /> DESTRUCT
                </span>
                <p className="text-xs font-mono font-bold">
                  {deal.offer?.upfrontPercent}% + {deal.offer?.earnoutPercent}%
                </p>
              </div>
            </div>

            {/* Signature States */}
            <div className="border-t border-black/10 pt-4 space-y-2.5">
              <span className="text-[9px] font-mono text-brand-dark/50 uppercase tracking-widest block">
                E-SIGNATURE COMPLIANCE
              </span>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-brand-dark/60">Buyer Signature:</span>
                <span className={`font-bold px-1.5 py-0.5 ${deal.buyerSigned ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"}`}>
                  {deal.buyerSigned ? "SIGNED" : "PENDING"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-brand-dark/60">Seller Signature:</span>
                <span className={`font-bold px-1.5 py-0.5 ${deal.sellerSigned ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"}`}>
                  {deal.sellerSigned ? "SIGNED" : "PENDING"}
                </span>
              </div>
            </div>

            {/* Escrow Status Bar */}
            <div className="border-t border-black/10 pt-4 space-y-2">
              <span className="text-[9px] font-mono text-brand-dark/50 uppercase tracking-widest block">
                FMI SAFE CUSTODY ESCROW
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-brand-dark/60">Escrow State:</span>
                <span className={`text-xs font-mono font-bold uppercase ${
                  deal.escrowStatus === "released"
                    ? "text-brand-green"
                    : deal.escrowStatus === "funded"
                    ? "text-blue-600"
                    : deal.escrowStatus === "pending"
                    ? "text-amber-600"
                    : "text-brand-dark/40"
                }`}>
                  {deal.escrowStatus || "NOT CREATED"}
                </span>
              </div>
              {deal.escrowReference && (
                <div className="bg-white border border-dashed border-black/10 p-2 text-center">
                  <span className="text-[10px] font-mono text-brand-dark/50 uppercase block">DEPOSIT REF</span>
                  <span className="text-xs font-mono font-bold tracking-widest text-brand-dark">{deal.escrowReference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Access Security Warning */}
          <div className="bg-brand-green/5 border border-brand-green/20 p-4 flex gap-3 items-start text-brand-green">
            <Shield className="w-4.5 h-4.5 shrink-0 mt-0.5 stroke-[2.5]" />
            <div className="space-y-1">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider">Secured Vault Routing</h4>
              <p className="text-[10px] leading-relaxed text-brand-dark/70">
                All communications, document uploads, and milestone signing logs in this Deal Room are legally binding and covered under the signed Non-Disclosure Agreement (NDA).
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
