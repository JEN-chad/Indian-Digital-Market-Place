import React, { useState } from "react";
import { KycWizard } from "../../../../components/kyc/kyc-wizard.tsx";
import { PanInput } from "../../../../components/kyc/pan-input.tsx";
import { useKycWizardStore } from "../../../../store/kyc-wizard-store.ts";
import { submitKyc, uploadDocument } from "../../../../actions/kyc.ts";
import { AlertCircle, FileUp, Trash2, Check, Loader2 } from "lucide-react";

import { z } from "zod";

const companyStep1Schema = z.object({
  companyName: z.string().min(2, { message: "Company Name is required" }),
  cin: z.string().regex(/^[A-Z0-9]{21}$/i, { message: "CIN must be exactly 21 alphanumeric characters" }),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{3}$/i, { message: "Invalid Indian GSTIN format (e.g. 22AAAAA1111A1Z1)" }).optional().or(z.literal("")),
  yearIncorporation: z.string().refine((v) => {
    const yr = parseInt(v, 10);
    return !isNaN(yr) && yr >= 1850 && yr <= new Date().getFullYear();
  }, { message: "Enter a valid year of incorporation (e.g. 2018)" }),
});

const companyStep2Schema = z.object({
  companyPan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: "Invalid Company PAN card format (e.g. ABCDE1234F)" }),
  coiDocUrl: z.string().min(1, { message: "Certificate of Incorporation document copy is required" }),
});

const companyStep3Schema = z.object({
  directorName: z.string().min(2, { message: "Managing Director Name is required" }),
  directorPan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, { message: "Invalid Director PAN format" }),
  directorAadhaarLast4: z.string().regex(/^\d{4}$/, { message: "Aadhaar must be exactly 4 digits" }),
});

const companyStep4Schema = z.object({
  bankAccountName: z.string().min(1, { message: "Corporate Account Beneficiary Name is required" }),
  bankAccountNumber: z.string().regex(/^\d{9,18}$/, { message: "Account number must be between 9 and 18 digits" }),
  bankIfsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, { message: "Invalid Bank IFSC code format" }),
  cancelledChequeDocUrl: z.string().min(1, { message: "Cancelled cheque copy or bank statement is required" }),
});

interface CompanyKycPageProps {
  user: any;
  onSuccess: () => void;
  onBackToRole: () => void;
}

