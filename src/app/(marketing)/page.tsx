import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  Search, Lock, Unlock, Handshake, CheckCircle, Shield, PlusCircle, 
  MessageCircle, Banknote, CheckCircle2, AlertCircle, ArrowRight, 
  ChevronRight, Star, ChevronLeft, HelpCircle, Info, Globe, FileText, 
  ArrowUpRight, ShieldCheck, Cpu, ShoppingCart, Smartphone, BookOpen, 
  ChevronDown, ShieldAlert, Sparkles, Building, Play, Briefcase
} from "lucide-react";
import { Navbar } from "../../components/layout/navbar.tsx";
import { Footer } from "../../components/layout/footer.tsx";
import { ListingCard } from "../../components/listings/listing-card.tsx";

// CountUp Component utilizing Framer Motion's useInView
interface CountUpProps {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

export function CountUp({ target, prefix = "", suffix = "", duration = 1.5 }: CountUpProps) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const end = target;
    if (start === end) return;

    const totalMs = duration * 1000;
    const startTime = performance.now();

    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalMs, 1);
      // easeOutQuad easing
      const easedProgress = progress * (2 - progress);
      setCount(Math.floor(easedProgress * (end - start) + start));
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="font-serif text-3xl md:text-5xl font-black text-brand-navy tracking-tight">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

// Demo Listings for padding / fallback
const DEMO_LISTINGS = [
  {
    id: "demo-saas",
    title: "HRTech Automated Payroll Platform for Indian SMEs",
    slug: "hrtech-automated-payroll-platform",
    tagline: "High-growth compliance & HR automation suite with 85% gross margins.",
    assetType: "saas" as const,
    industry: "Technology & Software",
    askingPrice: 31000000, // ₹3.1 Cr
    monthlyRevenue: 1250000,
    monthlyProfit: 820000,
    ndaRequired: true,
    isFeatured: true
  },
  {
    id: "demo-ecommerce",
    title: "Eco-Friendly Ayurvedic D2C Wellness Brand",
    slug: "eco-friendly-ayurvedic-d2c-brand",
    tagline: "Kerala-sourced premium hair and skincare brand with high retention.",
    assetType: "ecommerce" as const,
    industry: "Retail & Consumer Goods",
    askingPrice: 42000000, // ₹4.2 Cr
    monthlyRevenue: 3500000,
    monthlyProfit: 1450000,
    ndaRequired: true,
    isFeatured: true
  },
  {
    id: "demo-app",
    title: "Bengaluru Logistics Co-ordination Mobile App",
    slug: "bengaluru-logistics-coordination-app",
    tagline: "Intra-city hyper-local B2B dispatch engine with 25k monthly deliveries.",
    assetType: "app" as const,
    industry: "Logistics & Transport",
    askingPrice: 18000000, // ₹1.8 Cr
    monthlyRevenue: 1100000,
    monthlyProfit: 350000,
    ndaRequired: true,
    isFeatured: true
  },
  {
    id: "demo-blog",
    title: "Indian Personal Finance BFSI Hub",
    slug: "indian-personal-finance-bfsi-hub",
    tagline: "Highly authoritative editorial portal driving high-intent organic traffic.",
    assetType: "blog" as const,
    industry: "Finance & FinTech",
    askingPrice: 8500000, // ₹85 L
    monthlyRevenue: 300000,
    monthlyProfit: 260000,
    ndaRequired: false,
    isFeatured: true
  },
  {
    id: "demo-domain",
    title: "PayBharat.com Premium Domain Asset",
    slug: "paybharat-premium-domain",
    tagline: "Brandable fintech naming asset registered in 2017.",
    assetType: "domain" as const,
    industry: "Finance & FinTech",
    askingPrice: 5000000, // ₹50 L
    monthlyRevenue: 0,
    monthlyProfit: 0,
    ndaRequired: true,
    isFeatured: true
  },
  {
    id: "demo-service",
    title: "Cloud Migration Agency for HDFC Partners",
    slug: "cloud-migration-agency",
    tagline: "Certified DevOps consulting group with 8 active enterprise retainers.",
    assetType: "service" as const,
    industry: "Professional Services",
    askingPrice: 25000000, // ₹2.5 Cr
    monthlyRevenue: 1800000,
    monthlyProfit: 750000,
    ndaRequired: true,
    isFeatured: true
  }
];

