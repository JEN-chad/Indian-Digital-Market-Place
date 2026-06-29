// Client-side wrappers that fetch our server-side API endpoints for KYC/Onboarding

import { KycFormData, BuyerProfileData } from "../../actions/kyc.ts";

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

export async function submitKyc(data: KycFormData): Promise<{ success: boolean; profileId?: string; error?: string }> {
  try {
    const res = await fetch("/api/actions/submit-kyc", {
      method: "POST",
      headers: getAuthHeaders(data.userId),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error submitting KYC" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to call KYC submission service" };
  }
}

export async function getKycStatus(userId: string): Promise<{ status: string; rejectionReason?: string; reviewedAt?: any; error?: string }> {
  try {
    const res = await fetch("/api/actions/get-kyc-status", {
      method: "POST",
      headers: getAuthHeaders(userId),
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { status: "not_started", error: errData.error || "Network error fetching KYC status" };
    }
    return await res.json();
  } catch (error: any) {
    return { status: "not_started", error: error.message || "Failed to fetch KYC status" };
  }
}

export async function updateRole(userId: string, role: "buyer" | "seller" | "both"): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/actions/update-role", {
      method: "POST",
      headers: getAuthHeaders(userId),
      body: JSON.stringify({ userId, role }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error updating role" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update user role" };
  }
}

export async function saveBuyerInterests(data: BuyerProfileData): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/actions/save-buyer-interests", {
      method: "POST",
      headers: getAuthHeaders(data.userId),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error saving buyer interests" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to save buyer interests" };
  }
}

// Upload document utility
export async function uploadDocument(base64File: string, folder?: string): Promise<{ success: boolean; secure_url?: string; error?: string }> {
  try {
    const res = await fetch("/api/documents/upload", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ file: base64File, folder }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error uploading document" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to upload document" };
  }
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; phone?: string; avatarUrl?: string }
): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    const res = await fetch("/api/actions/update-user-profile", {
      method: "POST",
      headers: getAuthHeaders(userId),
      body: JSON.stringify({ userId, data }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error updating user profile" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update user profile" };
  }
}


