import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cpu, 
  ShoppingCart, 
  Smartphone, 
  BookOpen, 
  Globe, 
  FileText, 
  Briefcase, 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Coins, 
  MessageSquare, 
  Send, 
  UserCheck, 
  Plus, 
  FileCode, 
  Trash2, 
  ExternalLink, 
  FileSpreadsheet, 
  TrendingUp, 
  Sparkles, 
  Bell, 
  Check, 
  ChevronRight, 
  FileUp, 
  ArrowRight, 
  Info, 
  X,
  CreditCard,
  ShieldCheck,
  Building,
  User,
  Activity,
  Award,
  CircleDollarSign,
  ChevronDown,
  LogOut
} from "lucide-react";

// Import custom helpers if needed or implement clean inline ones to match index.css
import { formatCurrency, formatDate, generateSlug } from "../lib/utils.ts";
import { ASSET_TYPES, INDIAN_STATES, INDUSTRIES, DEAL_STAGES, NDA_FEE_DEFAULT } from "../config/constants.ts";

import { useAuth } from "./hooks/use-auth.ts";
import { AuthLayout } from "./app/(auth)/layout.tsx";
import { LoginPage } from "./app/(auth)/login/page.tsx";
import { SignupPage } from "./app/(auth)/signup/page.tsx";
import { VerifyEmailPage } from "./app/(auth)/verify-email/page.tsx";
import { VerifyPhonePage } from "./app/(auth)/verify-phone/page.tsx";

import { OnboardingLayout } from "./app/(onboarding)/layout.tsx";
import { OnboardingRolePage } from "./app/(onboarding)/role/page.tsx";
import { IndividualKycPage } from "./app/(onboarding)/kyc/individual/page.tsx";
import { CompanyKycPage } from "./app/(onboarding)/kyc/company/page.tsx";
import { OnboardingInterestsPage } from "./app/(onboarding)/interests/page.tsx";

import SellerLayout from "./app/(seller)/layout.tsx";
import SellerDashboardPage from "./app/(seller)/dashboard/page.tsx";
import SellerListingsPage from "./app/(seller)/listings/page.tsx";
import SellerNewListingPage from "./app/(seller)/listings/new/page.tsx";

import BrowseListingsPage from "./app/(marketing)/listings/page.tsx";
import ListingDetailPage from "./app/(marketing)/listings/[slug]/page.tsx";
import BuyerLayout from "./app/(buyer)/layout.tsx";
import BuyerDashboardPage from "./app/(buyer)/dashboard/page.tsx";
import BuyerOffersPage from "./app/(buyer)/offers/page.tsx";
import SellerOffersPage from "./app/(seller)/offers/page.tsx";

import BuyerDealsPage from "./app/(buyer)/deals/page.tsx";
import BuyerDealDetailPage from "./app/(buyer)/deals/[dealId]/page.tsx";
import BuyerDealDocumentsPage from "./app/(buyer)/deals/[dealId]/documents/page.tsx";
import BuyerDealChecklistPage from "./app/(buyer)/deals/[dealId]/checklist/page.tsx";
import BuyerDealMessagesPage from "./app/(buyer)/deals/[dealId]/messages/page.tsx";

import SellerDealsPage from "./app/(seller)/deals/page.tsx";
import SellerDealDetailPage from "./app/(seller)/deals/[dealId]/page.tsx";
import SellerDealDocumentsPage from "./app/(seller)/deals/[dealId]/documents/page.tsx";
import SellerDealChecklistPage from "./app/(seller)/deals/[dealId]/checklist/page.tsx";
import SellerDealMessagesPage from "./app/(seller)/deals/[dealId]/messages/page.tsx";

// Interface Definitions reflecting Schema
interface ListingItem {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  assetType: "saas" | "ecommerce" | "app" | "blog" | "domain" | "content_site" | "service";
  industry: string;
  askingPrice: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  monthlyTraffic: number;
  yearEstablished: number;
  businessUrl: string;
  ndaRequired: boolean;
  ndaFee: number;
  status: "draft" | "in_review" | "approved" | "live" | "paused" | "sold" | "rejected";
  isFeatured: boolean;
  coverImageUrl?: string;
  tags: string[];
}

interface UserProfile {
  name: string;
  email: string;
  role: "buyer" | "seller" | "both" | "admin";
  kycStatus: "not_started" | "pending" | "in_review" | "approved" | "rejected";
  kycType?: "individual" | "company";
  phone: string;
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: Date;
  isRead: boolean;
  type: "info" | "success" | "warning";
}

interface Offer {
  amount: number;
  upfrontPercent: number;
  earnoutPercent: number;
  earnoutTerms: string;
  message: string;
  status: "pending" | "countered" | "accepted" | "rejected" | "withdrawn";
}

// Initial Preset Listings
const INITIAL_LISTINGS: ListingItem[] = [
  {
    id: "l-8823",
    title: "HRTech Automated Payroll Platform for Indian SMEs",
    slug: "hrtech-automated-payroll-platform",
    tagline: "High-growth compliance & HR automation suite with 85% gross margins.",
    description: "A fully automated payroll, compliance (PF, ESIC, PT), and HRMS SaaS engineered specifically for the fast-growing Indian startup and mid-market segment. Integrates natively with ICICI and HDFC corporate banking APIs. Tech stack features Next.js, FastAPI, and robust PostgreSQL architecture. Servicing over 240 active corporate clients with average net revenue retention of 114%.",
    assetType: "saas",
    industry: "Technology & Software",
    askingPrice: 31000000, // ₹3.1 Cr
    monthlyRevenue: 1250000, // ₹12.5 L
    monthlyProfit: 820000, // ₹8.2 L
    monthlyTraffic: 45000,
    yearEstablished: 2023,
    businessUrl: "https://paygenius.in",
    ndaRequired: true,
    ndaFee: 999,
    status: "live",
    isFeatured: true,
    tags: ["HRTech", "SaaS", "B2B", "Compliance"],
  },
  {
    id: "l-4011",
    title: "Eco-Friendly Ayurvedic D2C Wellness Brand",
    slug: "eco-friendly-ayurvedic-d2c-brand",
    tagline: "Kerala-sourced premium hair and skincare brand with high retention.",
    description: "A premium Ayurvedic beauty & personal care brand sourcing raw ingredients directly from local tribal cooperatives in Wayanad, Kerala. The business holds proprietary FDA approved formulations and enjoys a high-value customer cohort with a 42% 90-day repeat purchase rate. Over 180,000 lifetime customer profiles. Scaled purely on organic search and highly efficient Meta/Google ad spend. Includes exclusive manufacturing vendor agreements and finished goods stock valued at ₹45 Lakhs.",
    assetType: "ecommerce",
    industry: "Retail & Consumer Goods",
    askingPrice: 42000000, // ₹4.2 Cr
    monthlyRevenue: 3500000, // ₹35 L
    monthlyProfit: 1450000, // ₹14.5 L
    monthlyTraffic: 120000,
    yearEstablished: 2021,
    businessUrl: "https://vanayaorganics.in",
    ndaRequired: true,
    ndaFee: 1499,
    status: "live",
    isFeatured: true,
    tags: ["D2C", "Ayurveda", "Wellness", "Organic"],
  },
  {
    id: "l-1092",
    title: "Indian Personal Finance BFSI Hub",
    slug: "indian-personal-finance-bfsi-hub",
    tagline: "Highly authoritative editorial portal driving high-intent organic traffic.",
    description: "An authoritative personal finance blog and product review site targeting early-career Indian professionals. Ranks #1 for several high-volume high-CPC keywords related to credit cards, home loans, and mutual fund comparisons in India. Generates prime affiliate commission income from top banks (HDFC, SBI, Axis) and leading fintech apps. Zero active content overhead; content is evergreen and updated periodically by experienced freelance journalists.",
    assetType: "content_site",
    industry: "Finance & FinTech",
    askingPrice: 8500000, // ₹85 L
    monthlyRevenue: 400000, // ₹4 L
    monthlyProfit: 280000, // ₹2.8 L
    monthlyTraffic: 250000,
    yearEstablished: 2020,
    businessUrl: "https://rupeewise.in",
    ndaRequired: false,
    ndaFee: 0,
    status: "live",
    isFeatured: false,
    tags: ["Personal Finance", "Affiliate", "SEO", "BFSI"],
  },
  {
    id: "l-3105",
    title: "Hyperlocal QuickCommerce Route Optimization API",
    slug: "hyperlocal-quickcommerce-route-api",
    tagline: "B2B deeptech routing engine serving tier-1 logistics operators.",
    description: "A specialized middleware API helping Indian 10-minute delivery players and D2C brands lower their last-mile delivery costs by up to 22%. Scaled to handle over 1.2 Million API queries daily. Excellent documentation, clean codebase, and extremely low infrastructure overhead hosted on AWS serverless lambda architecture. Contracted annual recurring revenues (ARR) backed by long-term SLA agreements.",
    assetType: "saas",
    industry: "Technology & Software",
    askingPrice: 12000000, // ₹1.2 Cr
    monthlyRevenue: 600000, // ₹6 L
    monthlyProfit: 350000, // ₹3.5 L
    monthlyTraffic: 5000,
    yearEstablished: 2022,
    businessUrl: "https://routefast.ai",
    ndaRequired: true,
    ndaFee: 0,
    status: "live",
    isFeatured: false,
    tags: ["API", "Logistics", "DeepTech", "SaaS"],
  },
  {
    id: "l-5022",
    title: "Indie Dev Showcase & Mockup Generator",
    slug: "indie-dev-mockup-generator",
    tagline: "One-click tool for global SaaS founders to generate high-end device mockups.",
    description: "A self-serve tool popular among product designers and indie developers globally to output stylish, high-resolution browser and mobile device frame mockups for presentations, pitches, and landing pages. Monetized via a clean premium monthly tier (Stripe/Razorpay) and micro-transactions. Generates high organic distribution through designer directories, Twitter, and ProductHunt listing.",
    assetType: "app",
    industry: "Media & Entertainment",
    askingPrice: 4500000, // ₹45 L
    monthlyRevenue: 220000, // ₹2.2 L
    monthlyProfit: 140000, // ₹1.4 L
    monthlyTraffic: 80000,
    yearEstablished: 2023,
    businessUrl: "https://screensnap.co",
    ndaRequired: false,
    ndaFee: 0,
    status: "live",
    isFeatured: false,
    tags: ["SaaS Tool", "Designer Utility", "MicroSaaS"],
  }
];

