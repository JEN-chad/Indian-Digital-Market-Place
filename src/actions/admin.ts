// Client-side wrappers for admin actions

export async function getAdminStats() {
  const res = await fetch("/api/admin/stats");
  if (!res.ok) throw new Error("Failed to fetch admin stats");
  return await res.json();
}

export async function getAdminListings() {
  const res = await fetch("/api/admin/listings");
  if (!res.ok) throw new Error("Failed to fetch admin listings");
  return await res.json();
}

export async function getAdminKyc() {
  const res = await fetch("/api/admin/kyc");
  if (!res.ok) throw new Error("Failed to fetch admin KYC profiles");
  return await res.json();
}

export async function getAdminDeals() {
  const res = await fetch("/api/admin/deals");
  if (!res.ok) throw new Error("Failed to fetch admin deals");
  return await res.json();
}

export async function getAdminUsers() {
  const res = await fetch("/api/admin/users");
  if (!res.ok) throw new Error("Failed to fetch admin users");
  return await res.json();
}

export async function approveListing(id: string) {
  const res = await fetch(`/api/admin/listings/${id}/approve`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to approve listing");
  return await res.json();
}

export async function rejectListing(id: string, reason: string) {
  const res = await fetch(`/api/admin/listings/${id}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Failed to reject listing");
  return await res.json();
}

export async function featureListing(id: string, featured: boolean) {
  const res = await fetch(`/api/admin/listings/${id}/feature`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ featured }),
  });
  if (!res.ok) throw new Error("Failed to feature listing");
  return await res.json();
}

export async function approveKyc(userId: string) {
  const res = await fetch(`/api/admin/kyc/${userId}/approve`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to approve KYC");
  return await res.json();
}

export async function rejectKyc(userId: string, reason: string) {
  const res = await fetch(`/api/admin/kyc/${userId}/reject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Failed to reject KYC");
  return await res.json();
}

export async function suspendUser(userId: string, reason: string) {
  const res = await fetch(`/api/admin/users/${userId}/suspend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) throw new Error("Failed to suspend user");
  return await res.json();
}

export async function analyzeListing(listingId: string) {
  const res = await fetch("/api/ai/analyze-listing", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ listingId }),
  });
  if (!res.ok) throw new Error("Failed to analyze listing");
  return await res.json();
}
