import React, { useState } from "react";
import { useAuthStore } from "../../store/auth-store.ts";
import { submitOffer } from "../../actions/offers.ts";
import { ShieldAlert, Info, Percent, Calendar, Check, AlertCircle, Sparkles } from "lucide-react";

interface OfferFormProps {
  listingId: string;
  listingTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function OfferForm({ listingId, listingTitle, onSuccess, onCancel }: OfferFormProps) {
  const { user } = useAuthStore();
  const [amount, setAmount] = useState<string>("");
  const [upfront, setUpfront] = useState<number>(80);
  const [message, setMessage] = useState<string>("");
  const [earnoutTerms, setEarnoutTerms] = useState<string>("");
  const [validity, setValidity] = useState<number>(14);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Derivations
  const earnout = 100 - upfront;
  const isKycApproved = user?.kycStatus === "approved";

  // Validate form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isKycApproved) {
      setErrorMsg("You must complete and get KYC approval to submit offers.");
      return;
    }

    const offerVal = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(offerVal) || offerVal <= 0) {
      setErrorMsg("Please enter a valid offer amount.");
      return;
    }

    if (earnout > 0 && !earnoutTerms.trim()) {
      setErrorMsg("Please specify performance metrics/terms for the earnout structure.");
      return;
    }

    setIsLoading(true);

    const res = await submitOffer({
      listingId,
      buyerId: user?.id || "",
      amount: offerVal,
      upfrontPercent: upfront,
      earnoutPercent: earnout,
      earnoutTerms: earnout > 0 ? earnoutTerms : undefined,
      message: message.trim() || undefined,
      validityDays: validity,
    });

    setIsLoading(false);

    if (res.success) {
      setSuccessMsg("Your M&A offer has been submitted and registered on the FMI Ledger!");
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } else {
      setErrorMsg(res.error || "An error occurred while submitting your offer.");
    }
  };

  const handleUpfrontChange = (val: number) => {
    if (val < 0) val = 0;
    if (val > 100) val = 100;
    setUpfront(val);
  };

  return (
    <div className="bg-white border border-black/10 shadow-lg p-6 max-w-lg w-full mx-auto font-sans text-brand-dark">
      <div className="space-y-2 mb-6">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-green bg-brand-cream px-2 py-0.5 border border-brand-green/20">
          SECURE OFFER ENGAGEMENT
        </span>
        <h2 className="text-xl font-serif italic font-black leading-tight">
          Submit Proposal
        </h2>
        <p className="text-xs text-brand-dark/50">
          You are initiating a formal purchase intent for <strong className="text-brand-dark">{listingTitle}</strong>.
        </p>
      </div>

      {/* KYC Alert Block */}
      {!isKycApproved && (
        <div className="bg-amber-50 border border-amber-200 p-4 mb-6 space-y-2">
          <div className="flex gap-2 items-start text-amber-800">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs uppercase block tracking-wider font-mono">
                KYC Verification Required
              </span>
              <p className="text-xs leading-relaxed text-amber-700">
                To maintain marketplace integrity, making offers requires a verified buyer profile. Your current status is{" "}
                <span className="font-bold uppercase">{user?.kycStatus?.replace("_", " ")}</span>.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => (window.location.hash = "#/buyer/dashboard")}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
          >
            Go to KYC Portal
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 text-xs flex gap-2 items-start mb-4 font-sans">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-xs flex gap-2 items-start mb-4 font-sans">
          <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <div>
            <span className="font-bold font-mono block mb-1 uppercase tracking-wider">OFFER RECEIVED</span>
            <p>{successMsg}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        {/* Offer Amount */}
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-brand-dark/50 mb-1">
            Offer Amount (INR ₹) *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-dark/40 font-mono text-sm">
              ₹
            </div>
            <input
              type="text"
              required
              disabled={!isKycApproved || isLoading}
              placeholder="e.g. 7,500,000"
              value={amount}
              onChange={(e) => {
                // Keep only numbers and convert to formatted string
                const clean = e.target.value.replace(/[^0-9]/g, "");
                if (clean) {
                  setAmount(Number(clean).toLocaleString("en-IN"));
                } else {
                  setAmount("");
                }
              }}
              className="w-full pl-7 pr-3 py-2.5 bg-white border border-black/10 focus:outline-none focus:border-brand-green text-sm rounded-none font-sans disabled:opacity-50"
            />
          </div>
        </div>

        {/* Upfront vs Earnout Structure */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-brand-dark/50">
            <span className="uppercase tracking-widest">DEAL ALLOCATION STRUCTURE</span>
            <span className="text-brand-green">{upfront}% Upfront / {earnout}% Earn-out</span>
          </div>

          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              disabled={!isKycApproved || isLoading}
              value={upfront}
              onChange={(e) => handleUpfrontChange(parseInt(e.target.value))}
              className="w-full accent-brand-green h-1.5 bg-black/5 rounded-none appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-brand-dark/40">
              <span>0% (All Earnout)</span>
              <span>100% (All Cash)</span>
            </div>
          </div>
        </div>

        {/* Conditional Earnout Terms */}
        {earnout > 0 && (
          <div className="space-y-1 bg-brand-cream/30 p-3 border border-black/5">
            <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/60 mb-1">
              Earnout Performance Metrics *
            </label>
            <textarea
              required
              rows={3}
              disabled={!isKycApproved || isLoading}
              placeholder="Detail target revenue/profit goals and release frequency (e.g. 10% paid quarterly over 12 months based on maintaining gross profits)."
              value={earnoutTerms}
              onChange={(e) => setEarnoutTerms(e.target.value)}
              className="w-full p-2.5 bg-white border border-black/10 focus:outline-none focus:border-brand-green text-xs rounded-none leading-relaxed disabled:opacity-50"
            />
          </div>
        )}

        {/* Message to Seller */}
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-brand-dark/50 mb-1">
            Message to Seller
          </label>
          <textarea
            rows={3}
            disabled={!isKycApproved || isLoading}
            placeholder="Introduce yourself, your background, and provide any contextual notes regarding your bid or timeline."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2.5 bg-white border border-black/10 focus:outline-none focus:border-brand-green text-xs rounded-none leading-relaxed disabled:opacity-50"
          />
        </div>

        {/* Validity */}
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-brand-dark/50 mb-1.5">
            Offer Validity Period
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                type="button"
                disabled={!isKycApproved || isLoading}
                onClick={() => setValidity(days)}
                className={`py-2 text-xs font-mono border transition-all rounded-none cursor-pointer ${
                  validity === days
                    ? "border-brand-green bg-brand-cream text-brand-green font-bold"
                    : "border-black/10 bg-white hover:border-black/30 text-brand-dark/60"
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-2 pt-4 border-t border-black/[0.05]">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 border border-black/10 hover:border-black/30 font-bold py-2.5 px-4 text-xs uppercase tracking-wider transition-colors rounded-none cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isKycApproved || isLoading}
            className="flex-[2] bg-brand-green hover:bg-brand-green/95 text-white font-black py-2.5 px-4 text-xs uppercase tracking-widest transition-colors border border-brand-green rounded-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-zinc-400 disabled:border-zinc-400"
          >
            <span>{isLoading ? "Broadcasting..." : "Submit Proposal"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
