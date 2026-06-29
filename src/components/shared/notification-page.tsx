import React from "react";
import { useNotifications } from "../../hooks/use-notifications.ts";
import { 
  Bell, FileText, Handshake, MessageSquare, ShieldCheck, 
  Clock, Check, RefreshCw, CheckCircle2, ChevronRight 
} from "lucide-react";
import { EmptyState } from "./empty-state.tsx";
import { NotificationSkeleton } from "./loading-skeleton.tsx";

interface NotificationPageProps {
  userId: string;
}

export function NotificationPage({ userId }: NotificationPageProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllRead, 
    loadNotifications 
  } = useNotifications(userId);

  // Group notifications by date: Today, Yesterday, Older
  const getGroupedNotifications = () => {
    const today: any[] = [];
    const yesterday: any[] = [];
    const older: any[] = [];

    const now = new Date();
    const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayDate = todayDate - 24 * 60 * 60 * 1000;

    notifications.forEach((notif) => {
      const notifTime = new Date(notif.createdAt).getTime();
      if (notifTime >= todayDate) {
        today.push(notif);
      } else if (notifTime >= yesterdayDate) {
        yesterday.push(notif);
      } else {
        older.push(notif);
      }
    });

    return { today, yesterday, older };
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "nda_signed":
      case "nda_fee_paid":
        return {
          icon: FileText,
          color: "text-teal-700 bg-teal-50 border-teal-100"
        };
      case "offer_received":
      case "offer_submitted":
      case "offer_countered":
      case "offer_accepted":
      case "offer_rejected":
        return {
          icon: ShieldCheck,
          color: "text-amber-700 bg-amber-50 border-amber-100"
        };
      case "deal_created":
      case "deal_stage_changed":
      case "deal_advanced":
      case "agreement_signed":
      case "escrow_funded":
      case "escrow_released":
        return {
          icon: Handshake,
          color: "text-indigo-700 bg-indigo-50 border-indigo-100"
        };
      case "message_received":
      case "new_message":
      case "deal_message":
        return {
          icon: MessageSquare,
          color: "text-purple-700 bg-purple-50 border-purple-100"
        };
      case "kyc_submission":
      case "kyc_approval":
      case "kyc_approved":
        return {
          icon: ShieldCheck,
          color: "text-emerald-700 bg-emerald-50 border-emerald-100"
        };
      default:
        return {
          icon: Bell,
          color: "text-brand-dark/60 bg-gray-50 border-gray-100"
        };
    }
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  const handleNotificationClick = (notif: any) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }
    
    // Determine redirect hash based on notification details
    if (notif.data && notif.data.dealId) {
      window.location.hash = `#/buyer/deals/${notif.data.dealId}`;
    } else if (notif.data && notif.data.listingId) {
      window.location.hash = `#/listings/${notif.data.listingId}`;
    } else if (notif.type.startsWith("offer")) {
      window.location.hash = `#/buyer/offers`;
    }
  };

  const { today, yesterday, older } = getGroupedNotifications();
  const hasNotifications = notifications.length > 0;

  const renderSection = (title: string, list: any[]) => {
    if (list.length === 0) return null;
    return (
      <div className="space-y-3.5">
        <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark/45 pl-1">
          {title} ({list.length})
        </h3>
        <div className="space-y-2.5">
          {list.map((notif) => {
            const meta = getNotificationIcon(notif.type);
            const Icon = meta.icon;
            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`border p-4.5 flex gap-4 transition-all hover:bg-brand-cream/5 cursor-pointer relative group ${
                  !notif.isRead
                    ? "bg-brand-green/[0.01] border-brand-green/15"
                    : "bg-white border-black/10"
                }`}
              >
                {/* Status Dot */}
                {!notif.isRead && (
                  <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-green" />
                )}

                {/* Left Icon */}
                <div className={`p-2 border shrink-0 flex items-center justify-center h-10 w-10 ${meta.color}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Body Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-brand-dark group-hover:text-brand-green transition-colors">
                        {notif.title}
                      </h4>
                      {notif.body && (
                        <p className="text-xs text-brand-dark/65 leading-relaxed mt-1 font-sans">
                          {notif.body}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-[9px] font-mono font-bold text-brand-dark/35 flex items-center">
                        <Clock className="w-2.5 h-2.5 mr-1" />
                        {formatTime(notif.createdAt)}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-brand-dark/25 group-hover:text-brand-green group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-4xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <h1 className="text-3xl font-serif italic font-black text-brand-dark tracking-tight">
            Notification Audit Trail
          </h1>
          <p className="text-xs font-semibold tracking-wider text-brand-dark/60 uppercase mt-1">
            Secure Platform Logs & Deal Alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadNotifications}
            className="p-3 bg-white hover:bg-black/5 text-brand-dark/70 hover:text-brand-dark border border-black/10 transition-all cursor-pointer flex items-center justify-center"
            title="Force refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="bg-brand-green hover:bg-brand-green/95 text-white font-bold text-xs uppercase tracking-widest px-5 py-3 rounded-none flex items-center space-x-2 border border-brand-green transition-all cursor-pointer shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Alert Log List */}
      {!hasNotifications ? (
        <EmptyState
          variant="no-notifications"
          heading="Your log is completely clear"
          description="We'll notify you here about bid offers, signed NDAs, deal stage updates, and new messages."
        />
      ) : (
        <div className="space-y-8">
          {renderSection("Today", today)}
          {renderSection("Yesterday", yesterday)}
          {renderSection("Older Records", older)}
        </div>
      )}
    </div>
  );
}
export default NotificationPage;
