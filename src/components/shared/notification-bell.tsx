import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "../../hooks/use-notifications.ts";
import { useAuthStore } from "../../store/auth-store.ts";
import { Bell, ShieldAlert, Check, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function NotificationBell() {
  const { user } = useAuthStore();
  const userId = user?.id || null;
  const { notifications, unreadCount, markNotificationsRead, loadNotifications } = useNotifications(userId);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      loadNotifications();
    }
  };

  const handleMarkRead = () => {
    markNotificationsRead();
  };

  // Helper to format timestamps elegantly
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

  if (!userId) return null;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Bell Trigger */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-brand-dark/65 hover:text-brand-dark hover:bg-black/5 border border-transparent hover:border-black/5 transition-all focus:outline-none cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-4 w-4 items-center justify-center bg-brand-green text-[9px] font-mono font-bold text-white tracking-tighter">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2.5 w-80 bg-white border border-black/10 shadow-lg z-50 rounded-none focus:outline-none"
          >
            {/* Dropdown Header */}
            <div className="px-3.5 py-3 border-b border-black/10 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-dark">
                TRANSACTION AUDITS ({notifications.length})
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadNotifications}
                  className="p-1 hover:bg-black/5 text-brand-dark/40 hover:text-brand-dark transition-all rounded-sm"
                  title="Reload Alerts"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkRead}
                    className="flex items-center gap-1 text-[9px] font-mono font-bold uppercase text-brand-green hover:opacity-85"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark Read
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-black/[0.06]">
              {notifications.length === 0 ? (
                <div className="py-10 px-4 text-center flex flex-col items-center justify-center gap-1.5">
                  <ShieldAlert className="w-6 h-6 text-brand-dark/20" />
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wide text-brand-dark/40">
                    No Audit Records Found
                  </p>
                  <p className="text-[11px] text-brand-dark/40 max-w-xs">
                    Your secure logs and deal milestones will appear here.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 flex gap-2.5 transition-all hover:bg-brand-cream/5 ${
                      !notif.isRead ? "bg-brand-green/[0.02]" : "bg-white"
                    }`}
                  >
                    {/* Unread pulsing dot */}
                    {!notif.isRead && (
                      <span className="w-1.5 h-1.5 mt-1.5 shrink-0 bg-brand-green rounded-full" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-tight text-brand-dark truncate">
                          {notif.title}
                        </p>
                        <span className="text-[8px] font-mono text-brand-dark/35 whitespace-nowrap">
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>
                      {notif.body && (
                        <p className="text-[11px] text-brand-dark/70 leading-relaxed mt-1 font-sans break-words">
                          {notif.body}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default NotificationBell;
