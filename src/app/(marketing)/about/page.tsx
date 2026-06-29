import React from "react";
import { Sparkles, ShieldCheck, Heart, Flag, Users, HelpCircle, Eye, Compass } from "lucide-react";
import { Navbar } from "../../../components/layout/navbar.tsx";
import { Footer } from "../../../components/layout/footer.tsx";

export function AboutPage({
  user,
  isAuthenticated,
  logout,
  navigateTo,
}: {
  user: any;
  isAuthenticated: boolean;
  logout: () => void;
  navigateTo: (path: string) => void;
}) {
  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col font-sans">
      <Navbar 
        user={user} 
        isAuthenticated={isAuthenticated} 
        logout={logout} 
        navigateTo={navigateTo} 
        currentPath="/about" 
      />

      {/* Hero Mission */}
      <section className="bg-gradient-to-b from-[#FDFCFB] to-[#F7F5F0] py-16 px-6 md:px-12 border-b border-black/5 text-center relative overflow-hidden">
        {/* Background gradient watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-green-india/5 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-brand-green-india/20 bg-brand-green-india/5 text-brand-green-india text-[10px] font-black uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5" />
            Our Mission
          </div>
          <h1 className="font-serif italic font-black text-4xl md:text-5xl text-brand-navy leading-none tracking-tight">
            Democratizing Digital Ownership across India
          </h1>
          <p className="text-sm md:text-base text-brand-dark/70 max-w-xl mx-auto leading-relaxed font-medium">
            FMI is on a mission to build India's most secure, compliance-first, and friction-free exchange for buying and selling tech assets. We bridge the trust gap between ambitious builders and qualified acquirers.
          </p>
        </div>
      </section>

      {/* Why We Built FMI Story */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-white border-b border-black/5">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-7 space-y-6">
            <h2 className="text-xs font-mono font-bold tracking-[0.2em] text-brand-green-india uppercase">Origin Story</h2>
            <h3 className="font-serif italic font-black text-3xl text-brand-navy tracking-tight leading-tight">
              Why We Built FMI
            </h3>
            <div className="space-y-4 text-xs md:text-sm text-brand-dark/75 leading-relaxed font-medium">
              <p>
                In the rapidly growing Indian startup ecosystem, thousands of high-quality digital assets—profitable micro-SaaS utilities, niche e-commerce portals, and authoritative content properties—are created every year. Yet, when builders want to exit or transition, they face a fragmented and risky landscape.
              </p>
              <p>
                Brokers charge exorbitant fees, negotiations are conducted through unstructured WhatsApp threads, and buyers risk acquiring listings with inflated, unverified traffic metrics. Even worse, there has been no secure domestic escrow platform built natively for Indian compliance standards (like PAN/Aadhaar gating and GST compliance).
              </p>
              <p>
                We built FMI to resolve these exact issues. By combining automated digital NDAs, MCA company verifications, verified analytics APIs, and RBI-licensed trustee escrow accounts, FMI ensures that buying or selling a digital business is as structured and safe as buying real estate.
              </p>
            </div>
          </div>
          
          <div className="md:col-span-5 bg-[#F7F5F0] border border-black/10 p-6 md:p-8 space-y-6 relative">
            <div className="absolute top-0 right-0 w-16 h-1 bg-brand-saffron" />
            <h4 className="font-serif italic font-bold text-lg text-brand-navy">Core Values</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-brand-green-india shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-brand-navy">Verification First</h5>
                  <p className="text-[11px] text-brand-dark/60 mt-0.5">Every user completes government database matches before unlocking private files.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Heart className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-brand-navy">Founder Respect</h5>
                  <p className="text-[11px] text-brand-dark/60 mt-0.5">We respect the years of hard work founders put into building assets by enforcing strict confidentiality.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Flag className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <h5 className="text-xs font-bold text-brand-navy">India Sovereign Tech</h5>
                  <p className="text-[11px] text-brand-dark/60 mt-0.5">All customer data, code blueprints, and tax records reside locally to secure digital sovereign IP.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-brand-cream border-b border-black/5">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-xs uppercase font-mono font-bold tracking-[0.25em] text-brand-green-india">
              The Creators
            </h2>
            <h3 className="font-serif italic font-black text-3xl text-brand-navy tracking-tight">
              FMI Leadership Team
            </h3>
            <p className="text-xs text-brand-dark/60 font-medium">
              A group of builders, engineers, and financial compliance experts coming from India's leading fintech organizations.
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { name: "Varun Sharma", role: "Co-Founder & CEO", origin: "Ex-Razorpay Fintech Lead", initial: "VS" },
              { name: "Deepa Krishnan", role: "Co-Founder & CTO", origin: "Ex-HDFC Bank Developer", initial: "DK" },
              { name: "Nikhil Kamath", role: "Chief Compliance Officer", origin: "Corporate Law Specialist", initial: "NK" }
            ].map((member, idx) => (
              <div key={idx} className="bg-white border border-black/10 p-6 text-center space-y-4 hover:shadow-md transition-all">
                <div className="w-20 h-20 rounded-full bg-brand-navy/5 text-brand-navy border border-black/10 mx-auto flex items-center justify-center text-xl font-serif font-black italic">
                  {member.initial}
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif italic font-bold text-base text-brand-navy">{member.name}</h4>
                  <p className="text-xs font-bold text-brand-green-india">{member.role}</p>
                  <p className="text-[10px] text-brand-dark/50 font-mono uppercase tracking-wider">{member.origin}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-20 px-6 bg-brand-navy text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="w-1/2 h-full bg-brand-saffron" />
          <div className="w-1/2 h-full bg-brand-green-india" />
        </div>
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h2 className="font-serif italic font-black text-3xl md:text-4xl">Join FMI Exchange Today</h2>
          <p className="text-xs text-white/70 max-w-sm mx-auto leading-relaxed">
            Onboard as a buyer or seller. Verify your account and unlock the next chapter of digital commerce.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigateTo("/listings")}
              className="bg-brand-saffron hover:bg-brand-saffron/90 text-brand-navy font-bold text-xs tracking-widest uppercase px-8 py-3.5 transition-colors cursor-pointer"
            >
              Start Browsing
            </button>
            <button
              onClick={() => navigateTo(isAuthenticated ? "/seller/listings/new" : "/login")}
              className="border border-white hover:bg-white/10 text-white font-bold text-xs tracking-widest uppercase px-8 py-3.5 transition-colors cursor-pointer"
            >
              List My Business
            </button>
          </div>
        </div>
      </section>

      <Footer navigateTo={navigateTo} />
    </div>
  );
}

export default AboutPage;
