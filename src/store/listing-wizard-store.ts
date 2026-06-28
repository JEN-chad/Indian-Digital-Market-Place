import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ListingDocument {
  id: string;
  name: string;
  type: "financial" | "analytics" | "ownership" | "pitch_deck" | "other";
  url: string;
  cloudinaryId?: string;
  isPrivate: boolean;
}

export interface ListingWizardState {
  currentStep: number;
  listingId: string | null;
  assetType: "saas" | "ecommerce" | "app" | "blog" | "domain" | "content_site" | "service" | "";
  
  // Step 2: Basic Info
  title: string;
  businessNamePrivate: string;
  industry: string;
  businessUrl: string;
  yearEstablished: string;
  teamSize: string;
  hoursPerWeek: string;
  businessModel: string;

  // Step 3: Financials
  monthlyRevenue: string;
  monthlyProfit: string;
  monthlyTraffic: string;
  trafficSources: string[];

  // Step 4: Documents
  documents: ListingDocument[];

  // Step 5: Description / Story
  tagline: string;
  description: string;
  reasonForSale: string;

  // Step 6: Pricing / Settings
  askingPrice: string;
  pricingModel: "auction" | "classified";
  reservePrice: string;
  ndaRequired: boolean;
  ndaFee: string;
  coverImageUrl: string;
  tags: string[];
}

export interface ListingWizardActions {
  setStep: (step: number) => void;
  setListingId: (id: string | null) => void;
  setAssetType: (assetType: ListingWizardState["assetType"]) => void;
  updateStepData: (data: Partial<Omit<ListingWizardState, "documents" | "trafficSources" | "tags">>) => void;
  setTrafficSources: (sources: string[]) => void;
  setTags: (tags: string[]) => void;
  addDocument: (doc: ListingDocument) => void;
  removeDocument: (id: string) => void;
  resetWizard: () => void;
}

const initialListingState: Omit<ListingWizardState, "currentStep"> = {
  listingId: null,
  assetType: "",
  title: "",
  businessNamePrivate: "",
  industry: "",
  businessUrl: "",
  yearEstablished: "",
  teamSize: "",
  hoursPerWeek: "",
  businessModel: "",
  monthlyRevenue: "",
  monthlyProfit: "",
  monthlyTraffic: "",
  trafficSources: [],
  documents: [],
  tagline: "",
  description: "",
  reasonForSale: "",
  askingPrice: "",
  pricingModel: "classified",
  reservePrice: "",
  ndaRequired: true,
  ndaFee: "999",
  coverImageUrl: "",
  tags: [],
};

export const useListingWizardStore = create<ListingWizardState & ListingWizardActions>()(
  persist(
    (set) => ({
      currentStep: 1,
      ...initialListingState,
      
      setStep: (step) => set({ currentStep: step }),
      setListingId: (listingId) => set({ listingId }),
      setAssetType: (assetType) => set({ assetType }),
      
      updateStepData: (data) => set((state) => ({ ...state, ...data })),
      
      setTrafficSources: (trafficSources) => set({ trafficSources }),
      setTags: (tags) => set({ tags }),
      
      addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
      removeDocument: (id) => set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),
      
      resetWizard: () => set({ currentStep: 1, ...initialListingState }),
    }),
    {
      name: "listing-wizard-store",
    }
  )
);
