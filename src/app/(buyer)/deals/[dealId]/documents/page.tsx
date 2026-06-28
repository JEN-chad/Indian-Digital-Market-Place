import React from "react";
import { DealRoomLayout } from "../../../../../components/deal-room/deal-room-layout.tsx";
import { DocumentVault } from "../../../../../components/documents/document-vault.tsx";

interface DealSubpageProps {
  dealId: string;
  deal?: any;
  refresh?: () => void;
}

export function BuyerDealDocumentsTab({ dealId, deal, refresh }: DealSubpageProps) {
  return (
    <DocumentVault deal={deal} refresh={refresh} role="buyer" />
  );
}

export default function BuyerDealDocumentsPage({ dealId }: { dealId: string }) {
  return (
    <DealRoomLayout dealId={dealId} activeTab="documents" role="buyer">
      <BuyerDealDocumentsTab dealId={dealId} />
    </DealRoomLayout>
  );
}
