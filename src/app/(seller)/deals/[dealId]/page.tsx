import React from "react";
import { DealRoomLayout } from "../../../../components/deal-room/deal-room-layout.tsx";
import { AgreementViewer } from "../../../../components/deal-room/agreement-viewer.tsx";
import { ESignSection } from "../../../../components/deal-room/e-sign-section.tsx";
import { EscrowStatusCard } from "../../../../components/deal-room/escrow-status-card.tsx";
import { DealTimeline } from "../../../../components/deal-room/deal-timeline.tsx";
import { ShieldCheck, Info, FileText, ArrowRight, CheckCircle } from "lucide-react";

interface DealSubpageProps {
  dealId: string;
  deal?: any; // Injected by DealRoomLayout
  refresh?: () => void; // Injected by DealRoomLayout
}

export function SellerDealOverviewTab({ dealId, deal, refresh }: DealSubpageProps) {
  if (!deal) return null;

  const renderStageContent = () => {
    switch (deal.stage) {
      case "due_diligence":
        return (
          <div className="space-y-6">
            <div className="bg-brand-green/5 border border-brand-green/20 p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-brand-green">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                  Active Milestone: Buyer Due Diligence Audit
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-brand-dark/70">
                The buyer is currently verifying traffic analytics, financial books, and checking off due diligence items. Use the <strong>Documents</strong> and <strong>Checklist</strong> tabs to coordinate credentials or upload financial statements as requested.
              </p>
              <div className="bg-white border border-black/5 p-3.5 space-y-2">
                <span className="text-[10px] font-mono text-brand-dark/40 uppercase block font-bold">REQUIRED NEXT ACTIONS:</span>
                <ul className="list-disc pl-4 space-y-1 text-xs text-brand-dark/80">
                  <li>Upload financial statement files or analytics access reports.</li>
                  <li>Check off completed seller transition items in the Checklist.</li>
                  <li>Coordinate with buyer via secure Chat to finalize deal details.</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case "agreement":
        return (
          <div className="space-y-6">
            <div className="bg-blue-50/40 border border-blue-200 p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-blue-800">
                <FileText className="w-5 h-5" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                  Active Milestone: Contract E-Signing
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-brand-dark/70">
                Please review the Asset Purchase Agreement terms. Once satisfied with the upfront and earnout allocation structures, cryptographically authorize your signature below.
              </p>
            </div>

            <AgreementViewer deal={deal} />
            <ESignSection deal={deal} role="seller" refresh={refresh} />
          </div>
        );

      case "escrow":
        return (
          <div className="space-y-6">
            <div className="bg-amber-50/40 border border-amber-200 p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-amber-800">
                <Info className="w-5 h-5" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                  Active Milestone: Escrow Vault Funding
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-brand-dark/70">
                The Purchase Agreement is fully executed by both parties. The buyer has been issued ICICI Bank safe-custody wire instructions. Once verified by compliance, the deal room automatically advances to the handover phase.
              </p>
            </div>

            <EscrowStatusCard deal={deal} role="seller" refresh={refresh} />
          </div>
        );

      case "transfer":
        return (
          <div className="space-y-6">
            <div className="bg-brand-green/5 border border-brand-green/20 p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-brand-green">
                <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                  Active Milestone: Asset Handover Proceeding
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-brand-dark/70">
                Buyer purchase funding has cleared wire verification and is securely locked in Escrow. Please proceed to transfer administrative accounts, databases, and code access to the buyer. Complete the <strong>Checklist</strong> transition items to authorize payout release.
              </p>
            </div>

            <EscrowStatusCard deal={deal} role="seller" refresh={refresh} />
          </div>
        );

      case "closed":
        return (
          <div className="bg-emerald-50 border border-emerald-200 p-8 text-center space-y-4">
            <CheckCircle className="w-10 h-10 text-brand-green mx-auto stroke-[2.5]" />
            <div className="space-y-1.5">
              <h3 className="font-serif italic font-bold text-lg text-emerald-900">Asset Sold Successfully!</h3>
              <p className="text-xs text-brand-dark/70 max-w-lg mx-auto leading-relaxed">
                Congratulations! Dual-approval was received, escrow payouts disbursed to your banking account, and the deal room is archived. Thank you for using FMI Digital Exchange.
              </p>
            </div>
            <button
              onClick={() => window.location.hash = "#/seller/dashboard"}
              className="px-5 py-2.5 bg-brand-dark text-white text-xs font-mono uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Back to Dashboard
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Stage dynamic content */}
      {renderStageContent()}

      {/* Chronological Log */}
      <div className="border-t border-black/[0.08] pt-6">
        <DealTimeline deal={deal} />
      </div>
    </div>
  );
}

export default function SellerDealDetailPage({ dealId }: { dealId: string }) {
  return (
    <DealRoomLayout dealId={dealId} activeTab="overview" role="seller">
      <SellerDealOverviewTab dealId={dealId} />
    </DealRoomLayout>
  );
}
