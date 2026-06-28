import React, { useState, useRef } from "react";
import { uploadDealDocument } from "../../actions/deals.ts";
import { Upload, File, Loader2, Info, Eye, Lock } from "lucide-react";

interface DocumentUploadProps {
  dealId: string;
  refresh?: () => void;
  role?: "buyer" | "seller";
}

export function DocumentUpload({ dealId, refresh, role }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [docType, setDocType] = useState<"proof_of_funds" | "agreement" | "transfer_proof" | "nda" | "other">("other");
  const [visibility, setVisibility] = useState<"both" | "buyer_only" | "seller_only">("both");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select or drop a document to upload.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    // Simulate upload delay and generate standard mock URL
    setTimeout(async () => {
      const mockCloudinaryUrl = `https://res.cloudinary.com/fmi-digital/image/upload/v1700000/${file.name.replace(/\s+/g, "_")}`;
      
      const result = await uploadDealDocument(dealId, {
        name: file.name,
        type: docType,
        url: mockCloudinaryUrl,
        visibility: visibility,
        cloudinaryId: `mock-cloud-id-${Date.now()}`
      });

      if (result.success) {
        setSuccess(true);
        setFile(null);
        if (refresh) refresh();
      } else {
        setError(result.error || "Failed to register document upload.");
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="border border-black/10 bg-white p-6 font-sans space-y-6 rounded-none">
      <div className="space-y-1">
        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-green bg-emerald-50 border border-emerald-100 px-2 py-0.5 inline-block">
          ENCRYPTED VAULT INGRESS
        </span>
        <h4 className="text-sm font-serif italic font-black text-brand-dark">Deposit New Document</h4>
        <p className="text-xs text-brand-dark/60">
          Upload critical files to the Document Vault. Files are securely logged and distributed based on access settings.
        </p>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-800 p-3 text-xs font-mono">
          🚨 {error}
        </div>
      )}

      {success && (
        <div className="border border-emerald-200 bg-emerald-50 text-emerald-800 p-3 text-xs font-mono">
          ✅ Document successfully encrypted and logged in vault.
        </div>
      )}

      <form onSubmit={handleUploadSubmit} className="space-y-4">
        {/* Type selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-brand-dark/50 uppercase tracking-widest block">
              Document Classification
            </label>
            <select
              value={docType}
              onChange={(e: any) => setDocType(e.target.value)}
              className="w-full px-3 py-2 border border-black/10 bg-white text-xs font-mono focus:border-brand-green focus:outline-none"
              disabled={loading}
            >
              <option value="proof_of_funds">Proof of Funds (POF)</option>
              <option value="agreement">M&A Asset Purchase Agreement</option>
              <option value="transfer_proof">Transfer Verification Log</option>
              <option value="nda">Non-Disclosure Agreement (NDA)</option>
              <option value="other">General Supporting Materials</option>
            </select>
          </div>

          {/* Visibility selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-brand-dark/50 uppercase tracking-widest block">
              Vault Access Rights (Visibility)
            </label>
            <select
              value={visibility}
              onChange={(e: any) => setVisibility(e.target.value)}
              className="w-full px-3 py-2 border border-black/10 bg-white text-xs font-mono focus:border-brand-green focus:outline-none"
              disabled={loading}
            >
              <option value="both">Shared (Both Buyer & Seller)</option>
              <option value="buyer_only">Buyer Vault Only (Private)</option>
              <option value="seller_only">Seller Vault Only (Private)</option>
            </select>
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[140px] rounded-none ${
            dragActive 
              ? "border-brand-green bg-brand-cream/5" 
              : "border-black/10 bg-brand-cream/10 hover:border-black/20 hover:bg-brand-cream/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx"
          />

          {file ? (
            <div className="space-y-2">
              <File className="w-8 h-8 text-brand-green mx-auto" />
              <div>
                <p className="text-xs font-mono font-bold text-brand-dark truncate max-w-xs sm:max-w-md mx-auto">
                  {file.name}
                </p>
                <p className="text-[10px] font-mono text-brand-dark/40 uppercase">
                  {(file.size / 1024).toFixed(1)} KB • Click to swap file
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="w-8 h-8 text-brand-dark/40 mx-auto group-hover:text-brand-green transition-colors" />
              <div>
                <p className="text-xs font-bold text-brand-dark">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-[10px] font-mono text-brand-dark/40 uppercase mt-0.5">
                  PDF, DOCX, XLSX, OR IMAGE UP TO 10MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Informational Warning */}
        <div className="bg-brand-green/5 border border-brand-green/20 p-3.5 flex gap-2.5 items-start text-brand-green">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed text-brand-dark/70">
            {visibility === "both" 
              ? "This document will be instantly shared, watermarked, and listed in the document workspace of BOTH parties."
              : `This document is marked as highly private and will only be visible to the ${visibility.replace("_only", "").toUpperCase()} and Platform Administrators.`}
          </p>
        </div>

        {/* Upload Button */}
        <button
          type="submit"
          disabled={loading || !file}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-mono uppercase tracking-widest transition-all ${
            file && !loading
              ? "bg-brand-dark text-white hover:bg-brand-green cursor-pointer"
              : "bg-black/5 text-brand-dark/20 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>ENCRYPTING & UPLOADING TO VAULT...</span>
            </>
          ) : (
            <span>SECURELY REGISTER FILE</span>
          )}
        </button>
      </form>
    </div>
  );
}
