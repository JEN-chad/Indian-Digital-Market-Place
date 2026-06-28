import React, { useState } from "react";
import { completeChecklistItem } from "../../actions/deals.ts";
import { CheckSquare, Square, Check, Loader2 } from "lucide-react";

interface ChecklistItem {
  id: string;
  dealId: string;
  title: string;
  assignedTo: "buyer" | "seller" | "platform";
  isCompleted: boolean;
  completedBy: string | null;
  completedAt: string | null;
}

interface DealChecklistProps {
  deal?: any;
  refresh?: () => void;
  role?: "buyer" | "seller";
}

export function DealChecklist({ deal, refresh, role }: DealChecklistProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!deal) return null;

  const checklist: ChecklistItem[] = deal.checklist || [];
  
  // Calculate stats
  const totalTasks = checklist.length;
  const completedTasks = checklist.filter((item) => item.isCompleted).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Group tasks
  const buyerTasks = checklist.filter((t) => t.assignedTo === "buyer");
  const sellerTasks = checklist.filter((t) => t.assignedTo === "seller");
  const platformTasks = checklist.filter((t) => t.assignedTo === "platform");

  const handleToggle = async (itemId: string, assignedTo: string) => {
    // Check role authorization
    const isPlatformTask = assignedTo === "platform";
    if (assignedTo !== role && !isPlatformTask) {
      setError(`Unauthorized. You can only manage ${role} tasks.`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (isPlatformTask) {
      setError("Compliance checks can only be completed by FMI Platform Admins.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setUpdatingId(itemId);
    setError(null);
    const result = await completeChecklistItem(itemId, deal.id);
    if (result.success) {
      if (refresh) refresh();
    } else {
      setError(result.error || "Failed to update checklist item.");
      setTimeout(() => setError(null), 4000);
    }
    setUpdatingId(null);
  };

  const renderSection = (title: string, tasks: ChecklistItem[], sectionRole: "buyer" | "seller" | "platform") => {
    if (tasks.length === 0) return null;

    const isCurrentSectionUser = sectionRole === role;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-2">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-brand-dark/80 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 ${
              sectionRole === "buyer"
                ? "bg-blue-500"
                : sectionRole === "seller"
                ? "bg-amber-500"
                : "bg-brand-green"
            }`} />
            {title} Tasks {isCurrentSectionUser && <span className="text-[10px] font-normal text-brand-green uppercase">(Assignee: You)</span>}
          </h4>
          <span className="text-[10px] font-mono text-brand-dark/40 italic">
            {tasks.filter((t) => t.isCompleted).length} / {tasks.length} Completed
          </span>
        </div>

        <div className="space-y-2">
          {tasks.map((item) => {
            const isClickable = isCurrentSectionUser && !isCurrentSectionUser === false; // Wait, can only click if matches role
            const disabled = sectionRole !== role;

            return (
              <div 
                key={item.id} 
                onClick={() => !disabled && handleToggle(item.id, item.assignedTo)}
                className={`group flex items-start gap-3 p-3 border transition-all text-xs ${
                  item.isCompleted 
                    ? "bg-emerald-50/20 border-emerald-100 text-brand-dark/50 line-through decoration-brand-dark/20" 
                    : "bg-white border-black/[0.05] hover:border-black/10 hover:shadow-sm"
                } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="shrink-0 mt-0.5">
                  {updatingId === item.id ? (
                    <Loader2 className="w-4 h-4 text-brand-green animate-spin" />
                  ) : item.isCompleted ? (
                    <CheckSquare className="w-4 h-4 text-brand-green fill-brand-green/10" />
                  ) : (
                    <Square className={`w-4 h-4 transition-colors ${disabled ? "text-brand-dark/15" : "text-brand-dark/40 group-hover:text-brand-green"}`} />
                  )}
                </div>

                <div className="space-y-0.5 flex-1">
                  <p className={`font-medium ${item.isCompleted ? "" : "text-brand-dark"}`}>{item.title}</p>
                  {item.isCompleted && item.completedAt && (
                    <span className="text-[9px] font-mono text-emerald-700/60 uppercase block">
                      Approved on {new Date(item.completedAt).toLocaleDateString("en-IN")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-brand-cream/10 border border-brand-green/20 p-4">
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-brand-green bg-emerald-50 border border-emerald-100 px-2 py-0.5 inline-block">
            M&A DUE DILIGENCE AUDIT
          </span>
          <h3 className="font-serif italic font-bold text-base text-brand-dark">Transition Checklist</h3>
          <p className="text-xs text-brand-dark/60">
            FMI automated security procedures. Both parties must execute their respective requirements to unlock payout release.
          </p>
        </div>

        {/* Circular or Bar Progress Meter */}
        <div className="shrink-0 flex items-center gap-4 bg-white border border-black/5 p-3.5">
          <div className="relative flex items-center justify-center">
            <span className="text-lg font-mono font-black text-brand-green">{progressPercent}%</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono text-brand-dark/40 uppercase tracking-widest block">COMPLETION STATE</span>
            <p className="text-xs font-bold font-mono text-brand-dark">
              {completedTasks} / {totalTasks} Tasks Completed
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-800 p-3 text-xs font-mono">
          🚨 {error}
        </div>
      )}

      {/* Task Sections */}
      <div className="space-y-6">
        {renderSection("Buyer Due Diligence", buyerTasks, "buyer")}
        {renderSection("Seller Assets & Onboarding", sellerTasks, "seller")}
        {renderSection("FMI Platform Compliance", platformTasks, "platform")}
      </div>
    </div>
  );
}
