import React, { useState, useEffect } from "react";
import { useNotifications } from "../../hooks/use-notifications.ts";
import { 
  FileText, Handshake, MessageSquare, ShieldCheck, BadgePercent, 
  Clock, ArrowRight, RefreshCw, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ActivityFeedProps {
  userId: string;
  initialEvents?: any[];
}

export function ActivityFeed({ userId, initialEvents = [] }: ActivityFeedProps) {
  const { notifications, loadNotifications } = useNotifications(userId);
  const [visibleCount, setVisibleCount] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Combine initial events and real-time notifications, filtered and sorted
  const allEvents = [...notifications];
  
  // Dedup events by ID
  const uniqueEvents = allEvents.filter(
    (event, index, self) => self.findIndex((e) => e.id === event.id) === index
  );

  // Sort by date desc
  uniqueEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const getEventMeta = (type: string) => {
    switch (type) {
      case "nda_signed":
      case "nda_fee_paid":
        return {
          icon: FileText,
          bgColor: "bg-teal-50 border-teal-100 text-teal-700",
          label: "NDA Signed"
        };
      case "offer_received":
      case "offer_submitted":
      case "offer_countered":
      case "offer_accepted":
      case "offer_rejected":
        return {
          icon: BadgePercent,
          bgColor: "bg-amber-50 border-amber-100 text-amber-700",
          label: "Offer Alert"
        };
      case "deal_created":
      case "deal_stage_changed":
      case "deal_advanced":
      case "agreement_signed":
      case "escrow_funded":
      case "escrow_released":
        return {
          icon: Handshake,
          bgColor: "bg-indigo-50 border-indigo-100 text-indigo-700",
          label: "Deal Room Event"
        };
      case "message_received":
      case "new_message":
      case "deal_message":
        return {
          icon: MessageSquare,
          bgColor: "bg-purple-50 border-purple-100 text-purple-700",
          label: "New Message"
        };
      case "kyc_submission":
      case "kyc_approval":
      case "kyc_approved":
        return {
          icon: ShieldCheck,
          bgColor: "bg-emerald-50 border-emerald-100 text-emerald-700",
          label: "Verification"
        };
      default:
        return {
          icon: AlertCircle,
          bgColor: "bg-gray-50 border-gray-100 text-gray-700",
          label: "Platform Alert"
        };
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    try {
      const past = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - past.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  const visibleEvents = uniqueEvents.slice(0, visibleCount);

  return (
    <div className="bg-white border border-black/10 p-6 rounded-none space-y-6">
      <div className="flex justify-between items-center border-b border-black/5 pb-4">
        <div>
          <h3 className="text-sm font-serif italic font-black text-brand-dark tracking-tight">
            Live Activity Stream
          </h3>
          <p className="text-[10px] text-brand-dark/50 font-semibold uppercase tracking-widest mt-0.5">
            Audit logs & platform actions
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-1.5 hover:bg-black/5 text-brand-dark/50 hover:text-brand-dark transition-all rounded border border-transparent hover:border-black/5 cursor-pointer flex items-center space-x-1.5"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider hidden sm:inline">Refresh</span>
        </button>
      </div>

      {uniqueEvents.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
          <Clock className="w-8 h-8 text-brand-dark/15" />
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/40">
            No activity logged
          </p>
          <p className="text-xs text-brand-dark/55 max-w-xs">
            Events like signed NDAs, offers, and messages will stream here in real-time.
          </p>
        </div>
      ) : (
        <div className="relative border-l border-black/5 pl-5 ml-2.5 space-y-6 py-1">
          <AnimatePresence initial={false}>
            {visibleEvents.map((event, idx) => {
              const meta = getEventMeta(event.type);
              const EventIcon = meta.icon;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                  className="relative group"
                >
                  {/* Timeline point marker */}
                  <span className="absolute -left-[27.5px] top-1.5 flex h-3.5 w-3.5 items-center justify-center bg-white border-2 border-brand-green/30 rounded-full group-hover:border-brand-green transition-colors" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start space-x-3">
                      <div className={`p-1.5 rounded-none border shrink-0 ${meta.bgColor}`}>
                        <EventIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-brand-dark font-sans">
                          {event.body || event.title}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-brand-dark/40">
                            {meta.label}
                          </span>
                          <span className="text-[9px] text-brand-dark/30">&bull;</span>
                          <span className="text-[9px] text-brand-dark/40 font-mono font-bold flex items-center">
                            <Clock className="w-2.5 h-2.5 mr-1" />
                            {formatTimeAgo(event.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {visibleCount < uniqueEvents.length && (
            <div className="pt-2">
              <button
                onClick={() => setVisibleCount((prev) => prev + 5)}
                className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-green hover:text-brand-green/80 flex items-center space-x-1 hover:space-x-1.5 transition-all cursor-pointer"
              >
                <span>Load older activity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default ActivityFeed;
