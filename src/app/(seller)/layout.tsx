import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, ListCollapse, BadgePercent, Handshake, 
  Settings, Menu, X, ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle, User, LogOut 
} from "lucide-react";
import { useAuthStore } from "../../store/auth-store.ts";
import { useAuth } from "../../hooks/use-auth.ts";

interface SellerLayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

export default function SellerLayout({ children, currentPath }: SellerLayoutProps) {
  const { user, setUser } = useAuthStore();
  const { logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Refresh KYC status from the server every time this layout mounts.
  // This fixes the inconsistency where the auth store holds a stale
  // kycStatus from login while the DB has already updated it to "approved".
  useEffect(() => {
    if (!user?.id) return;
    const refreshKycStatus = async () => {
      try {
        const token = localStorage.getItem("fmi_auth_token");
        const res = await fetch("/api/actions/get-kyc-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({}),
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          // Update auth store with the authoritative kycStatus from the users table
          if (data.success && data.userKycStatus && user) {
            const updatedUser = { ...user, kycStatus: data.userKycStatus };
            setUser(updatedUser);
          }
        }
      } catch (err) {
        // Non-critical: silently fail, stale status is better than a crash
        console.warn("Could not refresh KYC status:", err);
      }
    };
    refreshKycStatus();
  }, [user?.id]);

  const navigation = [
    { name: "Dashboard", path: "/seller/dashboard", icon: LayoutDashboard },
    { name: "My Listings", path: "/seller/listings", icon: ListCollapse },
    { name: "Offers", path: "/seller/offers", icon: BadgePercent },
    { name: "Deals", path: "/seller/deals", icon: Handshake },
    { name: "Settings", path: "/seller/settings", icon: Settings },
  ];

  const navigateTo = (path: string) => {
    window.location.hash = `#${path}`;
    setIsMobileOpen(false);
  };

  const kycStatus = user?.kycStatus || "not_started";

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col md:flex-row text-brand-dark font-sans antialiased">
      {/* Mobile Header */}
      <header className="md:hidden bg-brand-cream border-b border-black/10 py-4 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-green flex items-center justify-center text-white font-serif italic font-black text-lg">
            F
          </div>
          <span className="font-serif font-black tracking-tight text-sm uppercase">FMI Seller Hub</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 rounded-none text-brand-dark hover:bg-black/5"
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 transform ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out md:static md:flex md:flex-col w-64 bg-[#F7F5F0] text-brand-dark z-40 shrink-0 border-r border-black/10 min-h-screen`}
      >
        <div className="p-6 flex items-center justify-between border-b border-black/10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-brand-green flex items-center justify-center text-white font-serif italic font-extrabold text-lg">
              F
            </div>
            <div>
              <span className="text-sm font-serif font-black tracking-tight uppercase block">FMI Exchange</span>
              <span className="text-[9px] font-mono tracking-widest text-brand-green uppercase block -mt-0.5 font-bold">Seller Suite</span>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 rounded-none text-brand-dark/60 hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Back to Marketplace */}
        <div className="px-4 pt-4">
          <button
            onClick={() => navigateTo("/")}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-brand-green/80 hover:text-brand-green border border-brand-green/20 hover:bg-brand-green/5 transition-colors rounded-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Marketplace Home</span>
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            // Exact path match or parent path match
            const isActive = currentPath === item.path || currentPath.startsWith(item.path + "/");

            return (
              <button
                key={item.name}
                onClick={() => navigateTo(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-bold transition-all rounded-none ${
                  isActive
                    ? "bg-brand-green text-white border border-brand-green"
                    : "text-brand-dark/70 hover:text-brand-green hover:bg-[#1D4429]/5 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-black/10 flex items-center justify-between bg-black/[0.02] gap-2">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || "Seller profile"}
                className="w-10 h-10 rounded-full border border-black/10 object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-brand-dark truncate">{user?.name || "Seller Account"}</p>
              <p className="text-[10px] text-brand-green font-mono font-bold truncate capitalize">{user?.role || "Seller"}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
            }}
            title="Log Out"
            className="p-2 text-brand-dark/50 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0 cursor-pointer"
            aria-label="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main content and Banner Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* KYC Status Warning Banner */}
        {kycStatus !== "approved" && (
          <div className="bg-brand-orange/5 border-b border-brand-orange/20 py-3 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-brand-dark text-xs">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-brand-orange shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold text-brand-orange">KYC Action Required:</span>{" "}
                {kycStatus === "pending" || kycStatus === "in_review" ? (
                  <span>Your KYC profile is under review. You can prepare drafts, but listings cannot go live until approved.</span>
                ) : (
                  <span>Complete your Individual or Corporate KYC verification to list and sell businesses.</span>
                )}
              </div>
            </div>
            {kycStatus !== "pending" && kycStatus !== "in_review" && (
              <button
                onClick={() => navigateTo("/onboarding/role")}
                className="mt-2 sm:mt-0 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-3 py-1.5 transition-colors cursor-pointer rounded-none"
              >
                Verify KYC Now
              </button>
            )}
          </div>
        )}

        {/* Page children wrapped in standard layouts */}
        <main className="flex-1 overflow-y-auto bg-brand-cream">
          {children}
        </main>
      </div>
    </div>
  );
}
