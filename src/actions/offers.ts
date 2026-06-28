// Client-side wrappers that fetch our server-side API endpoints for Offer Flow

export interface OfferInput {
  listingId: string;
  buyerId: string;
  amount: number;
  upfrontPercent: number;
  earnoutPercent: number;
  earnoutTerms?: string;
  message?: string;
  validityDays: number; // 7, 14, or 30 days
}

function getStoredUserId(): string | undefined {
  try {
    const saved = localStorage.getItem("fmi_auth_user");
    return saved ? JSON.parse(saved)?.id : undefined;
  } catch {
    return undefined;
  }
}

export async function submitOffer(data: OfferInput): Promise<{ success: boolean; offerId?: string; error?: string }> {
  try {
    const payload = {
      ...data,
      buyerId: data.buyerId || getStoredUserId(),
    };
    const res = await fetch("/api/actions/offers/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to submit offer" };
    }
    return { success: true, offerId: result.offerId };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit offer" };
  }
}

export async function acceptOffer(offerId: string): Promise<{ success: boolean; dealId?: string; error?: string }> {
  try {
    const res = await fetch("/api/actions/offers/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId, sellerId: getStoredUserId() }),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to accept offer" };
    }
    return { success: true, dealId: result.dealId };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to accept offer" };
  }
}

export async function counterOffer(
  offerId: string,
  counterAmount: number,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/actions/offers/counter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId, counterAmount, message, sellerId: getStoredUserId() }),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to submit counter-offer" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit counter-offer" };
  }
}

export async function rejectOffer(offerId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/actions/offers/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId, reason, sellerId: getStoredUserId() }),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to reject offer" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reject offer" };
  }
}

export async function withdrawOffer(offerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/actions/offers/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId, buyerId: getStoredUserId() }),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to withdraw offer" };
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to withdraw offer" };
  }
}

export async function acceptCounter(offerId: string): Promise<{ success: boolean; dealId?: string; error?: string }> {
  try {
    const res = await fetch("/api/actions/offers/accept-counter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offerId, buyerId: getStoredUserId() }),
    });
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to accept counter-offer" };
    }
    return { success: true, dealId: result.dealId };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to accept counter-offer" };
  }
}

export async function getBuyerOffers(buyerId: string): Promise<{ success: boolean; offers?: any[]; error?: string }> {
  try {
    const res = await fetch(`/api/actions/offers/buyer?buyerId=${buyerId || getStoredUserId()}`);
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to fetch buyer offers" };
    }
    return { success: true, offers: result.offers };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch buyer offers" };
  }
}

export async function getSellerOffers(sellerId: string): Promise<{ success: boolean; offers?: any[]; error?: string }> {
  try {
    const res = await fetch(`/api/actions/offers/seller?sellerId=${sellerId || getStoredUserId()}`);
    const result = await res.json();
    if (!res.ok || result.success === false) {
      return { success: false, error: result.error || "Failed to fetch seller offers" };
    }
    return { success: true, offers: result.offers };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch seller offers" };
  }
}
