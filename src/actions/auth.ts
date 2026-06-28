// Client-side wrappers that fetch our server-side API endpoints

export async function sendEmailOtp(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/actions/send-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error || "Network error sending email OTP" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to call email OTP service" };
  }
}

export async function verifyEmailOtp(email: string, otp: string): Promise<{ success: boolean; userId?: string; user?: any; error?: string }> {
  try {
    const res = await fetch("/api/actions/verify-email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error || "Network error verifying email OTP" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to call email verification service" };
  }
}

export async function sendPhoneOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/actions/send-phone-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error || "Network error sending phone OTP" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to call phone OTP service" };
  }
}

export async function verifyPhoneOtp(phone: string, otp: string, email?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/actions/verify-phone-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, otp, email }),
    });
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.error || "Network error verifying phone OTP" };
    }
    return await res.json();
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to call phone verification service" };
  }
}