export default function App() {
  // --- AUTH HOOK & CLIENT-SIDE ROUTER ---
  const { user, isAuthenticated, login, logout } = useAuth();
  
  const [currentPath, setCurrentPath] = useState(() => {
    const hash = window.location.hash;
    return hash ? hash.replace("#", "") : "/";
  });

  const [authEmail, setAuthEmail] = useState("");
  const [authName, setAuthName] = useState("");

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash ? window.location.hash.replace("#", "") : "/");
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateTo = (path: string) => {
    window.location.hash = `#${path}`;
  };

  // --- STATE ---
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("fmi_profile");
    return saved ? JSON.parse(saved) : {
      name: "Guest User",
      email: "guest@fmi.in",
      role: "buyer",
      kycStatus: "not_started",
      phone: "",
      kycType: "individual"
    };
  });

  // Sync userProfile with authenticated user session
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.name || authName || "FMI Member",
        email: user.email,
        role: user.role || "both",
        kycStatus: user.kycStatus || "not_started",
        phone: user.phone || "",
        kycType: user.kycType || "individual"
      });
    } else {
      setUserProfile({
        name: "Guest User",
        email: "guest@fmi.in",
        role: "buyer",
        kycStatus: "not_started",
        phone: "",
        kycType: "individual"
      });
    }
  }, [user, authName]);

  const [listingsList, setListingsList] = useState<ListingItem[]>(() => {
    const saved = localStorage.getItem("fmi_listings");
    return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
  });

  const [unlockedListings, setUnlockedListings] = useState<string[]>(() => {
    const saved = localStorage.getItem("fmi_unlocked");
    return saved ? JSON.parse(saved) : ["l-1092", "l-5022"]; // Gated initially are HRTech and Ayurveda, Finance/Mockup are public
  });

  const [offersList, setOffersList] = useState<{ [listingId: string]: Offer }>(() => {
    const saved = localStorage.getItem("fmi_offers");
    return saved ? JSON.parse(saved) : {};
  });

  const [dealRooms, setDealRooms] = useState<{ [listingId: string]: { stage: string; checklist: any[]; messages: any[] } }>(() => {
    const saved = localStorage.getItem("fmi_deals");
    return saved ? JSON.parse(saved) : {};
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n-1",
      title: "Welcome to FMI Platform",
      body: "Phase 1 Bootstrap initialized successfully. Create listings and try the interactive NDA unlock & deal room!",
      timestamp: new Date(),
      isRead: false,
      type: "success"
    }
  ]);

  // UI Control States
  const [selectedListing, setSelectedListing] = useState<ListingItem | null>(null);
  const [selectedAssetType, setSelectedAssetType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNdaModalOpen, setIsNdaModalOpen] = useState(false);
  const [isKycWizardOpen, setIsKycWizardOpen] = useState(false);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [activeDealRoomListingId, setActiveDealRoomListingId] = useState<string | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Forms states
  const [ndaSignature, setNdaSignature] = useState("");
  const [isNdaPaying, setIsNdaPaying] = useState(false);

  // KYC Form Step states
  const [kycStep, setKycStep] = useState(1);
  const [kycRole, setKycRole] = useState<"buyer" | "seller" | "both">("both");
  const [kycType, setKycType] = useState<"individual" | "company">("individual");
  const [kycPan, setKycPan] = useState("AMPDP9912A");
  const [kycAadhaar, setKycAadhaar] = useState("4567");
  const [kycSelfie, setKycSelfie] = useState("");
  const [kycBankName, setKycBankName] = useState("Jenish Patel");
  const [kycBankAccount, setKycBankAccount] = useState("987654321098");
  const [kycIfsc, setKycIfsc] = useState("HDFC0000123");
  const [kycCompanyName, setKycCompanyName] = useState("");
  const [kycCin, setKycCin] = useState("");
  const [kycGstin, setKycGstin] = useState("");

  // Create Listing Wizard Form
  const [newTitle, setNewTitle] = useState("");
  const [newTagline, setNewTagline] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAssetType, setNewAssetType] = useState<ListingItem["assetType"]>("saas");
  const [newIndustry, setNewIndustry] = useState("Technology & Software");
  const [newAskingPrice, setNewAskingPrice] = useState("");
  const [newRevenue, setNewRevenue] = useState("");
  const [newProfit, setNewProfit] = useState("");
  const [newTraffic, setNewTraffic] = useState("");
  const [newYear, setNewYear] = useState("2024");
  const [newUrl, setNewUrl] = useState("");
  const [newNdaRequired, setNewNdaRequired] = useState(true);
  const [newNdaFee, setNewNdaFee] = useState("999");
  const [newTags, setNewTags] = useState("");

  // Deal Room Chat Message state
  const [chatInput, setChatInput] = useState("");

  // Deal Room Offer Making state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [offerUpfront, setOfferUpfront] = useState("100");
  const [offerEarnout, setOfferEarnout] = useState("0");
  const [offerEarnoutTerms, setOfferEarnoutTerms] = useState("");
  const [offerMessage, setOfferMessage] = useState("");

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem("fmi_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("fmi_listings", JSON.stringify(listingsList));
  }, [listingsList]);

  useEffect(() => {
    localStorage.setItem("fmi_unlocked", JSON.stringify(unlockedListings));
  }, [unlockedListings]);

  useEffect(() => {
    localStorage.setItem("fmi_offers", JSON.stringify(offersList));
  }, [offersList]);

  useEffect(() => {
    localStorage.setItem("fmi_deals", JSON.stringify(dealRooms));
  }, [dealRooms]);

  // --- HANDLERS ---
  const triggerNotification = (title: string, body: string, type: "info" | "success" | "warning" = "info") => {
    const newNotif: NotificationItem = {
      id: `n-${Date.now()}`,
      title,
      body,
      timestamp: new Date(),
      isRead: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleNdaClick = (listing: ListingItem) => {
    if (!isAuthenticated) {
      triggerNotification("Authentication Required", "Please sign in to execute NDAs and unlock gated listings.", "warning");
      navigateTo("/login");
      return;
    }
    setSelectedListing(listing);
    setIsNdaModalOpen(true);
  };

  const openCreateListing = () => {
    if (!isAuthenticated) {
      triggerNotification("Authentication Required", "Please sign in to list your digital business for sale.", "warning");
      navigateTo("/login");
      return;
    }
    setIsCreateListingOpen(true);
  };

  const openKycWizard = () => {
    if (!isAuthenticated) {
      triggerNotification("Authentication Required", "Please sign in to view and configure KYC profiles.", "warning");
      navigateTo("/login");
      return;
    }
    setIsKycWizardOpen(true);
  };

  const openDealRoom = (listing: ListingItem) => {
    if (!isAuthenticated) {
      triggerNotification("Authentication Required", "Please sign in to access secure M&A deal rooms.", "warning");
      navigateTo("/login");
      return;
    }
    setSelectedListing(listing);
    setActiveDealRoomListingId(listing.id);
  };

  const openOfferModal = (listing: ListingItem) => {
    if (!isAuthenticated) {
      triggerNotification("Authentication Required", "Please sign in to make a formal acquisition offer.", "warning");
      navigateTo("/login");
      return;
    }
    setSelectedListing(listing);
    setIsOfferModalOpen(true);
  };

  const submitNdaSignature = () => {
    if (!ndaSignature.trim()) {
      alert("Please sign your name digitally to execute the NDA.");
      return;
    }

    setIsNdaPaying(true);
    // Simulate Razorpay secure checkout
    setTimeout(() => {
      if (selectedListing) {
        setUnlockedListings(prev => [...prev, selectedListing.id]);
        setIsNdaPaying(false);
        setIsNdaModalOpen(false);
        setNdaSignature("");
        triggerNotification(
          "NDA Signed & Verified", 
          `You unlocked the complete details of '${selectedListing.title}'. NDA digital seal successfully generated.`, 
          "success"
        );
      }
    }, 1800);
  };

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserProfile(prev => ({
      ...prev,
      kycStatus: "approved",
      role: kycRole,
      kycType: kycType,
    }));
    setIsKycWizardOpen(false);
    setKycStep(1);
    triggerNotification(
      "KYC Profile Verified", 
      "Your PAN, Aadhaar, and identity checks have been validated. KYC Level 1 and 2 is fully Active.", 
      "success"
    );
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAskingPrice || !newRevenue || !newProfit) {
      alert("Please enter title, asking price, revenue and profit.");
      return;
    }

    const price = parseInt(newAskingPrice.replace(/\D/g, "")) || 0;
    const rev = parseInt(newRevenue.replace(/\D/g, "")) || 0;
    const prof = parseInt(newProfit.replace(/\D/g, "")) || 0;
    const traf = parseInt(newTraffic.replace(/\D/g, "")) || 0;
    const established = parseInt(newYear) || 2024;
    const slug = generateSlug(newTitle) || `listing-${Date.now()}`;

    const newListing: ListingItem = {
      id: `l-${Date.now()}`,
      title: newTitle,
      slug,
      tagline: newTagline || "FMI premium acquisition opportunity.",
      description: newDescription || "A secure and verified digital business listing on FMI.",
      assetType: newAssetType,
      industry: newIndustry,
      askingPrice: price,
      monthlyRevenue: rev,
      monthlyProfit: prof,
      monthlyTraffic: traf,
      yearEstablished: established,
      businessUrl: newUrl || "https://fmi.in/private",
      ndaRequired: newNdaRequired,
      ndaFee: newNdaRequired ? (parseInt(newNdaFee) || 0) : 0,
      status: "live",
      isFeatured: false,
      tags: newTags ? newTags.split(",").map(t => t.trim()) : [newAssetType.toUpperCase(), newIndustry],
    };

    setListingsList(prev => [newListing, ...prev]);
    setIsCreateListingOpen(false);
    // Clear Form Fields
    setNewTitle("");
    setNewTagline("");
    setNewDescription("");
    setNewAskingPrice("");
    setNewRevenue("");
    setNewProfit("");
    setNewTraffic("");
    setNewUrl("");
    setNewTags("");

    triggerNotification(
      "Listing Created Successfully",
      `Your digital asset '${newListing.title}' is now live on FMI marketplace. Drizzle records successfully pushed.`,
      "success"
    );
  };

  const makeOfferSubmit = (listingId: string) => {
    if (!offerAmount) {
      alert("Please specify the offer amount.");
      return;
    }
    const amt = parseFloat(offerAmount.replace(/\D/g, "")) || 0;
    const upfront = parseFloat(offerUpfront) || 100;
    const earnout = parseFloat(offerEarnout) || 0;

    const newOffer: Offer = {
      amount: amt,
      upfrontPercent: upfront,
      earnoutPercent: earnout,
      earnoutTerms: offerEarnoutTerms,
      message: offerMessage,
      status: "pending",
    };

    setOffersList(prev => ({
      ...prev,
      [listingId]: newOffer
    }));

    // Auto-create Deal Room state for this listing
    if (!dealRooms[listingId]) {
      setDealRooms(prev => ({
        ...prev,
        [listingId]: {
          stage: "due_diligence",
          checklist: [
            { id: "c1", title: "Complete diligence review of financials", assignedTo: "buyer", isCompleted: false },
            { id: "c2", title: "Verify real-time Google Analytics & traffic statistics", assignedTo: "buyer", isCompleted: false },
            { id: "c3", title: "Review proprietary technology & codebase blueprints", assignedTo: "buyer", isCompleted: false },
            { id: "c4", title: "Sign Asset Purchase Agreement contract", assignedTo: "both", isCompleted: false },
            { id: "c5", title: "Fund Indian Escrow transaction account (₹)", assignedTo: "buyer", isCompleted: false },
            { id: "c6", title: "Transfer domain and operational host credentials", assignedTo: "seller", isCompleted: false }
          ],
          messages: [
            { sender: "system", content: "Deal Room initiated successfully. Standard Indian legal guidelines apply. Keep negotiations on FMI to remain protected.", time: "Just Now" }
          ]
        }
      }));
    }

    setIsOfferModalOpen(false);
    triggerNotification(
      "Offer Submitted",
      `Your offer of ${formatCurrency(amt)} has been dispatched to the seller. Deal Room opened.`,
      "success"
    );

    // Pusher real-time reply simulation after 4 seconds
    setTimeout(() => {
      triggerNotification(
        "Pusher Notification",
        "Seller received your proposal and is preparing a counter-offer or verification in the Deal Room.",
        "info"
      );
      // Append a seller response to chat
      setDealRooms(prev => {
        const d = prev[listingId];
        if (!d) return prev;
        return {
          ...prev,
          [listingId]: {
            ...d,
            messages: [
              ...d.messages,
              { sender: "seller", content: "Hi there, thank you for your offer! I'm happy to grant you access to our codebase and answer any questions you have here in the FMI chat.", time: "A moment ago" }
            ]
          }
        };
      });
    }, 4500);
  };

  const handleSendMessage = (listingId: string) => {
    if (!chatInput.trim()) return;
    const currentMsg = chatInput;
    setChatInput("");

    setDealRooms(prev => {
      const d = prev[listingId];
      if (!d) return prev;
      return {
        ...prev,
        [listingId]: {
          ...d,
          messages: [
            ...d.messages,
            { sender: "buyer", content: currentMsg, time: "Just Now" }
          ]
        }
      };
    });

    // Simulate auto-seller real-time response (Pusher channels replica)
    setTimeout(() => {
      setDealRooms(prev => {
        const d = prev[listingId];
        if (!d) return prev;
        return {
          ...prev,
          [listingId]: {
            ...d,
            messages: [
              ...d.messages,
              { sender: "seller", content: `Received: "${currentMsg}". Our tech lead can jump on a quick call this week if you want to inspect our Wayanad cooperative FDA certifications or checkout compliance logs!`, time: "Just Now" }
            ]
          }
        };
      });
      triggerNotification("New Realtime Message", "The seller sent a response in your Deal Room chat.", "info");
    }, 2000);
  };

  const handleChecklistToggle = (listingId: string, itemId: string) => {
    setDealRooms(prev => {
      const d = prev[listingId];
      if (!d) return prev;
      return {
        ...prev,
        [listingId]: {
          ...d,
          checklist: d.checklist.map(item => item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item)
        }
      };
    });
  };

  const advanceDealStage = (listingId: string, nextStage: string) => {
    setDealRooms(prev => {
      const d = prev[listingId];
      if (!d) return prev;
      return {
        ...prev,
        [listingId]: {
          ...d,
          stage: nextStage
        }
      };
    });
    triggerNotification("Deal Status Shift", `FMI Deal stage updated to: ${nextStage.toUpperCase()}`, "warning");
  };

  // --- FILTERS & QUERY ---
  const filteredListings = listingsList.filter(l => {
    const matchesType = selectedAssetType === "all" || l.assetType === selectedAssetType;
    const matchesQuery = l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         l.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         l.industry.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  // --- AUTH FLOW ROUTER GATE ---
  if (currentPath === "/login") {
    return (
      <AuthLayout>
        <LoginPage 
          onSuccess={(email) => { 
            setAuthEmail(email); 
            navigateTo("/verify-email"); 
          }} 
          onNavigateToSignup={() => navigateTo("/signup")} 
        />
      </AuthLayout>
    );
  }

  if (currentPath === "/signup") {
    return (
      <AuthLayout>
        <SignupPage 
          onSuccess={(email, name) => { 
            setAuthEmail(email); 
            setAuthName(name); 
            navigateTo("/verify-email"); 
          }} 
          onNavigateToLogin={() => navigateTo("/login")} 
        />
      </AuthLayout>
    );
  }

  if (currentPath === "/verify-email") {
    return (
      <AuthLayout>
        <VerifyEmailPage 
          email={authEmail || "guest@fmi.in"} 
          onSuccess={(userData) => { 
            login(userData); 
            navigateTo("/verify-phone"); 
          }} 
          onBack={() => navigateTo("/login")} 
        />
      </AuthLayout>
    );
  }

  if (currentPath === "/verify-phone") {
    return (
      <AuthLayout>
        <VerifyPhonePage 
          email={authEmail} 
          onSuccess={(phone) => {
            if (user) {
              login({ ...user, phone, phoneVerified: true });
            }
            navigateTo("/onboarding/role");
          }} 
          onSkip={() => navigateTo("/onboarding/role")} 
        />
      </AuthLayout>
    );
  }

  if (currentPath === "/onboarding/role") {
    return (
      <OnboardingLayout currentPath={currentPath}>
        <OnboardingRolePage
          user={user}
          onSuccess={(role, kycType) => {
            setUserProfile((prev) => ({ ...prev, role, kycType }));
            if (user) {
              login({ ...user, role });
            }
            if (kycType === "company") {
              navigateTo("/onboarding/kyc/company");
            } else {
              navigateTo("/onboarding/kyc/individual");
            }
          }}
        />
      </OnboardingLayout>
    );
  }

  if (currentPath === "/onboarding/kyc/individual") {
    return (
      <OnboardingLayout currentPath={currentPath}>
        <IndividualKycPage
          user={user}
          onSuccess={() => {
            setUserProfile((prev) => ({ ...prev, kycStatus: "pending" }));
            if (user) {
              login({ ...user, kycStatus: "pending", kycType: "individual" });
            }
            if (userProfile.role === "buyer" || userProfile.role === "both") {
              navigateTo("/onboarding/interests");
            } else {
              navigateTo("/");
            }
          }}
          onBackToRole={() => navigateTo("/onboarding/role")}
        />
      </OnboardingLayout>
    );
  }

  if (currentPath === "/onboarding/kyc/company") {
    return (
      <OnboardingLayout currentPath={currentPath}>
        <CompanyKycPage
          user={user}
          onSuccess={() => {
            setUserProfile((prev) => ({ ...prev, kycStatus: "pending" }));
            if (user) {
              login({ ...user, kycStatus: "pending", kycType: "company" });
            }
            if (userProfile.role === "buyer" || userProfile.role === "both") {
              navigateTo("/onboarding/interests");
            } else {
              navigateTo("/");
            }
          }}
          onBackToRole={() => navigateTo("/onboarding/role")}
        />
      </OnboardingLayout>
    );
  }

  if (currentPath === "/onboarding/interests") {
    return (
      <OnboardingLayout currentPath={currentPath}>
        <OnboardingInterestsPage
          user={user}
          onSuccess={() => {
            navigateTo("/");
          }}
        />
      </OnboardingLayout>
    );
  }

  if (currentPath === "/listings" || currentPath.startsWith("/listings?")) {
    return <BrowseListingsPage />;
  }

  if (currentPath.startsWith("/listings/")) {
    const parts = currentPath.split("?")[0].split("/");
    const slug = parts[parts.length - 1];
    return <ListingDetailPage slug={slug} />;
  }

  if (currentPath.startsWith("/buyer")) {
    let pageContent = <BuyerDashboardPage />;
    if (currentPath === "/buyer/offers") {
      pageContent = <BuyerOffersPage />;
    } else if (currentPath === "/buyer/deals") {
      pageContent = <BuyerDealsPage />;
    } else {
      const detailMatch = currentPath.match(/^\/buyer\/deals\/([^\/]+)$/);
      const docsMatch = currentPath.match(/^\/buyer\/deals\/([^\/]+)\/documents$/);
      const checklistMatch = currentPath.match(/^\/buyer\/deals\/([^\/]+)\/checklist$/);
      const messagesMatch = currentPath.match(/^\/buyer\/deals\/([^\/]+)\/messages$/);
      
      if (detailMatch) {
        pageContent = <BuyerDealDetailPage dealId={detailMatch[1]} />;
      } else if (docsMatch) {
        pageContent = <BuyerDealDocumentsPage dealId={docsMatch[1]} />;
      } else if (checklistMatch) {
        pageContent = <BuyerDealChecklistPage dealId={checklistMatch[1]} />;
      } else if (messagesMatch) {
        pageContent = <BuyerDealMessagesPage dealId={messagesMatch[1]} />;
      }
    }
    return (
      <BuyerLayout currentPath={currentPath}>
        {pageContent}
      </BuyerLayout>
    );
  }

  if (currentPath.startsWith("/seller")) {
    let pageContent = <SellerDashboardPage />;
    if (currentPath === "/seller/listings") {
      pageContent = <SellerListingsPage />;
    } else if (currentPath === "/seller/listings/new") {
      pageContent = <SellerNewListingPage />;
    } else if (currentPath === "/seller/offers") {
      pageContent = <SellerOffersPage />;
    } else if (currentPath === "/seller/deals") {
      pageContent = <SellerDealsPage />;
    } else {
      const detailMatch = currentPath.match(/^\/seller\/deals\/([^\/]+)$/);
      const docsMatch = currentPath.match(/^\/seller\/deals\/([^\/]+)\/documents$/);
      const checklistMatch = currentPath.match(/^\/seller\/deals\/([^\/]+)\/checklist$/);
      const messagesMatch = currentPath.match(/^\/seller\/deals\/([^\/]+)\/messages$/);
      
      if (detailMatch) {
        pageContent = <SellerDealDetailPage dealId={detailMatch[1]} />;
      } else if (docsMatch) {
        pageContent = <SellerDealDocumentsPage dealId={docsMatch[1]} />;
      } else if (checklistMatch) {
        pageContent = <SellerDealChecklistPage dealId={checklistMatch[1]} />;
      } else if (messagesMatch) {
        pageContent = <SellerDealMessagesPage dealId={messagesMatch[1]} />;
      }
    }
    return (
      <SellerLayout currentPath={currentPath}>
        {pageContent}
      </SellerLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans antialiased selection:bg-brand-green/20 selection:text-brand-green flex flex-col justify-between">
      
      {/* 1. TOP HEADER & NAVIGATION */}
      <nav className="border-b border-black/10 py-5 px-6 md:px-12 bg-[#FDFCFB]/85 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-green flex items-center justify-center text-white font-serif italic font-extrabold text-xl shadow-md">
              F
            </div>
            <div>
              <span className="text-xl font-serif font-black tracking-tight uppercase block">FMI</span>
              <span className="text-[9px] font-mono tracking-widest text-[#1A1A1A]/40 uppercase block -mt-1">Digital Exchange</span>
            </div>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-widest uppercase text-black/80">
            <button onClick={() => navigateTo("/listings")} className="hover:text-brand-green transition-colors text-left">Marketplace</button>
            <button onClick={() => navigateTo("/seller/dashboard")} className="hover:text-brand-green transition-colors text-left">Sell Business</button>
            <button onClick={openKycWizard} className="hover:text-brand-green transition-colors text-left flex items-center gap-1">
              KYC Status: 
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${userProfile.kycStatus === 'approved' ? 'bg-brand-green/10 text-brand-green' : 'bg-red-100 text-red-800'}`}>
                {userProfile.kycStatus.toUpperCase()}
              </span>
            </button>
          </div>

          {/* Profile, Notifications */}
          <div className="flex items-center gap-4">
            {/* Bell Notification */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)} 
                className="p-2 border border-black/10 hover:bg-black/5 rounded-full transition-all relative"
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-brand-orange rounded-full" />
                )}
              </button>

              <AnimatePresence>
                {isNotificationOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-white border border-black/10 shadow-xl p-4 z-50 rounded"
                  >
                    <div className="flex justify-between items-center mb-3 border-b border-black/5 pb-2">
                      <span className="text-xs font-bold tracking-wider uppercase opacity-50">Notifications</span>
                      <button 
                        onClick={() => {
                          setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                          setIsNotificationOpen(false);
                        }} 
                        className="text-[10px] underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-3">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-center text-gray-400 py-4">No new notifications</p>
                      ) : (
                        notifications.map(notif => (
                          <div key={notif.id} className="p-2 hover:bg-gray-50 border-l-2 border-brand-green/50">
                            <h4 className="text-xs font-bold">{notif.title}</h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">{notif.body}</p>
                            <span className="text-[9px] text-gray-400 block mt-1">{formatDate(notif.timestamp)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar & Dropdown Trigger */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 border border-black/10 px-3 py-1.5 hover:bg-[#1D4429]/5 transition-all text-xs font-semibold cursor-pointer"
                >
                  <div className="w-5 h-5 bg-[#1D4429]/10 text-brand-green rounded-full flex items-center justify-center text-[10px] font-extrabold uppercase">
                    {userProfile.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline">{userProfile.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-55" />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-56 bg-white border border-black/10 shadow-xl z-50 rounded overflow-hidden"
                    >
                      {/* Dropdown Header */}
                      <div className="p-3 border-b border-black/5 bg-[#FDFCFB]">
                        <p className="text-xs font-black truncate">{userProfile.name}</p>
                        <p className="text-[10px] text-gray-500 truncate">{userProfile.email}</p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded capitalize ${userProfile.kycStatus === 'approved' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-orange/10 text-brand-orange'}`}>
                            KYC: {userProfile.kycStatus}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Body */}
                      <div className="py-1">
                        {userProfile.kycStatus !== 'approved' && (
                          <button 
                            onClick={() => {
                              navigateTo("/onboarding/role");
                              setIsProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <User className="w-3.5 h-3.5 text-brand-green" />
                            <span>KYC Portal</span>
                          </button>
                        )}

                        <button 
                          onClick={() => {
                            navigateTo("/seller/dashboard");
                            setIsProfileDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <Briefcase className="w-3.5 h-3.5 text-brand-green" />
                          <span>Seller Suite</span>
                        </button>
                      </div>

                      {/* Dropdown Footer / Logout */}
                      <div className="border-t border-black/5 py-1">
                        <button 
                          onClick={() => {
                            logout();
                            triggerNotification("Logged Out", "You have been successfully signed out of FMI.", "info");
                            setIsProfileDropdownOpen(false);
                            navigateTo("/");
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors font-bold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigateTo("/login")}
                  className="text-xs font-bold hover:text-brand-green px-3 py-1.5 transition-all"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => navigateTo("/signup")}
                  className="bg-brand-green hover:bg-brand-green/95 text-white text-xs font-bold px-4 py-2 transition-all rounded"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 2. DYNAMIC BROADCAST HERO */}
      <header className="px-6 md:px-12 py-12 md:py-20 bg-gradient-to-b from-[#FDFCFB] to-[#F7F5F0] border-b border-black/5 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Main Hero copy */}
          <div className="md:col-span-8 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-brand-green/20 bg-brand-green/5 text-brand-green text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
              Phase 1 Live — Infrastructure Verification Active
            </div>
            <h1 className="font-serif italic font-black text-5xl md:text-7xl leading-[1.0] tracking-tight">
              India's Premiere <br />
              <span className="text-brand-green">Digital Business</span> Exchange
            </h1>
            <p className="text-base md:text-lg max-w-xl text-[#1A1A1A]/70 leading-relaxed font-sans">
              The premium, trust-first marketplace engineered specifically for the Indian startup and business ecosystem. Acquire validated SaaS products, high-retention D2C brands, and content portals with integrated KYC, automated mutual NDAs, and escrow.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => navigateTo("/listings")}
                className="bg-brand-green hover:bg-brand-green/90 text-white font-semibold text-xs tracking-widest uppercase px-6 py-3 transition-all cursor-pointer"
              >
                Browse Live Deals
              </button>
              <button 
                onClick={() => setIsCreateListingOpen(true)} 
                className="border border-brand-green text-brand-green hover:bg-brand-green/5 font-semibold text-xs tracking-widest uppercase px-6 py-3 transition-all"
              >
                List Your Asset
              </button>
            </div>
          </div>

          {/* Side Platform Stats Block */}
          <div className="md:col-span-4 bg-white border border-black/10 p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="font-serif italic font-bold text-lg text-brand-green border-b border-black/5 pb-2">Platform Activity</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold tracking-widest uppercase text-black/50">Total Value Transacted</span>
                <span className="text-xl font-semibold tracking-tight">₹184.20 Cr+</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold tracking-widest uppercase text-black/50">Active Escrow Sum</span>
                <span className="text-xl font-semibold tracking-tight text-brand-green">₹14.90 Cr+</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold tracking-widest uppercase text-black/50">KYC Verified Buyers</span>
                <span className="text-xl font-semibold tracking-tight">12,400+</span>
              </div>
            </div>

            <div className="bg-[#1D4429]/5 p-3 text-[10px] text-brand-green font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              All listings are bound under the Indian Companies Act & SEBI regulations.
            </div>
          </div>

        </div>
      </header>

      {/* 3. INTERACTIVE PLATFORM PREVIEW PLAYGROUND */}
      <main id="marketplace" className="max-w-7xl mx-auto w-full px-6 md:px-12 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: FILTERS & LISTINGS MARKETPLACE (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-4">
            <div>
              <h2 className="text-xs uppercase font-bold tracking-[0.25em] text-brand-green border-l-4 border-brand-green pl-3">
                Acquisitions Marketplace
              </h2>
              <p className="text-xs text-gray-500 mt-1">Live listings requiring NDA signatures for deep diligence.</p>
            </div>
            
            {/* Search Input */}
            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search SaaS, D2C, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 border border-black/10 bg-white focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all"
              />
            </div>
          </div>

          {/* Asset Type Filter Pills */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedAssetType("all")}
              className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all ${selectedAssetType === "all" ? "bg-brand-green text-white" : "bg-black/5 hover:bg-black/10 text-black/80"}`}
            >
              All Assets ({listingsList.length})
            </button>
            {ASSET_TYPES.map(type => {
              const count = listingsList.filter(l => l.assetType === type.value).length;
              return (
                <button 
                  key={type.value}
                  onClick={() => setSelectedAssetType(type.value)}
                  className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase transition-all ${selectedAssetType === type.value ? "bg-brand-green text-white" : "bg-black/5 hover:bg-black/10 text-black/80"}`}
                >
                  {type.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Listings Grid */}
          <div className="space-y-6">
            {filteredListings.length === 0 ? (
              <div className="border border-dashed border-black/10 p-12 text-center text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No digital assets match your active filters.</p>
                <button onClick={() => { setSelectedAssetType("all"); setSearchQuery(""); }} className="text-xs underline text-brand-green mt-2 font-bold uppercase tracking-wider">Reset Search</button>
              </div>
            ) : (
              filteredListings.map((listing) => {
                const isUnlocked = unlockedListings.includes(listing.id);
                const hasOffer = offersList[listing.id];
                
                return (
                  <div key={listing.id} className="bg-white border border-black/10 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                    {listing.isFeatured && (
                      <span className="absolute top-0 right-0 bg-brand-green text-white text-[8px] font-bold uppercase tracking-widest px-3 py-1">
                        Featured
                      </span>
                    )}

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      
                      {/* Top Title/Tagline info */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border border-black/5 ${
                            ASSET_TYPES.find(t => t.value === listing.assetType)?.color || "bg-gray-100"
                          }`}>
                            {listing.assetType.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">#{listing.id.toUpperCase()}</span>
                          <span className="text-[10px] text-gray-400">Est. {listing.yearEstablished}</span>
                        </div>

                        <h3 className="text-xl font-serif italic font-bold leading-snug group-hover:text-brand-green transition-colors">
                          {listing.title}
                        </h3>

                        <p className="text-xs text-gray-500 leading-relaxed font-sans italic">
                          {listing.tagline}
                        </p>
                      </div>

                      {/* Pricing Block */}
                      <div className="bg-brand-cream border border-black/5 p-4 text-right min-w-[150px] shrink-0">
                        <span className="text-[9px] font-bold tracking-widest uppercase opacity-40 block mb-0.5">Asking Price</span>
                        <span className="text-xl font-black text-brand-green block tracking-tight">
                          {formatCurrency(listing.askingPrice)}
                        </span>
                        <div className="text-[10px] text-gray-500 font-medium">
                          Profit Multiplier: <span className="font-bold">{(listing.askingPrice / (listing.monthlyProfit * 12)).toFixed(1)}x</span>
                        </div>
                      </div>

                    </div>

                    {/* Diligence Preview Panel */}
                    <div className="mt-4 pt-4 border-t border-black/5 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <span className="block text-[9px] uppercase opacity-40 mb-0.5">Monthly Revenue</span>
                        <span className="text-sm font-semibold tracking-tight text-gray-800">
                          {formatCurrency(listing.monthlyRevenue)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase opacity-40 mb-0.5">Monthly Net Profit</span>
                        <span className="text-sm font-semibold tracking-tight text-brand-green">
                          {formatCurrency(listing.monthlyProfit)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase opacity-40 mb-0.5">Monthly Traffic</span>
                        <span className="text-sm font-semibold tracking-tight text-gray-800">
                          {listing.monthlyTraffic.toLocaleString()} Sessions
                        </span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase opacity-40 mb-0.5">Status</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-green">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
                          {listing.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Unlocked / Locked deep information section */}
                    <div className="mt-5 p-4 bg-brand-cream border border-black/5 relative">
                      {isUnlocked ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-brand-green uppercase tracking-widest">
                            <Unlock className="w-3.5 h-3.5" />
                            Diligence Vault Unlocked
                          </div>
                          <p className="text-xs text-[#1A1A1A]/85 leading-relaxed font-sans">
                            {listing.description}
                          </p>
                          <div className="flex flex-wrap gap-4 pt-1 border-t border-black/5 mt-2">
                            <span className="text-xs font-semibold text-brand-green flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-500">Business URL:</span> {listing.businessUrl}
                            </span>
                            <span className="text-xs font-semibold text-brand-green flex items-center gap-1">
                              <FileSpreadsheet className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-500">Analytics Attached:</span> Verified GA screenshots
                            </span>
                          </div>

                          <div className="flex justify-between items-center pt-2 mt-2">
                            <div className="flex gap-2">
                              {listing.tags.map(tag => (
                                <span key={tag} className="text-[9px] bg-black/5 text-black/60 px-2 py-0.5 rounded-full font-medium">#{tag}</span>
                              ))}
                            </div>

                            {/* Offer status or Bid Action */}
                            <div className="flex gap-2">
                              <button 
                                onClick={() => openDealRoom(listing)} 
                                className="bg-[#1D4429]/10 hover:bg-[#1D4429]/20 text-brand-green font-bold text-[10px] tracking-widest uppercase px-4 py-2 transition-all flex items-center gap-1.5"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Deal Room
                              </button>
                              <button 
                                onClick={() => openOfferModal(listing)} 
                                className="bg-brand-green hover:bg-brand-green/90 text-white font-bold text-[10px] tracking-widest uppercase px-4 py-2 transition-all flex items-center gap-1"
                              >
                                <CircleDollarSign className="w-3.5 h-3.5" />
                                {hasOffer ? "Modify Offer" : "Make Offer"}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-brand-orange/10 text-brand-orange rounded">
                              <Lock className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-[#1A1A1A]">Private Business Documents Gated</h5>
                              <p className="text-[10px] text-gray-400 mt-0.5">Execution of a verified mutual Non-Disclosure Agreement (NDA) is required.</p>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleNdaClick(listing)}
                            className="bg-[#1D4429] text-white hover:bg-brand-green/90 text-[10px] font-bold uppercase tracking-widest px-4 py-2.5 transition-all shrink-0 flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Sign Mutual NDA
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INFRASTRUCTURE TESTBENCH (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* USER CONSOLE */}
          <div className="bg-white border border-black/10 p-6 shadow-sm">
            <div className="flex justify-between items-center border-b border-black/5 pb-2 mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-brand-green">FMI User Console</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isAuthenticated ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-orange/10 text-brand-orange'}`}>
                {isAuthenticated ? "Authenticated" : "Guest Mode"}
              </span>
            </div>

            {isAuthenticated ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-green/10 text-brand-green font-black flex items-center justify-center text-lg uppercase rounded-full">
                      {userProfile.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{userProfile.name}</h4>
                      <p className="text-[10px] text-gray-500">{userProfile.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      triggerNotification("Logged Out", "You have been successfully signed out of FMI.", "info");
                      navigateTo("/");
                    }}
                    className="text-[10px] font-bold text-red-600 hover:underline px-2 py-1"
                  >
                    Log Out
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-black/5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Account Type:</span>
                    <span className="font-semibold text-brand-green capitalize">{userProfile.role}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">KYC Status:</span>
                    <div className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${userProfile.kycStatus === 'approved' ? 'bg-brand-green' : 'bg-brand-orange'}`} />
                      <span className="font-semibold capitalize text-[#1A1A1A]">{userProfile.kycStatus}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone Verified:</span>
                    <span className="font-semibold text-brand-green">{userProfile.phone ? "Yes" : "No"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button 
                    onClick={openKycWizard}
                    className="bg-[#1D4429]/5 border border-brand-green/10 text-brand-green hover:bg-[#1D4429]/10 py-2 text-[10px] font-bold uppercase tracking-wider text-center"
                  >
                    Configure KYC
                  </button>
                  <button 
                    onClick={openCreateListing}
                    className="bg-brand-green text-white hover:bg-brand-green/95 py-2 text-[10px] font-bold uppercase tracking-wider text-center"
                  >
                    Create Listing
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-2 text-center">
                <div className="w-12 h-12 bg-black/5 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-700">Not Logged In</h4>
                  <p className="text-[11px] text-gray-400 mt-1">Sign in to FMI to unlock secure M&A deal rooms, sign mutual NDAs, and view gated businesses.</p>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={() => navigateTo("/login")}
                    className="w-full bg-[#1D4429] text-white hover:bg-brand-green/95 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all"
                  >
                    Authenticate Now
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE AGREEMENT FLOW TEST PANEL */}
          <div className="bg-brand-green text-white p-6 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-6 -mt-6" />
            
            <h3 className="font-serif italic font-bold text-xl mb-2">Verification Sandbox</h3>
            <p className="text-xs text-white/80 leading-relaxed mb-4 font-sans">
              Test FMI's multi-step architecture including mutual legal agreements, Razorpay payments, and real-time Pusher state updates instantly.
            </p>

            <div className="space-y-3 text-[11px] border-t border-white/15 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white/20 flex items-center justify-center rounded-full font-bold">1</div>
                <span>Click "Sign Mutual NDA" on a locked listing card</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white/20 flex items-center justify-center rounded-full font-bold">2</div>
                <span>Digitally execute standard Mutual NDA</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white/20 flex items-center justify-center rounded-full font-bold">3</div>
                <span>Pay ₹999 / ₹1,499 mock fee (Razorpay sandbox simulated)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-white/20 flex items-center justify-center rounded-full font-bold">4</div>
                <span>Gain instant access to proprietary details & logs</span>
              </div>
            </div>
          </div>

          {/* SIMULATED LIVE DEAL ROOMS ACCORDION */}
          <div className="bg-white border border-black/10 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-black/5 pb-2 mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-brand-green">Active Deals ({Object.keys(dealRooms).length})</span>
              <span className="w-2.5 h-2.5 rounded-full bg-brand-green animate-pulse" />
            </div>

            {Object.keys(dealRooms).length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center italic">
                Unlock a listing and make an offer to initiate a Deal Room with a seller.
              </p>
            ) : (
              <div className="space-y-3">
                {Object.keys(dealRooms).map(listingId => {
                  const listing = listingsList.find(l => l.id === listingId);
                  const deal = dealRooms[listingId];
                  if (!listing) return null;

                  return (
                    <div 
                      key={listingId} 
                      onClick={() => setActiveDealRoomListingId(listingId)}
                      className={`p-3 border transition-all cursor-pointer ${activeDealRoomListingId === listingId ? "border-brand-green bg-brand-green/5" : "border-black/5 hover:border-black/20"}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider">{listing.assetType}</span>
                        <span className="text-[9px] font-mono text-gray-400 capitalize">Stage: {deal.stage.replace('_', ' ')}</span>
                      </div>
                      <h4 className="text-xs font-bold mt-1 line-clamp-1">{listing.title}</h4>
                      
                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/5 text-[10px]">
                        <span className="text-gray-500">Offer: <span className="font-bold text-brand-green">{formatCurrency(offersList[listingId]?.amount || 0)}</span></span>
                        <span className="text-brand-green font-bold flex items-center gap-0.5">
                          Enter Deal <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </main>

      {/* 4. REAL-TIME INTERACTIVE DEAL ROOM SHEET / BOX */}
      <AnimatePresence>
        {activeDealRoomListingId && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 bg-[#FDFCFB] z-50 overflow-y-auto flex flex-col justify-between"
          >
            {/* Header */}
            <div className="border-b border-black/10 py-4 px-6 bg-brand-cream sticky top-0 z-10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand-green text-white font-serif italic flex items-center justify-center text-lg font-bold">R</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-brand-green">FMI Secured Transaction Room</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-brand-green/10 text-brand-green font-mono uppercase">Room #{activeDealRoomListingId.toUpperCase()}</span>
                  </div>
                  <h2 className="text-sm font-serif italic font-extrabold text-[#1A1A1A]">
                    {listingsList.find(l => l.id === activeDealRoomListingId)?.title}
                  </h2>
                </div>
              </div>

              <button 
                onClick={() => setActiveDealRoomListingId(null)}
                className="p-2 border border-black/10 hover:bg-black/5 rounded-full transition-colors"
                title="Exit Room"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stages / Progress Tracker */}
            <div className="bg-[#1D4429]/5 py-4 px-6 border-b border-black/10">
              <div className="max-w-6xl mx-auto flex flex-wrap justify-between gap-4 text-xs font-semibold">
                {DEAL_STAGES.map((stg, idx) => {
                  const currentStage = dealRooms[activeDealRoomListingId]?.stage;
                  const currentIdx = DEAL_STAGES.findIndex(s => s.value === currentStage);
                  const isCompleted = idx < currentIdx;
                  const isActive = stg.value === currentStage;

                  return (
                    <div key={stg.value} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isCompleted ? "bg-brand-green text-white" : isActive ? "bg-brand-orange text-white" : "bg-black/10 text-gray-500"
                      }`}>
                        {isCompleted ? <Check className="w-3 h-3" /> : idx + 1}
                      </div>
                      <div className="text-left">
                        <span className={`block text-[10px] font-bold uppercase tracking-wider ${isActive ? "text-[#1A1A1A]" : "text-gray-400"}`}>
                          {stg.label}
                        </span>
                      </div>
                      {idx < DEAL_STAGES.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden md:inline" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Split Content: Chat vs Checklist */}
            <div className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Deal Detail, Counter-offer, Checklist (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Offer details & parameters */}
                <div className="bg-white border border-black/10 p-6 shadow-sm">
                  <div className="flex justify-between items-start border-b border-black/5 pb-3 mb-4">
                    <div>
                      <span className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Current Deal Proposal</span>
                      <h3 className="text-xl font-bold font-serif italic text-brand-green">
                        {formatCurrency(offersList[activeDealRoomListingId]?.amount || 0)}
                      </h3>
                    </div>

                    <div className="text-right text-xs">
                      <span className="block text-[9px] font-bold tracking-widest uppercase text-gray-400">Structure</span>
                      <span className="font-semibold text-gray-700">
                        {offersList[activeDealRoomListingId]?.upfrontPercent}% Upfront / {offersList[activeDealRoomListingId]?.earnoutPercent}% Earn-out
                      </span>
                    </div>
                  </div>

                  {offersList[activeDealRoomListingId]?.earnoutTerms && (
                    <div className="mb-4 text-xs bg-brand-cream p-3 border border-black/5">
                      <span className="font-bold block mb-1">Earn-out Terms:</span>
                      <p className="text-gray-600 font-serif italic">{offersList[activeDealRoomListingId]?.earnoutTerms}</p>
                    </div>
                  )}

                  {/* Modify Offer parameters or state shifts */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-gray-500">
                      Escrow Agent: <span className="font-bold text-brand-green">FMI Secured Trust</span>
                    </span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => advanceDealStage(activeDealRoomListingId, "agreement")} 
                        className="bg-black text-white hover:bg-black/90 text-[10px] font-bold uppercase tracking-wider px-4 py-2"
                      >
                        Advance to APA Agreement
                      </button>
                      <button 
                        onClick={() => advanceDealStage(activeDealRoomListingId, "escrow")} 
                        className="bg-brand-green text-white hover:bg-brand-green/90 text-[10px] font-bold uppercase tracking-wider px-4 py-2"
                      >
                        Simulate Escrow Funding
                      </button>
                    </div>
                  </div>
                </div>

                {/* Handover Checklist item execution */}
                <div className="bg-white border border-black/10 p-6 shadow-sm">
                  <h4 className="font-serif italic font-bold text-lg text-brand-green border-b border-black/5 pb-2 mb-4 flex justify-between items-center">
                    <span>Acquisition Milestones Checklist</span>
                    <span className="text-[10px] uppercase font-mono font-normal tracking-normal text-gray-400">Dual verification active</span>
                  </h4>

                  <div className="space-y-3">
                    {dealRooms[activeDealRoomListingId]?.checklist.map(item => (
                      <div 
                        key={item.id}
                        className={`p-3 border flex items-start gap-3 transition-all ${
                          item.isCompleted ? "bg-[#1D4429]/5 border-[#1D4429]/15" : "bg-[#FDFCFB] border-black/5 hover:border-black/10"
                        }`}
                      >
                        <button 
                          onClick={() => handleChecklistToggle(activeDealRoomListingId, item.id)}
                          className={`w-5 h-5 rounded-sm border mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                            item.isCompleted ? "bg-brand-green border-brand-green text-white" : "border-black/20 bg-white hover:border-brand-green"
                          }`}
                        >
                          {item.isCompleted && <Check className="w-3.5 h-3.5" />}
                        </button>
                        
                        <div className="flex-1 text-xs">
                          <p className={`font-semibold ${item.isCompleted ? "line-through opacity-50" : "text-[#1A1A1A]"}`}>{item.title}</p>
                          <span className="text-[9px] bg-black/5 text-black/50 px-1.5 py-0.2 rounded-full mt-1 inline-block uppercase">
                            Assigned to: {item.assignedTo.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Real-time Messaging (5 Cols) */}
              <div className="lg:col-span-5 bg-white border border-black/10 flex flex-col justify-between shadow-sm min-h-[450px]">
                
                {/* Header */}
                <div className="p-4 border-b border-black/5 bg-brand-cream/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 bg-brand-green rounded-full animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider">Simulated Negotiation Stream</span>
                  </div>
                  <span className="text-[10px] font-mono text-gray-400">Pusher Channels</span>
                </div>

                {/* Messages stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[400px]">
                  {dealRooms[activeDealRoomListingId]?.messages.map((msg, index) => {
                    const isSystem = msg.sender === "system";
                    const isBuyer = msg.sender === "buyer";

                    if (isSystem) {
                      return (
                        <div key={index} className="text-center py-2 bg-brand-cream border border-black/5 px-4 text-[11px] font-serif italic text-gray-500 rounded">
                          {msg.content}
                        </div>
                      );
                    }

                    return (
                      <div key={index} className={`flex flex-col ${isBuyer ? "items-end" : "items-start"}`}>
                        <span className="text-[9px] uppercase font-bold text-gray-400 mb-0.5">{msg.sender}</span>
                        <div className={`p-3 max-w-[80%] text-xs rounded-sm shadow-sm ${
                          isBuyer ? "bg-[#1D4429] text-white" : "bg-brand-cream text-[#1A1A1A] border border-black/5"
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[8px] text-gray-400 mt-0.5">{msg.time}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Inputs */}
                <div className="p-4 border-t border-black/5 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ask seller for financials or access code..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage(activeDealRoomListingId)}
                    className="flex-1 text-xs px-3 py-2 border border-black/10 focus:outline-none focus:border-brand-green"
                  />
                  <button 
                    onClick={() => handleSendMessage(activeDealRoomListingId)}
                    className="bg-brand-green text-white hover:bg-brand-green/90 px-4 py-2 font-bold text-xs uppercase tracking-wider"
                  >
                    Send
                  </button>
                </div>

              </div>

            </div>

            {/* Bottom Status panel */}
            <div className="border-t border-black/10 bg-black text-white/50 text-center py-3 text-[10px] uppercase tracking-widest">
              FMI Escrow and Legal Protection active ● All changes committed to drizzle model logs
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. INTERACTIVE MUTUAL NDA GATEWAY MODAL (₹999 Checkout) */}
      <AnimatePresence>
        {isNdaModalOpen && selectedListing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-black/10 max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start border-b border-black/5 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">Legal Agreement & Diligence Gate</span>
                  <h3 className="text-xl font-serif italic font-bold">Mutual Non-Disclosure Agreement</h3>
                </div>
                <button onClick={() => setIsNdaModalOpen(false)} className="text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Legal Terms scroll */}
              <div className="bg-brand-cream border border-black/10 p-4 rounded text-xs leading-relaxed max-h-48 overflow-y-auto font-serif italic text-gray-600">
                <p className="mb-3 font-sans font-bold text-black uppercase tracking-wider text-[10px]">STANDARD MUTUAL NON-DISCLOSURE AGREEMENT — FMI INDIA</p>
                <p className="mb-2">
                  This Agreement is entered into by and between the Listing Seller (represented as #{selectedListing.id.toUpperCase()}) and the Registered Buyer ({userProfile.name}) under the rules of the Indian Arbitration and Conciliation Act, 1996.
                </p>
                <p className="mb-2">
                  1. DEFINITION OF CONFIDENTIAL INFORMATION: Includes all software source codes, financial accounts, customer directories, payroll details, and proprietary Kerala FDA beauty formulations associated with "{selectedListing.title}".
                </p>
                <p className="mb-2">
                  2. RESTRICTIONS: The Buyer shall not duplicate, leverage, reverse-engineer, or share any metrics disclosed in the diligence logs of FMI platform. Any breach yields direct corporate liability under Indian IT Act, 2000.
                </p>
                <p>
                  3. FEE SCHEDULE: A mutual platform processing fee of {formatCurrency(selectedListing.ndaFee || NDA_FEE_DEFAULT)} is executed to verify buyer intent and seed contract logs.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-black/5">
                
                {/* Fee breakdown & Razorpay Badge */}
                <div className="bg-brand-cream border border-brand-green/10 p-4 text-xs space-y-2">
                  <span className="font-bold block uppercase tracking-wide text-brand-green">Intent Processing Fee</span>
                  <div className="flex justify-between font-mono">
                    <span>NDA Legal Draft Fee:</span>
                    <span>{formatCurrency(selectedListing.ndaFee || NDA_FEE_DEFAULT)}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Stamp Duty & Logging:</span>
                    <span className="text-brand-green">FREE (FMI Active)</span>
                  </div>
                  <div className="border-t border-black/5 pt-2 flex justify-between font-bold">
                    <span>Total Amount:</span>
                    <span className="text-brand-green">{formatCurrency(selectedListing.ndaFee || NDA_FEE_DEFAULT)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-mono pt-3">
                    <ShieldCheck className="w-4 h-4 text-brand-green" />
                    Razorpay Secure Sandbox Mode
                  </div>
                </div>

                {/* Digital Signature box */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">
                      Type Your Legal Name to Sign
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Jenish Patel"
                      value={ndaSignature}
                      onChange={(e) => setNdaSignature(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-black/10 focus:outline-none focus:border-brand-green bg-[#FDFCFB]"
                    />
                  </div>

                  <button 
                    onClick={submitNdaSignature}
                    disabled={isNdaPaying}
                    className="w-full bg-brand-green text-white hover:bg-brand-green/95 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    {isNdaPaying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
                        Executing razorpay checkout...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Execute Agreement & Pay
                      </>
                    )}
                  </button>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. CREATE PROPOSAL / OFFER MODAL */}
      <AnimatePresence>
        {isOfferModalOpen && selectedListing && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-black/10 max-w-lg w-full p-6 space-y-4"
            >
              <div className="flex justify-between items-start border-b border-black/5 pb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">FMI Formal Tender</span>
                  <h3 className="text-xl font-serif italic font-bold">Submit Acquisition Offer</h3>
                </div>
                <button onClick={() => setIsOfferModalOpen(false)} className="text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                
                <div className="bg-brand-cream p-3 border border-black/5">
                  <span className="font-mono text-[9px] text-gray-400 uppercase">Target Listing</span>
                  <h4 className="font-serif italic font-semibold text-[#1A1A1A] text-sm mt-0.5">{selectedListing.title}</h4>
                  <p className="font-mono font-bold text-brand-green mt-1">Asking price: {formatCurrency(selectedListing.askingPrice)}</p>
                </div>

                {/* Offer Amount Input */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">
                    Your Offer Price (₹)
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2,80,00,000"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-black/10 focus:outline-none focus:border-brand-green bg-[#FDFCFB]"
                  />
                </div>

                {/* Upfront & Earn-out sliders */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">
                      Upfront Capital (%)
                    </label>
                    <input 
                      type="number" 
                      min="10" 
                      max="100"
                      value={offerUpfront}
                      onChange={(e) => setOfferUpfront(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-black/10 focus:outline-none focus:border-brand-green bg-[#FDFCFB]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">
                      Earn-out (%)
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      max="90"
                      value={offerEarnout}
                      onChange={(e) => setOfferEarnout(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-black/10 focus:outline-none focus:border-brand-green bg-[#FDFCFB]"
                    />
                  </div>
                </div>

                {/* Earn-out Conditions */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">
                    Earn-out performance targets / Terms (optional)
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="e.g. Remaining 20% released on reaching ₹10L MRR targets within 12 months."
                    value={offerEarnoutTerms}
                    onChange={(e) => setOfferEarnoutTerms(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-black/10 focus:outline-none focus:border-brand-green bg-[#FDFCFB]"
                  />
                </div>

                {/* Pitch Letter */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">
                    Personal message / Introduction
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="Hi, I am an experienced software investor and have capital immediately available to fund..."
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-black/10 focus:outline-none focus:border-brand-green bg-[#FDFCFB]"
                  />
                </div>

                <button 
                  onClick={() => makeOfferSubmit(selectedListing.id)}
                  className="w-full bg-brand-green text-white hover:bg-brand-green/95 py-3 text-xs font-bold uppercase tracking-widest text-center"
                >
                  Submit Formal Tender
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. KYC ONBOARDING WIZARD */}
      <AnimatePresence>
        {isKycWizardOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-black/10 max-w-lg w-full p-6 space-y-6"
            >
              <div className="flex justify-between items-start border-b border-black/5 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">FMI Indian Compliance Portal</span>
                  <h3 className="text-xl font-serif italic font-bold">Onboarding & KYC Verification</h3>
                </div>
                <button onClick={() => setIsKycWizardOpen(false)} className="text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Progress Indicator */}
              <div className="flex justify-between items-center text-xs font-mono border-b border-black/5 pb-4">
                <span className={`px-2 py-1 ${kycStep === 1 ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-500'}`}>1. Role</span>
                <span className={`px-2 py-1 ${kycStep === 2 ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-500'}`}>2. Details</span>
                <span className={`px-2 py-1 ${kycStep === 3 ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-500'}`}>3. Documents</span>
                <span className={`px-2 py-1 ${kycStep === 4 ? 'bg-brand-green text-white' : 'bg-gray-100 text-gray-500'}`}>4. Banking</span>
              </div>

              <form onSubmit={handleKycSubmit} className="space-y-4 text-xs">
                
                {kycStep === 1 && (
                  <div className="space-y-4">
                    <label className="block text-xs font-bold mb-2">Select your primary role on FMI:</label>
                    <div className="grid grid-cols-3 gap-3">
                      <div 
                        onClick={() => setKycRole("buyer")}
                        className={`p-4 border text-center cursor-pointer transition-all ${kycRole === 'buyer' ? 'border-brand-green bg-[#1D4429]/5' : 'border-black/10'}`}
                      >
                        <User className="w-6 h-6 mx-auto mb-1 text-brand-green" />
                        <span className="font-bold block">Buyer</span>
                      </div>
                      <div 
                        onClick={() => setKycRole("seller")}
                        className={`p-4 border text-center cursor-pointer transition-all ${kycRole === 'seller' ? 'border-brand-green bg-[#1D4429]/5' : 'border-black/10'}`}
                      >
                        <Briefcase className="w-6 h-6 mx-auto mb-1 text-brand-green" />
                        <span className="font-bold block">Seller</span>
                      </div>
                      <div 
                        onClick={() => setKycRole("both")}
                        className={`p-4 border text-center cursor-pointer transition-all ${kycRole === 'both' ? 'border-brand-green bg-[#1D4429]/5' : 'border-black/10'}`}
                      >
                        <Award className="w-6 h-6 mx-auto mb-1 text-brand-green" />
                        <span className="font-bold block">Both</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-bold mb-2">KYC Constitution Profile Type:</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 font-semibold">
                          <input 
                            type="radio" 
                            name="kyc_type" 
                            checked={kycType === 'individual'} 
                            onChange={() => setKycType('individual')} 
                            className="accent-brand-green"
                          />
                          Individual / Proprietor
                        </label>
                        <label className="flex items-center gap-1.5 font-semibold">
                          <input 
                            type="radio" 
                            name="kyc_type" 
                            checked={kycType === 'company'} 
                            onChange={() => setKycType('company')} 
                            className="accent-brand-green"
                          />
                          Private Limited Company (CIN / GST)
                        </label>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => setKycStep(2)} 
                      className="w-full bg-brand-green text-white hover:bg-brand-green/95 py-3 font-bold uppercase tracking-widest mt-4 text-center block"
                    >
                      Next Step
                    </button>
                  </div>
                )}

                {kycStep === 2 && (
                  <div className="space-y-4">
                    {kycType === 'individual' ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold mb-1">Enter Permanent Account Number (PAN)</label>
                          <input 
                            type="text" 
                            value={kycPan}
                            onChange={(e) => setKycPan(e.target.value.toUpperCase())}
                            placeholder="ABCDE1234F"
                            maxLength={10}
                            className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                          />
                          {kycPan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(kycPan) && (
                            <span className="text-red-700 text-[10px] block mt-1">Invalid Indian PAN format (ABCDE1234F)</span>
                          )}
                        </div>

                        <div>
                          <label className="block font-bold mb-1">Last 4 digits of Aadhaar</label>
                          <input 
                            type="text" 
                            value={kycAadhaar}
                            onChange={(e) => setKycAadhaar(e.target.value.replace(/\D/g, ""))}
                            placeholder="4567"
                            maxLength={4}
                            className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block font-bold mb-1">Company Registered Name</label>
                          <input 
                            type="text" 
                            placeholder="FMI Technologies Pvt Ltd"
                            className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold mb-1">CIN Number</label>
                            <input 
                              type="text" 
                              placeholder="U12345MH2020PTC123456"
                              className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                            />
                          </div>
                          <div>
                            <label className="block font-bold mb-1">GSTIN</label>
                            <input 
                              type="text" 
                              placeholder="27ABCDE1234F1Z5"
                              className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <button type="button" onClick={() => setKycStep(1)} className="flex-1 bg-black text-white hover:bg-black/90 py-3 font-bold uppercase tracking-widest text-center">Back</button>
                      <button type="button" onClick={() => setKycStep(3)} className="flex-1 bg-brand-green text-white hover:bg-brand-green/95 py-3 font-bold uppercase tracking-widest text-center">Next</button>
                    </div>
                  </div>
                )}

                {kycStep === 3 && (
                  <div className="space-y-4">
                    <label className="block font-bold">Upload Verification proofs (Mock simulation)</label>
                    <div className="border-2 border-dashed border-black/10 p-6 text-center text-gray-400 bg-brand-cream hover:border-brand-green transition-colors">
                      <FileUp className="w-8 h-8 mx-auto mb-2 text-brand-green" />
                      <span className="text-xs font-bold block text-black">Aadhaar Card or PAN Scans</span>
                      <span className="text-[10px] block mt-0.5">Drag PDF/PNG images here or select locally.</span>
                    </div>

                    <div className="border-2 border-dashed border-black/10 p-6 text-center text-gray-400 bg-brand-cream hover:border-brand-green transition-colors mt-2">
                      <Smartphone className="w-8 h-8 mx-auto mb-2 text-brand-green" />
                      <span className="text-xs font-bold block text-black">Selfie Live Verification Match</span>
                      <span className="text-[10px] block mt-0.5">Device camera integration for real-time live presence check.</span>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button type="button" onClick={() => setKycStep(2)} className="flex-1 bg-black text-white hover:bg-black/90 py-3 font-bold uppercase tracking-widest text-center">Back</button>
                      <button type="button" onClick={() => setKycStep(4)} className="flex-1 bg-brand-green text-white hover:bg-brand-green/95 py-3 font-bold uppercase tracking-widest text-center">Next</button>
                    </div>
                  </div>
                )}

                {kycStep === 4 && (
                  <div className="space-y-4">
                    <h5 className="font-bold border-b border-black/5 pb-1">Payout Account Verification (Indian Rupee Escrow destination)</h5>
                    <div className="space-y-3">
                      <div>
                        <label className="block mb-0.5">Account Holder's Name</label>
                        <input 
                          type="text" 
                          value={kycBankName}
                          onChange={(e) => setKycBankName(e.target.value)}
                          className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block mb-0.5">Bank Account Number</label>
                          <input 
                            type="text" 
                            value={kycBankAccount}
                            onChange={(e) => setKycBankAccount(e.target.value.replace(/\D/g, ""))}
                            className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                          />
                        </div>
                        <div>
                          <label className="block mb-0.5">IFSC Code</label>
                          <input 
                            type="text" 
                            value={kycIfsc}
                            onChange={(e) => setKycIfsc(e.target.value.toUpperCase())}
                            className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button type="button" onClick={() => setKycStep(3)} className="flex-1 bg-black text-white hover:bg-black/90 py-3 font-bold uppercase tracking-widest text-center">Back</button>
                      <button type="submit" className="flex-1 bg-brand-green text-white hover:bg-brand-green/95 py-3 font-bold uppercase tracking-widest text-center">Submit & Verify</button>
                    </div>
                  </div>
                )}

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. CREATE LISTING DIALOG WIZARD */}
      <AnimatePresence>
        {isCreateListingOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-black/10 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start border-b border-black/5 pb-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-green">Drizzle model generator active</span>
                  <h3 className="text-xl font-serif italic font-bold">List Digital Asset on FMI</h3>
                </div>
                <button onClick={() => setIsCreateListingOpen(false)} className="text-gray-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateListing} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Business or Project Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. RupeeStream Payment SDK"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Catchy Tagline</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Automated billing middleware with 90% margin"
                      value={newTagline}
                      onChange={(e) => setNewTagline(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold mb-1">Asset Category Type</label>
                    <select 
                      value={newAssetType} 
                      onChange={(e) => setNewAssetType(e.target.value as ListingItem["assetType"])} 
                      className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                    >
                      <option value="saas">SaaS / Web App</option>
                      <option value="ecommerce">eCommerce Brand</option>
                      <option value="app">Mobile App</option>
                      <option value="blog">Content Blog</option>
                      <option value="domain">Premium Domain</option>
                      <option value="service">Agency / Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Industry</label>
                    <select 
                      value={newIndustry} 
                      onChange={(e) => setNewIndustry(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                    >
                      {INDUSTRIES.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">Public URL / Target</label>
                    <input 
                      type="text" 
                      placeholder="https://myproject.in"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-brand-cream p-4 border border-black/5">
                  <div>
                    <label className="block mb-1 text-[10px] uppercase font-bold text-gray-500">Asking Price (₹)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 15,00,000"
                      value={newAskingPrice}
                      onChange={(e) => setNewAskingPrice(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-black/10 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] uppercase font-bold text-gray-500">Monthly Revenue (₹)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 1,00,000"
                      value={newRevenue}
                      onChange={(e) => setNewRevenue(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-black/10 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] uppercase font-bold text-gray-500">Monthly Profit (₹)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 70,000"
                      value={newProfit}
                      onChange={(e) => setNewProfit(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-black/10 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] uppercase font-bold text-gray-500">Monthly traffic</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 10,000"
                      value={newTraffic}
                      onChange={(e) => setNewTraffic(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-black/10 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold mb-1">Extended Pitch description & Tech Stack</label>
                  <textarea 
                    rows={4}
                    placeholder="Provide a compelling story of the SaaS architecture, customer base, repeat metrics, and transition timelines..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={newNdaRequired}
                      onChange={(e) => setNewNdaRequired(e.target.checked)}
                      className="accent-brand-green w-4 h-4"
                      id="nda_checkbox"
                    />
                    <label htmlFor="nda_checkbox" className="font-bold cursor-pointer">Require executed mutual NDA to view details</label>
                  </div>

                  {newNdaRequired && (
                    <div>
                      <label className="block mb-0.5">NDA verification processing fee (₹)</label>
                      <input 
                        type="text" 
                        value={newNdaFee}
                        onChange={(e) => setNewNdaFee(e.target.value)}
                        className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold mb-1">Tags (comma-separated)</label>
                  <input 
                    type="text" 
                    placeholder="SaaS, FinTech, Wayanad Ayurveda, Web App"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-black/10 bg-[#FDFCFB]"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-green text-white hover:bg-brand-green/95 py-3 font-bold uppercase tracking-widest text-center"
                >
                  Generate Drizzle Record & List Live
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. BOTTOM STATUS BAR / FOOTER */}
      <footer className="border-t border-black/10 py-8 px-6 md:px-12 bg-black text-white/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono uppercase tracking-widest">
          <div className="flex flex-wrap justify-center gap-6">
            <span className="text-white">Status: Marketplace Live</span>
            <span>● Escrow Active</span>
            <span>● Drizzle Model Valid</span>
            <span>● Better Auth: v1.05</span>
          </div>
          <div className="flex gap-6 items-center">
            <span>Phase 1 Bootstrapped & Protected</span>
            <span className="text-white/80 font-serif font-black italic">© 2026 FMI India</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
