import React from "react";
import { DealRoomLayout } from "../../../../../components/deal-room/deal-room-layout.tsx";
import { DealChecklist } from "../../../../../components/deal-room/deal-checklist.tsx";

interface DealSubpageProps {
  dealId: string;
  deal?: any;
  refresh?: () => void;
}

export function SellerDealChecklistTab({ dealId, deal, refresh }: DealSubpageProps) {
  return (
    <DealChecklist deal={deal} refresh={refresh} role="seller" />
  );
}

export default function SellerDealChecklistPage({ dealId }: { dealId: string }) {
  return (
    <DealRoomLayout dealId={dealId} activeTab="checklist" role="seller">
      <SellerDealChecklistTab dealId={dealId} />
    </DealRoomLayout>
  );
}
