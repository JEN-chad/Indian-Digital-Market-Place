import { Request, Response } from "express";
import { approveKyc, rejectKyc } from "@/actions/admin.ts";
import { db } from "@/lib/db/index.ts";
import { users } from "@/lib/db/schema.ts";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/resend.ts";

export async function kycWebhookHandler(req: Request, res: Response) {
  try {
    const { userId, status, reason } = req.body;

    if (!userId || !status) {
      return res.status(400).json({ error: "Missing required fields: userId and status are required." });
    }

    if (status !== "approved" && status !== "rejected") {
      return res.status(400).json({ error: "Invalid status. Must be 'approved' or 'rejected'." });
    }

    console.log(`Received KYC Webhook. User: ${userId}, Status: ${status}, Reason: ${reason}`);

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const mockAdminId = "00000000-0000-0000-0000-000000000001"; // seeded system admin id

    if (status === "approved") {
      await approveKyc(userId, mockAdminId);
      
      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: "🎉 Your KYC Verification has been Approved!",
          template: "kyc-approved",
          data: { name: user.name || "Member" },
        });
      }
    } else {
      await rejectKyc(userId, reason || "Documents could not be verified", mockAdminId);

      if (user.email) {
        await sendEmail({
          to: user.email,
          subject: "FMI - KYC Verification Failed",
          template: "kyc-rejected",
          data: {
            name: user.name || "Member",
            reason: reason || "Identity document mismatched with profile details.",
          },
        });
      }
    }

    return res.status(200).json({ success: true, message: `KYC processed as ${status}` });
  } catch (error: any) {
    console.error("KYC Webhook handler error:", error);
    return res.status(500).json({ error: error.message });
  }
}
