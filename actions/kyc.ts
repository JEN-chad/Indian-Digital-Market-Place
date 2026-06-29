"use server";

import { eq } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { users, kycProfiles, buyerProfiles } from "../lib/db/schema.ts";
import { getResend, EMAIL_FROM, sendEmail } from "../lib/resend.ts";
import { createNotification } from "../lib/notifications.ts";


export interface KycFormData {
  userId: string;
  kycType: "individual" | "company";
  panNumber?: string;
  aadhaarLast4?: string;
  panDocUrl?: string;
  aadhaarDocUrl?: string;
  selfieUrl?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankIfsc?: string;
  companyName?: string;
  cin?: string;
  gstin?: string;
  companyPan?: string;
  directorName?: string;
  directorPan?: string;
  directorAadhaarLast4?: string;
}

export interface BuyerProfileData {
  userId: string;
  industries: string[];
  states: string[];
  budgetMin: number;
  budgetMax: number;
  acquisitionGoal: string;
  experienceLevel: "first_time" | "some" | "experienced" | "serial";
}

// 1. Submit KYC
export async function submitKyc(data: KycFormData) {
  try {
    if (!data.userId) {
      return { success: false, error: "User ID is required" };
    }

    // Create kyc_profiles record with status='pending'
    const [profile] = await db.insert(kycProfiles).values({
      userId: data.userId,
      panNumber: data.panNumber || data.companyPan || "",
      aadhaarLast4: data.aadhaarLast4 || data.directorAadhaarLast4 || "",
      panDocUrl: data.panDocUrl || "",
      aadhaarDocUrl: data.aadhaarDocUrl || "",
      selfieUrl: data.selfieUrl || "",
      bankAccountName: data.bankAccountName || "",
      bankAccountNumber: data.bankAccountNumber || "",
      bankIfsc: data.bankIfsc || "",
      companyName: data.companyName || null,
      cin: data.cin || null,
      gstin: data.gstin || null,
      companyPan: data.companyPan || null,
      directorName: data.directorName || null,
      status: "pending",
    }).returning();

    // Update users.kycStatus='pending' and kycType
    await db.update(users)
      .set({
        kycStatus: "pending",
        kycType: data.kycType,
      })
      .where(eq(users.id, data.userId));

    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, data.userId)
    });

    // Create notification for user
    await createNotification(
      data.userId,
      "kyc_submission",
      "KYC Submitted - Under Review",
      `Your ${data.kycType} KYC details have been successfully submitted and are currently under review.`,
      { profileId: profile?.id }
    );

    // Create notifications for admin users
    const adminUsers = await db.select().from(users).where(eq(users.role, "admin"));
    for (const admin of adminUsers) {
      await createNotification(
        admin.id,
        "kyc_submitted_admin",
        "New KYC Submission",
        `User ${user?.name || user?.email || "Member"} has submitted KYC documents for review.`,
        { userId: data.userId, profileId: profile?.id }
      );
    }

    // Send email to user via Resend
    if (user && user.email) {
      await sendEmail({
        to: user.email,
        subject: "FMI - KYC Submitted Successfully",
        template: "kyc-submitted",
        data: {
          name: user.name || "Member",
          kycType: data.kycType,
          submittedDocs: [
            "PAN Card/Company PAN",
            "Aadhaar/Director Aadhaar",
            "Selfie Photo",
            ...(data.kycType === "company" ? ["GSTIN Certificate", "CIN Certificate"] : [])
          ]
        }
      });
    }

    // In DEV: after 3s delay, auto-approve
    if (process.env.NODE_ENV === "development") {
      setTimeout(async () => {
        try {
          console.log(`[DEV ONLY] Simulating KYC Auto-Approval for user ${data.userId}...`);
          await db.update(kycProfiles)
            .set({ status: "approved" })
            .where(eq(kycProfiles.userId, data.userId));
          await db.update(users)
            .set({ kycStatus: "approved" })
            .where(eq(users.id, data.userId));
          
          // Add approved notification (handles DB + Pusher)
          await createNotification(
            data.userId,
            "kyc_approval",
            "KYC Approved",
            "Congratulations! Your KYC verification has been automatically approved."
          );

          // Send approval email
          if (user && user.email) {
            await sendEmail({
              to: user.email,
              subject: "🎉 Your KYC has been approved!",
              template: "kyc-approved",
              data: { name: user.name || "Member" }
            });
          }
        } catch (autoApproveErr) {
          console.error("Error in KYC simulation auto-approval:", autoApproveErr);
        }
      }, 3000);
    }

    return { success: true, profileId: profile?.id };
  } catch (error: any) {
    console.error("submitKyc error:", error);
    return { success: false, error: error.message || "Failed to submit KYC" };
  }
}

