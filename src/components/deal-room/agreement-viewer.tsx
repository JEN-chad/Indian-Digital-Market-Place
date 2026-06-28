import React from "react";
import { ShieldAlert, FileText, Award } from "lucide-react";

interface AgreementViewerProps {
  deal?: any;
}

export function AgreementViewer({ deal }: AgreementViewerProps) {
  if (!deal) return null;

  const { id, dealValue, buyerName, sellerName, createdAt, signedAt } = deal;
  const upfrontPercent = deal.offer?.upfrontPercent || "100";
  const earnoutPercent = deal.offer?.earnoutPercent || "0";
  const earnoutTerms = deal.offer?.earnoutTerms || "No earnout structures established.";
  const formattedPrice = Number(dealValue).toLocaleString("en-IN");
  const upfrontAmt = Number((Number(dealValue) * Number(upfrontPercent)) / 100).toLocaleString("en-IN");
  const earnoutAmt = Number((Number(dealValue) * Number(earnoutPercent)) / 100).toLocaleString("en-IN");

  const contractDate = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const executedDate = signedAt 
    ? new Date(signedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="bg-neutral-50 border border-black/15 shadow-inner p-8 md:p-12 font-serif text-neutral-800 space-y-8 relative overflow-hidden max-h-[600px] overflow-y-auto select-none rounded-none">
      
      {/* Draft Watermark */}
      {!signedAt && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] rotate-[-30deg] pointer-events-none select-none">
          <span className="text-8xl font-sans font-black tracking-widest text-brand-dark">UNEXECUTED DRAFT</span>
        </div>
      )}

      {/* Signed Executed Seal */}
      {signedAt && (
        <div className="absolute top-10 right-10 flex items-center gap-1.5 border-2 border-emerald-600/30 text-emerald-700 bg-emerald-50/70 px-4 py-2 font-mono text-xs font-black uppercase tracking-wider rotate-6 select-none z-20">
          <Award className="w-4 h-4 shrink-0" />
          <span>FMI Executed Contract</span>
        </div>
      )}

      {/* Legal Letterhead Header */}
      <div className="text-center space-y-2 border-b border-neutral-300 pb-8">
        <h2 className="text-lg uppercase tracking-wider font-bold">ASSET PURCHASE AGREEMENT</h2>
        <p className="text-xs uppercase tracking-widest font-sans text-neutral-500 font-bold">
          CONSTITUTED UNDER LAWS OF THE DIGITAL EXCHANGE DIRECTIVE
        </p>
        <p className="text-[11px] font-sans text-neutral-400">
          Agreement ID: FMI-APA-{id.slice(0, 8).toUpperCase()} • Draft Date: {contractDate}
        </p>
      </div>

      {/* Contract Body */}
      <div className="space-y-6 text-sm leading-relaxed text-neutral-900 pr-2">
        <p className="text-justify indent-8">
          This ASSET PURCHASE AGREEMENT (the <strong>"Agreement"</strong>) is entered into as of <strong>{contractDate}</strong>, by and between <strong>{buyerName}</strong> (hereinafter referred to as the <strong>"Buyer"</strong>) and <strong>{sellerName}</strong> (hereinafter referred to as the <strong>"Seller"</strong>).
        </p>

        <p className="uppercase tracking-wide font-bold text-xs font-sans text-neutral-600 mt-6 border-b border-neutral-200 pb-1">
          RECITALS
        </p>
        <p className="text-justify indent-8">
          WHEREAS, Seller owns and operates certain digital intellectual property assets, software source code architectures, hosting servers, customer list directories, and proprietary brand configurations known collectively as <strong>"{deal.listing?.title || "Target Digital Assets"}"</strong>; and WHEREAS, Seller desires to sell and Buyer desires to acquire all right, title, and interest in and to such assets under the mutual covenants described herein.
        </p>

        <p className="uppercase tracking-wide font-bold text-xs font-sans text-neutral-600 mt-6 border-b border-neutral-200 pb-1">
          SECTION 1: PURCHASE PRICE AND TRANSACTION STRUCTURE
        </p>
        
        <div className="space-y-3 pl-4">
          <p className="text-justify">
            <strong>1.1. Core Purchase Value:</strong> The aggregate purchase consideration to be paid by Buyer to Seller for the acquisition of the intellectual assets is established at a flat rate of <strong>₹{formattedPrice}</strong> (the <strong>"Purchase Price"</strong>).
          </p>
          
          <p className="text-justify">
            <strong>1.2. Escrow Deposit:</strong> Buyer agrees to deposit the entirety of the purchase consideration into the neutral, FMI-authorized safe custody escrow account within three (3) business days of mutual signature execution.
          </p>

          <p className="text-justify">
            <strong>1.3. Structured Payments:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1 text-xs font-sans text-neutral-600">
            <li>Upfront Disbursement Amount ({upfrontPercent}%): <strong>₹{upfrontAmt}</strong> (due instantly upon asset transfer confirmation).</li>
            <li>Earnout Allocation ({earnoutPercent}%): <strong>₹{earnoutAmt}</strong>.</li>
            <li>Earnout Terms: {earnoutTerms}</li>
          </ul>
        </div>

        <p className="uppercase tracking-wide font-bold text-xs font-sans text-neutral-600 mt-6 border-b border-neutral-200 pb-1">
          SECTION 2: TRANSFER OF INTELLECTUAL PROPERTY & TRANSFER PROCEDURES
        </p>
        <div className="space-y-2 pl-4 text-justify">
          <p>
            <strong>2.1. Assigned Intellectual Assets:</strong> Seller hereby permanently transfers, sells, and assigns to Buyer all global rights, titles, domain registrations, software source code structures, logo designs, customer records, and admin accounts.
          </p>
          <p>
            <strong>2.2. Handover Protocol:</strong> Seller is required to complete all transfer tasks outlined in the FMI active Transition Checklist, including transferring root DNS authority, code repositories, and SaaS administrative accounts.
          </p>
        </div>

        <p className="uppercase tracking-wide font-bold text-xs font-sans text-neutral-600 mt-6 border-b border-neutral-200 pb-1">
          SECTION 3: INDEMNIFICATION AND WARRANTIES
        </p>
        <p className="text-justify pl-4">
          Seller represents and warrants that all digital assets are delivered free of structural liens, code liabilities, backdoors, or platform infringements. Both parties covenant to act in absolute good faith. This agreement is governed under the rules of digital asset acquisition compliance.
        </p>
      </div>

      {/* Signature blocks placeholder visual */}
      <div className="border-t border-neutral-300 pt-8 grid grid-cols-2 gap-8 text-xs font-sans">
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">BUYER SIGNATURE</span>
          <div className="h-12 flex items-end border-b border-neutral-300 pb-1 font-serif italic text-neutral-700 text-sm">
            {deal.buyerSigned ? (
              <span className="text-emerald-800 font-bold">/s/ {buyerName.toUpperCase()} — Timestamp Recorded</span>
            ) : (
              <span className="text-neutral-400 italic font-sans">[Awaiting signature...]</span>
            )}
          </div>
          <p className="text-[10px] font-mono text-neutral-500">Signee Name: {buyerName}</p>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">SELLER SIGNATURE</span>
          <div className="h-12 flex items-end border-b border-neutral-300 pb-1 font-serif italic text-neutral-700 text-sm">
            {deal.sellerSigned ? (
              <span className="text-emerald-800 font-bold">/s/ {sellerName.toUpperCase()} — Timestamp Recorded</span>
            ) : (
              <span className="text-neutral-400 italic font-sans">[Awaiting signature...]</span>
            )}
          </div>
          <p className="text-[10px] font-mono text-neutral-500">Signee Name: {sellerName}</p>
        </div>
      </div>

      {executedDate && (
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 text-center font-sans text-xs text-emerald-800 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>
            <strong>Fully Executed:</strong> Signed and finalized on {executedDate} via FMI Cryptographic Audit Trail.
          </span>
        </div>
      )}
    </div>
  );
}
