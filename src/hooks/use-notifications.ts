import { useEffect, useCallback } from "react";
import { useNotificationStore, Notification } from "../store/notification-store.ts";
import { getPusherClient } from "../../lib/pusher.ts";

export function useNotifications(userId: string | null) {
  const { notifications, unreadCount, setNotifications, addNotification, markAllAsRead } = useNotificationStore();

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      const data = await res.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  }, [userId, setNotifications]);

  const markNotificationsRead = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/notifications/read", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        markAllAsRead();
      }
    } catch (err) {
      console.error("Failed to mark notifications read:", err);
    }
  }, [userId, markAllAsRead]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadNotifications();
    }
  }, [userId, loadNotifications]);

  // Pusher real-time subscription
  useEffect(() => {
    if (!userId) return;

    let pusher: any = null;
    let channel: any = null;

    try {
      pusher = getPusherClient(userId);
      channel = pusher.subscribe(`user-${userId}`);

      channel.bind("notification", (newNotif: Notification) => {
        addNotification(newNotif);
      });
    } catch (err) {
      console.error("Pusher notifications subscribe failed:", err);
    }

    return () => {
      if (pusher && channel) {
        try {
          channel.unbind("notification");
          pusher.unsubscribe(`user-${userId}`);
        } catch (err) {}
      }
    };
  }, [userId, addNotification]);

  return {
    notifications,
    unreadCount,
    loadNotifications,
    markNotificationsRead,
  };
}
