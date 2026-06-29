import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, LogOut, Briefcase, User, Menu, Settings } from "lucide-react";
import { MobileNav } from "./mobile-nav.tsx";

interface NavbarProps {
  user: any;
  isAuthenticated: boolean;
  logout: () => void;
  navigateTo: (path: string) => void;
  currentPath: string;
}

export function Navbar({
  user,
  isAuthenticated,
  logout,
  navigateTo,
  currentPath,
}: NavbarProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDashboardRedirect = () => {
    setIsDropdownOpen(false);
    if (user?.role === "admin") {
      navigateTo("/admin/listings");
    } else if (user?.role === "buyer") {
      navigateTo("/buyer/dashboard");
    } else {
      navigateTo("/seller/dashboard");
    }
  };

  const handleSettingsRedirect = () => {
    setIsDropdownOpen(false);
    if (user?.role === "buyer") {
      navigateTo("/buyer/settings");
    } else {
      navigateTo("/seller/settings");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-black/10 bg-brand-cream/80 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-12">
          {/* Logo */}
          <div 
            onClick={() => navigateTo("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center bg-brand-navy font-serif italic text-xl font-extrabold text-white shadow-md transition-transform group-hover:scale-[1.03]">
              F
            </div>
            <div>
              <span className="block font-serif text-xl font-black uppercase tracking-tight text-brand-navy">FMI</span>
              <span className="block -mt-1 font-mono text-[9px] tracking-widest text-[#1A1A1A]/40 uppercase">Digital Exchange</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold tracking-widest uppercase text-brand-navy/80">
            <button 
              onClick={() => navigateTo("/how-it-works")} 
              className={`hover:text-brand-green-india transition-colors text-left cursor-pointer ${currentPath === "/how-it-works" ? "text-brand-green-india border-b-2 border-brand-green-india/30 pb-1" : ""}`}
            >
              How It Works
            </button>
            <button 
              onClick={() => navigateTo("/listings")} 
              className={`hover:text-brand-green-india transition-colors text-left cursor-pointer ${currentPath.startsWith("/listings") ? "text-brand-green-india border-b-2 border-brand-green-india/30 pb-1" : ""}`}
            >
              Browse Businesses
            </button>
            <button 
              onClick={() => navigateTo("/about")} 
              className={`hover:text-brand-green-india transition-colors text-left cursor-pointer ${currentPath === "/about" ? "text-brand-green-india border-b-2 border-brand-green-india/30 pb-1" : ""}`}
            >
              About
            </button>
          </div>

          {/* Desktop CTAs / Auth State */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => navigateTo(isAuthenticated ? "/seller/listings/new" : "/login")}
              className="border border-brand-green-india text-brand-green-india hover:bg-brand-green-india/5 font-semibold text-xs tracking-widest uppercase px-5 py-2.5 transition-all cursor-pointer rounded-none"
            >
              List Your Business
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 border border-black/10 px-4 py-2 hover:bg-black/[0.02] transition-all text-xs font-bold cursor-pointer rounded-none"
                >
                  <div className="w-5 h-5 bg-brand-navy text-white rounded-full flex items-center justify-center text-[10px] font-extrabold uppercase">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <span className="truncate max-w-[100px]">{user?.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-brand-cream border border-black/10 shadow-xl z-50 rounded-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Metadata */}
                    <div className="p-3 border-b border-black/5 bg-black/[0.01]">
                      <p className="text-xs font-black truncate">{user?.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
                      <div className="flex gap-1.5 mt-2">
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded capitalize ${user?.kycStatus === 'approved' ? 'bg-brand-green-india/10 text-brand-green-india' : 'bg-brand-saffron/10 text-brand-saffron'}`}>
                          KYC: {user?.kycStatus?.toUpperCase()}
                        </span>
                        <span className="text-[8px] font-mono px-1.5 py-0.5 rounded capitalize bg-black/5 text-gray-600">
                          {user?.role?.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      <button
                        onClick={handleDashboardRedirect}
                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-black/[0.03] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-brand-green-india" />
                        <span>My Dashboard</span>
                      </button>
                      <button
                        onClick={handleSettingsRedirect}
                        className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-black/[0.03] flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-brand-green-india" />
                        <span>Settings</span>
                      </button>
                    </div>

                    {/* Logout */}
                    <div className="border-t border-black/5 py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigateTo("/login")}
                className="bg-brand-navy hover:bg-brand-navy/95 text-white font-bold text-xs tracking-widest uppercase px-5 py-2.5 transition-all cursor-pointer rounded-none"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1 text-brand-navy/80 hover:text-brand-navy transition-colors cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <MobileNav
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        user={user}
        isAuthenticated={isAuthenticated}
        logout={logout}
        navigateTo={navigateTo}
      />
    </>
  );
}

export default Navbar;
