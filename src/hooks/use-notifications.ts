import { useEffect, useCallback } from "react";
import { useNotificationStore, Notification } from "../store/notification-store.ts";
import { getPusherClient } from "../../lib/pusher.ts";

export function useNotifications(userId: string | null) {
  const { 
    notifications, 
    unreadCount, 
    setNotifications, 
    addNotification, 
    markAsRead: storeMarkAsRead, 
    markAllAsRead: storeMarkAllAsRead 
  } = useNotificationStore();

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

  const markAsRead = useCallback(async (id: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success) {
        storeMarkAsRead(id);
      }
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read:`, err);
    }
  }, [userId, storeMarkAsRead]);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        storeMarkAllAsRead();
      }
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  }, [userId, storeMarkAllAsRead]);

  // Aliases for backward compatibility with existing components
  const markNotificationsRead = markAllRead;

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
    markAsRead,
    markAllRead,
    markNotificationsRead,
  };
}

