import React from "react";
import { useAuthStore } from "../../../store/auth-store.ts";
import { NotificationPage } from "../../../components/shared/notification-page.tsx";

export default function BuyerNotificationsPage() {
  const { user } = useAuthStore();
  const userId = user?.id || "";

  return (
    <div className="bg-[#FDFCFB] min-h-screen">
      <NotificationPage userId={userId} />
    </div>
  );
}
