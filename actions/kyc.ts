"use server";

import { eq } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { users, kycProfiles, buyerProfiles, notifications } from "../lib/db/schema.ts";
import { getResend, EMAIL_FROM } from "../lib/resend.ts";

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

    // Create notification for admin
    await db.insert(notifications).values({
      userId: data.userId,
      type: "kyc_submission",
      title: "KYC Submitted - Under Review",
      body: `Your ${data.kycType} KYC details have been successfully submitted and are currently under review.`,
      isRead: false,
    });

    // Send email via Resend
    const resend = getResend();
    const user = await db.query.users.findFirst({
      where: eq(users.id, data.userId)
    });

    if (user && user.email) {
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: user.email,
          subject: "FMI - KYC Submitted Successfully",
          html: `
            <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1a1a1a;">
              <h2 style="color: #1d4429;">FMI Digital Exchange</h2>
              <p>Hello ${user.name || "Member"},</p>
              <p>We have successfully received your <strong>${data.kycType} KYC submission</strong>.</p>
              <p>Our verification team is currently reviewing your documents. This process usually takes 24 to 48 hours.</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <strong>Status:</strong> Under Review (Pending)<br/>
                <strong>Submission Type:</strong> ${data.kycType === "individual" ? "Individual Identity Verification" : "Corporate Entity Verification"}<br/>
                <strong>Date:</strong> ${new Date().toLocaleDateString()}
              </div>
              <p>We will notify you immediately once your verification is completed. You can check your progress in the FMI portal.</p>
              <hr style="border: none; border-top: 1px border #e5e7eb; margin: 20px 0;" />
              <p style="font-size: 11px; color: #9ca3af;">This is an automated message. Please do not reply directly to this email.</p>
            </div>
          `
        });
      } catch (err) {
        console.error("Failed to send KYC submission email via Resend:", err);
      }
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
          
          // Add approved notification
          await db.insert(notifications).values({
            userId: data.userId,
            type: "kyc_approval",
            title: "KYC Approved",
            body: "Congratulations! Your KYC verification has been automatically approved.",
            isRead: false,
          });

          // Send approval email
          if (user && user.email) {
            await resend.emails.send({
              from: EMAIL_FROM,
              to: user.email,
              subject: "FMI - KYC Approved!",
              html: `
                <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #1a1a1a;">
                  <h2 style="color: #1d4429;">FMI Digital Exchange</h2>
                  <p>Hello ${user.name || "Member"},</p>
                  <p>Great news! Your <strong>KYC verification has been APPROVED</strong>.</p>
                  <p>You now have full access to FMI features including viewing private details of premium listings, signing NDAs, making offers, and entering Deal Rooms.</p>
                  <p>We are excited to have you as a verified member of the exchange.</p>
                  <hr style="border: none; border-top: 1px border #e5e7eb; margin: 20px 0;" />
                  <p style="font-size: 11px; color: #9ca3af;">This is an automated message. Please do not reply directly to this email.</p>
                </div>
              `
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

