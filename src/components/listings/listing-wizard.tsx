import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const useNavigate = () => {
  return (path: string) => {
    window.location.hash = `#${path}`;
  };
};
import { 
  Check, ArrowRight, ArrowLeft, Loader2, Landmark, ShieldCheck, 
  Sparkles, FileText, Trash2, Tag as TagIcon, Plus, X, AlertCircle, Save 
} from "lucide-react";

import { useListingWizardStore, ListingDocument } from "../../store/listing-wizard-store.ts";
import { useAuthStore } from "../../store/auth-store.ts";
import AssetTypeSelector, { AssetType } from "./asset-type-selector.tsx";
import FinancialInputGroup from "./financial-input-group.tsx";
import ListingPreview from "./listing-preview.tsx";
import FileDropzone from "../shared/file-dropzone.tsx";
import { 
  createListingDraft, updateListingStep, uploadListingDocument, 
  submitListingForReview, suggestAskingPrice 
} from "../../actions/listings.ts";

const steps = [
  { id: 1, name: "Asset Type" },
  { id: 2, name: "Basic Info" },
  { id: 3, name: "Financials" },
  { id: 4, name: "Documents" },
  { id: 5, name: "Listing Story" },
  { id: 6, name: "Pricing & Settings" }
];

export default function ListingWizard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const store = useListingWizardStore();
  
  // Local state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Step 3: AI Valuation Assist state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<{
    minPrice?: number;
    maxPrice?: number;
    recommendedPrice?: number;
    multiple?: string;
    reasoning?: string;
  } | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Step 4: Documents upload type state
  const [docType, setDocType] = useState<"financial" | "analytics" | "ownership" | "pitch_deck" | "other">("financial");
  const [docLabel, setDocLabel] = useState("");

  // Step 6: Tags input state
  const [tagInput, setTagInput] = useState("");

  // Auto-redirect if not logged in or not a seller
  useEffect(() => {
    if (!user) {
      navigate("/");
    } else if (user.kycStatus !== "approved") {
      setGlobalError("Your KYC must be approved by our team before creating a business listing.");
    }
  }, [user, navigate]);

  // Clean success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => setSaveSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess]);

  // Form Validation helper
  const validateStep = (stepNum: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (stepNum === 1) {
      if (!store.assetType) {
        newErrors.assetType = "Please select an asset type to continue.";
      }
    }

    if (stepNum === 2) {
      if (!store.title.trim()) newErrors.title = "Listing title is required.";
      if (!store.industry) newErrors.industry = "Industry sector is required.";
      if (!store.yearEstablished) {
        newErrors.yearEstablished = "Year established is required.";
      } else {
        const year = parseInt(store.yearEstablished, 10);
        if (isNaN(year) || year < 1900 || year > new Date().getFullYear()) {
          newErrors.yearEstablished = "Please enter a valid established year.";
        }
      }
      if (!store.businessModel) newErrors.businessModel = "Business monetization model is required.";
      if (store.teamSize) {
        const team = parseInt(store.teamSize, 10);
        if (isNaN(team) || team < 0) newErrors.teamSize = "Please enter a valid team size.";
      }
      if (store.hoursPerWeek) {
        const hours = parseInt(store.hoursPerWeek, 10);
        if (isNaN(hours) || hours < 0 || hours > 168) newErrors.hoursPerWeek = "Please enter valid weekly hours (0-168).";
      }
    }

    if (stepNum === 3) {
      if (!store.monthlyRevenue) {
        newErrors.monthlyRevenue = "Monthly revenue is required.";
      } else {
        const rev = parseInt(store.monthlyRevenue, 10);
        if (isNaN(rev) || rev < 0) newErrors.monthlyRevenue = "Please enter a valid positive revenue amount.";
      }

      if (!store.monthlyProfit) {
        newErrors.monthlyProfit = "Monthly profit is required.";
      } else {
        const prof = parseInt(store.monthlyProfit, 10);
        if (isNaN(prof)) newErrors.monthlyProfit = "Please enter a valid profit amount.";
      }
    }

    if (stepNum === 4) {
      if (store.documents.length === 0) {
        newErrors.documents = "At least one verification document is required (e.g. Profit/Loss statement).";
      }
    }

    if (stepNum === 5) {
      if (!store.tagline.trim()) {
        newErrors.tagline = "A catchy tagline is required.";
      } else if (store.tagline.trim().length > 120) {
        newErrors.tagline = "Tagline should be within 120 characters.";
      }

      if (!store.description.trim()) {
        newErrors.description = "Detailed listing description is required.";
      } else if (store.description.trim().length < 100) {
        newErrors.description = "Description should be at least 100 characters.";
      }

      if (!store.reasonForSale.trim()) {
        newErrors.reasonForSale = "Reason for sale is required.";
      }
    }

    if (stepNum === 6) {
      if (!store.askingPrice) {
        newErrors.askingPrice = "Please enter an asking price.";
      } else {
        const price = parseInt(store.askingPrice, 10);
        if (isNaN(price) || price <= 0) newErrors.askingPrice = "Please enter a valid asking price greater than 0.";
      }

      if (store.pricingModel === "auction" && !store.reservePrice) {
        newErrors.reservePrice = "Reserve price is required for auctions.";
      }

      if (store.ndaRequired && store.ndaFee) {
        const fee = parseInt(store.ndaFee, 10);
        if (isNaN(fee) || fee < 0) newErrors.ndaFee = "Please enter a valid positive NDA deposit fee.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Perform auto-save to cloud
  const saveCurrentStepData = async (stepNum: number) => {
    if (!user) return;
    setIsSaving(true);
    setGlobalError(null);

    try {
      if (!store.listingId) {
        // Step 1: Create draft
        const result = await createListingDraft(user.id, {
          title: store.title || "Draft Listing",
          assetType: store.assetType as any,
        });

        if (result.success && result.listingId) {
          store.setListingId(result.listingId);
          setSaveSuccess(true);
        } else {
          setGlobalError(result.error || "Failed to save draft listing to DB.");
        }
      } else {
        // Save current step data to DB
        const stepData: any = {};
        if (stepNum === 1) {
          stepData.assetType = store.assetType;
        } else if (stepNum === 2) {
          stepData.title = store.title;
          stepData.businessNamePrivate = store.businessNamePrivate;
          stepData.industry = store.industry;
          stepData.businessUrl = store.businessUrl;
          stepData.yearEstablished = store.yearEstablished;
          stepData.teamSize = store.teamSize;
          stepData.hoursPerWeek = store.hoursPerWeek;
          stepData.businessModel = store.businessModel;
        } else if (stepNum === 3) {
          stepData.monthlyRevenue = store.monthlyRevenue;
          stepData.monthlyProfit = store.monthlyProfit;
          stepData.monthlyTraffic = store.monthlyTraffic;
          stepData.trafficSources = store.trafficSources.join(", ");
        } else if (stepNum === 5) {
          stepData.tagline = store.tagline;
          stepData.description = store.description;
          stepData.reasonForSale = store.reasonForSale;
        } else if (stepNum === 6) {
          stepData.askingPrice = store.askingPrice;
          stepData.pricingModel = store.pricingModel;
          stepData.reservePrice = store.reservePrice;
          stepData.ndaRequired = store.ndaRequired;
          stepData.ndaFee = store.ndaFee;
          stepData.coverImageUrl = store.coverImageUrl;
          stepData.tags = store.tags;
        }

        const result = await updateListingStep(store.listingId, stepData);
        if (result.success) {
          setSaveSuccess(true);
        } else {
          setGlobalError(result.error || "Failed to update listing step.");
        }
      }
    } catch (err: any) {
      setGlobalError(err.message || "An unexpected error occurred during auto-save.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (!validateStep(store.currentStep)) return;

    // Save to DB
    await saveCurrentStepData(store.currentStep);

    if (store.currentStep < 6) {
      store.setStep(store.currentStep + 1);
    }
  };

  const handleBack = () => {
    if (store.currentStep > 1) {
      store.setStep(store.currentStep - 1);
    }
  };

  // AI Valuation Assist handler
  const handleSuggestValuation = async () => {
    setAiError(null);
    setAiResult(null);

    const isRevenueValid = validateStep(3);
    if (!isRevenueValid) return;

    setIsAiLoading(true);

    try {
      const result = await suggestAskingPrice({
        assetType: store.assetType,
        monthlyRevenue: parseInt(store.monthlyRevenue, 10) || 0,
        monthlyProfit: parseInt(store.monthlyProfit, 10) || 0,
        yearEstablished: store.yearEstablished || new Date().getFullYear(),
      });

      if (result.success) {
        setAiResult({
          minPrice: result.minPrice,
          maxPrice: result.maxPrice,
          recommendedPrice: result.recommendedPrice,
          multiple: result.multiple,
          reasoning: result.reasoning,
        });
      } else {
        setAiError(result.error || "Failed to generate AI valuation suggestion.");
      }
    } catch (err: any) {
      setAiError(err.message || "Valuation service is currently unavailable.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const applySuggestedValuation = () => {
    if (aiResult && aiResult.recommendedPrice) {
      store.updateStepData({ askingPrice: aiResult.recommendedPrice.toString() });
      setAiResult(null); // clear after applying
    }
  };

  // Document management
  const handleDocumentUploaded = async (url: string, name: string) => {
    if (!store.listingId) return;

    setIsSaving(true);
    try {
      const result = await uploadListingDocument(store.listingId, url, docType, name || docLabel || "Document");
      if (result.success && result.doc) {
        store.addDocument({
          id: result.doc.id,
          name: result.doc.name,
          type: result.doc.type,
          url: result.doc.url,
          cloudinaryId: result.doc.cloudinaryId,
          isPrivate: result.doc.isPrivate,
        });
        setDocLabel("");
      } else {
        setGlobalError(result.error || "Failed to add document record to database.");
      }
    } catch (err: any) {
      setGlobalError(err.message || "Failed to link uploaded document.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveDocument = (id: string) => {
    // For simplicity, we just remove it from the state (cascade or delete handled separately)
    store.removeDocument(id);
  };

  // Tags management
  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !store.tags.includes(tag)) {
      store.setTags([...store.tags, tag]);
    }
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    store.setTags(store.tags.filter((t) => t !== tagToRemove));
  };

  // Submit Listing for Review
  const handleSubmitListing = async () => {
    if (!validateStep(6)) return;
    if (!store.listingId) return;

    setIsSaving(true);
    setGlobalError(null);

    try {
      // First save step 6 data
      await saveCurrentStepData(6);

      // Submit for review
      const result = await submitListingForReview(store.listingId);
      if (result.success) {
        // Reset wizard and navigate to My Listings
        store.resetWizard();
        navigate("/seller/listings");
      } else {
        setGlobalError(result.error || "Failed to submit listing for review.");
      }
    } catch (err: any) {
      setGlobalError(err.message || "Failed to submit listing.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Global Error Banner */}
      {globalError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Listing Creation Restricted</p>
            <p className="mt-1 text-xs opacity-90">{globalError}</p>
          </div>
        </div>
      )}

      {/* Stepper Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-4 uppercase tracking-wider">
          <span>Step {store.currentStep} of 6</span>
          <div className="flex items-center space-x-1.5 text-slate-500">
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>Auto-saving draft...</span>
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500 font-bold" />
                <span className="text-emerald-600">Draft saved to cloud</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Cloud Sync Enabled</span>
              </>
            )}
          </div>
        </div>

        {/* Visual Stepper Progress Bar */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full bg-slate-100 h-1 rounded-full"></div>
          </div>
          <div className="relative flex justify-between">
            {steps.map((step) => {
              const isActive = store.currentStep === step.id;
              const isCompleted = store.currentStep > step.id;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => {
                      // Allow navigating back to completed steps directly
                      if (step.id < store.currentStep) {
                        store.setStep(step.id);
                      }
                    }}
                    disabled={step.id >= store.currentStep}
                    className={`relative w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all border-2 ${
                      isCompleted
                        ? "bg-amber-500 border-amber-500 text-white shadow-sm"
                        : isActive
                        ? "bg-white border-amber-500 text-amber-600 shadow-sm ring-4 ring-amber-50"
                        : "bg-white border-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 font-extrabold" /> : step.id}
                  </button>
                  <span
                    className={`hidden md:block absolute -bottom-6 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      isActive ? "text-slate-800" : isCompleted ? "text-amber-600" : "text-slate-400"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Forms left, Live preview right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 items-start">
        {/* Step Content Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 shadow-xs">
          <AnimatePresence mode="wait">
            <motion.div
              key={store.currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* STEP 1: ASSET TYPE */}
              {store.currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">What type of asset are you selling?</h2>
                    <p className="text-sm text-slate-500">Select the option that best characterizes your digital asset.</p>
                  </div>
                  
                  <AssetTypeSelector
                    selectedType={store.assetType}
                    onSelect={(type) => {
                      store.setAssetType(type);
                      setErrors({});
                    }}
                  />
                  {errors.assetType && (
                    <p className="text-sm text-rose-600 font-semibold flex items-center space-x-1.5 mt-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>{errors.assetType}</span>
                    </p>
                  )}
                </div>
              )}

              {/* STEP 2: BASIC INFO */}
              {store.currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Tell us about your business</h2>
                    <p className="text-sm text-slate-500">Provide the foundational operational details about your digital asset.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Listing Title */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700" htmlFor="title">
                        Listing Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="title"
                        type="text"
                        placeholder="e.g. Micro-SaaS for automated invoice verification"
                        value={store.title}
                        onChange={(e) => store.updateStepData({ title: e.target.value })}
                        className={`block w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                          errors.title ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-amber-500 focus:ring-amber-200"
                        }`}
                      />
                      {errors.title && <p className="text-xs text-rose-600 font-semibold">{errors.title}</p>}
                    </div>

                    {/* Private Name */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700" htmlFor="private-name">
                        Private Legal/Brand Name <span className="text-xs text-slate-400 font-normal">(hidden from marketplace listings)</span>
                      </label>
                      <input
                        id="private-name"
                        type="text"
                        placeholder="e.g. VerifyBot Technologies Pvt Ltd"
                        value={store.businessNamePrivate}
                        onChange={(e) => store.updateStepData({ businessNamePrivate: e.target.value })}
                        className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Industry */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="industry">
                          Industry / Sector <span className="text-rose-500">*</span>
                        </label>
                        <select
                          id="industry"
                          value={store.industry}
                          onChange={(e) => store.updateStepData({ industry: e.target.value })}
                          className={`block w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all bg-white ${
                            errors.industry ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-amber-500 focus:ring-amber-200"
                          }`}
                        >
                          <option value="">Select an industry</option>
                          <option value="Technology & Software">Technology & Software</option>
                          <option value="Fintech">Fintech</option>
                          <option value="Healthtech">Healthtech</option>
                          <option value="E-commerce & Retail">E-commerce & Retail</option>
                          <option value="Agency & Services">Agency & Services</option>
                          <option value="Education / EdTech">Education / EdTech</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Food & Beverage">Food & Beverage</option>
                        </select>
                        {errors.industry && <p className="text-xs text-rose-600 font-semibold">{errors.industry}</p>}
                      </div>

                      {/* Business URL */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="business-url">
                          Business URL <span className="text-xs text-slate-400 font-normal">(optional)</span>
                        </label>
                        <input
                          id="business-url"
                          type="url"
                          placeholder="e.g. https://verifybot.co"
                          value={store.businessUrl}
                          onChange={(e) => store.updateStepData({ businessUrl: e.target.value })}
                          className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Year Established */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="year-established">
                          Year Established <span className="text-rose-500">*</span>
                        </label>
                        <input
                          id="year-established"
                          type="number"
                          placeholder="e.g. 2022"
                          value={store.yearEstablished}
                          onChange={(e) => store.updateStepData({ yearEstablished: e.target.value })}
                          className={`block w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                            errors.yearEstablished ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-amber-500 focus:ring-amber-200"
                          }`}
                        />
                        {errors.yearEstablished && <p className="text-xs text-rose-600 font-semibold">{errors.yearEstablished}</p>}
                      </div>

                      {/* Team Size */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="team-size">
                          Team Size
                        </label>
                        <input
                          id="team-size"
                          type="number"
                          placeholder="e.g. 3"
                          value={store.teamSize}
                          onChange={(e) => store.updateStepData({ teamSize: e.target.value })}
                          className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all"
                        />
                      </div>

                      {/* Hours per Week */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="hours-per-week">
                          Hours/Week Required
                        </label>
                        <input
                          id="hours-per-week"
                          type="number"
                          placeholder="e.g. 10"
                          value={store.hoursPerWeek}
                          onChange={(e) => store.updateStepData({ hoursPerWeek: e.target.value })}
                          className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Business Model / Monetization */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700" htmlFor="business-model">
                        Business Monetization Model <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="business-model"
                        type="text"
                        placeholder="e.g. SaaS subscription (Starter/Pro/Enterprise plans), custom API usage billing"
                        value={store.businessModel}
                        onChange={(e) => store.updateStepData({ businessModel: e.target.value })}
                        className={`block w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                          errors.businessModel ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-amber-500 focus:ring-amber-200"
                        }`}
                      />
                      {errors.businessModel && <p className="text-xs text-rose-600 font-semibold">{errors.businessModel}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: FINANCIALS */}
              {store.currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Key metrics & performance</h2>
                    <p className="text-sm text-slate-500">Specify financial figures and traffic statistics to build trust.</p>
                  </div>

                  <FinancialInputGroup
                    monthlyRevenue={store.monthlyRevenue}
                    monthlyProfit={store.monthlyProfit}
                    monthlyTraffic={store.monthlyTraffic}
                    trafficSources={store.trafficSources}
                    onRevenueChange={(val) => store.updateStepData({ monthlyRevenue: val })}
                    onProfitChange={(val) => store.updateStepData({ monthlyProfit: val })}
                    onTrafficChange={(val) => store.updateStepData({ monthlyTraffic: val })}
                    onTrafficSourcesChange={(sources) => store.setTrafficSources(sources)}
                    errors={errors}
                  />

                  {/* AI Valuation Box */}
                  <div className="pt-6 border-t border-slate-100">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/60 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 text-amber-500/25">
                        <Sparkles className="w-16 h-16" />
                      </div>

                      <div className="space-y-3 relative z-10">
                        <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm">
                          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                          <span>AI Valuation Assistant</span>
                        </div>
                        <p className="text-xs text-slate-500 max-w-md">
                          Not sure about your listing's value? FMI's valuation engine analyzes your asset type, revenue, and profit to suggest a recommended asking price range based on current Indian SME market multiple standards.
                        </p>

                        {aiError && (
                          <p className="text-xs text-rose-600 font-semibold bg-rose-50 p-2 rounded-lg flex items-center space-x-1.5">
                            <AlertCircle className="w-4 h-4" />
                            <span>{aiError}</span>
                          </p>
                        )}

                        <div className="pt-2 flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={handleSuggestValuation}
                            disabled={isAiLoading}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs inline-flex items-center space-x-1.5 transition-colors disabled:opacity-70 cursor-pointer"
                          >
                            {isAiLoading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Generating valuation...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Suggest Asking Price</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* AI Results Presentation */}
                        {aiResult && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 p-4 bg-white border border-slate-200 rounded-xl space-y-3"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center border-b border-slate-100 pb-3">
                              <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Estimated Range</p>
                                <p className="text-xs font-extrabold text-slate-800">
                                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(aiResult.minPrice || 0)} - {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(aiResult.maxPrice || 0)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Recommended Starting</p>
                                <p className="text-sm font-extrabold text-amber-600">
                                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(aiResult.recommendedPrice || 0)}
                                </p>
                              </div>
                              <div className="col-span-2 md:col-span-1">
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Estimated Multiple</p>
                                <p className="text-xs font-semibold text-slate-600 italic">{aiResult.multiple}</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <p className="text-xs font-bold text-slate-700">Valuation Context:</p>
                              <p className="text-xs text-slate-500 leading-relaxed">{aiResult.reasoning}</p>
                            </div>

                            <button
                              type="button"
                              onClick={applySuggestedValuation}
                              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 rounded-lg transition-colors flex items-center justify-center space-x-1"
                            >
                              <Check className="w-4 h-4" />
                              <span>Apply Suggestion as Asking Price (Step 6)</span>
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: DOCUMENTS */}
              {store.currentStep === 4 && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Verification documents</h2>
                    <p className="text-sm text-slate-500">Provide official documentation to verify your financials and traffic claims. All documents are kept private by default.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Doc Type Selector */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600" htmlFor="doc-type">Document Type</label>
                        <select
                          id="doc-type"
                          value={docType}
                          onChange={(e) => setDocType(e.target.value as any)}
                          className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                        >
                          <option value="financial">Financial Statements (Profit & Loss / Tax)</option>
                          <option value="analytics">Traffic & User Analytics Exports</option>
                          <option value="ownership">Proof of Asset/Code Ownership</option>
                          <option value="pitch_deck">Pitch Deck / Executive Summary</option>
                          <option value="other">Other Supporting Material</option>
                        </select>
                      </div>

                      {/* Doc Name Label */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600" htmlFor="doc-label">Custom Document Label</label>
                        <input
                          id="doc-label"
                          type="text"
                          placeholder="e.g. FY23 Profit & Loss Report"
                          value={docLabel}
                          onChange={(e) => setDocLabel(e.target.value)}
                          className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                        />
                      </div>
                    </div>

                    <FileDropzone
                      onUploadComplete={handleDocumentUploaded}
                      maxSizeMB={5}
                      label="Upload a verification document"
                      description="Supported formats: PDF, DOC, XLS, PNG, JPG up to 5MB"
                    />

                    {errors.documents && (
                      <p className="text-xs text-rose-600 font-semibold flex items-center space-x-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.documents}</span>
                      </p>
                    )}

                    {/* Uploaded Documents List */}
                    {store.documents.length > 0 && (
                      <div className="space-y-2 pt-4 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Uploaded Files ({store.documents.length})</p>
                        <div className="space-y-2">
                          {store.documents.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                              <div className="flex items-center space-x-3 overflow-hidden">
                                <div className="p-2 bg-amber-50 rounded-lg text-amber-600 shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">{doc.name}</p>
                                  <div className="flex items-center space-x-1 text-[10px] text-slate-400 capitalize">
                                    <span>{doc.type}</span>
                                    <span>•</span>
                                    <span>Private Archive</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveDocument(doc.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5: LISTING STORY */}
              {store.currentStep === 5 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">The listing story</h2>
                    <p className="text-sm text-slate-500">Draft a compelling presentation explaining what your asset does and why it is a great acquisition opportunity.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Tagline */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700" htmlFor="tagline">
                        Listing Tagline <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="tagline"
                        type="text"
                        placeholder="e.g. Fully automated verification app processing over 50k invoices monthly with 42% margins."
                        value={store.tagline}
                        onChange={(e) => store.updateStepData({ tagline: e.target.value })}
                        maxLength={120}
                        className={`block w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                          errors.tagline ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-amber-500 focus:ring-amber-200"
                        }`}
                      />
                      <div className="flex justify-between mt-1">
                        {errors.tagline ? <p className="text-xs text-rose-600 font-semibold">{errors.tagline}</p> : <p className="text-[10px] text-slate-400">Provide a 1-sentence, high-impact summary shown on the listing card</p>}
                        <span className="text-[10px] text-slate-400 font-semibold">{store.tagline.length}/120</span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700" htmlFor="description">
                        Full Description <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        rows={6}
                        placeholder="Explain the background, product capabilities, core features, technology stack, marketing channels, operational workflows, and potential growth opportunities..."
                        value={store.description}
                        onChange={(e) => store.updateStepData({ description: e.target.value })}
                        className={`block w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                          errors.description ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-amber-500 focus:ring-amber-200"
                        }`}
                      />
                      <div className="flex justify-between mt-1">
                        {errors.description ? <p className="text-xs text-rose-600 font-semibold">{errors.description}</p> : <p className="text-[10px] text-slate-400">Describe operational activities, backend stack, assets included (at least 100 characters)</p>}
                        <span className="text-[10px] text-slate-400 font-semibold">{store.description.length} chars</span>
                      </div>
                    </div>

                    {/* Reason for Sale */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700" htmlFor="reason-sale">
                        Reason for sale <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        id="reason-sale"
                        rows={3}
                        placeholder="e.g. Relocating/changing focus to a new project; I lack the bandwidth to manage marketing operations."
                        value={store.reasonForSale}
                        onChange={(e) => store.updateStepData({ reasonForSale: e.target.value })}
                        className={`block w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                          errors.reasonForSale ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-amber-500 focus:ring-amber-200"
                        }`}
                      />
                      {errors.reasonForSale && <p className="text-xs text-rose-600 font-semibold">{errors.reasonForSale}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: PRICING & SETTINGS */}
              {store.currentStep === 6 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Pricing & marketplace settings</h2>
                    <p className="text-sm text-slate-500">Determine your final pricing constraints, privacy options, and promotional assets.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Asking Price */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="asking-price">
                          Asking Price (₹) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <span className="text-sm font-bold">₹</span>
                          </div>
                          <input
                            id="asking-price"
                            type="text"
                            placeholder="e.g. 15,00,000"
                            value={store.askingPrice}
                            onChange={(e) => store.updateStepData({ askingPrice: e.target.value.replace(/\D/g, "") })}
                            className={`block w-full pl-7 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                              errors.askingPrice ? "border-rose-300 focus:border-rose-500 focus:ring-rose-200" : "border-slate-200 focus:border-amber-500 focus:ring-amber-200"
                            }`}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                            <span className="text-xs">INR</span>
                          </div>
                        </div>
                        {errors.askingPrice && <p className="text-xs text-rose-600 font-semibold">{errors.askingPrice}</p>}
                      </div>

                      {/* Pricing Model */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="pricing-model">Pricing Framework</label>
                        <select
                          id="pricing-model"
                          value={store.pricingModel}
                          onChange={(e) => store.updateStepData({ pricingModel: e.target.value as any })}
                          className="block w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 transition-all"
                        >
                          <option value="classified">Classified Listing (Accept Offers)</option>
                          <option value="auction">Auction (Highest Bidder)</option>
                        </select>
                      </div>
                    </div>

                    {/* Reserve Price (Only if Auction) */}
                    {store.pricingModel === "auction" && (
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700" htmlFor="reserve-price">
                          Reserve Price (₹) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <span className="text-sm font-bold">₹</span>
                          </div>
                          <input
                            id="reserve-price"
                            type="text"
                            placeholder="e.g. 12,00,000"
                            value={store.reservePrice}
                            onChange={(e) => store.updateStepData({ reservePrice: e.target.value.replace(/\D/g, "") })}
                            className="block w-full pl-7 pr-12 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all"
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                            <span className="text-xs">INR</span>
                          </div>
                        </div>
                        {errors.reservePrice && <p className="text-xs text-rose-600 font-semibold">{errors.reservePrice}</p>}
                        <p className="text-xs text-slate-400">The minimum price at which you are willing to sell the asset.</p>
                      </div>
                    )}

                    {/* Cover Image Upload */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Listing Cover Image / Banner</label>
                      <FileDropzone
                        onUploadComplete={(url) => store.updateStepData({ coverImageUrl: url })}
                        maxSizeMB={2}
                        accept="image/png,image/jpeg,image/jpg"
                        label="Upload a Cover Image"
                        description="PNG or JPG up to 2MB (shown in search results)"
                        uploadedUrl={store.coverImageUrl}
                        onClear={() => store.updateStepData({ coverImageUrl: "" })}
                      />
                    </div>

                    {/* NDA Required settings */}
                    <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 space-y-3">
                      <div className="flex items-center space-x-3">
                        <input
                          id="nda-required"
                          type="checkbox"
                          checked={store.ndaRequired}
                          onChange={(e) => store.updateStepData({ ndaRequired: e.target.checked })}
                          className="h-4.5 w-4.5 rounded-sm border-slate-300 text-amber-500 focus:ring-amber-200"
                        />
                        <label htmlFor="nda-required" className="text-sm font-bold text-slate-800 flex items-center space-x-1.5">
                          <ShieldCheck className="w-4 h-4 text-slate-500" />
                          <span>Enable Buyer NDA Agreement Gate</span>
                        </label>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed pl-7">
                        If selected, buyers must sign a digital Non-Disclosure Agreement (NDA) and pay a platform fee to access private assets (domain name, source code repo, tax papers).
                      </p>

                      {store.ndaRequired && (
                        <div className="space-y-1.5 pl-7 pt-2">
                          <label className="text-xs font-bold text-slate-600" htmlFor="nda-fee">NDA Escrow Deposit Fee (₹)</label>
                          <input
                            id="nda-fee"
                            type="text"
                            placeholder="e.g. 999"
                            value={store.ndaFee}
                            onChange={(e) => store.updateStepData({ ndaFee: e.target.value.replace(/\D/g, "") })}
                            className="block max-w-[200px] px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-500 bg-white"
                          />
                          {errors.ndaFee && <p className="text-xs text-rose-600 font-semibold">{errors.ndaFee}</p>}
                        </div>
                      )}
                    </div>

                    {/* Listing Tags */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700" htmlFor="tags-input">Search Keywords & Tags</label>
                      <div className="flex space-x-2">
                        <input
                          id="tags-input"
                          type="text"
                          placeholder="e.g. automation, nodejs, realestate"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          className="flex-1 block px-4 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add</span>
                        </button>
                      </div>

                      {/* Active Tags Chips */}
                      {store.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {store.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-xs font-medium bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full flex items-center space-x-1.5"
                            >
                              <TagIcon className="w-3 h-3 text-amber-600" />
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:bg-amber-100 p-0.5 rounded-full text-amber-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Navigation Panel */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={store.currentStep === 1 || isSaving}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-bold text-xs inline-flex items-center space-x-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                {store.currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={isSaving}
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs inline-flex items-center space-x-1.5 transition-colors disabled:opacity-70 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue & Save</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitListing}
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-xs inline-flex items-center space-x-1.5 transition-colors disabled:opacity-70 cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 font-bold" />
                        <span>Submit Listing for Review</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Live Preview Column (Static or floating card) */}
        <div className="lg:col-span-5 lg:sticky lg:top-8">
          <ListingPreview data={store} />
        </div>
      </div>
    </div>
  );
}
