import React, { useState } from "react";
import { DocumentUpload } from "./document-upload.tsx";
import { DocumentViewer } from "./document-viewer.tsx";
import { FileText, Eye, ShieldAlert, Lock, ArrowRight, EyeOff } from "lucide-react";

interface DocumentVaultProps {
  deal?: any;
  refresh?: () => void;
  role?: "buyer" | "seller";
}

export function DocumentVault({ deal, refresh, role }: DocumentVaultProps) {
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [showUpload, setShowUpload] = useState<boolean>(false);

  if (!deal) return null;

  const documents = deal.documents || [];

  // Grouping categories
  const categories = [
    { key: "proof_of_funds", label: "Proof of Funds" },
    { key: "agreement", label: "Purchase Agreements" },
    { key: "transfer_proof", label: "Asset Transfer Proofs" },
    { key: "nda", label: "NDAs & Legal Files" },
    { key: "other", label: "Supporting Materials" },
  ];

  const getVisibilityBadge = (visibility: string) => {
    if (visibility === "both") {
      return (
        <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100">
          <Eye className="w-3 h-3" /> SHARED (MUTUAL)
        </span>
      );
    }
    const label = visibility === "buyer_only" ? "BUYER ONLY" : "SELLER ONLY";
    const isPrivateForMe = visibility === `${role}_only`;

    return (
      <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 border border-amber-100">
        <Lock className="w-3 h-3" /> {label} {isPrivateForMe && "(PRIVATE)"}
      </span>
    );
  };

  const getViewerEmail = () => {
    return role === "buyer" ? deal.buyerEmail : deal.sellerEmail;
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-brand-cream/10 border border-brand-green/20 p-4">
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-green bg-emerald-50 border border-emerald-100 px-2 py-0.5 inline-block">
            M&A AUDITED TRANSACTION VAULT
          </span>
          <h3 className="font-serif italic font-bold text-base text-brand-dark">Secure Document Vault</h3>
          <p className="text-xs text-brand-dark/60">
            Encrypted storage and viewing for due diligence, agreements, and proof logs. NDA terms fully apply to all content.
          </p>
        </div>

        <button
          onClick={() => setShowUpload(!showUpload)}
          className="shrink-0 px-4 py-2 bg-brand-dark text-white text-xs font-mono uppercase tracking-widest hover:bg-brand-green transition-all"
        >
          {showUpload ? "CLOSE UPLOAD CONDUIT" : "DEPOSIT DOCUMENT"}
        </button>
      </div>

      {/* Render upload form if toggled */}
      {showUpload && (
        <div className="animate-fade-in">
          <DocumentUpload 
            dealId={deal.id} 
            refresh={() => {
              if (refresh) refresh();
              setShowUpload(false);
            }} 
            role={role} 
          />
        </div>
      )}

      {/* Categories Render */}
      <div className="space-y-6">
        {categories.map((cat) => {
          const catDocs = documents.filter((doc: any) => doc.type === cat.key);

          return (
            <div key={cat.key} className="space-y-2.5">
              <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-dark/50 border-b border-black/[0.05] pb-1.5">
                {cat.label} ({catDocs.length})
              </h4>

              {catDocs.length === 0 ? (
                <p className="text-xs text-brand-dark/30 italic pl-3">
                  No registered documents in this category.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {catDocs.map((doc: any) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className="group flex items-center justify-between p-3.5 border border-black/[0.05] bg-white hover:border-black/10 hover:shadow-sm cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                        <FileText className="w-5 h-5 text-brand-green shrink-0 group-hover:scale-105 transition-transform" />
                        <div className="min-w-0 space-y-0.5">
                          <p className="text-xs font-bold text-brand-dark truncate group-hover:text-brand-green transition-colors">
                            {doc.name}
                          </p>
                          <span className="text-[9px] font-mono text-brand-dark/30 uppercase block">
                            Deposited {new Date(doc.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {getVisibilityBadge(doc.visibility)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Document Viewer Overlay */}
      {selectedDoc && (
        <DocumentViewer
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          viewerEmail={getViewerEmail()}
        />
      )}
    </div>
  );
}
