import React, { useState } from "react";
import { initiateEscrow, releaseEscrow, verifyEscrowFunding } from "../../actions/deals.ts";
import { ShieldCheck, ArrowRight, Check, Coins, HelpCircle, Loader2, Landmark, Copy } from "lucide-react";

interface EscrowStatusCardProps {
  deal?: any;
  refresh?: () => void;
  role?: "buyer" | "seller";
}

export function EscrowStatusCard({ deal, refresh, role }: EscrowStatusCardProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!deal) return null;

  const { escrowStatus, escrowReference, dealValue, stage } = deal;
  const buyerApproved = deal.escrowApproved?.buyer || false;
  const sellerApproved = deal.escrowApproved?.seller || false;

  const handleInit = async () => {
    setLoading(true);
    setError(null);
    const result = await initiateEscrow(deal.id);
    if (result.success) {
      setSuccess("Secure Escrow account successfully provisioned!");
      if (refresh) refresh();
    } else {
      setError(result.error || "Failed to initialize escrow account.");
    }
    setLoading(false);
  };

  const handleVerifyFunding = async () => {
    setLoading(true);
    setError(null);
    const result = await verifyEscrowFunding(deal.id);
    if (result.success) {
      setSuccess("Compliance team successfully verified escrow funding!");
      if (refresh) refresh();
    } else {
      setError(result.error || "Compliance validation failed.");
    }
    setLoading(false);
  };

  const handleRelease = async () => {
    setLoading(true);
    setError(null);
    const result = await releaseEscrow(deal.id, role!);
    if (result.success) {
      setSuccess("Release authorization successfully logged!");
      if (refresh) refresh();
    } else {
      setError(result.error || "Failed to approve escrow release.");
    }
    setLoading(false);
  };

  return (
    <div className="border border-black/10 bg-white p-6 font-sans space-y-6 relative rounded-none">
      <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
        <div className="space-y-0.5">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-green bg-emerald-50 border border-emerald-100 px-2 py-0.5 inline-block">
            FINANCIAL TRANSACTION CONDUIT
          </span>
          <h4 className="text-sm font-serif italic font-black">Escrow Vault Service</h4>
        </div>
        <div className="flex items-center gap-1.5 bg-brand-cream/40 px-2.5 py-1 border border-brand-green/20">
          <Coins className="w-3.5 h-3.5 text-brand-green" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark">
            FMI SafeCustody™
          </span>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-800 p-3 text-xs font-mono">
          🚨 {error}
        </div>
      )}

      {success && (
        <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 p-3 text-xs font-mono">
          ✅ {success}
        </div>
      )}

      {/* State Renderers */}

      {/* 1. NOT CREATED */}
      {(!escrowStatus || escrowStatus === "not_created") && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-dark/80">Escrow Initialization Required</h5>
            <p className="text-xs leading-relaxed text-brand-dark/70">
              Escrow setup is unlocked upon moving into the Escrow Phase. This allocates a secured neutral banking router to hold transaction funds.
            </p>
          </div>

          <button
            onClick={handleInit}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-dark text-white text-xs font-mono uppercase tracking-widest hover:bg-brand-green transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "PROVISION NEUTRAL ESCROW ACCOUNT"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. PENDING (DEPOSIT REQUIRED) */}
      {escrowStatus === "pending" && (
        <div className="space-y-5">
          <div className="bg-amber-50/50 border border-amber-200 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Landmark className="w-4.5 h-4.5 text-amber-600 shrink-0" />
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
                Awaiting Wire Deposit Funding
              </h5>
            </div>
            <p className="text-xs leading-relaxed text-brand-dark/70">
              {role === "buyer" 
                ? "Please wire the designated funds using the compliance routing instructions below to prevent transaction delays."
                : "The buyer has been issued wire transfer routing instructions. FMI Compliance is awaiting deposit receipt."}
            </p>
          </div>

          {/* Wire details for Buyer */}
          <div className="bg-brand-cream/5 border border-black/10 p-4.5 space-y-3.5">
            <div className="flex justify-between items-center text-xs border-b border-black/[0.05] pb-2">
              <span className="text-brand-dark/60 font-mono">Deposit Target Amount:</span>
              <span className="font-mono font-black text-brand-dark">
                ₹{Number(dealValue).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 text-[11px] font-mono">
              <div className="space-y-0.5">
                <span className="text-brand-dark/40 uppercase text-[9px] tracking-widest block">ROUTING BANK</span>
                <span className="font-bold">ICICI Bank Limited</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-brand-dark/40 uppercase text-[9px] tracking-widest block">BENEFICIARY</span>
                <span className="font-bold">FMI Digital Custody Account</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-brand-dark/40 uppercase text-[9px] tracking-widest block">IFSC CODE</span>
                <span className="font-bold">ICIC0001093</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-brand-dark/40 uppercase text-[9px] tracking-widest block">VIRTUAL ACCT NO</span>
                <span className="font-bold">FMI{deal.id.slice(0, 8).toUpperCase()}</span>
              </div>
            </div>

            <div className="bg-white border border-dashed border-brand-green/20 p-2.5 text-center flex items-center justify-between font-mono text-xs">
              <span className="text-[10px] text-brand-dark/50">DEPOSIT REF CODE:</span>
              <span className="font-bold text-brand-green">{escrowReference}</span>
            </div>
          </div>

          {/* Compliance Mock Verification Button */}
          <div className="border border-brand-green/10 bg-brand-green/5 p-4 text-center space-y-3">
            <p className="text-[10px] font-mono text-brand-dark/60">
              [SANDBOX MOCK CONTROL] Simulate wire compliance clearance to verify Escrow Funded states:
            </p>
            <button
              onClick={handleVerifyFunding}
              disabled={loading}
              className="px-4 py-2 bg-brand-green text-white text-[10px] font-mono uppercase tracking-widest hover:opacity-90 transition-all"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" /> : "APPROVE MOCK DEPOSIT (ADMIN)"}
            </button>
          </div>
        </div>
      )}

      {/* 3. FUNDED (SAFETY VERIFIED) */}
      {escrowStatus === "funded" && (
        <div className="space-y-5">
          <div className="bg-emerald-50 border border-emerald-200 p-4 space-y-2 text-brand-green">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              <h5 className="text-xs font-mono font-bold uppercase tracking-wider">
                Escrow Funds Secured & Guarded
              </h5>
            </div>
            <p className="text-xs leading-relaxed text-brand-dark/70">
              ₹{Number(dealValue).toLocaleString("en-IN")} is held securely in the FMI Neutral Custody Account. Release is locked until both parties authorize payout.
            </p>
          </div>

          <div className="bg-brand-cream/5 border border-black/10 p-4 space-y-3">
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase tracking-widest block">RELEASE AUTHORIZATION PROGRESS</span>
            
            <div className="flex justify-between items-center text-xs font-mono">
              <span>Buyer Authorization:</span>
              <span className={`font-bold ${buyerApproved ? "text-emerald-700" : "text-brand-dark/30"}`}>
                {buyerApproved ? "APPROVED" : "AWAITING..."}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs font-mono">
              <span>Seller Authorization:</span>
              <span className={`font-bold ${sellerApproved ? "text-emerald-700" : "text-brand-dark/30"}`}>
                {sellerApproved ? "APPROVED" : "AWAITING..."}
              </span>
            </div>
          </div>

          {/* Action to Authorize Payout */}
          {((role === "buyer" && !buyerApproved) || (role === "seller" && !sellerApproved)) ? (
            <button
              onClick={handleRelease}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-green text-white text-xs font-mono uppercase tracking-widest hover:opacity-95 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "AUTHORIZE PAYOUT ESCROW RELEASE"}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="bg-brand-cream/10 border border-brand-green/20 p-3.5 text-center text-xs font-mono text-brand-dark/70">
              Your payout release authorization is logged. Waiting for counterparty confirmation.
            </div>
          )}
        </div>
      )}

      {/* 4. RELEASED (DEAL CLOSED) */}
      {escrowStatus === "released" && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 text-center text-emerald-800 space-y-2">
            <Check className="w-8 h-8 mx-auto stroke-[3]" />
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider">Transaction Fully Disbursed</h5>
            <p className="text-xs leading-relaxed text-brand-dark/70">
              Payout of ₹{Number(dealValue).toLocaleString("en-IN")} was processed and securely released to the Seller. FMI Custody closed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
