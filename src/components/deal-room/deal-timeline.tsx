import React from "react";
import { ShieldAlert, Calendar, CheckSquare, Coins, FileText, Gift, Award } from "lucide-react";

interface DealTimelineProps {
  deal?: any;
}

export function DealTimeline({ deal }: DealTimelineProps) {
  if (!deal) return null;

  const { createdAt, buyerSigned, sellerSigned, signedAt, escrowStatus, stage, closedAt, checklist } = deal;

  // Deriving chronological events from deal state
  const events: { title: string; desc: string; date: Date; icon: any; type: string }[] = [];

  // 1. Creation Event
  events.push({
    title: "Transaction Room Initialized",
    desc: `Safe-custody escrow room opened for "${deal.listing?.title || "Digital Enterprise Acquisition"}". Due Diligence checklist generated.`,
    date: new Date(createdAt),
    icon: Calendar,
    type: "setup"
  });

  // 2. Completed checklist tasks
  const completedChecklist = (checklist || []).filter((item: any) => item.isCompleted && item.completedAt);
  completedChecklist.forEach((item: any) => {
    events.push({
      title: "Transition Task Completed",
      desc: `Task cleared: "${item.title}". Verified by participant.`,
      date: new Date(item.completedAt),
      icon: CheckSquare,
      type: "checklist"
    });
  });

  // 3. Signing events
  if (buyerSigned) {
    events.push({
      title: "Agreement Signed by Buyer",
      desc: `Buyer (${deal.buyerName}) registered cryptographic signature and consent timestamp on the Asset Purchase Agreement.`,
      date: signedAt ? new Date(signedAt) : new Date(createdAt), // Fallback if signedAt not set
      icon: FileText,
      type: "sign"
    });
  }

  if (sellerSigned) {
    events.push({
      title: "Agreement Signed by Seller",
      desc: `Seller (${deal.sellerName}) registered cryptographic signature and consent timestamp on the Asset Purchase Agreement.`,
      date: signedAt ? new Date(signedAt) : new Date(createdAt), // Fallback
      icon: FileText,
      type: "sign"
    });
  }

  if (signedAt) {
    events.push({
      title: "Purchase Agreement Fully Executed",
      desc: "Both Buyer and Seller signatures validated. Contract binding established. Deal stage advanced to ESCROW.",
      date: new Date(signedAt),
      icon: Award,
      type: "executed"
    });
  }

  // 4. Escrow events
  if (escrowStatus === "pending" || escrowStatus === "funded" || escrowStatus === "released") {
    events.push({
      title: "FMI Escrow Initialized",
      desc: `FMI SafeCustody wire deposit routing instructions created under reference ${deal.escrowReference || "ESC-NEW"}.`,
      date: signedAt ? new Date(new Date(signedAt).getTime() + 1000) : new Date(createdAt),
      icon: Coins,
      type: "escrow"
    });
  }

  if (escrowStatus === "funded" || escrowStatus === "released") {
    events.push({
      title: "Escrow Deposit Secured",
      desc: `FMI compliance verified wire clearance. Transaction purchase fund of ₹${Number(deal.dealValue).toLocaleString("en-IN")} held in neutral safe custody.`,
      date: signedAt ? new Date(new Date(signedAt).getTime() + 5000) : new Date(createdAt),
      icon: ShieldAlert,
      type: "escrow"
    });
  }

  if (escrowStatus === "released") {
    events.push({
      title: "Escrow Released & Deal Closed",
      desc: "All transition checklist conditions cleared. Safe custody payout dispersement completed. Asset transfer archived.",
      date: closedAt ? new Date(closedAt) : new Date(),
      icon: Gift,
      type: "closed"
    });
  }

  // Sort events chronologically (newest first)
  const sortedEvents = [...events].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="font-sans space-y-6">
      <div className="border-b border-black/[0.06] pb-2">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-dark/80">
          Transaction Audit Trail
        </h4>
        <p className="text-[11px] text-brand-dark/50 italic">
          Chronological cryptographic and operational transaction history.
        </p>
      </div>

      <div className="relative pl-6 border-l border-black/[0.08] space-y-6">
        {sortedEvents.map((ev, idx) => {
          const Icon = ev.icon;
          return (
            <div key={idx} className="relative group">
              {/* Dot Icon */}
              <div className={`absolute -left-[35px] top-0 w-7.5 h-7.5 rounded-full border flex items-center justify-center bg-white shadow-sm transition-colors ${
                ev.type === "closed"
                  ? "border-emerald-500 text-emerald-600"
                  : ev.type === "escrow"
                  ? "border-amber-500 text-amber-600"
                  : ev.type === "sign" || ev.type === "executed"
                  ? "border-blue-500 text-blue-600"
                  : "border-black/10 text-brand-dark/40"
              }`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
              </div>

              {/* Event Card */}
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <span className={`text-xs font-bold uppercase tracking-wide ${
                    ev.type === "closed"
                      ? "text-emerald-800"
                      : ev.type === "escrow"
                      ? "text-amber-800"
                      : "text-brand-dark"
                  }`}>
                    {ev.title}
                  </span>
                  <span className="text-[9px] font-mono text-brand-dark/30 uppercase">
                    {ev.date.toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    {ev.date.toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-brand-dark/60">
                  {ev.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
