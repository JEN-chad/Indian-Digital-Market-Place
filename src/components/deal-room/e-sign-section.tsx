import React, { useState } from "react";
import { signAgreement } from "../../actions/deals.ts";
import { ShieldAlert, Check, Loader2 } from "lucide-react";

interface ESignSectionProps {
  deal?: any;
  role?: "buyer" | "seller";
  refresh?: () => void;
}

export function ESignSection({ deal, role, refresh }: ESignSectionProps) {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!deal || !role) return null;

  const currentPartySigned = role === "buyer" ? deal.buyerSigned : deal.sellerSigned;
  const actualProfileName = role === "buyer" ? deal.buyerName : deal.sellerName;

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!authorized) {
      setError("Please check the authorization box representing your formal legal consent.");
      return;
    }

    if (fullName.trim().toLowerCase() !== actualProfileName.trim().toLowerCase()) {
      setError(`Entered name must exactly match your registered profile name: "${actualProfileName}"`);
      return;
    }

    setLoading(true);
    const result = await signAgreement(deal.id, role);
    if (result.success) {
      setSuccess(true);
      if (refresh) refresh();
    } else {
      setError(result.error || "Failed to log digital signature.");
    }
    setLoading(false);
  };

  if (currentPartySigned) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-5 text-brand-green font-sans space-y-2 text-center">
        <Check className="w-6 h-6 mx-auto stroke-[3]" />
        <h5 className="text-xs font-mono font-bold uppercase tracking-wider">Your Signature Registered</h5>
        <p className="text-[11px] text-brand-dark/70">
          Your digital signature is securely locked and registered on the contract. Waiting for the counterparty to complete signing.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-black/10 bg-white p-6 font-sans space-y-5 relative rounded-none">
      <div className="space-y-1">
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-green bg-emerald-50 border border-emerald-100 px-2 py-0.5 inline-block">
          SECURE LEGAL VERIFICATION
        </span>
        <h4 className="text-sm font-serif italic font-black text-brand-dark">Execute Purchase Agreement</h4>
        <p className="text-xs text-brand-dark/60">
          By signing, you formally execute the Asset Purchase Agreement terms. This action creates a legally binding contract.
        </p>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-800 p-3 text-xs font-mono">
          🚨 {error}
        </div>
      )}

      <form onSubmit={handleSign} className="space-y-4">
        {/* Checkbox representation */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={authorized}
            onChange={(e) => setAuthorized(e.target.checked)}
            className="w-4 h-4 text-brand-green border-black/10 focus:ring-brand-green shrink-0 mt-0.5 cursor-pointer"
          />
          <span className="text-xs leading-relaxed text-brand-dark/70">
            I represent, warrant, and warrant that I have read this Asset Purchase Agreement, fully comprehend all its terms, and formally authorize my digital signature to execute this transaction legally.
          </span>
        </label>

        {/* Text name matching */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono text-brand-dark/50 uppercase tracking-widest block">
            ENTER FULL PROFILE NAME TO SIGN
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={actualProfileName}
            className="w-full px-3 py-2 border border-black/10 text-xs font-mono focus:border-brand-green focus:outline-none placeholder:text-brand-dark/20"
            disabled={loading}
          />
          <span className="text-[9px] font-mono text-brand-dark/40 italic block">
            Must exactly match (case-insensitive): <strong>{actualProfileName}</strong>
          </span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-dark text-white text-xs font-mono uppercase tracking-widest hover:bg-brand-green transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "CRYPTOGRAPHICALLY EXECUTE AGREEMENT"}
        </button>
      </form>
    </div>
  );
}
