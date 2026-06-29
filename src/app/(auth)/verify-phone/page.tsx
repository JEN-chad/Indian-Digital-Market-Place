import React, { useState } from "react";
import OtpInput from "../../../components/auth/otp-input.tsx";
import { Loader2, AlertCircle, ArrowRight, Smartphone, CheckCircle, ShieldCheck } from "lucide-react";
import { sendPhoneOtp, verifyPhoneOtp } from "../../../actions/auth.ts";

import { z } from "zod";

interface VerifyPhonePageProps {
  email?: string;
  onSuccess: (phone: string) => void;
  onSkip?: () => void;
}

export function VerifyPhonePage({ email, onSuccess, onSkip }: VerifyPhonePageProps) {
  const [step, setStep] = useState<"input" | "otp">("input");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Zod schema for Indian Phone Validation
    const phoneSchema = z.string().regex(/^(\+91)?\d{10}$/, { 
      message: "Please enter a valid 10-digit Indian phone number (optionally starting with +91)." 
    });
    
    const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone.replace(/^\+?91/, "")}`;
    const parsed = phoneSchema.safeParse(formattedPhone);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid phone number.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await sendPhoneOtp(formattedPhone);
      if (result.success) {
        setStep("otp");
      } else {
        setError(result.error || "Failed to send SMS OTP.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Zod schema for SMS OTP verification
    const otpSchema = z.string().length(6, { message: "SMS OTP must be exactly 6 digits." });
    const parsed = otpSchema.safeParse(otp);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid SMS OTP.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formattedPhone = phone.startsWith("+91") ? phone : `+91${phone.replace(/^\+?91/, "")}`;
      const result = await verifyPhoneOtp(formattedPhone, otp, email);
      if (result.success) {
        onSuccess(formattedPhone);
      } else {
        setError(result.error || "Invalid or expired SMS OTP.");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === "input" ? (
        <>
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 bg-brand-green/10 text-brand-green flex items-center justify-center rounded-full mx-auto">
              <Smartphone className="w-6 h-6" />
            </div>
            <h1 className="font-serif italic font-extrabold text-2xl tracking-tight">Verify Mobile</h1>
            <p className="text-xs text-gray-500">
              Enter your Indian phone number to complete security verification.
            </p>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="phone" className="block text-xs font-bold tracking-wider uppercase text-black/60">
                Indian Phone Number
              </label>
              <div className="flex rounded-md border border-black/10 overflow-hidden focus-within:ring-1 focus-within:ring-brand-green">
                <span className="bg-gray-50 px-3 py-3 border-r border-black/5 text-xs text-gray-500 font-bold flex items-center">
                  🇮🇳 +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  disabled={isLoading}
                  value={phone.replace(/^\+91/, "").replace(/\s+/g, "")}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="w-full text-xs px-4 py-3 bg-white focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || phone.replace(/\D/g, "").length < 10}
              className="w-full bg-brand-green hover:bg-brand-green/95 text-white py-3 px-4 font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  Send Verification SMS
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        <>
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 bg-brand-green/10 text-brand-green flex items-center justify-center rounded-full mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="font-serif italic font-extrabold text-2xl tracking-tight">Verify SMS OTP</h1>
            <p className="text-xs text-gray-500">
              We sent a verification SMS to <span className="font-semibold text-black/80">+91 {phone.replace(/^\+91/, "")}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* 6-Digit OtpInput */}
            <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />

            <p className="text-[10px] text-center text-gray-400 font-mono">
              Tip: Enter "123456" to instantly verify in development mode.
            </p>

            <button
              type="submit"
              disabled={isLoading || otp.length < 6}
              className="w-full bg-brand-green hover:bg-brand-green/95 text-white py-3 px-4 font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Finish
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <button
            onClick={() => setStep("input")}
            disabled={isLoading}
            className="w-full text-center text-xs text-gray-500 hover:underline pt-2 font-medium"
          >
            Go Back & Change Number
          </button>
        </>
      )}

      {onSkip && (
        <button
          onClick={onSkip}
          disabled={isLoading}
          className="w-full text-center text-xs text-gray-400 hover:text-brand-green transition-colors mt-4 block underline font-medium"
        >
          Skip Verification (Do This Later)
        </button>
      )}
    </div>
  );
}

export default VerifyPhonePage;
