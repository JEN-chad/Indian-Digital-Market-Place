import React from "react";
import { DealRoomLayout } from "../../../../../components/deal-room/deal-room-layout.tsx";
import { ChatWindow } from "../../../../../components/messaging/chat-window.tsx";

interface DealSubpageProps {
  dealId: string;
  deal?: any;
  refresh?: () => void;
}

export function SellerDealMessagesTab({ dealId, deal }: DealSubpageProps) {
  return <ChatWindow dealId={dealId} deal={deal} />;
}

export default function SellerDealMessagesPage({ dealId }: { dealId: string }) {
  return (
    <DealRoomLayout dealId={dealId} activeTab="messages" role="seller">
      <SellerDealMessagesTab dealId={dealId} />
    </DealRoomLayout>
  );
}
