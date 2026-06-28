import React, { useState, useEffect } from "react";
import { X, Lock, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "../../../lib/utils.ts";

// Define declare for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface NdaModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
  ndaFee: number;
  buyerEmail: string;
  buyerName: string;
  buyerPhone?: string;
  onSuccess: () => void;
}

export function NdaModal({
  isOpen,
  onClose,
  listingId,
  listingTitle,
  ndaFee,
  buyerEmail,
  buyerName,
  buyerPhone,
  onSuccess,
}: NdaModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay checkout script dynamically
  useEffect(() => {
    if (isOpen) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignNda = async () => {
    if (!agreed) {
      setError("You must agree to the Non-Disclosure terms to proceed.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (ndaFee > 0) {
        // --- PAID NDA GATEWAY (RAZORPAY) ---
        // 1. Create Razorpay order on the backend
        const orderRes = await fetch("/api/payments/order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: ndaFee,
            purpose: "nda_fee",
            listingId,
          }),
        });

        if (!orderRes.ok) {
          const errText = await orderRes.json();
          throw new Error(errText.error || "Failed to initiate payment order");
        }

        const orderData = await orderRes.json();
        const { orderId, amount, currency, keyId, paymentRecordId } = orderData;

        // 2. Open Razorpay Widget
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: "FMI Digital Exchange",
          description: `NDA Fee: ${listingTitle}`,
          order_id: orderId,
          prefill: {
            name: buyerName,
            email: buyerEmail,
            contact: buyerPhone || "",
          },
          theme: {
            color: "#1D4429", // brand green
          },
          handler: async function (response: any) {
            setLoading(true);
            try {
              // 3. Verify Razorpay payment signature
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  paymentRecordId,
                }),
              });

              if (!verifyRes.ok) {
                const errText = await verifyRes.json();
                throw new Error(errText.error || "Payment signature verification failed");
              }

              const verifyData = await verifyRes.json();

              // 4. Register signed NDA agreement
              const unlockRes = await fetch(`/api/listings/${listingId}/unlock`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paymentId: verifyData.paymentRecordId,
                  paymentProviderId: response.razorpay_payment_id,
                }),
              });

              if (!unlockRes.ok) {
                const unlockErr = await unlockRes.json();
                throw new Error(unlockErr.error || "Failed to unlock listing after payment");
              }

              onSuccess();
            } catch (err: any) {
              setError(err.message || "An error occurred verifying payment.");
              setLoading(false);
            }
          },
          modal: {
            onDismiss: function () {
              setLoading(false);
              setError("Payment gateway was closed before completing checkout.");
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // --- FREE NDA ACCESS ---
        const unlockRes = await fetch(`/api/listings/${listingId}/unlock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });

        if (!unlockRes.ok) {
          const unlockErr = await unlockRes.json();
          throw new Error(unlockErr.error || "Failed to sign NDA agreement");
        }

        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign NDA. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-xs">
      <div className="bg-[#FDFCFB] border border-black/15 w-full max-w-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/10">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-brand-green/5 text-brand-green border border-brand-green/10">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-brand-dark">
                Confidentiality Agreement
              </h2>
              <p className="text-[10px] font-mono text-brand-dark/50 uppercase tracking-widest mt-0.5">
                NDA Signature Required to Unlock Listing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-brand-dark/40 hover:text-rose-600 p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NDA Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="bg-[#F7F5F0] border border-black/5 p-4 text-xs text-brand-dark/80 leading-relaxed font-sans space-y-3">
            <p className="font-serif italic font-black text-brand-dark text-sm border-b border-black/5 pb-2 uppercase tracking-wide">
              Mutual Non-Disclosure Agreement (Summary)
            </p>
            <p>
              This Mutual Non-Disclosure Agreement ("Agreement") is made effective to protect the confidential and proprietary business operations, metrics, analytics, and identifiers of <strong className="text-brand-dark">"{listingTitle}"</strong>.
            </p>
            <p>
              1. <strong>Confidential Information:</strong> Under this agreement, the receiving party (Buyer) agrees that all business URLs, brand names, code structures, document files, exact financial sheets, and developer credentials shared here constitute Confidential Information.
            </p>
            <p>
              2. <strong>Strict Restrictions:</strong> The Buyer shall not copy, distribute, disclose, reverse engineer, or sell any confidential information, nor use it for competitive analysis or startup replication, for a period of one (1) year.
            </p>
            <p>
              3. <strong>Indemnification:</strong> Any breach of confidentiality will result in legal action and full financial indemnification of the Seller and FMI Platform under applicable corporate jurisdiction.
            </p>
            <p>
              4. <strong>NDA Processing Fee:</strong> {ndaFee > 0 ? `To ensure high intent and verify buyer credentials, this listing requires a processing fee of ${formatCurrency(ndaFee)}.` : "This NDA requires no payment, but requires checkbox agreement and signature."}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200/60 text-rose-800 flex items-center space-x-3 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="p-5 border-t border-black/10 bg-[#F7F5F0]/50 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 rounded border-black/10 text-brand-green focus:ring-brand-green"
            />
            <span className="text-[11px] font-sans text-brand-dark/75 leading-relaxed">
              I have read, understood, and agree to the Mutual Non-Disclosure terms. I certify that my registered profile represents high-intent interest in evaluating this listing for acquisition.
            </span>
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <p className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/40">
                Fee to unlock details
              </p>
              <p className="text-lg font-serif italic font-black text-brand-green mt-0.5">
                {ndaFee > 0 ? formatCurrency(ndaFee) : "FREE"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-5 py-3 border border-black/10 hover:bg-[#F7F5F0] text-brand-dark text-xs uppercase font-bold tracking-widest rounded-none transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignNda}
                disabled={loading}
                className="px-6 py-3 bg-brand-green hover:bg-brand-green/95 text-[#FDFCFB] text-xs uppercase font-bold tracking-widest rounded-none flex items-center justify-center gap-2 border border-brand-green transition-all cursor-pointer min-w-40 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>{ndaFee > 0 ? "Pay & Sign NDA" : "Sign NDA"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
