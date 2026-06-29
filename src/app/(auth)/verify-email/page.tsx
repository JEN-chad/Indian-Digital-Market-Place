import React, { useState, useEffect } from "react";
import OtpInput from "../../../components/auth/otp-input.tsx";
import { Loader2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { verifyEmailOtp, sendEmailOtp } from "../../../actions/auth.ts";

import { z } from "zod";

interface VerifyEmailPageProps {
  email: string;
  onSuccess: (userData: any) => void;
  onBack: () => void;
}

export function VerifyEmailPage({ email, onSuccess, onBack }: VerifyEmailPageProps) {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(30);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Zod validation for OTP code
    const otpSchema = z.string().length(6, { message: "Verification code must be exactly 6 digits." });
    const parsed = otpSchema.safeParse(otp);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid verification code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResendStatus(null);

    try {
      const result = await verifyEmailOtp(email, otp);
      if (result.success) {
        onSuccess(result.user);
      } else {
        setError(result.error || "Verification failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during verification.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await sendEmailOtp(email);
      if (result.success) {
        setCooldown(30);
        setResendStatus("A new verification code has been dispatched to your inbox.");
      } else {
        setError(result.error || "Failed to resend code.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="w-12 h-12 bg-brand-green/10 text-brand-green flex items-center justify-center rounded-full mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h1 className="font-serif italic font-extrabold text-2xl tracking-tight">Verify Email</h1>
        <p className="text-xs text-gray-500">
          We sent a verification code to <span className="font-semibold text-black/80">{email}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {resendStatus && (
          <div className="flex items-center gap-2 bg-brand-green/5 border border-brand-green/10 text-brand-green p-3 rounded-md text-xs">
            <span>{resendStatus}</span>
          </div>
        )}

        {/* 6-Digit OtpInput */}
        <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />

        {/* Info Note */}
        <p className="text-[10px] text-center text-gray-400 font-mono">
          Tip: Enter "123456" to instantly verify in development mode.
        </p>

        {/* Submit Button */}
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
              Verify & Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Resend Action */}
      <div className="flex justify-between items-center text-xs pt-2">
        <button onClick={onBack} className="text-gray-500 hover:underline font-medium">
          Change Email
        </button>

        {cooldown > 0 ? (
          <span className="text-gray-400">Resend in {cooldown}s</span>
        ) : (
          <button
            onClick={handleResend}
            disabled={isLoading}
            className="text-brand-green font-bold hover:underline"
          >
            Resend Code
          </button>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
