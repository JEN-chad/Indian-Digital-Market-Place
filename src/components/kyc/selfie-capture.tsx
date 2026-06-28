import React, { useState, useRef } from "react";
import { Camera, FileUp, Check, Trash2, Loader2, AlertCircle, Info } from "lucide-react";
import { uploadDocument } from "../../actions/kyc.ts";

interface SelfieCaptureProps {
  value: string;
  onChange: (url: string) => void;
}

export function SelfieCapture({ value, onChange }: SelfieCaptureProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setError("File exceeds the 5MB size limit.");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const uploadRes = await uploadDocument(base64String, "fmi_selfies");

        if (uploadRes.success && uploadRes.secure_url) {
          onChange(uploadRes.secure_url);
        } else {
          setError(uploadRes.error || "Upload failed. Please try again.");
        }
        setUploading(false);
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setUploading(false);
    }
  };

  const removeSelfie = () => {
    onChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <label className="block text-xs font-mono uppercase tracking-wider text-[#1A1A1A]/60">
        Live Selfie Verification
      </label>

      {value ? (
        <div className="relative max-w-sm mx-auto border border-emerald-100 bg-emerald-50/20 rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-full border-2 border-emerald-500 overflow-hidden bg-white mb-3 shadow">
            <img src={value} alt="Selfie preview" className="w-full h-full object-cover" />
          </div>
          <span className="text-xs font-medium text-emerald-800 flex items-center gap-1 mb-4">
            <Check className="w-4 h-4" /> Selfie Captured Successfully
          </span>
          <button
            type="button"
            onClick={removeSelfie}
            className="text-xs text-rose-500 font-medium flex items-center gap-1.5 px-3 py-2 border border-rose-200 bg-rose-50/50 hover:bg-rose-50 rounded-md transition"
          >
            <Trash2 className="w-3.5 h-3.5" /> Retake Selfie
          </button>
        </div>
      ) : (
        <div className="border border-black/10 bg-gray-50/50 rounded-lg p-6 text-center max-w-sm mx-auto flex flex-col items-center justify-center min-h-[220px]">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="user"
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-[#1D4429]">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-medium font-mono">Uploading selfie...</span>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 bg-white border border-black/10 rounded-full flex items-center justify-center mb-4 text-[#1D4429] shadow-sm">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs font-medium text-gray-700 max-w-[240px] leading-relaxed mb-4">
                Upload a clear front-facing portrait of yourself
              </p>
              
              <div className="flex flex-col w-full gap-2 px-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 bg-[#1D4429] hover:bg-[#15331E] text-white font-medium text-xs rounded-md transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <FileUp className="w-4 h-4" /> Upload Selfie Image
                </button>
                <div className="text-[10px] text-gray-400 font-mono flex items-center justify-center gap-1 mt-1">
                  <Info className="w-3 h-3 text-gray-300" />
                  <span>Supports Camera Capture on Mobile</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs text-rose-500 text-center flex items-center justify-center gap-1 font-sans">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
export default SelfieCapture;