export function LandingPage({
  user,
  isAuthenticated,
  logout,
  onListBusiness,
  navigateTo,
}: {
  user: any;
  isAuthenticated: boolean;
  logout: () => void;
  onListBusiness: () => void;
  navigateTo: (path: string) => void;
}) {
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"buyers" | "sellers" | "both">("buyers");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Scroll reveal references
  const probSolRef = useRef(null);
  const isProbSolInView = useInView(probSolRef, { once: true, margin: "-100px" });

  useEffect(() => {
    // Fetch live listings
    const loadListings = async () => {
      try {
        const res = await fetch("/api/listings");
        if (res.ok) {
          const data = await res.json();
          // Filter live, then slice up to 6
          const live = data.listings || [];
          if (live.length > 0) {
            // pad with demo if less than 6
            const merged = [...live, ...DEMO_LISTINGS].slice(0, 6);
            setFeaturedListings(merged);
          } else {
            setFeaturedListings(DEMO_LISTINGS);
          }
        } else {
          setFeaturedListings(DEMO_LISTINGS);
        }
      } catch (err) {
        setFeaturedListings(DEMO_LISTINGS);
      }
    };
    loadListings();
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleListingClick = (slug: string) => {
    navigateTo(`/listings/${slug}`);
  };

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col font-sans">
      
      {/* SECTION 1 — NAVBAR */}
      <Navbar 
        user={user} 
        isAuthenticated={isAuthenticated} 
        logout={logout} 
        navigateTo={navigateTo} 
        currentPath="/" 
      />

      {/* SECTION 2 — HERO */}
      <header className="relative py-16 md:py-24 px-6 md:px-12 overflow-hidden border-b border-black/5 bg-gradient-to-b from-[#FDFCFB] to-[#F7F5F0]">
        {/* Background grids */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Hero Copy (Framer Motion mount animate) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-brand-green-india/20 bg-brand-green-india/5 text-brand-green-india text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Digital Assets India
            </div>
            
            <h1 className="font-serif italic font-black text-4xl md:text-6xl text-brand-navy leading-[1.05] tracking-tight">
              Buy & Sell Digital <br />
              <span className="text-brand-green-india">Businesses in India</span> <br />
              — With Trust Built In
            </h1>
            
            <p className="text-sm md:text-base max-w-xl text-brand-dark/70 leading-relaxed font-sans font-medium">
              The first Indian marketplace with mandatory KYC verification, NDA-gated financial dossiers, licensed escrow protection, and structured secure deal rooms. Secure your acquisitions natively.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => navigateTo("/listings")}
                className="bg-brand-navy hover:bg-brand-navy/95 text-white font-bold text-xs tracking-widest uppercase px-8 py-3.5 transition-all cursor-pointer shadow-lg shadow-brand-navy/10 flex items-center gap-2"
              >
                <span>Browse Businesses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={onListBusiness}
                className="border-2 border-brand-navy hover:bg-brand-navy/5 text-brand-navy font-bold text-xs tracking-widest uppercase px-8 py-3 transition-all cursor-pointer"
              >
                List Your Business
              </button>
            </div>

            {/* Trust Badges Row */}
            <div className="pt-6 border-t border-black/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4 text-[10px] font-mono uppercase tracking-wider text-brand-navy/60">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-green-india shrink-0" />
                <span>KYC Verified Sellers</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-saffron shrink-0" />
                <span>NDA Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-green-india shrink-0" />
                <span>Escrow Secured</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-600 shrink-0" />
                <span>₹50Cr+ in Deals</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Illustration / Mockup (Interactive Deal Room Screen) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative w-full"
          >
            {/* Elegant Deal Room Card Representation */}
            <div className="w-full bg-[#1A1A1A] text-white p-5 border border-white/10 shadow-2xl relative overflow-hidden">
              {/* Flag accent corner */}
              <div className="absolute top-0 right-0 w-24 h-1.5 flex">
                <div className="w-1/3 h-full bg-brand-saffron" />
                <div className="w-1/3 h-full bg-white" />
                <div className="w-1/3 h-full bg-brand-green-india" />
              </div>
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                  <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">SECURE DEAL ROOM</span>
                </div>
                <div className="px-2 py-0.5 bg-brand-green-india/20 border border-brand-green-india/40 text-[9px] font-mono text-brand-green-india uppercase font-bold">
                  Stage: Due Diligence
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-serif italic font-bold">BrewCraft Coffee D2C Brand</h4>
                  <p className="text-[10px] text-white/40 font-mono uppercase tracking-wider mt-0.5">Asset Ref: #FMI-8012</p>
                </div>

                {/* Secure vault items checklist */}
                <div className="space-y-2 bg-white/5 p-3 border border-white/5">
                  <div className="flex items-center gap-2.5 text-xs">
                    <CheckCircle className="w-4 h-4 text-brand-green-india" />
                    <span className="text-white/80">PAN & Aadhaar Identity Lockers Verified</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <CheckCircle className="w-4 h-4 text-brand-green-india" />
                    <span className="text-white/80">Mutual NDA Digitally Authenticated</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <Lock className="w-4 h-4 text-brand-saffron" />
                    <span className="text-white/60">Gated Financial Ledger (Vouchered GST)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 flex items-center justify-center text-[8px] font-mono font-black text-white/40">3</div>
                    <span className="text-white/40">Fund INR Escrow Account (Razorpay Node)</span>
                  </div>
                </div>

                {/* Fake chat snippet */}
                <div className="space-y-2 text-[10px] font-sans border-t border-white/5 pt-3">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center font-bold text-[8px] text-brand-saffron shrink-0">B</div>
                    <div className="bg-white/5 p-2 rounded text-white/80 max-w-[85%]">
                      "I've inspected the audited GST logs. Ready to draft the purchase agreement."
                    </div>
                  </div>
                  <div className="flex items-start gap-2 justify-end">
                    <div className="bg-brand-green-india/20 p-2 rounded text-white/80 max-w-[85%]">
                      "Blueprints uploaded to the secure vault. Escrow release trigger set to code handoff."
                    </div>
                    <div className="w-5 h-5 bg-brand-green-india/20 rounded-full flex items-center justify-center font-bold text-[8px] text-brand-green-india shrink-0">S</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Visual shadows */}
            <div className="absolute -bottom-6 -right-6 w-full h-full border border-black/5 bg-[#1A1A1A]/5 -z-10 pointer-events-none" />
          </motion.div>
        </div>
      </header>

      {/* SECTION 3 — STATS BAR */}
      <section className="bg-gradient-to-r from-brand-cream via-white to-brand-cream py-10 px-6 border-b border-black/5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-black/10">
          <div className="text-center flex flex-col justify-center py-2 md:py-0">
            <CountUp target={500} suffix="+" />
            <p className="text-[10px] font-mono tracking-widest uppercase text-brand-navy/60 mt-1">Businesses Listed</p>
          </div>
          <div className="text-center flex flex-col justify-center pt-6 md:pt-0">
            <CountUp target={50} prefix="₹" suffix=" Cr+" />
            <p className="text-[10px] font-mono tracking-widest uppercase text-brand-navy/60 mt-1">Deal Value</p>
          </div>
          <div className="text-center flex flex-col justify-center pt-6 md:pt-0">
            <CountUp target={200} suffix="+" />
            <p className="text-[10px] font-mono tracking-widest uppercase text-brand-navy/60 mt-1">Verified Buyers</p>
          </div>
          <div className="text-center flex flex-col justify-center pt-6 md:pt-0">
            <CountUp target={98} suffix="%" />
            <p className="text-[10px] font-mono tracking-widest uppercase text-brand-navy/60 mt-1">Deal Completion Rate</p>
          </div>
        </div>
      </section>

      {/* SECTION 4 — PROBLEM/SOLUTION */}
      <section ref={probSolRef} className="py-16 md:py-24 px-6 md:px-12 bg-white border-b border-black/5 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-stretch">
          {/* Left Column - Problem */}
          <div className="space-y-6 flex flex-col justify-between">
            <div>
              <h2 className="text-xs uppercase font-mono font-bold tracking-[0.25em] text-red-600 border-l-4 border-red-500 pl-3 mb-4">
                The Status Quo
              </h2>
              <h3 className="font-serif italic font-black text-3xl md:text-4xl text-brand-navy tracking-tight leading-tight">
                The Problem with Buying Indian Businesses Today
              </h3>
              <p className="text-xs text-brand-dark/60 mt-2 max-w-md">
                Traditional transactions are rife with risk, misrepresentation, and operational friction due to unregulated marketplaces.
              </p>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-black/5 flex-1 flex flex-col justify-center">
              {[
                "Fake listings with inflated revenue & fake Stripe/Razorpay captures",
                "No verified buyer qualification (leaking financials to direct competitors)",
                "Manual, unstructured negotiations over WhatsApp and email chains",
                "No secure document sharing or digital room tracking",
                "No escrow safety, exposing parties to payout default and contract breach"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-red-600">❌</span>
                  </div>
                  <p className="text-xs text-brand-dark/80 font-medium leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Solution (Scroll Reveal) */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={isProbSolInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-[#F7F5F0] border border-black/10 p-6 md:p-10 space-y-6 flex flex-col justify-between relative"
          >
            {/* Visual background flag lines */}
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-brand-green-india" />
            
            <div>
              <h2 className="text-xs uppercase font-mono font-bold tracking-[0.25em] text-brand-green-india border-l-4 border-brand-green-india pl-3 mb-4">
                The FMI Way
              </h2>
              <h3 className="font-serif italic font-black text-3xl md:text-4xl text-brand-navy tracking-tight leading-tight">
                Institutional Quality Deal Architecture
              </h3>
              <p className="text-xs text-brand-dark/60 mt-2 max-w-md">
                We've built compliance, verification, and transactional security directly into the pipeline.
              </p>
            </div>

            <div className="space-y-4 pt-6 border-t border-black/5 flex-1 flex flex-col justify-center">
              {[
                "PAN + Aadhaar verified sellers mapping to official Ministry of Corporate Affairs data",
                "KYC-gated buyer access ensuring only qualified acquirers inspect details",
                "Structured deal room + automated mutual NDA flow to lock down liability",
                "Secure document vault with digital watermark tracking and limited expiry downloads",
                "INR Escrow protection via RBI licensed partners holding funds till handoff checklist clear"
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-green-india/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-brand-green-india">✓</span>
                  </div>
                  <p className="text-xs text-brand-dark/80 font-medium leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-brand-cream border-b border-black/5">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-xs uppercase font-mono font-bold tracking-[0.25em] text-brand-green-india">
              Transaction Protocol
            </h2>
            <h3 className="font-serif italic font-black text-3xl md:text-4xl text-brand-navy tracking-tight">
              How FMI Facilitates the Acquisition
            </h3>
            <p className="text-xs text-brand-dark/60 font-medium">
              We guide both buyers and sellers from initial registration to secure escrow payout in a structured legal flow.
            </p>
          </div>

          {/* Stepper Tabs */}
          <div className="flex justify-center border-b border-black/10 max-w-md mx-auto">
            <button
              onClick={() => setActiveTab("buyers")}
              className={`flex-1 pb-3 text-xs font-bold tracking-widest uppercase text-center transition-all cursor-pointer ${activeTab === "buyers" ? "text-brand-green-india border-b-2 border-brand-green-india" : "text-brand-dark/40 hover:text-brand-dark/70"}`}
            >
              For Buyers
            </button>
            <button
              onClick={() => setActiveTab("sellers")}
              className={`flex-1 pb-3 text-xs font-bold tracking-widest uppercase text-center transition-all cursor-pointer ${activeTab === "sellers" ? "text-brand-green-india border-b-2 border-brand-green-india" : "text-brand-dark/40 hover:text-brand-dark/70"}`}
            >
              For Sellers
            </button>
            <button
              onClick={() => setActiveTab("both")}
              className={`flex-1 pb-3 text-xs font-bold tracking-widest uppercase text-center transition-all cursor-pointer ${activeTab === "both" ? "text-brand-green-india border-b-2 border-brand-green-india" : "text-brand-dark/40 hover:text-brand-dark/70"}`}
            >
              The Escrow flow
            </button>
          </div>

          {/* Tab Contents with Framer Motion transitions */}
          <div className="pt-6">
            <AnimatePresence mode="wait">
              {activeTab === "buyers" && (
                <motion.div
                  key="buyers-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-6"
                >
                  <div className="bg-white border border-black/10 p-6 space-y-4 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-brand-green-india/10 flex items-center justify-center text-brand-green-india font-bold rounded-full">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-brand-navy/55 uppercase tracking-widest font-black">Step 1</h4>
                      <h5 className="text-sm font-bold font-serif italic text-brand-navy">Browse Verified Listings</h5>
                      <p className="text-[11px] text-brand-dark/65 leading-relaxed">
                        Access our vetted marketplace, filter by revenue, multiple, and industry.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 p-6 space-y-4 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-brand-saffron/10 flex items-center justify-center text-brand-saffron font-bold rounded-full">
                      <Lock className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-brand-navy/55 uppercase tracking-widest font-black">Step 2</h4>
                      <h5 className="text-sm font-bold font-serif italic text-brand-navy">Sign NDA to Unlock Dossiers</h5>
                      <p className="text-[11px] text-brand-dark/65 leading-relaxed">
                        Execute a digitally binding mutual NDA to automatically unlock full financials.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 p-6 space-y-4 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold rounded-full">
                      <Handshake className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-brand-navy/55 uppercase tracking-widest font-black">Step 3</h4>
                      <h5 className="text-sm font-bold font-serif italic text-brand-navy">Submit Structured Offers</h5>
                      <p className="text-[11px] text-brand-dark/65 leading-relaxed">
                        Make an offer with custom terms (upfront % vs. earnout % and timeline clauses).
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 p-6 space-y-4 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-brand-green-india/10 flex items-center justify-center text-brand-green-india font-bold rounded-full">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-brand-navy/55 uppercase tracking-widest font-black">Step 4</h4>
                      <h5 className="text-sm font-bold font-serif italic text-brand-navy">Close inside the Deal Room</h5>
                      <p className="text-[11px] text-brand-dark/65 leading-relaxed">
                        Verify assets using our collaborative checklist, release escrow, and trigger handover.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "sellers" && (
                <motion.div
                  key="sellers-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-6"
                >
                  <div className="bg-white border border-black/10 p-6 space-y-4 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-brand-green-india/10 flex items-center justify-center text-brand-green-india font-bold rounded-full">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-brand-navy/55 uppercase tracking-widest font-black">Step 1</h4>
                      <h5 className="text-sm font-bold font-serif italic text-brand-navy">Submit KYC Verification</h5>
                      <p className="text-[11px] text-brand-dark/65 leading-relaxed">
                        Input PAN & Aadhaar (individual) or GST registration records to confirm origin legitimacy.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 p-6 space-y-4 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-brand-saffron/10 flex items-center justify-center text-brand-saffron font-bold rounded-full">
                      <PlusCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-brand-navy/55 uppercase tracking-widest font-black">Step 2</h4>
                      <h5 className="text-sm font-bold font-serif italic text-brand-navy">Create Vetted Listing</h5>
                      <p className="text-[11px] text-brand-dark/65 leading-relaxed">
                        Define metrics, upload pitch decks, and deposit secured diligence files.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 p-6 space-y-4 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold rounded-full">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-brand-navy/55 uppercase tracking-widest font-black">Step 3</h4>
                      <h5 className="text-sm font-bold font-serif italic text-brand-navy">Negotiate via Deal Rooms</h5>
                      <p className="text-[11px] text-brand-dark/65 leading-relaxed">
                        Manage NDA requests, debate valuations, and reply to buyer queries in real time.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 p-6 space-y-4 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-brand-green-india/10 flex items-center justify-center text-brand-green-india font-bold rounded-full">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-brand-navy/55 uppercase tracking-widest font-black">Step 4</h4>
                      <h5 className="text-sm font-bold font-serif italic text-brand-navy">Transfer & Receive Payout</h5>
                      <p className="text-[11px] text-brand-dark/65 leading-relaxed">
                        Complete domain transfer and receive funds directly to your verified Indian bank account.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "both" && (
                <motion.div
                  key="both-tab"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 sm:grid-cols-4 gap-6"
                >
                  <div className="bg-white border border-black/10 p-6 space-y-4 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-brand-saffron/10 flex items-center justify-center text-brand-saffron font-bold rounded-full">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-brand-navy/55 uppercase tracking-widest font-black">Stage 1</h4>
                      <h5 className="text-sm font-bold font-serif italic text-brand-navy">Execute Purchase Agreement</h5>
                      <p className="text-[11px] text-brand-dark/65 leading-relaxed">
                        Parties sign the formal Asset Purchase Agreement detailing checklist conditions.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 p-6 space-y-4 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-brand-navy/10 flex items-center justify-center text-brand-navy font-bold rounded-full">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-brand-navy/55 uppercase tracking-widest font-black">Stage 2</h4>
                      <h5 className="text-sm font-bold font-serif italic text-brand-navy">Buyer Funds Escrow Vault</h5>
                      <p className="text-[11px] text-brand-dark/65 leading-relaxed">
                        The transaction sum is secured by our licensed trustee partner bank in compliance with FEMA/RBI.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 p-6 space-y-4 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold rounded-full">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-brand-navy/55 uppercase tracking-widest font-black">Stage 3</h4>
                      <h5 className="text-sm font-bold font-serif italic text-brand-navy">Handover Handoff Process</h5>
                      <p className="text-[11px] text-brand-dark/65 leading-relaxed">
                        Seller transfers DNS, codebase, databases, and third-party dashboard accounts to the buyer.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-black/10 p-6 space-y-4 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-brand-green-india/10 flex items-center justify-center text-brand-green-india font-bold rounded-full">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-brand-navy/55 uppercase tracking-widest font-black">Stage 4</h4>
                      <h5 className="text-sm font-bold font-serif italic text-brand-navy">Escrow Released</h5>
                      <p className="text-[11px] text-brand-dark/65 leading-relaxed">
                        Buyer confirms successful asset takeover and funds are instantly disbursed to the seller.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* SECTION 6 — ASSET TYPES */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-white border-b border-black/5">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-xs uppercase font-mono font-bold tracking-[0.25em] text-brand-green-india">
              Market Segments
            </h2>
            <h3 className="font-serif italic font-black text-3xl md:text-4xl text-brand-navy tracking-tight">
              What Types of Businesses Can You Buy?
            </h3>
            <p className="text-xs text-brand-dark/60 font-medium">
              Filter by specific transaction models suited to your tech experience, portfolio operations, or scale scope.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: "SaaS Products", type: "saas", range: "3.5x–5.5x ARR Multiple", bg: "hover:border-purple-600 hover:shadow-purple-50", color: "text-purple-600", icon: Cpu },
              { label: "eCommerce Stores", type: "ecommerce", range: "2.0x–3.5x EBITDA Multiple", bg: "hover:border-blue-600 hover:shadow-blue-50", color: "text-blue-600", icon: ShoppingCart },
              { label: "Mobile Apps", type: "app", range: "3.0x–4.5x ARR Multiple", bg: "hover:border-green-600 hover:shadow-green-50", color: "text-green-600", icon: Smartphone },
              { label: "Blogs & Content Sites", type: "blog", range: "2.5x–4.0x Monthly Revenue", bg: "hover:border-orange-600 hover:shadow-orange-50", color: "text-orange-600", icon: BookOpen },
              { label: "Domain Names", type: "domain", range: "Brand Asset Flat Valuations", bg: "hover:border-yellow-600 hover:shadow-yellow-50", color: "text-yellow-600", icon: Globe },
              { label: "Service Businesses", type: "service", range: "1.5x–3.0x Net Annual Profit", bg: "hover:border-gray-600 hover:shadow-gray-50", color: "text-gray-600", icon: Briefcase }
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => navigateTo(`/listings?type=${card.type}`)}
                  className={`bg-[#FDFCFB] border border-black/10 p-6 space-y-4 hover:-translate-y-0.5 cursor-pointer transition-all flex flex-col justify-between ${card.bg}`}
                >
                  <div className="space-y-4">
                    <div className={`w-10 h-10 rounded-full bg-black/[0.02] flex items-center justify-center ${card.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif italic font-bold text-lg text-brand-navy">{card.label}</h4>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-brand-dark/40 mt-1">Typical Multiples</p>
                      <p className="text-xs font-bold text-brand-navy mt-0.5">{card.range}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-black/[0.05] flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-brand-navy/60 hover:text-brand-green-india">
                    <span>Explore Market</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 7 — FEATURED LISTINGS */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-brand-cream border-b border-black/5">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-black/10 pb-6">
            <div>
              <h2 className="text-xs uppercase font-mono font-bold tracking-[0.25em] text-brand-green-india">
                Featured Assets
              </h2>
              <h3 className="font-serif italic font-black text-3xl md:text-4xl text-brand-navy tracking-tight mt-2">
                Recently Listed Businesses
              </h3>
            </div>
            <button
              onClick={() => navigateTo("/listings")}
              className="text-xs font-mono font-bold uppercase tracking-widest text-brand-green-india hover:opacity-80 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Browse All 500+ Listings</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Listings Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                slug={listing.slug}
                tagline={listing.tagline}
                assetType={listing.assetType}
                industry={listing.industry}
                askingPrice={listing.askingPrice}
                monthlyRevenue={listing.monthlyRevenue}
                monthlyProfit={listing.monthlyProfit}
                ndaRequired={listing.ndaRequired}
                isFeatured={listing.isFeatured}
                onClick={handleListingClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8 — TRUST & COMPLIANCE */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-white border-b border-black/5 relative overflow-hidden">
        {/* Flag Watermark motif overlay */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-saffron/5 via-white to-transparent pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-green-india/5 via-white to-transparent pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          {/* Header */}
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-black tracking-widest text-brand-navy/60 uppercase">
              <span className="w-4 h-2.5 bg-brand-saffron" />
              <span className="w-4 h-2.5 bg-white border border-black/10" />
              <span className="w-4 h-2.5 bg-brand-green-india" />
              <span>Indian Compliance Framework</span>
            </div>
            <h3 className="font-serif italic font-black text-3xl md:text-4xl text-brand-navy tracking-tight">
              Built for India's Legal Requirements
            </h3>
            <p className="text-xs text-brand-dark/60 font-medium">
              Every process on FMI maps strictly to MCA directives, the IT Act of 2000, and domestic banking mandates.
            </p>
          </div>

          {/* Compliance features grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-[#FDFCFB] border border-black/10 p-6 space-y-3">
              <div className="w-10 h-10 bg-brand-saffron/10 text-brand-saffron rounded-full flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-serif italic font-bold text-sm text-brand-navy">PAN & Aadhaar KYC</h4>
              <p className="text-[11px] text-brand-dark/60 leading-relaxed">
                Verification checks confirm the physical authenticity of the beneficial owner before any listing approval.
              </p>
            </div>

            <div className="bg-[#FDFCFB] border border-black/10 p-6 space-y-3">
              <div className="w-10 h-10 bg-brand-navy/10 text-brand-navy rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-serif italic font-bold text-sm text-brand-navy">Digital consent NDAs</h4>
              <p className="text-[11px] text-brand-dark/60 leading-relaxed">
                Legal contracts automatically execute on-screen to create strict confidentiality guidelines.
              </p>
            </div>

            <div className="bg-[#FDFCFB] border border-black/10 p-6 space-y-3">
              <div className="w-10 h-10 bg-brand-green-india/10 text-brand-green-india rounded-full flex items-center justify-center">
                <Banknote className="w-5 h-5" />
              </div>
              <h4 className="font-serif italic font-bold text-sm text-brand-navy">GST Invoicing</h4>
              <p className="text-[11px] text-brand-dark/60 leading-relaxed">
                Clean invoicing models and GST checks map to clear transaction history logs for audit.
              </p>
            </div>

            <div className="bg-[#FDFCFB] border border-black/10 p-6 space-y-3">
              <div className="w-10 h-10 bg-blue-500/10 text-blue-600 rounded-full flex items-center justify-center">
                <Handshake className="w-5 h-5" />
              </div>
              <h4 className="font-serif italic font-bold text-sm text-brand-navy">Licensed Escrow</h4>
              <p className="text-[11px] text-brand-dark/60 leading-relaxed">
                Escrow balances are routed via authorized banking nodes and held until verified checklist completion.
              </p>
            </div>

            <div className="bg-[#FDFCFB] border border-black/10 p-6 space-y-3">
              <div className="w-10 h-10 bg-brand-navy/10 text-brand-navy rounded-full flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="font-serif italic font-bold text-sm text-brand-navy">India Data Residency</h4>
              <p className="text-[11px] text-brand-dark/60 leading-relaxed">
                All uploaded diligence files, database schemas, and messages are stored inside Indian cloud zones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — TESTIMONIALS */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-brand-cream border-b border-black/5">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-xs uppercase font-mono font-bold tracking-[0.25em] text-brand-green-india">
              Success Stories
            </h2>
            <h3 className="font-serif italic font-black text-3xl md:text-4xl text-brand-navy tracking-tight">
              What Our Users Say
            </h3>
          </div>

          {/* Testimonial cards grid - Desktop only */}
          <div className="hidden md:grid grid-cols-3 gap-8">
            {[
              { role: "Buyer", initial: "A", name: "Ananya Sen, PE Investor", rating: 5, quote: "Found my first SaaS acquisition on FMI. The NDA and deal room made the whole process feel safe and structured." },
              { role: "Seller", initial: "R", name: "Rahul Nair, Founder, HerbKerala D2C", rating: 5, quote: "Listed my eCommerce store and had 12 NDA requests in the first week. Sold in 45 days." },
              { role: "Buyer", initial: "V", name: "Vikram Malhotra, Venture Partner", rating: 5, quote: "As a PE investor, FMI's KYC requirements meant every seller I spoke to was legitimate." }
            ].map((t, idx) => (
              <div key={idx} className="bg-white border border-black/10 p-8 space-y-6 flex flex-col justify-between hover:shadow-lg transition-all relative">
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-brand-saffron text-brand-saffron" />
                    ))}
                  </div>
                  <p className="text-xs font-medium text-brand-navy italic leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-black/[0.05]">
                  <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-black">
                    {t.initial}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-brand-navy">{t.name}</h5>
                    <span className="text-[9px] font-mono uppercase tracking-widest text-brand-green-india">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Testimonial Carousel - Mobile only */}
          <div className="block md:hidden relative bg-white border border-black/10 p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex gap-1 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-saffron text-brand-saffron" />
                ))}
              </div>
              
              <AnimatePresence mode="wait">
                <motion.p 
                  key={currentTestimonial}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs font-medium text-brand-navy italic text-center leading-relaxed min-h-[60px]"
                >
                  "{[
                    "Found my first SaaS acquisition on FMI. The NDA and deal room made the whole process feel safe and structured.",
                    "Listed my eCommerce store and had 12 NDA requests in the first week. Sold in 45 days.",
                    "As a PE investor, FMI's KYC requirements meant every seller I spoke to was legitimate."
                  ][currentTestimonial]}"
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/[0.05]">
              <button 
                onClick={() => setCurrentTestimonial(prev => (prev === 0 ? 2 : prev - 1))}
                className="p-1 border border-black/10 rounded"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="text-center">
                <h5 className="text-xs font-bold text-brand-navy">
                  {["Ananya Sen, PE Investor", "Rahul Nair, Founder, HerbKerala D2C", "Vikram Malhotra, Venture Partner"][currentTestimonial]}
                </h5>
                <span className="text-[9px] font-mono uppercase tracking-widest text-brand-green-india">
                  {["Buyer", "Seller", "Buyer"][currentTestimonial]}
                </span>
              </div>

              <button 
                onClick={() => setCurrentTestimonial(prev => (prev === 2 ? 0 : prev + 1))}
                className="p-1 border border-black/10 rounded"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10 — FAQ */}
      <section className="py-16 md:py-24 px-6 md:px-12 bg-white border-b border-black/5 animate-in fade-in duration-300">
        <div className="max-w-3xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <h2 className="text-xs uppercase font-mono font-bold tracking-[0.25em] text-brand-green-india">
              Frequently Asked Questions
            </h2>
            <h3 className="font-serif italic font-black text-3xl md:text-4xl text-brand-navy tracking-tight">
              Information Directory
            </h3>
          </div>

          {/* Accordion Questions */}
          <div className="space-y-4">
            {[
              { q: "What is FMI?", a: "FMI (Financial Market India - Digital Business Exchange) is a premium, compliance-first marketplace designed specifically for buying and selling digital businesses, SaaS platforms, content sites, and D2C brands within the Indian regulatory ecosystem." },
              { q: "How is my identity verified?", a: "Identity verification is done using Aadhaar OTP e-KYC and PAN matching via government API portals. This ensures that every listing seller and qualified buyer is a verified resident corporate or individual owner." },
              { q: "What does KYC cost?", a: "For sandbox and standard users, basic e-KYC verification is completely free. There are no fees associated with updating your profile role." },
              { q: "How does the NDA process work?", a: "When a listing seller checks the 'Require NDA' option, buyers must execute a digital mutual NDA on FMI before they are granted access to private financial dossiers or tech documents." },
              { q: "How is escrow handled?", a: "Funds are deposited into an RBI-compliant bank escrow account set up by our licensed trustee partners. Funds are released only upon completion of a structured digital transition checklist signed by both parties." },
              { q: "What fees does FMI charge?", a: "We charge a standard 4% transaction fee on successful business transfers, with no listing fees or upfront onboarding costs for sellers." },
              { q: "How long does it take to sell a business?", a: "Most listings secure initial interest within 7 to 10 days of approval. Due diligence and escrow closing typically take 14 to 45 days depending on transition complexity." },
              { q: "Is FMI regulated?", a: "While we operate as an asset marketplace rather than a SEBI stock exchange, FMI processes all escrow transactions, NDA documents, and corporate filings in accordance with the Companies Act, GST Act, and banking regulations." }
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
                      transition={{ duration: 0.25, ease: "easeInOut" }}
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

      {/* SECTION 11 — FINAL CTA */}
      <section className="relative py-20 px-6 md:px-12 bg-brand-navy text-white text-center overflow-hidden border-b border-black/5">
        {/* Saffron and green border accents */}
        <div className="absolute top-0 left-0 right-0 h-1 flex">
          <div className="w-1/2 h-full bg-brand-saffron" />
          <div className="w-1/2 h-full bg-brand-green-india" />
        </div>

        {/* Ashoka Chakra watermark in background */}
        <div className="absolute inset-0 opacity-[0.015] flex items-center justify-center pointer-events-none">
          <div className="w-96 h-96 rounded-full border-8 border-white border-dashed animate-spin-slow" />
        </div>

        <div className="max-w-xl mx-auto space-y-6 relative z-10">
          <h3 className="font-serif italic font-black text-3xl md:text-5xl leading-tight">
            Ready to Buy or Sell Your Digital Business?
          </h3>
          <p className="text-xs md:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
            Onboard in minutes. Set up your KYC, sign NDAs, and participate in India's leading verified digital economy.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <button
              onClick={() => navigateTo("/listings")}
              className="bg-brand-saffron hover:bg-brand-saffron/90 text-brand-navy font-bold text-xs tracking-widest uppercase px-8 py-3.5 transition-colors cursor-pointer"
            >
              Start Browsing
            </button>
            <button
              onClick={onListBusiness}
              className="border border-white hover:bg-white/10 text-white font-bold text-xs tracking-widest uppercase px-8 py-3.5 transition-colors cursor-pointer"
            >
              List My Business
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 12 — FOOTER */}
      <Footer navigateTo={navigateTo} />
      
    </div>
  );
}

export default LandingPage;
