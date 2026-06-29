import React from "react";

import { LayoutDashboard, FileText, CheckCircle, Briefcase, Users, PieChart, ShieldAlert } from "lucide-react";
import { useAuth } from "../../../hooks/use-auth.ts";

export function AdminLayout({ children, currentPath }: { children: React.ReactNode, currentPath?: string }) {
  const location = currentPath || window.location.hash.replace("#", "") || "/admin/dashboard";
  const { user, isLoading } = useAuth();

  // If loading or not an admin, we might want to redirect.
  // We'll let App.tsx handle the actual redirection logic, but we can double-check here.
  if (!isLoading && user && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 max-w-md w-full border border-black/10 text-center">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold font-serif italic mb-2">Access Denied</h2>
          <p className="text-sm text-gray-500 mb-6">You do not have administrative privileges to view this area.</p>
          <a href="#/" className="inline-block bg-black text-white px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-800">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/listings", label: "Listings Queue", icon: FileText },
    { href: "/admin/kyc", label: "KYC Reviews", icon: CheckCircle },
    { href: "/admin/deals", label: "Deal Monitor", icon: Briefcase },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/reports", label: "Reports & Analytics", icon: PieChart },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-black/10 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-black/10 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          <div>
            <h1 className="font-serif italic font-bold text-lg">FMI</h1>
            <span className="bg-red-600 text-white text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold absolute ml-8 -mt-2">
              ADMIN
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/admin/dashboard");
            return (
              <a key={item.href} href={`#${item.href}`} className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors ${
                isActive 
                  ? "bg-red-50 text-red-700 border-l-2 border-red-600" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-black border-l-2 border-transparent"
              }`}>
                <Icon className="w-4 h-4" />
                {item.label}
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-black/10 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h1 className="font-serif italic font-bold">FMI Admin</h1>
          </div>
          {/* Mobile menu toggle would go here */}
        </header>

        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
