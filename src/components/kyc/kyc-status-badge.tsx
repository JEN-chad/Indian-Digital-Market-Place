import React from "react";
import { CheckCircle2, AlertCircle, Clock, XCircle } from "lucide-react";

interface KycStatusBadgeProps {
  status: "not_started" | "pending" | "in_review" | "approved" | "rejected";
  className?: string;
}

export function KycStatusBadge({ status, className = "" }: KycStatusBadgeProps) {
  let badgeStyle = "bg-gray-100 text-gray-700 border-gray-200";
  let Icon = Clock;
  let text = "Not Started";

  switch (status) {
    case "pending":
      badgeStyle = "bg-amber-50 text-amber-800 border-amber-200/50";
      Icon = Clock;
      text = "Pending Review";
      break;
    case "in_review":
      badgeStyle = "bg-blue-50 text-blue-800 border-blue-200/50";
      Icon = Clock;
      text = "In Review";
      break;
    case "approved":
      badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200/50";
      Icon = CheckCircle2;
      text = "Approved";
      break;
    case "rejected":
      badgeStyle = "bg-rose-50 text-rose-800 border-rose-200/50";
      Icon = XCircle;
      text = "Rejected";
      break;
    default:
      badgeStyle = "bg-gray-50 text-gray-500 border-gray-200/50";
      Icon = AlertCircle;
      text = "Not Started";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyle} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {text}
    </span>
  );
}
export default KycStatusBadge;