export function CompanyKycPage({ user, onSuccess, onBackToRole }: CompanyKycPageProps) {
  const store = useKycWizardStore();
  const [loading, setLoading] = useState(false);
  const [coiUploading, setCoiUploading] = useState(false);
  const [panUploading, setPanUploading] = useState(false);
  const [chequeUploading, setChequeUploading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const steps = [
    { title: "Corporate Details", description: "Provide registered corporate entity information" },
    { title: "Entity Verification", description: "Upload incorporation and registration certificates" },
    { title: "Director Details", description: "Authorize verification with key director information" },
    { title: "Corporate Bank", description: "Provide corporate bank routing for escrow transactions" },
  ];

  const validateStep = (stepNum: number): boolean => {
    const d = store.companyData;
    let parsed: any;

    if (stepNum === 1) {
      parsed = companyStep1Schema.safeParse(d);
    } else if (stepNum === 2) {
      parsed = companyStep2Schema.safeParse(d);
    } else if (stepNum === 3) {
      parsed = companyStep3Schema.safeParse(d);
    } else if (stepNum === 4) {
      parsed = companyStep4Schema.safeParse(d);
    }

    if (parsed && !parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.errors.forEach((err: any) => {
        if (err.path[0]) errors[err.path[0]] = err.message;
      });
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  };

  const handleNext = async () => {
    setError("");
    const isStepValid = validateStep(store.currentStep);

    if (!isStepValid) return;

    if (store.currentStep < steps.length) {
      store.setStep(store.currentStep + 1);
    } else {
      setLoading(true);
      try {
        const payload = {
          userId: user?.id || "mock-user-id",
          kycType: "company" as const,
          companyName: store.companyData.companyName,
          cin: store.companyData.cin,
          gstin: store.companyData.gstin || null,
          companyPan: store.companyData.companyPan,
          panNumber: store.companyData.companyPan,
          directorName: store.companyData.directorName,
          directorPan: store.companyData.directorPan,
          directorAadhaarLast4: store.companyData.directorAadhaarLast4,
          aadhaarLast4: store.companyData.directorAadhaarLast4,
          panDocUrl: store.companyData.coiDocUrl, // Use CoI for corporate PAN doc or map directly
          aadhaarDocUrl: store.companyData.cancelledChequeDocUrl, // Map corporate cheque as secondary doc
          bankAccountName: store.companyData.bankAccountName,
          bankAccountNumber: store.companyData.bankAccountNumber,
          bankIfsc: store.companyData.bankIfsc,
        };

        const res = await submitKyc(payload);
        if (res.success) {
          store.resetWizard();
          onSuccess();
        } else {
          setError(res.error || "Submission failed. Please verify details.");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred during submission.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    setError("");
    setValidationErrors({});
    if (store.currentStep > 1) {
      store.setStep(store.currentStep - 1);
    } else {
      onBackToRole();
    }
  };

  // Generic base64 upload helper
  const handleDocUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "coiDocUrl" | "cancelledChequeDocUrl",
    setUploading: (u: boolean) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors((prev) => ({ ...prev, [field]: "File exceeds the 5MB size limit." }));
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const uploadRes = await uploadDocument(base64String, "fmi_company_docs");
        if (uploadRes.success && uploadRes.secure_url) {
          store.updateCompanyData({ [field]: uploadRes.secure_url });
        } else {
          setValidationErrors((prev) => ({ ...prev, [field]: uploadRes.error || "Upload failed." }));
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setValidationErrors((prev) => ({ ...prev, [field]: err.message || "Error uploading file." }));
      setUploading(false);
    }
  };

  const canProceed = () => {
    const d = store.companyData;
    if (store.currentStep === 1) {
      return !!(d.companyName && d.cin && d.yearIncorporation);
    }
    if (store.currentStep === 2) {
      return !!(d.companyPan && d.coiDocUrl);
    }
    if (store.currentStep === 3) {
      return !!(d.directorName && d.directorPan && d.directorAadhaarLast4);
    }
    if (store.currentStep === 4) {
      return !!(d.bankAccountName && d.bankAccountNumber && d.bankIfsc && d.cancelledChequeDocUrl);
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-serif font-black tracking-tight text-gray-900">
          Corporate Entity KYC
        </h2>
        <p className="text-xs text-gray-400">
          Complete company verification to acquire or exit digital businesses at scale.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-md text-xs text-rose-600 font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <KycWizard
        currentStep={store.currentStep}
        steps={steps}
        onBack={handleBack}
        onNext={handleNext}
        canNext={canProceed()}
        nextText={store.currentStep === steps.length ? "Submit Corporate KYC" : "Next Step"}
        loading={loading}
      >
        {/* STEP 1: Corporate Details */}
        {store.currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                Registered Company Name (Matches CoI)
              </label>
              <input
                type="text"
                placeholder="Ex. FMI Digital Exchange Private Limited"
                value={store.companyData.companyName}
                onChange={(e) => store.updateCompanyData({ companyName: e.target.value })}
                className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
              />
              {validationErrors.companyName && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.companyName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                Corporate Identification Number (CIN)
              </label>
              <input
                type="text"
                placeholder="21-digit Alphanumeric CIN"
                maxLength={21}
                value={store.companyData.cin}
                onChange={(e) => store.updateCompanyData({ cin: e.target.value.toUpperCase() })}
                className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
              />
              {validationErrors.cin && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.cin}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                  GSTIN (Optional)
                </label>
                <input
                  type="text"
                  placeholder="15-digit GSTIN"
                  maxLength={15}
                  value={store.companyData.gstin}
                  onChange={(e) => store.updateCompanyData({ gstin: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
                />
                {validationErrors.gstin && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.gstin}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                  Incorporation Year
                </label>
                <input
                  type="text"
                  placeholder="Ex. 2021"
                  maxLength={4}
                  value={store.companyData.yearIncorporation}
                  onChange={(e) => store.updateCompanyData({ yearIncorporation: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
                />
                {validationErrors.yearIncorporation && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.yearIncorporation}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Entity Documents */}
        {store.currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <PanInput
                value={store.companyData.companyPan}
                onChange={(val) => store.updateCompanyData({ companyPan: val })}
              />
              {validationErrors.companyPan && (
                <p className="text-[11px] text-rose-500 -mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.companyPan}
                </p>
              )}

              {/* Certificate of Incorporation Document Upload */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-2">
                  Certificate of Incorporation (CoI) Copy
                </label>
                {store.companyData.coiDocUrl ? (
                  <div className="relative border border-emerald-100 bg-emerald-50/20 rounded-lg p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded border border-black/10 overflow-hidden bg-white flex items-center justify-center">
                        <img src={store.companyData.coiDocUrl} alt="CoI Certificate" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-emerald-800 block flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Uploaded Successfully
                        </span>
                        <span className="text-[10px] text-gray-400 block font-mono">Incorporation_Certificate.pdf</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => store.updateCompanyData({ coiDocUrl: "" })}
                      className="p-2 text-gray-400 hover:text-rose-500 rounded-md hover:bg-white transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => document.getElementById("coi-file")?.click()}
                    className="border-2 border-dashed border-black/15 hover:border-[#1D4429]/60 rounded-lg p-6 text-center cursor-pointer bg-[#FDFCFB]/50 hover:bg-white transition flex flex-col items-center justify-center min-h-[120px]"
                  >
                    <input
                      id="coi-file"
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => handleDocUpload(e, "coiDocUrl", setCoiUploading)}
                      className="hidden"
                    />
                    {coiUploading ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-emerald-800">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-xs font-mono">Uploading CoI certificate...</span>
                      </div>
                    ) : (
                      <>
                        <FileUp className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-xs font-medium text-gray-700">Click to upload CoI scan copy</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-mono">JPG, PNG, PDF up to 5MB</p>
                      </>
                    )}
                  </div>
                )}
                {validationErrors.coiDocUrl && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.coiDocUrl}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Managing Director details */}
        {store.currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                Managing Director / Partner Full Name
              </label>
              <input
                type="text"
                placeholder="Ex. Jenish J"
                value={store.companyData.directorName}
                onChange={(e) => store.updateCompanyData({ directorName: e.target.value })}
                className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
              />
              {validationErrors.directorName && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.directorName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PanInput
                value={store.companyData.directorPan}
                onChange={(val) => store.updateCompanyData({ directorPan: val })}
              />
              {validationErrors.directorPan && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.directorPan}
                </p>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                  Director Aadhaar (Last 4 Digits)
                </label>
                <input
                  type="text"
                  placeholder="Ex. 1234"
                  maxLength={4}
                  value={store.companyData.directorAadhaarLast4}
                  onChange={(e) => store.updateCompanyData({ directorAadhaarLast4: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
                />
                {validationErrors.directorAadhaarLast4 && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.directorAadhaarLast4}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Corporate Bank Details */}
        {store.currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                Corporate Bank Beneficiary Name
              </label>
              <input
                type="text"
                placeholder="Matches Registered Corporate Name exactly"
                value={store.companyData.bankAccountName}
                onChange={(e) => store.updateCompanyData({ bankAccountName: e.target.value })}
                className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
              />
              {validationErrors.bankAccountName && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.bankAccountName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                  Corporate Bank Account Number
                </label>
                <input
                  type="text"
                  placeholder="Ex. 123456789012"
                  value={store.companyData.bankAccountNumber}
                  onChange={(e) => store.updateCompanyData({ bankAccountNumber: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
                />
                {validationErrors.bankAccountNumber && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.bankAccountNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                  IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="Ex. UTIB0001234"
                  maxLength={11}
                  value={store.companyData.bankIfsc}
                  onChange={(e) => store.updateCompanyData({ bankIfsc: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
                />
                {validationErrors.bankIfsc && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.bankIfsc}
                  </p>
                )}
              </div>
            </div>

            {/* Cancelled Cheque / Statement upload */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-2">
                Cancelled Cheque or Corporate Bank Statement Copy
              </label>
              {store.companyData.cancelledChequeDocUrl ? (
                <div className="relative border border-emerald-100 bg-emerald-50/20 rounded-lg p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded border border-black/10 overflow-hidden bg-white flex items-center justify-center">
                      <img src={store.companyData.cancelledChequeDocUrl} alt="Cancelled Cheque copy" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-emerald-800 block flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Uploaded Successfully
                      </span>
                      <span className="text-[10px] text-gray-400 block font-mono">Cancelled_Cheque.pdf</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => store.updateCompanyData({ cancelledChequeDocUrl: "" })}
                    className="p-2 text-gray-400 hover:text-rose-500 rounded-md hover:bg-white transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => document.getElementById("cheque-file")?.click()}
                  className="border-2 border-dashed border-black/15 hover:border-[#1D4429]/60 rounded-lg p-6 text-center cursor-pointer bg-[#FDFCFB]/50 hover:bg-white transition flex flex-col items-center justify-center min-h-[120px]"
                >
                  <input
                    id="cheque-file"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleDocUpload(e, "cancelledChequeDocUrl", setChequeUploading)}
                    className="hidden"
                  />
                  {chequeUploading ? (
                    <div className="flex flex-col items-center justify-center gap-2 text-emerald-800">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-xs font-mono">Uploading check image...</span>
                    </div>
                  ) : (
                    <>
                      <FileUp className="w-6 h-6 text-gray-400 mb-2" />
                      <p className="text-xs font-medium text-gray-700">Click to upload cancelled cheque scan</p>
                      <p className="text-[10px] text-gray-400 mt-1 font-mono">JPG, PNG, PDF up to 5MB</p>
                    </>
                  )}
                </div>
              )}
              {validationErrors.cancelledChequeDocUrl && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.cancelledChequeDocUrl}
                </p>
              )}
            </div>
          </div>
        )}
      </KycWizard>
    </div>
  );
}
export default CompanyKycPage;