// 2. Get KYC Status
export async function getKycStatus(userId: string) {
  try {
    const profile = await db.query.kycProfiles.findFirst({
      where: eq(kycProfiles.userId, userId),
    });
    if (!profile) {
      return { status: "not_started" as const };
    }
    return {
      status: profile.status,
      rejectionReason: profile.rejectionReason,
      reviewedAt: profile.reviewedAt,
      profile,
    };
  } catch (error: any) {
    console.error("getKycStatus error:", error);
    return { status: "not_started" as const, error: error.message };
  }
}

// 3. Update Role
export async function updateRole(userId: string, role: "buyer" | "seller" | "both") {
  try {
    await db.update(users)
      .set({ role })
      .where(eq(users.id, userId));
    return { success: true };
  } catch (error: any) {
    console.error("updateRole error:", error);
    return { success: false, error: error.message || "Failed to update role" };
  }
}

// 4. Save Buyer Interests
export async function saveBuyerInterests(data: BuyerProfileData) {
  try {
    if (!data.userId) {
      return { success: false, error: "User ID is required" };
    }

    const existingProfile = await db.query.buyerProfiles.findFirst({
      where: eq(buyerProfiles.userId, data.userId),
    });

    if (existingProfile) {
      await db.update(buyerProfiles)
        .set({
          industries: data.industries,
          states: data.states,
          budgetMin: data.budgetMin,
          budgetMax: data.budgetMax,
          acquisitionGoal: data.acquisitionGoal,
          experienceLevel: data.experienceLevel,
        })
        .where(eq(buyerProfiles.userId, data.userId));
    } else {
      await db.insert(buyerProfiles).values({
        userId: data.userId,
        investorType: "individual",
        industries: data.industries,
        states: data.states,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        acquisitionGoal: data.acquisitionGoal,
        experienceLevel: data.experienceLevel,
        proofOfFundsVerified: false,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("saveBuyerInterests error:", error);
    return { success: false, error: error.message || "Failed to save buyer interests" };
  }
}

// 5. Update User Profile (Name, Phone, Avatar)
export async function updateUserProfile(userId: string, data: { name?: string; phone?: string; avatarUrl?: string }) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.avatarUrl !== undefined && data.avatarUrl) {
      let secureUrl = data.avatarUrl;
      if (data.avatarUrl.startsWith("data:") || !data.avatarUrl.startsWith("http")) {
        const { getCloudinary } = await import("../lib/cloudinary.ts");
        const cloudinaryInstance = getCloudinary();
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
          console.warn("[AVATAR UPLOAD FALLBACK] Cloudinary not configured. Storing data URL directly.");
          secureUrl = data.avatarUrl;
        } else {
          const uploadRes = await cloudinaryInstance.uploader.upload(data.avatarUrl, {
            folder: "fmi/avatars",
            resource_type: "image",
          });
          secureUrl = uploadRes.secure_url;
        }
      }
      updateData.avatarUrl = secureUrl;
    }

    const [updatedUser] = await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error("updateUserProfile error:", error);
    return { success: false, error: error.message || "Failed to update user profile" };
  }
}

