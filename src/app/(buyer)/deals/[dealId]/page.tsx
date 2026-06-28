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

export function BuyerDealOverviewTab({ dealId, deal, refresh }: DealSubpageProps) {
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
                  Active Milestone: Due Diligence Audit
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-brand-dark/70">
                You are in the Due Diligence Phase. Please perform thorough validation of the target enterprise's financial statements, live traffic metrics, and software source files. Use the <strong>Documents</strong> and <strong>Checklist</strong> tabs to coordinate audits.
              </p>
              <div className="bg-white border border-black/5 p-3.5 space-y-2">
                <span className="text-[10px] font-mono text-brand-dark/40 uppercase block">REQUIRED NEXT ACTIONS:</span>
                <ul className="list-disc pl-4 space-y-1 text-xs text-brand-dark/80">
                  <li>Verify all uploaded financial statements in the Vault.</li>
                  <li>Check off completed buyer tasks in the Checklist.</li>
                  <li>When satisfied, coordinate with seller to move into contract phase.</li>
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
                Please review the finalized Asset Purchase Agreement below. Once satisfied with the terms and earnout specifications, cryptographically authorize your digital signature.
              </p>
            </div>

            {/* Live Agreement rendering */}
            <AgreementViewer deal={deal} />
            <ESignSection deal={deal} role="buyer" refresh={refresh} />
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
                The Purchase Agreement is fully executed by both parties. Please fund the designated safe custody escrow bank routing to hold payment before asset transition.
              </p>
            </div>

            <EscrowStatusCard deal={deal} role="buyer" refresh={refresh} />
          </div>
        );

      case "transfer":
        return (
          <div className="space-y-6">
            <div className="bg-brand-green/5 border border-brand-green/20 p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-brand-green">
                <CheckCircle className="w-5 h-5 stroke-[2.5]" />
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                  Active Milestone: Private Asset Handover
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-brand-dark/70">
                Your purchase funding is locked and secured in safe custody. The seller is currently transferring administrative accounts, repositories, and domains. Use the <strong>Checklist</strong> tab to confirm when each credential is received.
              </p>
            </div>

            {/* Release trigger showing once funded */}
            <EscrowStatusCard deal={deal} role="buyer" refresh={refresh} />
          </div>
        );

      case "closed":
        return (
          <div className="bg-emerald-50 border border-emerald-200 p-8 text-center space-y-4">
            <CheckCircle className="w-10 h-10 text-brand-green mx-auto stroke-[2.5]" />
            <div className="space-y-1.5">
              <h3 className="font-serif italic font-bold text-lg text-emerald-900">Acquisition Completed!</h3>
              <p className="text-xs text-brand-dark/70 max-w-lg mx-auto leading-relaxed">
                Congratulations! Payout has been released, asset handover verified, and the transaction is legally archived. You are now the official proprietor of the enterprise.
              </p>
            </div>
            <button
              onClick={() => window.location.hash = "#/buyer/dashboard"}
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
      {/* 1. Stage dynamic guide */}
      {renderStageContent()}

      {/* 2. Chronological Log */}
      <div className="border-t border-black/[0.08] pt-6">
        <DealTimeline deal={deal} />
      </div>
    </div>
  );
}

export default function BuyerDealDetailPage({ dealId }: { dealId: string }) {
  return (
    <DealRoomLayout dealId={dealId} activeTab="overview" role="buyer">
      <BuyerDealOverviewTab dealId={dealId} />
    </DealRoomLayout>
  );
}
