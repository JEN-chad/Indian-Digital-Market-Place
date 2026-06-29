import React, { useRef, useState } from "react";
import { Upload, File, AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";

interface FileDropzoneProps {
  id?: string;
  onUploadComplete: (url: string, name: string) => void;
  maxSizeMB?: number;
  accept?: string;
  label?: string;
  description?: string;
  uploadedUrl?: string;
  onClear?: () => void;
}

export default function FileDropzone({
  id = "file-dropzone",
  onUploadComplete,
  maxSizeMB = 5,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg",
  label = "Upload a file",
  description = "PDF, DOC, XLS, PNG, or JPG up to 5MB",
  uploadedUrl,
  onClear,
}: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setError(null);

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Maximum size allowed is ${maxSizeMB}MB.`);
      return;
    }

    setIsUploading(true);
    setFileName(file.name);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Upload via API
        const response = await fetch("/api/documents/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64String, folder: "fmi_listings" }),
        });

        const data = await response.json();
        
        if (data.success && data.secure_url) {
          onUploadComplete(data.secure_url, file.name);
        } else {
          setError(data.error || "Failed to upload file.");
        }
        setIsUploading(false);
      };
      
      reader.onerror = () => {
        setError("Error reading file.");
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || "Failed to process and upload file.");
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="w-full">
      {uploadedUrl ? (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-emerald-800 truncate">
                {fileName || "File uploaded successfully"}
              </p>
              <a
                href={uploadedUrl}
                target="_blank"
                referrerPolicy="no-referrer"
                className="text-xs text-emerald-600 hover:underline"
              >
                View Uploaded Document
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={clearFile}
            className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          id={id}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerInputClick}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${
            isDragActive
              ? "border-amber-500 bg-amber-50/50"
              : "border-slate-200 hover:border-amber-400 hover:bg-slate-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="flex flex-col items-center space-y-3 py-2 text-slate-500">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              <p className="text-sm font-medium">Uploading {fileName || "file"}...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="p-3 bg-amber-50 rounded-full text-amber-600">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">{label}</p>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
