import { Request, Response } from "express";
import crypto from "crypto";
import { db } from "@/lib/db/index.ts";
import { payments, ndaAgreements, listings, deals, users, messages } from "@/lib/db/schema.ts";
import { createNotification } from "@/lib/notifications.ts";
import { eq, and } from "drizzle-orm";
import { getPusherServer } from "@/lib/pusher.ts";
import { sendEmail } from "@/lib/resend.ts";

// Helper to push Pusher events safely
async function triggerPusher(dealId: string, eventName: string, data: any) {
  try {
    const pusher = getPusherServer();
    await pusher.trigger(`deal-${dealId}`, eventName, data);
  } catch (err) {
    console.warn(`[Pusher Webhook Warning] Failed to trigger ${eventName} for deal ${dealId}:`, err);
  }
}

// Helper to create system chat message
async function createSystemMessage(dealId: string, content: string) {
  try {
    await db.insert(messages).values({
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(4)}`,
      dealId,
      senderId: "00000000-0000-0000-0000-000000000000", // System UUID placeholder
      content,
      type: "system",
      isRead: false,
    });
    await triggerPusher(dealId, "new-message", { type: "system", content });
  } catch (err) {
    console.error("Failed to create system message:", err);
  }
}

export async function razorpayWebhookHandler(req: Request, res: Response) {
  try {
    console.log("Received Razorpay Webhook Event...");

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"] as string;

    let isValid = false;

    if (!secret || !signature) {
      if (process.env.NODE_ENV === "development") {
        console.log("[DEV ONLY] Bypassing Razorpay webhook signature verification.");
        isValid = true;
      }
    } else {
      try {
        const rawBody = (req as any).rawBody || JSON.stringify(req.body);
        const shasum = crypto.createHmac("sha256", secret);
        shasum.update(rawBody);
        const digest = shasum.digest("hex");
        isValid = digest === signature;
      } catch (err) {
        console.error("Error verifying Razorpay webhook signature:", err);
      }
    }

    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature verification" });
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`Razorpay Event: ${event}`);

    // Return 200 OK immediately to satisfy Razorpay timeout requirements
    res.status(200).json({ status: "received" });

    if (event === "payment.captured") {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const paymentRecordId = paymentEntity.notes?.paymentRecordId || paymentEntity.notes?.paymentId;

      // Find the corresponding database record
      let paymentRecord;
      if (paymentRecordId) {
        [paymentRecord] = await db.select().from(payments).where(eq(payments.id, paymentRecordId)).limit(1);
      }
      if (!paymentRecord && orderId) {
        [paymentRecord] = await db.select().from(payments).where(eq(payments.providerOrderId, orderId)).limit(1);
      }

      if (!paymentRecord) {
        console.error(`Payment record not found for Order ID: ${orderId}, Notes ID: ${paymentRecordId}`);
        return;
      }

      // Update payment record status
      await db.update(payments)
        .set({
          status: "paid",
          providerPaymentId: paymentId,
          paidAt: new Date(),
        })
        .where(eq(payments.id, paymentRecord.id));

      console.log(`Payment updated to PAID. ID: ${paymentRecord.id}, Purpose: ${paymentRecord.purpose}`);

      // Trigger purpose processing
      if (paymentRecord.purpose === "nda_fee" && paymentRecord.listingId) {
        const [listing] = await db.select().from(listings).where(eq(listings.id, paymentRecord.listingId)).limit(1);
        if (listing) {
          const resolvedBuyerId = paymentRecord.userId;
          const existingNda = await db.select().from(ndaAgreements).where(
            and(
              eq(ndaAgreements.listingId, listing.id),
              eq(ndaAgreements.buyerId, resolvedBuyerId)
            )
          ).limit(1);

          if (existingNda.length > 0) {
            await db.update(ndaAgreements).set({
              status: "signed",
              signedAt: new Date(),
              paymentId: paymentRecord.id,
              feePaid: paymentRecord.amount,
            }).where(eq(ndaAgreements.id, existingNda[0].id));
          } else {
            await db.insert(ndaAgreements).values({
              id: `nda-${Date.now()}-${Math.random().toString(36).substring(4)}`,
              listingId: listing.id,
              buyerId: resolvedBuyerId,
              status: "signed",
              signedAt: new Date(),
              paymentId: paymentRecord.id,
              feePaid: paymentRecord.amount,
            });
          }

          // Create notification for seller
          await createNotification(
            listing.sellerId,
            "nda_signed",
            "Confidentiality Agreement Signed",
            `An investor has signed the digital Mutual NDA and unlocked details for: "${listing.title}"`,
            { listingId: listing.id }
          );

          // Send email to seller & buyer
          const [seller] = await db.select().from(users).where(eq(users.id, listing.sellerId)).limit(1);
          const [buyer] = await db.select().from(users).where(eq(users.id, resolvedBuyerId)).limit(1);
          if (seller && seller.email) {
            await sendEmail({
              to: seller.email,
              subject: `[FMI] NDA Signed — ${listing.title}`,
              template: "nda-signed-seller",
              data: {
                sellerName: seller.name || "Seller",
                listingTitle: listing.title,
                buyerName: buyer?.name || "Investor",
              }
            });
          }
        }
      } else if (paymentRecord.purpose === "listing_fee" && paymentRecord.listingId) {
        await db.update(listings)
          .set({ status: "in_review", updatedAt: new Date() })
          .where(eq(listings.id, paymentRecord.listingId));

        await createNotification(
          paymentRecord.userId,
          "listing_fee_paid",
          "Listing Fee Paid",
          "Your listing fee payment was verified. Your listing is now under review.",
          { listingId: paymentRecord.listingId }
        );

        // Send email to seller
        const [seller] = await db.select().from(users).where(eq(users.id, paymentRecord.userId)).limit(1);
        const [listing] = await db.select().from(listings).where(eq(listings.id, paymentRecord.listingId)).limit(1);
        if (seller && seller.email && listing) {
          await sendEmail({
            to: seller.email,
            subject: `[FMI] Listing Under Review — ${listing.title}`,
            template: "listing-submitted",
            data: {
              sellerName: seller.name || "Seller",
              listingTitle: listing.title,
            }
          });
        }
      } else if (paymentRecord.purpose === "escrow" && paymentRecord.dealId) {
        await db.update(deals)
          .set({
            escrowStatus: "funded",
            stage: "transfer",
            updatedAt: new Date(),
          })
          .where(eq(deals.id, paymentRecord.dealId));

        const [deal] = await db.select().from(deals).where(eq(deals.id, paymentRecord.dealId)).limit(1);
        if (deal) {
          // Chat log message
          await createSystemMessage(deal.id, "Escrow funding verified. Payout hold is active. Advancing stage to TRANSFER.");

          // Notify parties
          await createNotification(
            deal.buyerId,
            "escrow_funded",
            "Escrow Funding Verified",
            "Your escrow deposit was verified. Holdings are in secure custody.",
            { dealId: deal.id }
          );

          await createNotification(
            deal.sellerId,
            "escrow_funded",
            "Escrow Funding Verified",
            "Buyer's deposit was successfully verified by FMI. Please initiate asset handovers.",
            { dealId: deal.id }
          );

          // Send emails to buyer and seller
          const [buyer] = await db.select().from(users).where(eq(users.id, deal.buyerId)).limit(1);
          const [seller] = await db.select().from(users).where(eq(users.id, deal.sellerId)).limit(1);
          const [listing] = await db.select().from(listings).where(eq(listings.id, deal.listingId)).limit(1);
          const appUrl = process.env.VITE_APP_URL || "http://localhost:3000";
          const dealRoomUrl = `${appUrl}/deals/${deal.id}`;

          if (buyer && buyer.email) {
            await sendEmail({
              to: buyer.email,
              subject: `[FMI] Escrow Deposit Verified — ${listing?.title || "Listing"}`,
              template: "escrow-funded-buyer",
              data: {
                userName: buyer.name || "Buyer",
                listingTitle: listing?.title || "Listing",
                dealRoomUrl,
              }
            });
          }
          if (seller && seller.email) {
            await sendEmail({
              to: seller.email,
              subject: `[FMI] Escrow Deposit Verified! Start Handover — ${listing?.title || "Listing"}`,
              template: "escrow-funded-seller",
              data: {
                userName: seller.name || "Seller",
                listingTitle: listing?.title || "Listing",
                dealRoomUrl,
              }
            });
          }

          await triggerPusher(deal.id, "escrow-updated", { status: "funded" });
          await triggerPusher(deal.id, "stage-changed", { stage: "transfer" });
        }
      }
    } else if (event === "payment.failed") {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentRecordId = paymentEntity.notes?.paymentRecordId || paymentEntity.notes?.paymentId;

      let paymentRecord;
      if (paymentRecordId) {
        [paymentRecord] = await db.select().from(payments).where(eq(payments.id, paymentRecordId)).limit(1);
      }
      if (!paymentRecord && orderId) {
        [paymentRecord] = await db.select().from(payments).where(eq(payments.providerOrderId, orderId)).limit(1);
      }

      if (paymentRecord) {
        await db.update(payments)
          .set({ status: "failed" })
          .where(eq(payments.id, paymentRecord.id));

        await createNotification(
          paymentRecord.userId,
          "payment_failed",
          "Payment Failed",
          `Your payment transaction of ₹${paymentRecord.amount} for "${paymentRecord.purpose}" was declined.`,
          { paymentId: paymentRecord.id }
        );

        // Send email to user
        const [userObj] = await db.select().from(users).where(eq(users.id, paymentRecord.userId)).limit(1);
        if (userObj && userObj.email) {
          await sendEmail({
            to: userObj.email,
            subject: `[FMI] Payment Failed Alert`,
            template: "payment-failed",
            data: {
              userName: userObj.name || "Member",
              amount: paymentRecord.amount,
              purpose: paymentRecord.purpose,
            }
          });
        }
      }
    } else if (event === "refund.created") {
      const refundEntity = payload.refund.entity;
      const paymentId = refundEntity.payment_id;

      const [paymentRecord] = await db.select().from(payments).where(eq(payments.providerPaymentId, paymentId)).limit(1);
      if (paymentRecord) {
        await db.update(payments)
          .set({ status: "refunded" })
          .where(eq(payments.id, paymentRecord.id));

        await createNotification(
          paymentRecord.userId,
          "payment_refunded",
          "Payment Refunded",
          `A refund of ₹${paymentRecord.amount} was processed for transaction: "${paymentRecord.id}"`,
          { paymentId: paymentRecord.id }
        );

        // Send email to user
        const [userObj] = await db.select().from(users).where(eq(users.id, paymentRecord.userId)).limit(1);
        if (userObj && userObj.email) {
          await sendEmail({
            to: userObj.email,
            subject: `[FMI] Refund Processed`,
            template: "payment-refunded",
            data: {
              userName: userObj.name || "Member",
              amount: paymentRecord.amount,
            }
          });
        }
      }
    }
  } catch (error: any) {
    console.error("Razorpay webhook handler error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
}
