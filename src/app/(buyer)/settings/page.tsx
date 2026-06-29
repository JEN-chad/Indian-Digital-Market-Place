import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/auth-store.ts";
import { saveBuyerInterests, getKycStatus, updateUserProfile } from "../../../actions/kyc.ts";
import { INDUSTRIES, ASSET_TYPES } from "../../../../config/constants.ts";
import { 
  User, Shield, Bookmark, Upload, Check, AlertTriangle, 
  RefreshCw, Camera, Landmark, HelpCircle 
} from "lucide-react";

export default function BuyerSettingsPage() {
  const { user, setUser } = useAuthStore();
  const userId = user?.id || "";

  // Profile forms state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatarUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Preference forms state
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState<number>(0);
  const [budgetMax, setBudgetMax] = useState<number>(100000000);
  const [acquisitionGoal, setAcquisitionGoal] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<"first_time" | "some" | "experienced" | "serial">("first_time");
  const [prefMessage, setPrefMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // KYC status state
  const [kycData, setKycData] = useState<any>(null);

  const navigateTo = (path: string) => {
    window.location.hash = `#${path}`;
  };

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setAvatar(user.avatarUrl || "");
    }
  }, [user]);

  // Load saved preferences & KYC details
  useEffect(() => {
    async function loadData() {
      if (!userId) return;
      try {
        // Load KYC status
        const kycStatusRes = await getKycStatus(userId);
        setKycData(kycStatusRes);

        // Fetch buyer profile by calling the buyer dashboard API or similar database fetch
        // Or fetch buyer profile details directly:
        const res = await fetch("/api/actions/get-buyer-dashboard-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        });
        const d = await res.json();
        if (d.success && d.user) {
          // If buyer profile is found
          // Let's call endpoint if exists or parse from db
          // In dashboards.ts, getBuyerDashboardData returns user record
        }
      } catch (e) {
        console.warn("Failed to load user settings extra data:", e);
      }
    }
    loadData();
  }, [userId]);

  // Handle avatar upload via FileReader base64
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileMessage({ type: "error", text: "Image size should be less than 2MB" });
      return;
    }

    const reader = new FileReader();
    reader.onloadstart = () => setIsUploading(true);
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        const res = await updateUserProfile(userId, { avatarUrl: base64 });
        if (res.success && res.user) {
          setAvatar(res.user.avatarUrl || "");
          setUser({ ...user!, avatarUrl: res.user.avatarUrl });
          setProfileMessage({ type: "success", text: "Avatar updated successfully!" });
        } else {
          setProfileMessage({ type: "error", text: res.error || "Failed to upload avatar" });
        }
      } catch (err) {
        setProfileMessage({ type: "error", text: "Avatar upload failed." });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateUserProfile(userId, { name, phone });
      if (res.success && res.user) {
        setUser({
          ...user!,
          name: res.user.name,
          phone: res.user.phone,
          avatarUrl: res.user.avatarUrl
        });
        setProfileMessage({ type: "success", text: "Profile details updated successfully!" });
      } else {
        setProfileMessage({ type: "error", text: res.error || "Failed to update profile" });
      }
    } catch (err: any) {
      setProfileMessage({ type: "error", text: err.message || "Failed to update profile" });
    }
  };

  // Handle Preferences Update
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await saveBuyerInterests({
        userId,
        industries: selectedIndustries,
        states: ["Maharashtra", "Delhi", "Karnataka"], // default active tech states
        budgetMin,
        budgetMax,
        acquisitionGoal,
        experienceLevel
      });
      if (res.success) {
        setPrefMessage({ type: "success", text: "Acquisition preferences saved successfully!" });
      } else {
        setPrefMessage({ type: "error", text: res.error || "Failed to save preferences" });
      }
    } catch (err: any) {
      setPrefMessage({ type: "error", text: err.message || "Failed to save preferences" });
    }
  };

  const handleToggleIndustry = (ind: string) => {
    if (selectedIndustries.includes(ind)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== ind));
    } else {
      setSelectedIndustries([...selectedIndustries, ind]);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-black/10 pb-6">
        <h1 className="text-3xl font-serif italic font-black text-brand-dark tracking-tight">
          Buyer Account Settings
        </h1>
        <p className="text-xs font-semibold tracking-wider text-brand-dark/60 uppercase mt-1">
          Manage identity checks, avatar, and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & KYC Card */}
        <div className="space-y-6 lg:col-span-1">
          {/* Avatar upload card */}
          <div className="bg-white border border-black/10 p-6 text-center space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-dark/60">
              Profile Avatar
            </h3>
            
            <div className="relative w-28 h-28 mx-auto group">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name || "User Avatar"}
                  className="w-full h-full rounded-full border border-black/10 object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 flex items-center justify-center">
                  <User className="w-10 h-10" />
                </div>
              )}

              {/* Upload trigger overlay */}
              <label className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-brand-dark">{name || "FMI Member"}</h4>
              <p className="text-[10px] font-mono text-brand-dark/40 font-semibold">{user?.email}</p>
            </div>

            {isUploading && (
              <p className="text-[10px] font-mono text-brand-green font-bold flex items-center justify-center gap-1.5 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                UPLOADING...
              </p>
            )}
          </div>

          {/* KYC Status Card */}
          <div className="bg-white border border-black/10 p-6 space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-dark/60 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-brand-green" />
              <span>KYC Verification</span>
            </h3>

            <div className={`p-4 border text-center ${
              user?.kycStatus === "approved"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : user?.kycStatus === "pending" || user?.kycStatus === "in_review"
                ? "bg-amber-50 border-amber-100 text-amber-800"
                : "bg-rose-50 border-rose-100 text-rose-800"
            }`}>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest block">
                Status: {user?.kycStatus?.toUpperCase()}
              </span>

              {user?.kycStatus === "approved" ? (
                <p className="text-[11px] leading-relaxed mt-2">
                  Congratulations! Your investor profile is fully verified. You have full trading access on the exchange.
                </p>
              ) : (
                <div className="space-y-2 mt-2">
                  <p className="text-[11px] leading-relaxed">
                    Identity checks are required to bid on live listings and communicate in transaction deal rooms.
                  </p>
                  {user?.kycStatus !== "pending" && user?.kycStatus !== "in_review" && (
                    <button
                      onClick={() => navigateTo("/onboarding/role")}
                      className="bg-brand-green hover:bg-brand-green/95 text-white font-bold text-[9px] uppercase tracking-widest px-4 py-2 border border-brand-green w-full rounded-none cursor-pointer"
                    >
                      Start KYC Portal
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form & Preferences */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* Profile Details Form */}
          <div className="bg-white border border-black/10 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-serif italic font-black text-brand-dark tracking-tight">
                Profile Details
              </h3>
              <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-dark/50 mt-0.5">
                Contact information
              </p>
            </div>

            {profileMessage && (
              <div className={`p-3 border text-xs font-semibold ${
                profileMessage.type === "success" 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                  : "bg-rose-50 border-rose-100 text-rose-800"
              }`}>
                {profileMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-black/10 p-3 text-xs bg-white focus:outline-brand-green rounded-none"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-black/10 p-3 text-xs bg-white focus:outline-brand-green rounded-none"
                    placeholder="e.g. +919876543210"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50">Email Address (Read-only)</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full border border-black/5 p-3 text-xs bg-black/[0.02] text-brand-dark/50 cursor-not-allowed rounded-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-brand-green hover:bg-brand-green/95 text-white font-bold text-xs uppercase tracking-widest px-5 py-3 border border-brand-green transition-all cursor-pointer rounded-none"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>

          {/* Acquisition Preferences Form */}
          <div className="bg-white border border-black/10 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-serif italic font-black text-brand-dark tracking-tight">
                Acquisition Preferences
              </h3>
              <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-dark/50 mt-0.5">
                Feeds AI recommendations & deal matchmaking
              </p>
            </div>

            {prefMessage && (
              <div className={`p-3 border text-xs font-semibold ${
                prefMessage.type === "success" 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                  : "bg-rose-50 border-rose-100 text-rose-800"
              }`}>
                {prefMessage.text}
              </div>
            )}

            <form onSubmit={handleSavePreferences} className="space-y-6">
              {/* Industries Choice */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50 block">Target Industries</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {INDUSTRIES.map((ind) => {
                    const isChecked = selectedIndustries.includes(ind);
                    return (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => handleToggleIndustry(ind)}
                        className={`text-left px-4 py-3 text-xs border transition-all rounded-none flex items-center justify-between ${
                          isChecked 
                            ? "border-brand-green bg-brand-green/5 text-brand-green font-bold" 
                            : "border-black/10 hover:border-brand-green/30"
                        }`}
                      >
                        <span>{ind}</span>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Range Slider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50">Minimum Budget (INR)</label>
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(parseInt(e.target.value, 10) || 0)}
                    className="w-full border border-black/10 p-3 text-xs bg-white focus:outline-brand-green rounded-none font-mono"
                    min="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50">Maximum Budget (INR)</label>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(parseInt(e.target.value, 10) || 0)}
                    className="w-full border border-black/10 p-3 text-xs bg-white focus:outline-brand-green rounded-none font-mono"
                    min="0"
                  />
                </div>
              </div>

              {/* Goal */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50">Acquisition Goal</label>
                <textarea
                  value={acquisitionGoal}
                  onChange={(e) => setAcquisitionGoal(e.target.value)}
                  className="w-full border border-black/10 p-3 text-xs bg-white focus:outline-brand-green rounded-none min-h-[80px]"
                  placeholder="Describe what type of business assets you want to acquire..."
                />
              </div>

              {/* Experience Level */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/50 block">Investment Experience</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full border border-black/10 p-3 text-xs bg-white focus:outline-brand-green rounded-none"
                >
                  <option value="first_time">First-time Acquirer</option>
                  <option value="some">Some Experience (1-2 acquisitions)</option>
                  <option value="experienced">Experienced Acquirer</option>
                  <option value="serial">Serial Entrepreneur / PE Firm</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-brand-green hover:bg-brand-green/95 text-white font-bold text-xs uppercase tracking-widest px-5 py-3 border border-brand-green transition-all cursor-pointer rounded-none"
                >
                  Save Acquisition Preferences
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
