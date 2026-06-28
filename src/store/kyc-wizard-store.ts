import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface KycWizardState {
  currentStep: number;
  role: "buyer" | "seller" | "both" | "";
  kycType: "individual" | "company";
  individualData: {
    fullName: string;
    dob: string;
    street: string;
    city: string;
    state: string;
    pin: string;
    panNumber: string;
    panDocUrl: string;
    aadhaarLast4: string;
    aadhaarDocUrl: string;
    aadhaarBackDocUrl: string;
    selfieUrl: string;
    bankAccountNumber: string;
    bankIfsc: string;
    bankAccountName: string;
  };
  companyData: {
    companyName: string;
    cin: string;
    gstin: string;
    yearIncorporation: string;
    companyPan: string;
    coiDocUrl: string;
    directorName: string;
    directorPan: string;
    directorAadhaarLast4: string;
    bankAccountNumber: string;
    bankIfsc: string;
    bankAccountName: string;
    cancelledChequeDocUrl: string;
  };
  buyerInterests: {
    assetTypes: string[];
    industries: string[];
    states: string[];
    budgetMin: number;
    budgetMax: number;
    acquisitionGoal: string;
    experienceLevel: "first_time" | "some" | "experienced" | "serial" | "";
  };
  setStep: (step: number) => void;
  setRole: (role: "buyer" | "seller" | "both") => void;
  setKycType: (type: "individual" | "company") => void;
  updateIndividualData: (data: Partial<KycWizardState["individualData"]>) => void;
  updateCompanyData: (data: Partial<KycWizardState["companyData"]>) => void;
  updateBuyerInterests: (data: Partial<KycWizardState["buyerInterests"]>) => void;
  resetWizard: () => void;
}

export const useKycWizardStore = create<KycWizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      role: "",
      kycType: "individual",
      individualData: {
        fullName: "",
        dob: "",
        street: "",
        city: "",
        state: "",
        pin: "",
        panNumber: "",
        panDocUrl: "",
        aadhaarLast4: "",
        aadhaarDocUrl: "",
        aadhaarBackDocUrl: "",
        selfieUrl: "",
        bankAccountNumber: "",
        bankIfsc: "",
        bankAccountName: "",
      },
      companyData: {
        companyName: "",
        cin: "",
        gstin: "",
        yearIncorporation: "",
        companyPan: "",
        coiDocUrl: "",
        directorName: "",
        directorPan: "",
        directorAadhaarLast4: "",
        bankAccountNumber: "",
        bankIfsc: "",
        bankAccountName: "",
        cancelledChequeDocUrl: "",
      },
      buyerInterests: {
        assetTypes: [],
        industries: [],
        states: [],
        budgetMin: 500000,
        budgetMax: 50000000,
        acquisitionGoal: "",
        experienceLevel: "",
      },
      setStep: (step) => set({ currentStep: step }),
      setRole: (role) => set({ role }),
      setKycType: (kycType) => set({ kycType }),
      updateIndividualData: (data) =>
        set((state) => ({ individualData: { ...state.individualData, ...data } })),
      updateCompanyData: (data) =>
        set((state) => ({ companyData: { ...state.companyData, ...data } })),
      updateBuyerInterests: (data) =>
        set((state) => ({ buyerInterests: { ...state.buyerInterests, ...data } })),
      resetWizard: () =>
        set({
          currentStep: 1,
          role: "",
          kycType: "individual",
          individualData: {
            fullName: "",
            dob: "",
            street: "",
            city: "",
            state: "",
            pin: "",
            panNumber: "",
            panDocUrl: "",
            aadhaarLast4: "",
            aadhaarDocUrl: "",
            aadhaarBackDocUrl: "",
            selfieUrl: "",
            bankAccountNumber: "",
            bankIfsc: "",
            bankAccountName: "",
          },
          companyData: {
            companyName: "",
            cin: "",
            gstin: "",
            yearIncorporation: "",
            companyPan: "",
            coiDocUrl: "",
            directorName: "",
            directorPan: "",
            directorAadhaarLast4: "",
            bankAccountNumber: "",
            bankIfsc: "",
            bankAccountName: "",
            cancelledChequeDocUrl: "",
          },
          buyerInterests: {
            assetTypes: [],
            industries: [],
            states: [],
            budgetMin: 500000,
            budgetMax: 50000000,
            acquisitionGoal: "",
            experienceLevel: "",
          },
        }),
    }),
    {
      name: "fmi-kyc-wizard-store",
    }
  )
);
