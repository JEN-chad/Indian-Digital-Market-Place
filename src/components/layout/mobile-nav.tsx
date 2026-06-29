import React from "react";
import { motion } from "framer-motion";
import { X, LogOut, Briefcase, User, HelpCircle, Search, Info } from "lucide-react";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isAuthenticated: boolean;
  logout: () => void;
  navigateTo: (path: string) => void;
}

export function MobileNav({
  isOpen,
  onClose,
  user,
  isAuthenticated,
  logout,
  navigateTo,
}: MobileNavProps) {
  if (!isOpen) return null;

  const handleLinkClick = (path: string) => {
    navigateTo(path);
    onClose();
  };

  const handleLogoutClick = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-brand-navy text-white p-6 shadow-2xl flex flex-col justify-between z-10"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-green-india flex items-center justify-center text-white font-serif italic font-extrabold text-lg">
                F
              </div>
              <div>
                <span className="text-lg font-serif font-black tracking-tight uppercase block">FMI</span>
                <span className="text-[8px] font-mono tracking-widest text-white/40 uppercase block -mt-1">India Exchange</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 text-white/80 hover:text-white transition-all rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <button
              onClick={() => handleLinkClick("/how-it-works")}
              className="w-full text-left flex items-center gap-3 py-2 px-3 hover:bg-white/5 text-sm font-semibold tracking-wider uppercase text-white/80 hover:text-white transition-all"
            >
              <HelpCircle className="w-4 h-4 text-brand-saffron" />
              <span>How It Works</span>
            </button>
            <button
              onClick={() => handleLinkClick("/listings")}
              className="w-full text-left flex items-center gap-3 py-2 px-3 hover:bg-white/5 text-sm font-semibold tracking-wider uppercase text-white/80 hover:text-white transition-all"
            >
              <Search className="w-4 h-4 text-brand-green-india" />
              <span>Browse Businesses</span>
            </button>
            <button
              onClick={() => handleLinkClick("/about")}
              className="w-full text-left flex items-center gap-3 py-2 px-3 hover:bg-white/5 text-sm font-semibold tracking-wider uppercase text-white/80 hover:text-white transition-all"
            >
              <Info className="w-4 h-4 text-blue-400" />
              <span>About FMI</span>
            </button>
          </div>

          {/* User Section (Mobile) */}
          <div className="border-t border-white/10 mt-8 pt-6">
            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="px-3 py-2 bg-white/5 rounded border border-white/5">
                  <p className="text-xs font-mono text-white/50 uppercase tracking-wider">Logged In As</p>
                  <p className="text-sm font-black truncate">{user.name}</p>
                  <p className="text-[10px] text-white/60 truncate">{user.email}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[8px] font-mono font-bold bg-brand-green-india/20 text-brand-green-india border border-brand-green-india/30 px-1.5 py-0.5 uppercase">
                      KYC: {user.kycStatus}
                    </span>
                    <span className="text-[8px] font-mono font-bold bg-brand-saffron/20 text-brand-saffron border border-brand-saffron/30 px-1.5 py-0.5 uppercase">
                      Role: {user.role}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <button
                    onClick={() => handleLinkClick(user.role === "buyer" ? "/buyer/dashboard" : "/seller/dashboard")}
                    className="w-full text-left flex items-center gap-3 py-2 px-3 hover:bg-white/5 text-sm font-semibold text-white/80 hover:text-white transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span>My Dashboard</span>
                  </button>
                  <button
                    onClick={() => handleLinkClick(user.role === "buyer" ? "/buyer/settings" : "/seller/settings")}
                    className="w-full text-left flex items-center gap-3 py-2 px-3 hover:bg-white/5 text-sm font-semibold text-white/80 hover:text-white transition-all"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 px-3">
                <button
                  onClick={() => handleLinkClick("/login")}
                  className="w-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold tracking-widest uppercase py-3 border border-white/10 transition-all rounded text-center cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleLinkClick("/signup")}
                  className="w-full bg-brand-green-india hover:bg-brand-green-india/90 text-white text-xs font-bold tracking-widest uppercase py-3 transition-all rounded text-center shadow-lg shadow-brand-green-india/10 cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer info in Mobile menu */}
        <div>
          {isAuthenticated && (
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-600/10 border border-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-all text-xs font-bold tracking-widest uppercase rounded cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          )}

          <div className="text-center mt-6">
            <button
              onClick={() => handleLinkClick("/seller/listings/new")}
              className="w-full bg-gradient-to-r from-brand-saffron to-brand-green-india hover:opacity-95 text-white text-[10px] font-black tracking-widest uppercase py-3 rounded mb-4 cursor-pointer"
            >
              List Your Business
            </button>
            <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
              FMI India Pvt. Ltd. &copy; 2026
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default MobileNav;
