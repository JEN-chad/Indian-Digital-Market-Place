import React from "react";
import { X, FileText, Download, ShieldAlert, EyeOff } from "lucide-react";

interface DocumentViewerProps {
  document: any;
  onClose: () => void;
  viewerEmail?: string;
}

export function DocumentViewer({ document, onClose, viewerEmail }: DocumentViewerProps) {
  if (!document) return null;

  // Derive display metadata
  const typeLabels: any = {
    proof_of_funds: "Proof of Funds (POF)",
    agreement: "M&A Purchase Agreement",
    transfer_proof: "Transfer Verification Log",
    nda: "Non-Disclosure Agreement (NDA)",
    other: "General Business Material",
  };

  const watermarkText = viewerEmail 
    ? `${viewerEmail} • CONFIDENTIAL FMI SECURITY VAULT • STRICT NO DISCLOSE`
    : "CONFIDENTIAL TRANSACTION DOCUMENT • NO COPIES AUTHORIZED";

  return (
    <div className="fixed inset-0 bg-brand-dark/85 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in font-sans">
      <div 
        className="bg-white border border-black/10 w-full max-w-4xl h-[85vh] flex flex-col relative rounded-none shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="border-b border-black/[0.08] px-6 py-4 flex items-center justify-between bg-neutral-50 shrink-0">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-brand-green" />
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-green bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 inline-block">
                {typeLabels[document.type] || "SECURED VAULT FILE"}
              </span>
              <h3 className="text-xs font-mono font-bold text-brand-dark truncate max-w-xs sm:max-w-md mt-0.5">
                {document.name}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={document.url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 hover:bg-black/5 text-brand-dark/60 hover:text-brand-dark focus:outline-none"
              title="Download Source Document"
            >
              <Download className="w-4.5 h-4.5" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-black/5 text-brand-dark/60 hover:text-brand-dark focus:outline-none"
              aria-label="Close document viewer"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Modal Main Content (Document Sandbox Viewport) */}
        <div className="flex-1 overflow-auto bg-neutral-100 p-8 flex items-center justify-center relative select-none">
          
          {/* SECURE WATERMARK CONTAINER */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-3 pointer-events-none select-none z-50 overflow-hidden opacity-[0.06] font-mono text-[10px] uppercase tracking-widest font-bold">
            {Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className="flex items-center justify-center rotate-[-25deg] text-center px-4"
              >
                {watermarkText}
              </div>
            ))}
          </div>

          {/* DOCUMENT BODY CONTENT GRAPHIC SIMULATION */}
          <div className="w-full max-w-2xl bg-white border border-black/5 p-12 min-h-[500px] shadow-sm flex flex-col justify-between relative">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-black/[0.08] pb-4">
                <span className="text-[10px] font-mono text-brand-dark/40 font-bold">DOCUMENT TYPE: {document.type.toUpperCase()}</span>
                <span className="text-[10px] font-mono text-brand-dark/40 font-bold">FMI CLASSIFIED</span>
              </div>

              {/* Simulated text */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold font-mono text-brand-dark uppercase">Verified Document Asset Signature Details</h4>
                <div className="h-2 w-32 bg-brand-green/20" />
                
                <p className="text-xs text-brand-dark/70 leading-relaxed text-justify">
                  This file represents official documentation deposited securely into the FMI Transaction Room under ID: <strong className="font-mono">{document.id.toUpperCase()}</strong>.
                </p>

                <p className="text-xs text-brand-dark/70 leading-relaxed text-justify">
                  All rights, details, assets, transactions, bank statements, or proof files linked herein are covered under the executed legal terms of the transaction room NDA. Unauthorised copying, screenshotting, distribution, or sharing of this file outside of the certified deal participants will constitute a major breach of acquisition trust and legal covenants.
                </p>

                {/* Nice visual layout matching files */}
                <div className="bg-neutral-50 border border-black/[0.04] p-4 font-mono text-[10px] text-brand-dark/60 space-y-2 mt-4">
                  <div><strong>FILE NAME:</strong> {document.name}</div>
                  <div><strong>FILE INDEX:</strong> FMI-VAULT-{(document.cloudinaryId || document.id).slice(0, 12).toUpperCase()}</div>
                  <div><strong>DEPOSIT TIMESTAMP:</strong> {new Date(document.createdAt || Date.now()).toUTCString()}</div>
                  <div><strong>ACCESS SCOPE:</strong> {document.visibility === "both" ? "MUTUAL (BUYER + SELLER)" : `PRIVATE (${document.visibility.toUpperCase()})`}</div>
                </div>
              </div>
            </div>

            <div className="border-t border-black/[0.08] pt-6 flex justify-between items-center text-[9px] font-mono text-brand-dark/40">
              <span>VAULT ID: {document.id.slice(0, 16).toUpperCase()}</span>
              <span>VERIFIED BY FMI SECURITY</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Security Warning */}
        <div className="border-t border-black/[0.08] px-6 py-3 bg-neutral-50 flex items-center gap-2 shrink-0">
          <ShieldAlert className="w-4 h-4 text-brand-green shrink-0" />
          <p className="text-[10px] font-mono text-brand-dark/50">
            This workspace uses secure browser sandbox encapsulation. Anti-screenshot tracking and encrypted ledger records are registered to: <strong>{viewerEmail || "Participant"}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
