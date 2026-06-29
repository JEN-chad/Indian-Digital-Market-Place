// Client-side wrappers that fetch our server-side API endpoints for Listings

function getAuthHeaders(userId?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  let id = userId;
  if (!id) {
    try {
      const saved = localStorage.getItem("fmi_auth_user");
      id = saved ? JSON.parse(saved)?.id : undefined;
    } catch {}
  }
  if (id) {
    headers["Authorization"] = `Bearer ${id}`;
  }
  return headers;
}

export async function createListingDraft(
  sellerId: string,
  initialData?: { title?: string; assetType?: string }
): Promise<{ success: boolean; listingId?: string; listing?: any; error?: string }> {
  try {
    const res = await fetch("/api/actions/create-listing-draft", {
      method: "POST",
      headers: getAuthHeaders(sellerId),
      body: JSON.stringify({ sellerId, initialData }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error creating draft listing" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to call draft listing creation service" };
  }
}

export async function updateListingStep(
  listingId: string,
  stepData: any
): Promise<{ success: boolean; listing?: any; error?: string }> {
  try {
    const res = await fetch("/api/actions/update-listing-step", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ listingId, stepData }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error updating listing step" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update listing step" };
  }
}

export async function uploadListingDocument(
  listingId: string,
  fileData: string,
  type: "financial" | "analytics" | "ownership" | "pitch_deck" | "other",
  name: string
): Promise<{ success: boolean; doc?: any; url?: string; cloudinaryId?: string; error?: string }> {
  try {
    const res = await fetch("/api/actions/upload-listing-document", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ listingId, fileData, type, name }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error uploading listing document" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to upload listing document" };
  }
}

export async function submitListingForReview(
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/actions/submit-listing-for-review", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ listingId }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error submitting listing" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit listing for review" };
  }
}

export async function getSellerListings(
  sellerId: string
): Promise<{ success: boolean; listings?: any[]; error?: string }> {
  try {
    const res = await fetch("/api/actions/get-seller-listings", {
      method: "POST",
      headers: getAuthHeaders(sellerId),
      body: JSON.stringify({ sellerId }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error fetching seller listings" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch seller listings" };
  }
}

export async function suggestAskingPrice(payload: {
  assetType: string;
  monthlyRevenue: number;
  monthlyProfit: number;
  yearEstablished: number | string;
}): Promise<{
  success: boolean;
  minPrice?: number;
  maxPrice?: number;
  recommendedPrice?: number;
  multiple?: string;
  reasoning?: string;
  error?: string;
}> {
  try {
    const res = await fetch("/api/ai/valuation", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error suggesting asking price" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch AI valuation" };
  }
}

export async function saveListingForBuyer(
  userId: string,
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/actions/save-listing", {
      method: "POST",
      headers: getAuthHeaders(userId),
      body: JSON.stringify({ userId, listingId }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error saving listing" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save listing" };
  }
}

export async function unsaveListingForBuyer(
  userId: string,
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/actions/unsave-listing", {
      method: "POST",
      headers: getAuthHeaders(userId),
      body: JSON.stringify({ userId, listingId }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error unsaving listing" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to unsave listing" };
  }
}

export async function trackListingView(
  userId: string,
  listingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/actions/track-view", {
      method: "POST",
      headers: getAuthHeaders(userId),
      body: JSON.stringify({ userId, listingId }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error tracking listing view" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to track listing view" };
  }
}


