// Client-side wrappers that fetch our server-side API endpoints for Dashboards

export async function getBuyerDashboardData(
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch("/api/actions/get-buyer-dashboard-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error fetching buyer dashboard" };
    }
    const result = await res.json();
    if (result.success) {
      return { success: true, data: result };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch buyer dashboard" };
  }
}

export async function getSellerDashboardData(
  userId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const res = await fetch("/api/actions/get-seller-dashboard-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const errData = await res.json();
      return { success: false, error: errData.error || "Network error fetching seller dashboard" };
    }
    const result = await res.json();
    if (result.success) {
      return { success: true, data: result };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch seller dashboard" };
  }
}
