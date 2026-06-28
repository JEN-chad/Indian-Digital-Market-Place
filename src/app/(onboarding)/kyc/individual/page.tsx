import React, { useState, useEffect } from "react";
import { KycWizard } from "../../../../components/kyc/kyc-wizard.tsx";
import { PanInput } from "../../../../components/kyc/pan-input.tsx";
import { AadhaarUpload } from "../../../../components/kyc/aadhaar-upload.tsx";
import { SelfieCapture } from "../../../../components/kyc/selfie-capture.tsx";
import { useKycWizardStore } from "../../../../store/kyc-wizard-store.ts";
import { submitKyc, uploadDocument } from "../../../../actions/kyc.ts";
import { AlertCircle, FileUp, Trash2, Check, Loader2 } from "lucide-react";

interface IndividualKycPageProps {
  user: any;
  onSuccess: () => void;
  onBackToRole: () => void;
}

export function IndividualKycPage({ user, onSuccess, onBackToRole }: IndividualKycPageProps) {
  const store = useKycWizardStore();
  const [loading, setLoading] = useState(false);
  const [panUploading, setPanUploading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Individual Form Steps Configuration
  const steps = [
    { title: "Personal Details", description: "Provide your official identity details" },
    { title: "Document Upload", description: "Upload scan or clear photos of PAN & Aadhaar" },
    { title: "Selfie Capture", description: "Take a live selfie to confirm your identity" },
    { title: "Bank Verification", description: "Provide bank account for transaction clearance" },
  ];

  // Helper to validate current step fields
  const validateStep = (stepNum: number): boolean => {
    const errors: Record<string, string> = {};
    const data = store.individualData;

    if (stepNum === 1) {
      if (!data.fullName.trim()) errors.fullName = "Full Name is required";
      if (!data.dob) errors.dob = "Date of Birth is required";
      if (!data.street.trim()) errors.street = "Street address is required";
      if (!data.city.trim()) errors.city = "City is required";
      if (!data.state.trim()) errors.state = "State is required";
      if (!/^\d{6}$/.test(data.pin)) errors.pin = "PIN code must be exactly 6 digits";
    } else if (stepNum === 2) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panNumber)) {
        errors.panNumber = "Invalid PAN Card number format";
      }
      if (!data.panDocUrl) errors.panDocUrl = "PAN document copy is required";
      if (!/^\d{4}$/.test(data.aadhaarLast4)) {
        errors.aadhaarLast4 = "Must enter last 4 digits of Aadhaar";
      }
      if (!data.aadhaarDocUrl) errors.aadhaarDocUrl = "Aadhaar front image is required";
      if (!data.aadhaarBackDocUrl) errors.aadhaarBackDocUrl = "Aadhaar back image is required";
    } else if (stepNum === 3) {
      if (!data.selfieUrl) errors.selfieUrl = "Selfie verification is required";
    } else if (stepNum === 4) {
      if (!data.bankAccountName.trim()) errors.bankAccountName = "Bank Account Name is required";
      if (!/^\d{9,18}$/.test(data.bankAccountNumber)) {
        errors.bankAccountNumber = "Account number must be between 9 and 18 digits";
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.bankIfsc)) {
        errors.bankIfsc = "Invalid Indian Financial System Code (IFSC) format";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    setError("");
    const isStepValid = validateStep(store.currentStep);

    if (!isStepValid) return;

    if (store.currentStep < steps.length) {
      store.setStep(store.currentStep + 1);
    } else {
      // Final submission!
      setLoading(true);
      try {
        const payload = {
          userId: user?.id || "mock-user-id",
          kycType: "individual" as const,
          panNumber: store.individualData.panNumber,
          aadhaarLast4: store.individualData.aadhaarLast4,
          panDocUrl: store.individualData.panDocUrl,
          aadhaarDocUrl: store.individualData.aadhaarDocUrl,
          selfieUrl: store.individualData.selfieUrl,
          bankAccountName: store.individualData.bankAccountName,
          bankAccountNumber: store.individualData.bankAccountNumber,
          bankIfsc: store.individualData.bankIfsc,
        };

        const res = await submitKyc(payload);
        if (res.success) {
          // Reset wizard store state on success
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

  // PAN Document File Handler
  const handlePanFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidationErrors((prev) => ({ ...prev, panDocUrl: "" }));
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors((prev) => ({ ...prev, panDocUrl: "File exceeds 5MB size limit." }));
      return;
    }

    setPanUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const uploadRes = await uploadDocument(base64String, "fmi_pan");
        if (uploadRes.success && uploadRes.secure_url) {
          store.updateIndividualData({ panDocUrl: uploadRes.secure_url });
        } else {
          setValidationErrors((prev) => ({ ...prev, panDocUrl: uploadRes.error || "Upload failed." }));
        }
        setPanUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setValidationErrors((prev) => ({ ...prev, panDocUrl: err.message || "Error uploading file." }));
      setPanUploading(false);
    }
  };

  // Check if current step values are populated to enable the Next button
  const canProceed = () => {
    const d = store.individualData;
    if (store.currentStep === 1) {
      return !!(d.fullName && d.dob && d.street && d.city && d.state && d.pin);
    }
    if (store.currentStep === 2) {
      return !!(d.panNumber && d.panDocUrl && d.aadhaarLast4 && d.aadhaarDocUrl && d.aadhaarBackDocUrl);
    }
    if (store.currentStep === 3) {
      return !!d.selfieUrl;
    }
    if (store.currentStep === 4) {
      return !!(d.bankAccountName && d.bankAccountNumber && d.bankIfsc);
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-serif font-black tracking-tight text-gray-900">
          Individual Profile KYC
        </h2>
        <p className="text-xs text-gray-400">
          Complete verification to start transacting digital businesses.
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
        nextText={store.currentStep === steps.length ? "Submit Application" : "Next Step"}
        loading={loading}
      >
        {/* STEP 1: Personal Details */}
        {store.currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                Full Name (Matches PAN Card)
              </label>
              <input
                type="text"
                placeholder="Ex. Jenish J"
                value={store.individualData.fullName}
                onChange={(e) => store.updateIndividualData({ fullName: e.target.value })}
                className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
              />
              {validationErrors.fullName && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.fullName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={store.individualData.dob}
                  onChange={(e) => store.updateIndividualData({ dob: e.target.value })}
                  className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
                />
                {validationErrors.dob && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.dob}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  placeholder="6-digit Indian PIN"
                  maxLength={6}
                  value={store.individualData.pin}
                  onChange={(e) => store.updateIndividualData({ pin: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
                />
                {validationErrors.pin && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.pin}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                Street Address
              </label>
              <input
                type="text"
                placeholder="Flat No, Wing, Society Name, Landmark"
                value={store.individualData.street}
                onChange={(e) => store.updateIndividualData({ street: e.target.value })}
                className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
              />
              {validationErrors.street && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.street}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Ex. Mumbai"
                  value={store.individualData.city}
                  onChange={(e) => store.updateIndividualData({ city: e.target.value })}
                  className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
                />
                {validationErrors.city && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.city}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  placeholder="Ex. Maharashtra"
                  value={store.individualData.state}
                  onChange={(e) => store.updateIndividualData({ state: e.target.value })}
                  className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
                />
                {validationErrors.state && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.state}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Document Upload */}
        {store.currentStep === 2 && (
          <div className="space-y-6">
            <div className="space-y-4">
              <PanInput
                value={store.individualData.panNumber}
                onChange={(val) => store.updateIndividualData({ panNumber: val })}
              />
              {validationErrors.panNumber && (
                <p className="text-[11px] text-rose-500 -mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {validationErrors.panNumber}
                </p>
              )}

              {/* PAN Upload */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-2">
                  PAN Card Document Copy
                </label>
                {store.individualData.panDocUrl ? (
                  <div className="relative border border-emerald-100 bg-emerald-50/20 rounded-lg p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded border border-black/10 overflow-hidden bg-white flex items-center justify-center">
                        <img src={store.individualData.panDocUrl} alt="PAN card" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-emerald-800 block flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Uploaded Successfully
                        </span>
                        <span className="text-[10px] text-gray-400 block font-mono">PAN_Card.jpg</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => store.updateIndividualData({ panDocUrl: "" })}
                      className="p-2 text-gray-400 hover:text-rose-500 rounded-md hover:bg-white transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => document.getElementById("pan-file")?.click()}
                    className="border-2 border-dashed border-black/15 hover:border-[#1D4429]/60 rounded-lg p-6 text-center cursor-pointer bg-[#FDFCFB]/50 hover:bg-white transition flex flex-col items-center justify-center min-h-[120px]"
                  >
                    <input
                      id="pan-file"
                      type="file"
                      accept="image/*"
                      onChange={handlePanFileChange}
                      className="hidden"
                    />
                    {panUploading ? (
                      <div className="flex flex-col items-center justify-center gap-2 text-emerald-800">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="text-xs font-mono">Uploading PAN...</span>
                      </div>
                    ) : (
                      <>
                        <FileUp className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-xs font-medium text-gray-700">Click to upload clear image of PAN</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-mono">JPG, PNG up to 5MB</p>
                      </>
                    )}
                  </div>
                )}
                {validationErrors.panDocUrl && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.panDocUrl}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-black/5 pt-6 space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                  Aadhaar Card (Last 4 Digits)
                </label>
                <input
                  type="text"
                  placeholder="Ex. 9845"
                  maxLength={4}
                  value={store.individualData.aadhaarLast4}
                  onChange={(e) => store.updateIndividualData({ aadhaarLast4: e.target.value.replace(/\D/g, "") })}
                  className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
                />
                {validationErrors.aadhaarLast4 && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.aadhaarLast4}
                  </p>
                )}
              </div>

              {/* Aadhaar Upload Dropzone */}
              <AadhaarUpload
                frontUrl={store.individualData.aadhaarDocUrl}
                backUrl={store.individualData.aadhaarBackDocUrl}
                onFrontChange={(url) => store.updateIndividualData({ aadhaarDocUrl: url })}
                onBackChange={(url) => store.updateIndividualData({ aadhaarBackDocUrl: url })}
              />
              {(validationErrors.aadhaarDocUrl || validationErrors.aadhaarBackDocUrl) && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Please upload both Aadhaar Front and Back documents.
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Selfie Capture */}
        {store.currentStep === 3 && (
          <div className="py-2">
            <SelfieCapture
              value={store.individualData.selfieUrl}
              onChange={(url) => store.updateIndividualData({ selfieUrl: url })}
            />
            {validationErrors.selfieUrl && (
              <p className="text-[11px] text-rose-500 text-center mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="w-3 h-3" /> {validationErrors.selfieUrl}
              </p>
            )}
          </div>
        )}

        {/* STEP 4: Bank Details */}
        {store.currentStep === 4 && (
          <div className="space-y-4">
            <div className="bg-[#1D4429]/5 p-4 rounded-md border border-[#1D4429]/10">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong>Why Bank Details?</strong> Vetting and routing digital transactions securely inside India requires verified Indian bank accounts. No funds will be charged; this is strictly for buyer/seller credential routing.
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-1.5">
                Bank Account Beneficiary Name
              </label>
              <input
                type="text"
                placeholder="Should match your PAN name exactly"
                value={store.individualData.bankAccountName}
                onChange={(e) => store.updateIndividualData({ bankAccountName: e.target.value })}
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
                  Bank Account Number
                </label>
                <input
                  type="text"
                  placeholder="Ex. 912345678901"
                  value={store.individualData.bankAccountNumber}
                  onChange={(e) => store.updateIndividualData({ bankAccountNumber: e.target.value.replace(/\D/g, "") })}
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
                  placeholder="Ex. SBIN0012345"
                  maxLength={11}
                  value={store.individualData.bankIfsc}
                  onChange={(e) => store.updateIndividualData({ bankIfsc: e.target.value.toUpperCase() })}
                  className="w-full bg-white border border-black/15 focus:border-[#1D4429] px-4 py-2.5 rounded-md text-sm font-mono tracking-widest focus:outline-none focus:ring-1 focus:ring-[#1D4429] transition"
                />
                {validationErrors.bankIfsc && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {validationErrors.bankIfsc}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </KycWizard>
    </div>
  );
}
export default IndividualKycPage;
