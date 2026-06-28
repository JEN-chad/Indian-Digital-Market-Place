import React, { useState } from "react";
import { 
  LayoutDashboard, Search, FileText, Handshake, 
  Settings, Menu, X, ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle, User, LogOut, Bell 
} from "lucide-react";
import { useAuthStore } from "../../store/auth-store.ts";
import { useAuth } from "../../hooks/use-auth.ts";

interface BuyerLayoutProps {
  children: React.ReactNode;
  currentPath: string;
}

export default function BuyerLayout({ children, currentPath }: BuyerLayoutProps) {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigation = [
    { name: "Dashboard", path: "/buyer/dashboard", icon: LayoutDashboard },
    { name: "Browse Listings", path: "/listings", icon: Search },
    { name: "My Offers", path: "/buyer/offers", icon: FileText },
    { name: "My Deals", path: "/buyer/deals", icon: Handshake },
    { name: "Settings", path: "/buyer/settings", icon: Settings },
  ];

  const navigateTo = (path: string) => {
    window.location.hash = `#${path}`;
    setIsMobileOpen(false);
  };

  const kycStatus = user?.kycStatus || "not_started";

  const mockNotifications = [
    { id: "1", text: "Welcome to FMI Sandbox! Complete KYC to bid.", time: "Just now" },
    { id: "2", text: "NDA for SaaS project signed successfully.", time: "1 hour ago" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col md:flex-row text-brand-dark font-sans antialiased">
      {/* Mobile Header */}
      <header className="md:hidden bg-[#FDFCFB] border-b border-black/10 py-4 px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-green flex items-center justify-center text-white font-serif italic font-black text-lg">
            F
          </div>
          <span className="font-serif font-black tracking-tight text-sm uppercase">FMI Buyer Suite</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1 text-brand-dark hover:text-brand-green relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-brand-orange rounded-full" />
          </button>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-1.5 rounded-none text-brand-dark hover:bg-black/5"
            aria-label="Toggle navigation menu"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
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
              <span className="text-[9px] font-mono tracking-widest text-brand-green uppercase block -mt-0.5 font-bold">Buyer Suite</span>
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
            const isActive = currentPath === item.path || (item.path !== "/" && currentPath.startsWith(item.path));

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
                alt={user.name || "Buyer profile"}
                className="w-10 h-10 rounded-full border border-black/10 object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green border border-brand-green/20 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-brand-dark truncate">{user?.name || "Buyer Account"}</p>
              <p className="text-[10px] text-brand-green font-mono font-bold truncate capitalize">{user?.role || "Buyer"}</p>
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
      <div className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Desktop Header */}
        <header className="hidden md:flex bg-white border-b border-black/10 py-4 px-8 items-center justify-between sticky top-0 z-30">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-brand-dark/60">
            FMI Sandbox Environment
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-brand-dark hover:text-brand-green transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-orange rounded-full" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 bg-white border border-black/15 shadow-xl w-80 p-4 space-y-3 z-50 rounded-none animate-fade-in">
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-dark">Notifications</span>
                  <span className="text-[9px] font-mono text-brand-green font-bold uppercase">Clear</span>
                </div>
                <div className="space-y-2.5">
                  {mockNotifications.map((notif) => (
                    <div key={notif.id} className="text-xs border-b border-black/[0.02] pb-2 space-y-1">
                      <p className="text-brand-dark leading-snug">{notif.text}</p>
                      <span className="text-[9px] font-mono text-brand-dark/40 font-bold">{notif.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* KYC Status Warning Banner */}
        {kycStatus !== "approved" && (
          <div className="bg-brand-orange/5 border-b border-brand-orange/20 py-3 px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between text-brand-dark text-xs z-20">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-brand-orange shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold text-brand-orange">Verification Pending:</span>{" "}
                {kycStatus === "pending" || kycStatus === "in_review" ? (
                  <span>Your investor KYC details are under review. You can browse listings and sign NDAs, but cannot submit acquisition bids yet.</span>
                ) : (
                  <span>Verify your Investor profile (KYC) to message sellers and place legal acquisition bids on assets.</span>
                )}
              </div>
            </div>
            {kycStatus !== "pending" && kycStatus !== "in_review" && (
              <button
                onClick={() => navigateTo("/onboarding/role")}
                className="mt-2 sm:mt-0 bg-brand-orange hover:bg-brand-orange/90 text-white font-bold px-3 py-1.5 transition-colors cursor-pointer rounded-none text-xs"
              >
                Verify KYC Now
              </button>
            )}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 bg-[#FDFCFB]">
          {children}
        </main>
      </div>
    </div>
  );
}
