// Client-side wrappers that fetch our server-side API endpoints for Deal Room

export type DealStage = "nda" | "due_diligence" | "agreement" | "escrow" | "transfer" | "closed" | "cancelled";

export interface DealDocumentInput {
  name: string;
  type: "proof_of_funds" | "agreement" | "transfer_proof" | "nda" | "other";
  url: string;
  visibility: "both" | "buyer_only" | "seller_only";
  cloudinaryId?: string;
}

function getStoredUserId(): string | undefined {
  try {
    const saved = localStorage.getItem("fmi_auth_user");
    return saved ? JSON.parse(saved)?.id : undefined;
  } catch {
    return undefined;
  }
}

function getAuthHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const userId = getStoredUserId();
  if (userId) {
    headers["Authorization"] = `Bearer ${userId}`;
  }
  return headers;
}

export async function getActiveDeals(role: "buyer" | "seller"): Promise<{ success: boolean; deals?: any[]; error?: string }> {
  try {
    const userId = getStoredUserId();
    if (!userId) return { success: false, error: "Not logged in" };

    const res = await fetch(`/api/actions/deals?userId=${userId}&role=${role}`, {
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to fetch active deals" };
    }
    return { success: true, deals: result.deals };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch active deals" };
  }
}

export async function getDealDetail(dealId: string): Promise<{ success: boolean; deal?: any; error?: string }> {
  try {
    const userId = getStoredUserId();
    if (!userId) return { success: false, error: "Not logged in" };

    const res = await fetch(`/api/actions/deals/detail?dealId=${dealId}&userId=${userId}`, {
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to fetch deal detail" };
    }
    return { success: true, deal: result.deal };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch deal detail" };
  }
}

export async function advanceStage(dealId: string, newStage: DealStage): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = getStoredUserId();
    if (!userId) return { success: false, error: "Not logged in" };

    const res = await fetch("/api/actions/deals/advance", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ dealId, newStage, userId }),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to advance stage" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to advance stage" };
  }
}

export async function completeChecklistItem(itemId: string, dealId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = getStoredUserId();
    if (!userId) return { success: false, error: "Not logged in" };

    const res = await fetch("/api/actions/deals/checklist/complete", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ itemId, dealId, userId }),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to complete task" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to complete task" };
  }
}

export async function signAgreement(dealId: string, role: "buyer" | "seller"): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = getStoredUserId();
    if (!userId) return { success: false, error: "Not logged in" };

    const res = await fetch("/api/actions/deals/sign", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ dealId, role, userId }),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to sign agreement" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to sign agreement" };
  }
}

export async function initiateEscrow(dealId: string): Promise<{ success: boolean; escrowReference?: string; error?: string }> {
  try {
    const res = await fetch("/api/actions/deals/escrow/initiate", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ dealId }),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to initiate escrow" };
    }
    return { success: true, escrowReference: result.escrowReference };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to initiate escrow" };
  }
}

export async function releaseEscrow(dealId: string, role: "buyer" | "seller"): Promise<{ success: boolean; approvals?: any; error?: string }> {
  try {
    const res = await fetch("/api/actions/deals/escrow/release", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ dealId, role }),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to release escrow" };
    }
    return { success: true, approvals: result.approvals };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to release escrow" };
  }
}

export async function verifyEscrowFunding(dealId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/actions/deals/escrow/admin-fund", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ dealId }),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to confirm escrow funding" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to confirm escrow funding" };
  }
}

export async function uploadDealDocument(dealId: string, data: DealDocumentInput): Promise<{ success: boolean; document?: any; error?: string }> {
  try {
    const userId = getStoredUserId();
    if (!userId) return { success: false, error: "Not logged in" };

    const res = await fetch("/api/actions/deals/documents/upload", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ dealId, data, userId }),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to register document upload" };
    }
    return { success: true, document: result.document };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to register document upload" };
  }
}

export async function fetchDealMessages(dealId: string): Promise<{ success: boolean; messages?: any[]; error?: string }> {
  try {
    const res = await fetch(`/api/actions/deals/messages?dealId=${dealId}`, {
      headers: getAuthHeaders(),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to fetch messages" };
    }
    return { success: true, messages: result.messages };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch messages" };
  }
}

export async function submitDealMessage(dealId: string, content: string): Promise<{ success: boolean; message?: any; error?: string }> {
  try {
    const senderId = getStoredUserId();
    if (!senderId) return { success: false, error: "Not logged in" };

    const res = await fetch("/api/actions/deals/messages/send", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ dealId, senderId, content }),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to send message" };
    }
    return { success: true, message: result.message };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to send message" };
  }
}

