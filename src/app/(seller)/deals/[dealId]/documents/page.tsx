import React from "react";
import { DealRoomLayout } from "../../../../../components/deal-room/deal-room-layout.tsx";
import { DocumentVault } from "../../../../../components/documents/document-vault.tsx";

interface DealSubpageProps {
  dealId: string;
  deal?: any;
  refresh?: () => void;
}

export function SellerDealDocumentsTab({ dealId, deal, refresh }: DealSubpageProps) {
  return (
    <DocumentVault deal={deal} refresh={refresh} role="seller" />
  );
}

export default function SellerDealDocumentsPage({ dealId }: { dealId: string }) {
  return (
    <DealRoomLayout dealId={dealId} activeTab="documents" role="seller">
      <SellerDealDocumentsTab dealId={dealId} />
    </DealRoomLayout>
  );
}
