import React, { useState } from "react";
import { saveBuyerInterests } from "../../../actions/kyc.ts";
import { useKycWizardStore } from "../../../store/kyc-wizard-store.ts";
import { Loader2, Sparkles, Building2, MapPin, DollarSign, Award, Target } from "lucide-react";

interface OnboardingInterestsPageProps {
  user: any;
  onSuccess: () => void;
}

export function OnboardingInterestsPage({ user, onSuccess }: OnboardingInterestsPageProps) {
  const store = useKycWizardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sectors = [
    "SaaS", "E-commerce", "D2C Brands", "Content Sites", "Agencies", 
    "FinTech", "AI / Tech", "Mobile Apps", "EdTech", "HealthTech"
  ];

  const statesList = [
    "Maharashtra", "Karnataka", "Delhi NCR", "Tamil Nadu", "Telangana",
    "Gujarat", "Haryana", "Uttar Pradesh", "West Bengal", "Other"
  ];

  const experienceLevels = [
    { value: "first_time", label: "First Time", desc: "Never bought a digital asset before" },
    { value: "some", label: "Some", desc: "Bought/operated 1-2 digital properties" },
    { value: "experienced", label: "Experienced", desc: "Successfully acquired and scaled businesses" },
    { value: "serial", label: "Serial Acquirer", desc: "Institutional or serial portfolio operator" },
  ];

  const toggleSector = (sector: string) => {
    const current = store.buyerInterests.industries;
    if (current.includes(sector)) {
      store.updateBuyerInterests({ industries: current.filter((s) => s !== sector) });
    } else {
      store.updateBuyerInterests({ industries: [...current, sector] });
    }
  };

  const toggleState = (stateName: string) => {
    const current = store.buyerInterests.states;
    if (current.includes(stateName)) {
      store.updateBuyerInterests({ states: current.filter((s) => s !== stateName) });
    } else {
      store.updateBuyerInterests({ states: [...current, stateName] });
    }
  };

  const handleSave = async () => {
    const ints = store.buyerInterests;
    if (ints.industries.length === 0) {
      setError("Please select at least one industry/sector.");
      return;
    }
    if (ints.states.length === 0) {
      setError("Please select at least one state of preference.");
      return;
    }
    if (!ints.experienceLevel) {
      setError("Please choose your experience level.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        userId: user?.id || "mock-user-id",
        industries: ints.industries,
        states: ints.states,
        budgetMin: ints.budgetMin,
        budgetMax: ints.budgetMax,
        acquisitionGoal: ints.acquisitionGoal || "Acquiring vetted digital properties",
        experienceLevel: ints.experienceLevel as any,
      };

      const res = await saveBuyerInterests(payload);
      if (res.success) {
        store.resetWizard();
        onSuccess();
      } else {
        setError(res.error || "Failed to save interest profile.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-serif font-black tracking-tight text-gray-900 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" /> Target Investment Profile
        </h2>
        <p className="text-xs text-gray-400">
          We match you with verified digital listings, custom financials, and active dealrooms based on these criteria.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-md text-xs text-rose-600 font-medium">
          {error}
        </div>
      )}

      {/* 1. Industry / Sector Preferences */}
      <div className="space-y-2.5">
        <label className="text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 flex items-center gap-1.5 font-bold">
          <Building2 className="w-4 h-4 text-gray-400" /> Target Sectors / Industries
        </label>
        <div className="flex flex-wrap gap-2">
          {sectors.map((sec) => {
            const isSelected = store.buyerInterests.industries.includes(sec);
            return (
              <button
                key={sec}
                type="button"
                onClick={() => toggleSector(sec)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? "bg-[#1D4429] text-white border border-[#1D4429] shadow-sm"
                    : "bg-white text-gray-600 border border-black/10 hover:border-black/15"
                }`}
              >
                {sec}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Location Preference */}
      <div className="space-y-2.5 border-t border-black/5 pt-5">
        <label className="text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 flex items-center gap-1.5 font-bold">
          <MapPin className="w-4 h-4 text-gray-400" /> Preferred Entity Jurisdiction / States
        </label>
        <div className="flex flex-wrap gap-2">
          {statesList.map((st) => {
            const isSelected = store.buyerInterests.states.includes(st);
            return (
              <button
                key={st}
                type="button"
                onClick={() => toggleState(st)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition cursor-pointer ${
                  isSelected
                    ? "bg-[#1D4429] text-white border border-[#1D4429]"
                    : "bg-white text-gray-600 border border-black/10 hover:border-black/15"
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Budget Sliders (Vetted Indian Capital range) */}
      <div className="space-y-4 border-t border-black/5 pt-5">
        <label className="text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 flex items-center gap-1.5 font-bold">
          <DollarSign className="w-4 h-4 text-gray-400" /> Investment Budget Range (INR)
        </label>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-gray-400 block font-mono">MINIMUM BUDGET</span>
            <input
              type="range"
              min={500000}
              max={10000000}
              step={500000}
              value={store.buyerInterests.budgetMin}
              onChange={(e) => store.updateBuyerInterests({ budgetMin: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1D4429]"
            />
            <span className="text-sm font-semibold font-mono text-gray-800 mt-1 block">
              ₹{(store.buyerInterests.budgetMin / 100000).toFixed(1)} Lakh
            </span>
          </div>

          <div>
            <span className="text-[10px] text-gray-400 block font-mono">MAXIMUM BUDGET</span>
            <input
              type="range"
              min={10000000}
              max={50000000}
              step={1000000}
              value={store.buyerInterests.budgetMax}
              onChange={(e) => store.updateBuyerInterests({ budgetMax: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#1D4429]"
            />
            <span className="text-sm font-semibold font-mono text-gray-800 mt-1 block">
              ₹{(store.buyerInterests.budgetMax / 10000000).toFixed(2)} Crore
            </span>
          </div>
        </div>
      </div>

      {/* 4. Experience Level */}
      <div className="space-y-2.5 border-t border-black/5 pt-5">
        <label className="text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 flex items-center gap-1.5 font-bold">
          <Award className="w-4 h-4 text-gray-400" /> Digital Acquisition Experience
        </label>
        
        <div className="grid grid-cols-2 gap-3">
          {experienceLevels.map((exp) => {
            const isSelected = store.buyerInterests.experienceLevel === exp.value;
            return (
              <button
                key={exp.value}
                type="button"
                onClick={() => store.updateBuyerInterests({ experienceLevel: exp.value as any })}
                className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                  isSelected
                    ? "border-[#1D4429] bg-[#1D4429]/5"
                    : "border-black/10 hover:border-black/15 bg-white"
                }`}
              >
                <span className={`text-xs font-semibold block ${isSelected ? "text-[#1D4429]" : "text-gray-900"}`}>
                  {exp.label}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5 leading-snug">{exp.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Custom Acquisition Goal */}
      <div className="space-y-2.5 border-t border-black/5 pt-5">
        <label className="text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 flex items-center gap-1.5 font-bold">
          <Target className="w-4 h-4 text-gray-400" /> Deal Sourcing Objective
        </label>
        <textarea
          rows={3}
          value={store.buyerInterests.acquisitionGoal}
          onChange={(e) => store.updateBuyerInterests({ acquisitionGoal: e.target.value })}
          placeholder="Ex. Looking for a high-margin Indian B2B SaaS in the HRTech or FinTech space with at least ₹2L MRR and a clean code base."
          className="w-full bg-white border border-black/15 focus:border-[#1D4429] p-3 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition leading-relaxed"
        />
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleSave}
        className="w-full py-3 bg-[#1D4429] hover:bg-[#15331E] text-white font-medium text-xs rounded-md transition shadow flex items-center justify-center gap-2 cursor-pointer mt-6"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Saving investment target...
          </>
        ) : (
          "Save and Finish Onboarding"
        )}
      </button>
    </div>
  );
}
export default OnboardingInterestsPage;
