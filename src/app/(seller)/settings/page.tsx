import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../store/auth-store.ts";
import { getKycStatus, updateUserProfile } from "../../../actions/kyc.ts";
import { 
  User, Shield, Landmark, Bell, Upload, Check, AlertTriangle, 
  RefreshCw, Camera, HelpCircle, Mail, MessageSquare, Handshake 
} from "lucide-react";

export default function SellerSettingsPage() {
  const { user, setUser } = useAuthStore();
  const userId = user?.id || "";

  // Profile forms state
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [avatar, setAvatar] = useState(user?.avatarUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Bank details state
  const [kycData, setKycData] = useState<any>(null);

  // Notification Preferences state
  const [emailOffers, setEmailOffers] = useState(true);
  const [emailDeals, setEmailDeals] = useState(true);
  const [emailMarketing, setEmailMarketing] = useState(false);
  const [emailNda, setEmailNda] = useState(true);
  const [prefMessage, setPrefMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        // Load KYC status for bank details
        const kycStatusRes = await getKycStatus(userId);
        setKycData(kycStatusRes);

        // Load mock notification settings from localStorage
        const savedNotifs = localStorage.getItem(`notif_prefs_${userId}`);
        if (savedNotifs) {
          const parsed = JSON.parse(savedNotifs);
          setEmailOffers(parsed.emailOffers);
          setEmailDeals(parsed.emailDeals);
          setEmailMarketing(parsed.emailMarketing);
          setEmailNda(parsed.emailNda);
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

  // Handle Notifications Save
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const prefs = { emailOffers, emailDeals, emailMarketing, emailNda };
      localStorage.setItem(`notif_prefs_${userId}`, JSON.stringify(prefs));
      setPrefMessage({ type: "success", text: "Notification preferences updated successfully!" });
    } catch (err) {
      setPrefMessage({ type: "error", text: "Failed to save preferences" });
    }
  };

  const navigateTo = (path: string) => {
    window.location.hash = `#${path}`;
  };

  const bankProfile = kycData?.profile;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-black/10 pb-6">
        <h1 className="text-3xl font-serif italic font-black text-brand-dark tracking-tight">
          Seller Account Settings
        </h1>
        <p className="text-xs font-semibold tracking-wider text-brand-dark/60 uppercase mt-1">
          Manage listings credentials, banking, and communications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & KYC Card */}
        <div className="space-y-6 lg:col-span-1">
          {/* Avatar upload card */}
          <div className="bg-white border border-black/10 p-6 text-center space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-dark/60">
              Seller Identity Avatar
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
              <span>KYC Profile Verification</span>
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
                  KYC identity is approved. You can list businesses and accept legal bids.
                </p>
              ) : (
                <div className="space-y-2 mt-2">
                  <p className="text-[11px] leading-relaxed">
                    Identity checks are required to list a business and interact in deal rooms.
                  </p>
                  {user?.kycStatus !== "pending" && user?.kycStatus !== "in_review" && (
                    <button
                      onClick={() => navigateTo("/onboarding/role")}
                      className="bg-brand-green hover:bg-brand-green/95 text-white font-bold text-[9px] uppercase tracking-widest px-4 py-2 border border-brand-green w-full rounded-none cursor-pointer"
                    >
                      Verify KYC Status
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form, Bank Details & Notification Toggles */}
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

          {/* Bank Details Card (Read-only, linked to KYC) */}
          <div className="bg-white border border-black/10 p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-serif italic font-black text-brand-dark tracking-tight flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-brand-green" />
                  <span>Escrow & Bank Payout Details</span>
                </h3>
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-dark/50 mt-0.5">
                  Verified bank accounts for payouts (Read-only)
                </p>
              </div>
              
              <button
                onClick={() => navigateTo("/onboarding/role")}
                className="text-[9px] font-mono font-bold uppercase text-brand-green hover:underline"
              >
                Re-submit KYC &rarr;
              </button>
            </div>

            {!bankProfile ? (
              <div className="p-4 border border-dashed border-black/15 text-center text-xs text-brand-dark/50 font-mono">
                No bank account verification details registered. Submit KYC to link your payout bank.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-black/[0.01] border border-black/5 p-4">
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/40 block">Account Holder</span>
                  <span className="text-xs font-bold text-brand-dark mt-1 block truncate">
                    {bankProfile.bankAccountName || "Not Provided"}
                  </span>
                </div>
                <div className="border-t sm:border-t-0 sm:border-l sm:border-r border-black/5 sm:px-4 py-2 sm:py-0">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/40 block">Account Number</span>
                  <span className="text-xs font-mono font-bold text-brand-dark mt-1 block truncate">
                    {bankProfile.bankAccountNumber ? `****${bankProfile.bankAccountNumber.slice(-4)}` : "Not Provided"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/40 block">IFSC Code</span>
                  <span className="text-xs font-mono font-bold text-brand-dark mt-1 block uppercase">
                    {bankProfile.bankIfsc || "Not Provided"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Notification Preferences */}
          <div className="bg-white border border-black/10 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-serif italic font-black text-brand-dark tracking-tight">
                Notification Preferences
              </h3>
              <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-dark/50 mt-0.5">
                Manage how we communicate transactional activity
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

            <form onSubmit={handleSaveNotifications} className="space-y-5">
              
              <div className="space-y-3.5">
                <div className="flex items-start justify-between gap-4 p-3 hover:bg-black/[0.01] transition-colors border border-black/5">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <div>
                      <label className="text-xs font-bold text-brand-dark block cursor-pointer" htmlFor="pref-offers">
                        Offers Alerts
                      </label>
                      <span className="text-[10px] text-brand-dark/50 leading-relaxed font-sans">
                        Receive instant email notifications when a buyer submits, counter-offers, or withdraws a bid on your listings.
                      </span>
                    </div>
                  </div>
                  <input
                    id="pref-offers"
                    type="checkbox"
                    checked={emailOffers}
                    onChange={(e) => setEmailOffers(e.target.checked)}
                    className="h-4.5 w-4.5 border-black/10 text-brand-green focus:ring-brand-green accent-brand-green cursor-pointer mt-0.5"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 p-3 hover:bg-black/[0.01] transition-colors border border-black/5">
                  <div className="flex items-start space-x-3">
                    <Handshake className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <div>
                      <label className="text-xs font-bold text-brand-dark block cursor-pointer" htmlFor="pref-deals">
                        Transaction Deal Updates
                      </label>
                      <span className="text-[10px] text-brand-dark/50 leading-relaxed font-sans">
                        Receive progress milestones, checklist completions, legal signings, and Escrow fund confirmation alerts.
                      </span>
                    </div>
                  </div>
                  <input
                    id="pref-deals"
                    type="checkbox"
                    checked={emailDeals}
                    onChange={(e) => setEmailDeals(e.target.checked)}
                    className="h-4.5 w-4.5 border-black/10 text-brand-green focus:ring-brand-green accent-brand-green cursor-pointer mt-0.5"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 p-3 hover:bg-black/[0.01] transition-colors border border-black/5">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <div>
                      <label className="text-xs font-bold text-brand-dark block cursor-pointer" htmlFor="pref-ndas">
                        NDA Signings
                      </label>
                      <span className="text-[10px] text-brand-dark/50 leading-relaxed font-sans">
                        Notify when a qualified investor signs your listing confidentiality agreement and unlocks financials.
                      </span>
                    </div>
                  </div>
                  <input
                    id="pref-ndas"
                    type="checkbox"
                    checked={emailNda}
                    onChange={(e) => setEmailNda(e.target.checked)}
                    className="h-4.5 w-4.5 border-black/10 text-brand-green focus:ring-brand-green accent-brand-green cursor-pointer mt-0.5"
                  />
                </div>

                <div className="flex items-start justify-between gap-4 p-3 hover:bg-black/[0.01] transition-colors border border-black/5">
                  <div className="flex items-start space-x-3">
                    <Bell className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                    <div>
                      <label className="text-xs font-bold text-brand-dark block cursor-pointer" htmlFor="pref-marketing">
                        Marketplace Insights
                      </label>
                      <span className="text-[10px] text-brand-dark/50 leading-relaxed font-sans">
                        Get monthly multiples reports, transaction volume stats, buyer demand reports, and FMI platform updates.
                      </span>
                    </div>
                  </div>
                  <input
                    id="pref-marketing"
                    type="checkbox"
                    checked={emailMarketing}
                    onChange={(e) => setEmailMarketing(e.target.checked)}
                    className="h-4.5 w-4.5 border-black/10 text-brand-green focus:ring-brand-green accent-brand-green cursor-pointer mt-0.5"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-brand-green hover:bg-brand-green/95 text-white font-bold text-xs uppercase tracking-widest px-5 py-3 border border-brand-green transition-all cursor-pointer rounded-none"
                >
                  Save Notification Toggles
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
