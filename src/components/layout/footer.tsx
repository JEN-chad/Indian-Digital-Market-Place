import React from "react";
import { Globe, Heart } from "lucide-react";

interface FooterProps {
  navigateTo: (path: string) => void;
}

export function Footer({ navigateTo }: FooterProps) {
  return (
    <footer className="bg-brand-navy border-t border-white/10 text-white/60 py-12 md:py-16 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        {/* Brand block (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo("/")}>
            <div className="flex h-9 w-9 items-center justify-center bg-white font-serif italic text-lg font-extrabold text-brand-navy shadow-sm">
              F
            </div>
            <div>
              <span className="block font-serif text-lg font-black uppercase tracking-tight text-white">FMI</span>
              <span className="block -mt-1 font-mono text-[8px] tracking-widest text-white/40 uppercase">Digital Exchange</span>
            </div>
          </div>
          <p className="text-xs text-white/50 max-w-sm leading-relaxed">
            FMI is India's premier trust-first marketplace for digital businesses. Buy and sell validated SaaS tools, eCommerce brands, apps, and content portfolios under Indian regulatory frameworks.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/40">
            <span>Corporate Identification Number</span>
            <span className="text-brand-saffron font-bold">U72900KA2024PTC123456</span>
          </div>
        </div>

        {/* Links (3 cols) */}
        <div className="md:col-span-3 space-y-4">
          <h4 className="text-xs font-black tracking-widest uppercase text-white font-mono">Platform</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => navigateTo("/how-it-works")} className="hover:text-white transition-colors text-left cursor-pointer">
                How It Works
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo("/listings")} className="hover:text-white transition-colors text-left cursor-pointer">
                Browse Directory
              </button>
            </li>
            <li>
              <button onClick={() => navigateTo("/about")} className="hover:text-white transition-colors text-left cursor-pointer">
                About FMI
              </button>
            </li>
            <li>
              <a href="#/blog" className="hover:text-white transition-colors block text-left">
                Insights & Blog
              </a>
            </li>
            <li>
              <a href="#/careers" className="hover:text-white transition-colors block text-left">
                Careers (Hiring)
              </a>
            </li>
          </ul>
        </div>

        {/* Legal & Compliance (4 cols) */}
        <div className="md:col-span-4 space-y-4">
          <h4 className="text-xs font-black tracking-widest uppercase text-white font-mono">Legal & Compliance</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <a href="#/privacy" className="hover:text-white transition-colors block text-left">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#/terms" className="hover:text-white transition-colors block text-left">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#/refunds" className="hover:text-white transition-colors block text-left">
                Refund Policy
              </a>
            </li>
            <li>
              <div className="flex items-center gap-1.5 pt-2 text-[10px] text-white/40 font-mono">
                <Globe className="w-3.5 h-3.5 text-brand-green-india" />
                <span>GST Compliant Invoicing & Digital NDA Escrows</span>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span>Secure Platform</span>
          <span className="text-white/20">|</span>
          <span>Escrow Protected (INR)</span>
          <span className="text-white/20">|</span>
          <span>India Data Resident</span>
        </div>
        <div className="flex items-center gap-1">
          <span>&copy; {new Date().getFullYear()} FMI Technologies Pvt. Ltd. Made with</span>
          <Heart className="w-3 h-3 text-red-500 fill-current animate-pulse" />
          <span>in India</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
