import React, { useState, useRef } from "react";
import { FileUp, Image, Check, Trash2, Loader2, AlertCircle } from "lucide-react";
import { uploadDocument } from "../../actions/kyc.ts";

interface AadhaarUploadProps {
  frontUrl: string;
  backUrl: string;
  onFrontChange: (url: string) => void;
  onBackChange: (url: string) => void;
}

export function AadhaarUpload({ frontUrl, backUrl, onFrontChange, onBackChange }: AadhaarUploadProps) {
  const [frontUploading, setFrontUploading] = useState(false);
  const [backUploading, setBackUploading] = useState(false);
  const [frontError, setFrontError] = useState("");
  const [backError, setBackError] = useState("");

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    if (side === "front") setFrontError("");
    else setBackError("");

    // Check size limit: 5MB
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      const errMsg = "File exceeds the 5MB size limit.";
      if (side === "front") setFrontError(errMsg);
      else setBackError(errMsg);
      return;
    }

    const setUploading = side === "front" ? setFrontUploading : setBackUploading;
    const onChange = side === "front" ? onFrontChange : onBackChange;

    setUploading(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const uploadRes = await uploadDocument(base64String, "fmi_aadhaar");

        if (uploadRes.success && uploadRes.secure_url) {
          onChange(uploadRes.secure_url);
        } else {
          const errMsg = uploadRes.error || "Upload failed. Please try again.";
          if (side === "front") setFrontError(errMsg);
          else setBackError(errMsg);
        }
        setUploading(false);
      };
      reader.onerror = () => {
        const errMsg = "Failed to read file.";
        if (side === "front") setFrontError(errMsg);
        else setBackError(errMsg);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || "An error occurred during upload.";
      if (side === "front") setFrontError(errMsg);
      else setBackError(errMsg);
      setUploading(false);
    }
  };

  const removeFile = (side: "front" | "back") => {
    if (side === "front") {
      onFrontChange("");
      if (frontInputRef.current) frontInputRef.current.value = "";
    } else {
      onBackChange("");
      if (backInputRef.current) backInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-2">
          Aadhaar Card Front Document
        </label>
        {frontUrl ? (
          <div className="relative border border-emerald-100 bg-emerald-50/20 rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded border border-black/10 overflow-hidden bg-white flex items-center justify-center">
                <img src={frontUrl} alt="Aadhaar Front" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs font-medium text-emerald-800 block flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Uploaded Successfully
                </span>
                <span className="text-[10px] text-gray-400 block font-mono">Aadhaar_Front.jpg</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile("front")}
              className="p-2 text-gray-400 hover:text-rose-500 rounded-md hover:bg-white transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => frontInputRef.current?.click()}
            className="border-2 border-dashed border-black/15 hover:border-[#1D4429]/60 rounded-lg p-6 text-center cursor-pointer bg-[#FDFCFB]/50 hover:bg-white transition flex flex-col items-center justify-center min-h-[140px]"
          >
            <input
              type="file"
              ref={frontInputRef}
              onChange={(e) => handleFileChange(e, "front")}
              accept="image/*,application/pdf"
              className="hidden"
            />
            {frontUploading ? (
              <div className="flex flex-col items-center justify-center gap-2 text-emerald-800">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-medium font-mono">Uploading front...</span>
              </div>
            ) : (
              <>
                <FileUp className="w-6 h-6 text-gray-400 mb-2" />
                <p className="text-xs font-medium text-gray-700">Click to upload Aadhaar front image</p>
                <p className="text-[10px] text-gray-400 mt-1 font-mono">JPG, PNG up to 5MB</p>
              </>
            )}
          </div>
        )}
        {frontError && (
          <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-sans">
            <AlertCircle className="w-3.5 h-3.5" /> {frontError}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60 mb-2">
          Aadhaar Card Back Document
        </label>
        {backUrl ? (
          <div className="relative border border-emerald-100 bg-emerald-50/20 rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded border border-black/10 overflow-hidden bg-white flex items-center justify-center">
                <img src={backUrl} alt="Aadhaar Back" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs font-medium text-emerald-800 block flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Uploaded Successfully
                </span>
                <span className="text-[10px] text-gray-400 block font-mono">Aadhaar_Back.jpg</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile("back")}
              className="p-2 text-gray-400 hover:text-rose-500 rounded-md hover:bg-white transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => backInputRef.current?.click()}
            className="border-2 border-dashed border-black/15 hover:border-[#1D4429]/60 rounded-lg p-6 text-center cursor-pointer bg-[#FDFCFB]/50 hover:bg-white transition flex flex-col items-center justify-center min-h-[140px]"
          >
            <input
              type="file"
              ref={backInputRef}
              onChange={(e) => handleFileChange(e, "back")}
              accept="image/*,application/pdf"
              className="hidden"
            />
            {backUploading ? (
              <div className="flex flex-col items-center justify-center gap-2 text-emerald-800">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="text-xs font-medium font-mono">Uploading back...</span>
              </div>
            ) : (
              <>
                <FileUp className="w-6 h-6 text-gray-400 mb-2" />
                <p className="text-xs font-medium text-gray-700">Click to upload Aadhaar back image</p>
                <p className="text-[10px] text-gray-400 mt-1 font-mono">JPG, PNG up to 5MB</p>
              </>
            )}
          </div>
        )}
        {backError && (
          <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-sans">
            <AlertCircle className="w-3.5 h-3.5" /> {backError}
          </p>
        )}
      </div>
    </div>
  );
}
export default AadhaarUpload;
