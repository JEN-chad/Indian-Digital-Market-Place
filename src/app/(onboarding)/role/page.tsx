import React, { useState } from "react";
import { RoleSelector } from "../../../components/auth/role-selector.tsx";
import { updateRole } from "../../../actions/kyc.ts";
import { Loader2, ShieldCheck } from "lucide-react";

interface OnboardingRolePageProps {
  user: any;
  onSuccess: (role: "buyer" | "seller" | "both", kycType: "individual" | "company") => void;
}

export function OnboardingRolePage({ user, onSuccess }: OnboardingRolePageProps) {
  const [role, setRole] = useState<"buyer" | "seller" | "both" | "">("");
  const [kycType, setKycType] = useState<"individual" | "company">("individual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async () => {
    if (!role) {
      setError("Please select a role to continue.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await updateRole(user?.id || "mock-user-id", role);
      if (res.success) {
        onSuccess(role, kycType);
      } else {
        setError(res.error || "Failed to update role. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-serif font-black tracking-tight text-gray-900">
          How will you use FMI?
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Select your primary intent on the exchange. This customizes your experience, dashboard features, and deal rooms.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-md text-xs text-rose-600 font-medium">
          {error}
        </div>
      )}

      {/* Role Selector Cards */}
      <RoleSelector value={role} onChange={(selectedRole) => {
        setRole(selectedRole);
        setError("");
      }} />

      {/* Onboarding KYC Branch Selection */}
      <div className="border-t border-black/5 pt-6 space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-2">
            I will onboard as a:
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setKycType("individual")}
              className={`p-3.5 rounded-md border text-left transition ${
                kycType === "individual"
                  ? "border-[#1D4429] bg-[#1D4429]/5 font-semibold text-[#1D4429]"
                  : "border-black/10 hover:border-black/15 bg-white text-gray-700"
              }`}
            >
              <span className="text-xs block font-bold font-mono tracking-wide uppercase">Individual</span>
              <span className="text-[10px] text-gray-400 block font-normal mt-0.5">Proprietor, Angel, etc.</span>
            </button>
            <button
              type="button"
              onClick={() => setKycType("company")}
              className={`p-3.5 rounded-md border text-left transition ${
                kycType === "company"
                  ? "border-[#1D4429] bg-[#1D4429]/5 font-semibold text-[#1D4429]"
                  : "border-black/10 hover:border-black/15 bg-white text-gray-700"
              }`}
            >
              <span className="text-xs block font-bold font-mono tracking-wide uppercase">Company</span>
              <span className="text-[10px] text-gray-400 block font-normal mt-0.5">Pvt Ltd, LLP, Partnership</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="bg-gray-50 rounded-md p-3.5 flex items-start gap-3 border border-black/5">
        <ShieldCheck className="w-5 h-5 text-[#1D4429] shrink-0 mt-0.5" />
        <div className="text-[11px] text-gray-500 leading-relaxed">
          <strong>Identity Security Guarantee:</strong> FMI requires PAN verification to maintain Indian regulatory compliance and ensure absolute trust between all buyers and sellers. Your documents are securely encrypted.
        </div>
      </div>

      <button
        type="button"
        disabled={loading || !role}
        onClick={handleContinue}
        className={`w-full py-3 bg-[#1D4429] hover:bg-[#15331E] text-white font-medium text-sm rounded-md transition shadow flex items-center justify-center gap-2 cursor-pointer ${
          (loading || !role) ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Saving role preference...
          </>
        ) : (
          "Continue to Verification"
        )}
      </button>
    </div>
  );
}
export default OnboardingRolePage;
