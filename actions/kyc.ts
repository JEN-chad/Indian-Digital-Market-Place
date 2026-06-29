"use server";

import { desc, eq } from "drizzle-orm";
import { assertPersistentDatabaseAvailable, db, persistentDb } from "../lib/db/index.ts";
import { users, kycProfiles, buyerProfiles } from "../lib/db/schema.ts";
import { getResend, EMAIL_FROM, sendEmail } from "../lib/resend.ts";
import { createNotification } from "../lib/notifications.ts";


export interface KycFormData {
  userId: string;
  kycType: "individual" | "company";
  fullName?: string;
  dob?: string;
  street?: string;
  city?: string;
  state?: string;
  pinCode?: string;
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

    await assertPersistentDatabaseAvailable("Submitting KYC");

    const reviewStatus = "in_review" as const;
    const submittedAt = new Date();
    const profileValues = {
      userId: data.userId,
      fullName: data.fullName || null,
      dob: data.dob || null,
      street: data.street || null,
      city: data.city || null,
      state: data.state || null,
      pinCode: data.pinCode || null,
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
      status: reviewStatus,
      rejectionReason: null,
      reviewedBy: null,
      reviewedAt: null,
    };

    const { profile, user } = await persistentDb.transaction(async (tx) => {
      const [existingProfile] = await tx
        .select()
        .from(kycProfiles)
        .where(eq(kycProfiles.userId, data.userId))
        .orderBy(desc(kycProfiles.createdAt))
        .limit(1);

      let savedProfile;
      if (existingProfile) {
        [savedProfile] = await tx
          .update(kycProfiles)
          .set(profileValues)
          .where(eq(kycProfiles.id, existingProfile.id))
          .returning();
      } else {
        [savedProfile] = await tx
          .insert(kycProfiles)
          .values(profileValues)
          .returning();
      }

      const [updatedUser] = await tx
        .update(users)
        .set({
          kycStatus: reviewStatus,
          kycType: data.kycType,
          updatedAt: submittedAt,
        })
        .where(eq(users.id, data.userId))
        .returning();

      if (!updatedUser) {
        throw new Error("User not found for KYC submission");
      }

      return { profile: savedProfile, user: updatedUser };
    });

    try {
      await createNotification(
        data.userId,
        "kyc_submission",
        "KYC Submitted - Under Review",
        `Your ${data.kycType} KYC details have been successfully submitted and are currently under review.`,
        { profileId: profile?.id }
      );

      const adminUsers = await persistentDb.select().from(users).where(eq(users.role, "admin"));
      for (const admin of adminUsers) {
        await createNotification(
          admin.id,
          "kyc_submitted_admin",
          "New KYC Submission",
          `User ${user?.name || user?.email || "Member"} has submitted KYC documents for review.`,
          { userId: data.userId, profileId: profile?.id }
        );
      }

      if (user?.email) {
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
    } catch (sideEffectError) {
      console.error("KYC was persisted, but a notification/email side effect failed:", sideEffectError);
    }

    return { success: true, profileId: profile?.id, status: reviewStatus };
  } catch (error: any) {
    console.error("submitKyc error:", error);
    return { success: false, error: error.message || "Failed to submit KYC" };
  }
}
// 2. Get KYC Status
export async function getKycStatus(userId: string) {
  try {
    await assertPersistentDatabaseAvailable("Fetching KYC status");

    const [userRecord] = await persistentDb
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const [profile] = await persistentDb
      .select()
      .from(kycProfiles)
      .where(eq(kycProfiles.userId, userId))
      .orderBy(desc(kycProfiles.createdAt))
      .limit(1);

    if (!profile) {
      return { success: true, status: "not_started" as const, userKycStatus: userRecord?.kycStatus || "not_started" };
    }

    return {
      success: true,
      status: profile.status,
      userKycStatus: userRecord?.kycStatus || profile.status,
      rejectionReason: profile.rejectionReason,
      reviewedAt: profile.reviewedAt,
      profile,
    };
  } catch (error: any) {
    console.error("getKycStatus error:", error);
    return { success: false, status: "not_started" as const, userKycStatus: "not_started" as const, error: error.message };
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
