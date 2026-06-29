import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Lock, Handshake, CheckCircle2, ShieldCheck, PlusCircle, 
  MessageSquare, Banknote, HelpCircle, ChevronDown, Check, ArrowRight,
  ShieldAlert, Sparkles, Building, Landmark, ChevronRight
} from "lucide-react";
import { Navbar } from "../../../components/layout/navbar.tsx";
import { Footer } from "../../../components/layout/footer.tsx";

export function HowItWorksPage({
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
  const [activeTab, setActiveTab] = useState<"buyers" | "sellers" | "compliance">("buyers");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleListBusiness = () => {
    if (isAuthenticated) {
      navigateTo("/seller/listings/new");
    } else {
      navigateTo("/login");
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col font-sans">
      <Navbar 
        user={user} 
        isAuthenticated={isAuthenticated} 
        logout={logout} 
        navigateTo={navigateTo} 
        currentPath="/how-it-works" 
      />

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#FDFCFB] to-[#F7F5F0] py-16 px-6 md:px-12 border-b border-black/5 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-brand-green-india/20 bg-brand-green-india/5 text-brand-green-india text-[10px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            Transaction Guide
          </div>
          <h1 className="font-serif italic font-black text-4xl md:text-5xl text-brand-navy leading-none tracking-tight">
            How FMI Secures Digital Mergers & Acquisitions
          </h1>
          <p className="text-xs md:text-sm text-brand-dark/70 max-w-xl mx-auto leading-relaxed">
            FMI provides a structured, legally sound framework for transferring web applications, SaaS platforms, D2C brands, and content assets. Explore our process pathways.
          </p>
        </div>
      </section>

      {/* Tabs Selector */}
      <section className="py-8 bg-white border-b border-black/5 px-6 sticky top-16 z-30">
        <div className="max-w-4xl mx-auto flex bg-brand-cream p-1.5 border border-black/10">
          <button
            onClick={() => setActiveTab("buyers")}
            className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase text-center transition-all cursor-pointer ${activeTab === "buyers" ? "bg-brand-navy text-white" : "text-brand-dark/65 hover:text-brand-dark"}`}
          >
            Buyer Pathway
          </button>
          <button
            onClick={() => setActiveTab("sellers")}
            className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase text-center transition-all cursor-pointer ${activeTab === "sellers" ? "bg-brand-navy text-white" : "text-brand-dark/65 hover:text-brand-dark"}`}
          >
            Seller Pathway
          </button>
          <button
            onClick={() => setActiveTab("compliance")}
            className={`flex-1 py-3 text-xs font-bold tracking-widest uppercase text-center transition-all cursor-pointer ${activeTab === "compliance" ? "bg-brand-navy text-white" : "text-brand-dark/65 hover:text-brand-dark"}`}
          >
            Legal & Escrow
          </button>
        </div>
      </section>

      {/* Pathway Details */}
      <section className="py-16 px-6 md:px-12 bg-brand-cream border-b border-black/5">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "buyers" && (
              <motion.div
                key="buyers"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-16"
              >
                {/* Horizontal Stepper Diagram (drawn visually) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                  {/* Line connection */}
                  <div className="hidden md:block absolute top-10 left-8 right-8 h-0.5 bg-black/10 -z-10" />

                  <div className="space-y-4 bg-white border border-black/10 p-6 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-brand-green-india text-white flex items-center justify-center font-bold text-xs">1</div>
                    <h3 className="font-serif italic font-bold text-sm text-brand-navy">Verify Profile</h3>
                    <p className="text-[11px] text-brand-dark/60 leading-relaxed">Submit your individual Aadhaar/PAN or company registration. Gain immediate vetted status.</p>
                  </div>

                  <div className="space-y-4 bg-white border border-black/10 p-6 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-brand-green-india text-white flex items-center justify-center font-bold text-xs">2</div>
                    <h3 className="font-serif italic font-bold text-sm text-brand-navy">Sign Mutual NDA</h3>
                    <p className="text-[11px] text-brand-dark/60 leading-relaxed">Sign the digitale NDA on-screen. Instantly unlock gated financial PDFs and real-time integrations.</p>
                  </div>

                  <div className="space-y-4 bg-white border border-black/10 p-6 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-brand-green-india text-white flex items-center justify-center font-bold text-xs">3</div>
                    <h3 className="font-serif italic font-bold text-sm text-brand-navy">Secure Escrow</h3>
                    <p className="text-[11px] text-brand-dark/60 leading-relaxed">Lock the funds securely via our licensed node. The seller is notified that capital is guaranteed.</p>
                  </div>

                  <div className="space-y-4 bg-white border border-black/10 p-6 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-brand-green-india text-white flex items-center justify-center font-bold text-xs">4</div>
                    <h3 className="font-serif italic font-bold text-sm text-brand-navy">Takeover Assets</h3>
                    <p className="text-[11px] text-brand-dark/60 leading-relaxed">Inspect codebases, accounts and domain DNS. Verify the handoff, release escrow and complete.</p>
                  </div>
                </div>

                {/* Detailed Steps breakdown */}
                <div className="space-y-12 pt-8 border-t border-black/10">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-7 space-y-4">
                      <h2 className="text-xs font-mono font-bold tracking-widest text-brand-green-india uppercase">Diligence Phase</h2>
                      <h3 className="font-serif italic font-black text-2xl text-brand-navy">01. Smart NDA-Gating & Live Analytics Inspect</h3>
                      <p className="text-xs text-brand-dark/70 leading-relaxed">
                        To protect trade secrets, FMI enforces digital NDAs. Once signed, you get full access to the Private Document Vault containing audited balance sheets and tax returns. Furthermore, you can review live, verified third-party API integrations (such as Google Analytics traffic and Stripe/Razorpay payout ledgers) directly inside the listing panel.
                      </p>
                    </div>
                    {/* Visual UI mockup */}
                    <div className="md:col-span-5 bg-white border border-black/10 p-4 shadow-sm space-y-3 font-mono text-[10px]">
                      <div className="flex items-center justify-between border-b border-black/5 pb-2">
                        <span className="font-bold text-brand-navy">🔒 NDA LOCKED ASSET</span>
                        <span className="text-red-500 font-bold">NDA SIGN REQUIRED</span>
                      </div>
                      <div className="space-y-1 bg-black/[0.02] p-2 border border-black/[0.05]">
                        <p className="text-[9px] text-gray-500">AVAILABLE UPON SIGNATURE:</p>
                        <p className="font-bold">✓ FY25 GST Tax Invoices (Audited)</p>
                        <p className="font-bold">✓ Google Search Console API metrics</p>
                        <p className="font-bold">✓ Source Code repository blueprints</p>
                      </div>
                      <button className="w-full bg-brand-navy text-white text-[9px] font-bold py-2 uppercase tracking-widest text-center cursor-pointer">
                        Sign Mutual NDA Instantly
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    {/* Visual UI mockup */}
                    <div className="md:col-span-5 bg-white border border-black/10 p-4 shadow-sm space-y-3 font-mono text-[10px] order-last md:order-first">
                      <div className="border-b border-black/5 pb-2 font-bold text-brand-navy">
                        STRUCTURED PROPOSAL FORM
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[8px] text-gray-500 block uppercase">Valuation Offer</label>
                          <div className="font-bold text-sm text-brand-green-india">₹1,50,00,000 (INR)</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[9px]">
                          <div>
                            <span className="text-[8px] text-gray-500 block">Upfront Payment</span>
                            <span className="font-bold">₹1,20,00,000 (80%)</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-gray-500 block">Earnout (12 months)</span>
                            <span className="font-bold">₹30,00,000 (20%)</span>
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-black/5 pt-2 text-[8px] text-gray-500">
                        *Escrow deposit required upon mutual agreement signature.
                      </div>
                    </div>
                    <div className="md:col-span-7 space-y-4">
                      <h2 className="text-xs font-mono font-bold tracking-widest text-brand-green-india uppercase">Negotiation Phase</h2>
                      <h3 className="font-serif italic font-black text-2xl text-brand-navy">02. Structured Bidding & Custom Earnout Clauses</h3>
                      <p className="text-xs text-brand-dark/70 leading-relaxed">
                        FMI eliminates vague, unstructured email conversations. Submit formal business acquisition proposals with exact pricing, upfront cash percentiles, and performance-based earnout structures. Sellers can review, counter, or accept proposals directly within their dashboards. Once accepted, FMI automatically instantiates a secure collaborative Deal Room.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "sellers" && (
              <motion.div
                key="sellers"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-16"
              >
                {/* Stepper Diagram */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                  <div className="hidden md:block absolute top-10 left-8 right-8 h-0.5 bg-black/10 -z-10" />

                  <div className="space-y-4 bg-white border border-black/10 p-6 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-brand-green-india text-white flex items-center justify-center font-bold text-xs">1</div>
                    <h3 className="font-serif italic font-bold text-sm text-brand-navy">Complete KYC</h3>
                    <p className="text-[11px] text-brand-dark/60 leading-relaxed">Authorize your listing with standard PAN validation to ensure marketplace authenticity.</p>
                  </div>

                  <div className="space-y-4 bg-white border border-black/10 p-6 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-brand-green-india text-white flex items-center justify-center font-bold text-xs">2</div>
                    <h3 className="font-serif italic font-bold text-sm text-brand-navy">Configure Listing</h3>
                    <p className="text-[11px] text-brand-dark/60 leading-relaxed">Supply financials, metrics, models and upload dossiers to the private document vault.</p>
                  </div>

                  <div className="space-y-4 bg-white border border-black/10 p-6 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-brand-green-india text-white flex items-center justify-center font-bold text-xs">3</div>
                    <h3 className="font-serif italic font-bold text-sm text-brand-navy">Evaluate Bids</h3>
                    <p className="text-[11px] text-brand-dark/60 leading-relaxed font-sans">Approve NDA releases, chat with verified buyers, and review proposed deal structures.</p>
                  </div>

                  <div className="space-y-4 bg-white border border-black/10 p-6 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-brand-green-india text-white flex items-center justify-center font-bold text-xs">4</div>
                    <h3 className="font-serif italic font-bold text-sm text-brand-navy">Payout Dispatch</h3>
                    <p className="text-[11px] text-brand-dark/60 leading-relaxed">Conduct asset migration. Once the buyer completes their checklist, receive payouts via NEFT/RTGS.</p>
                  </div>
                </div>

                {/* Detailed Steps breakdown */}
                <div className="space-y-12 pt-8 border-t border-black/10">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-7 space-y-4">
                      <h2 className="text-xs font-mono font-bold tracking-widest text-brand-green-india uppercase">Listing Phase</h2>
                      <h3 className="font-serif italic font-black text-2xl text-brand-navy">01. High-Fidelity Asset Packaging</h3>
                      <p className="text-xs text-brand-dark/70 leading-relaxed">
                        Setting up a listing is simple yet thorough. You provide details regarding the technology stack, traffic data, customer repeat metrics, and private financials. You can choose whether to make the listing public or NDA-protected. When NDA protection is enabled, you can optionally require a small KYC processing fee to filter out casual browsers.
                      </p>
                    </div>
                    {/* Visual UI mockup */}
                    <div className="md:col-span-5 bg-white border border-black/10 p-4 shadow-sm space-y-3 font-mono text-[10px]">
                      <div className="border-b border-black/5 pb-2 font-bold text-brand-navy">
                        LISTING CONFIGURATION
                      </div>
                      <div className="space-y-2 text-[9px]">
                        <div className="flex justify-between">
                          <span>NDA Privacy Protection</span>
                          <span className="text-brand-green-india font-bold">ENABLED</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Verified Analytics Sync</span>
                          <span className="text-brand-green-india font-bold">CONNECTED</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dossier Attachment</span>
                          <span className="text-brand-green-india font-bold">3 FILES UPLOADED</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "compliance" && (
              <motion.div
                key="compliance"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="space-y-12"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7 space-y-4">
                    <h2 className="text-xs font-mono font-bold tracking-widest text-brand-green-india uppercase">Trust Architecture</h2>
                    <h3 className="font-serif italic font-black text-2xl text-brand-navy">RBI-Compliant INR Escrow Protection</h3>
                    <p className="text-xs text-brand-dark/70 leading-relaxed">
                      To safeguard transactions, FMI routes payments through trustee accounts managed by RBI-regulated banking institutions. 
                      Once both parties sign the Asset Purchase Agreement, the buyer deposits the agreed funds into the escrow vault. The funds are legally locked and cannot be released until the seller completes the asset transition checklist (e.g. codebase transfer, DNS pointing, customer record delivery) and both parties sign the final digital handoff certificate.
                    </p>
                  </div>
                  
                  {/* Escrow flow chart illustration */}
                  <div className="md:col-span-5 bg-white border border-black/10 p-6 shadow-sm space-y-4">
                    <h4 className="text-xs font-mono font-bold text-brand-navy border-b border-black/5 pb-2 text-center uppercase">Escrow Protocol Flow</h4>
                    <div className="space-y-3 text-[10px] font-mono">
                      <div className="flex items-center justify-between bg-brand-saffron/10 text-brand-saffron border border-brand-saffron/20 p-2">
                        <span>1. BUYER FUND DEPOSIT</span>
                        <span>₹ Secured</span>
                      </div>
                      <div className="text-center text-gray-400 font-bold">↓</div>
                      <div className="flex items-center justify-between bg-brand-navy/10 text-brand-navy border border-brand-navy/20 p-2">
                        <span>2. TRANSITION CHECKLIST RELEASE</span>
                        <span>DNS & Code Handoff</span>
                      </div>
                      <div className="text-center text-gray-400 font-bold">↓</div>
                      <div className="flex items-center justify-between bg-brand-green-india/10 text-brand-green-india border border-brand-green-india/20 p-2">
                        <span>3. TRUSTEE DISBURSEMENT</span>
                        <span>Seller Paid</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Dedicated FAQ Accordion */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-white border-b border-black/5">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs uppercase font-mono font-bold tracking-[0.25em] text-brand-green-india">
              Process FAQ
            </h2>
            <h3 className="font-serif italic font-black text-3xl text-brand-navy tracking-tight">
              Understanding the Legal Framework
            </h3>
          </div>

          <div className="space-y-4">
            {[
              { q: "Is the digital NDA legally binding under Indian law?", a: "Yes. NDAs executed on FMI are fully binding under Section 10A of the Information Technology Act, 2000, which gives legal recognition to electronic contracts and digital signatures." },
              { q: "How long can funds remain in the Escrow Trustee account?", a: "Funds can be held in escrow for up to 90 days. If a dispute arises, the funds remain secured in the trustee account until mutual settlement or arbitration is resolved." },
              { q: "What happens if a seller does not deliver the assets?", a: "If the seller fails to complete the handoff checklist items within the agreed timeline, the buyer can initiate a dispute. The escrow trustee will audit the checklist log and return the funds to the buyer if default is confirmed." },
              { q: "How is GST accounted for during a digital business sale?", a: "Digital asset transfers are generally classified as a 'transfer of business as a going concern' which is exempt from GST under Indian tax laws. FMI provides compliance invoicing templates to report these transfers to tax authorities." }
            ].map((faq, idx) => (
              <div key={idx} className="border border-black/10 bg-[#FDFCFB] overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-serif italic font-bold text-sm md:text-base text-brand-navy hover:bg-black/[0.01] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-brand-navy/60 transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`} />
                </button>
                
                <AnimatePresence initial={false}>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-5 pt-1 text-xs md:text-sm text-brand-dark/70 leading-relaxed font-sans font-medium border-t border-black/[0.03]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 bg-brand-navy text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="w-1/2 h-full bg-brand-saffron" />
          <div className="w-1/2 h-full bg-brand-green-india" />
        </div>
        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h2 className="font-serif italic font-black text-3xl md:text-4xl">Ready to Start Your Acquisition Journey?</h2>
          <p className="text-xs text-white/70 max-w-sm mx-auto leading-relaxed">
            Create an account today to verify your KYC and access the private marketplace listings.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigateTo("/listings")}
              className="bg-brand-saffron hover:bg-brand-saffron/90 text-brand-navy font-bold text-xs tracking-widest uppercase px-8 py-3.5 transition-colors cursor-pointer"
            >
              Start Browsing
            </button>
            <button
              onClick={handleListBusiness}
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

export default HowItWorksPage;
