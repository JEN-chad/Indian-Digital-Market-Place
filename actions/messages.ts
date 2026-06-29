import { eq, and, ne, desc } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { deals, messages, users } from "../lib/db/schema.ts";
import { getPusherServer } from "../lib/pusher.ts";

// Helper to push Pusher events safely
async function triggerPusher(dealId: string, eventName: string, data: any) {
  try {
    const pusher = getPusherServer();
    await pusher.trigger(`deal-${dealId}`, eventName, data);
  } catch (err) {
    console.warn(`[Pusher Warning] Failed to trigger ${eventName} for deal ${dealId}:`, err);
  }
}

export async function sendMessage(
  dealId: string,
  senderId: string,
  content: string,
  type: "text" | "system" | "document" = "text",
  documentUrl?: string
) {
  try {
    // 1. Validate deal exists
    const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
    if (!deal) {
      return { success: false, error: "Deal not found" };
    }

    // 2. Validate sender is a participant (buyer, seller, or system/admin)
    const isSystem = senderId === "00000000-0000-0000-0000-000000000000";
    if (!isSystem && deal.buyerId !== senderId && deal.sellerId !== senderId) {
      const [senderUser] = await db.select().from(users).where(eq(users.id, senderId)).limit(1);
      if (senderUser?.role !== "admin") {
        return { success: false, error: "Access Denied. You are not a participant in this deal." };
      }
    }

    // 3. Insert message
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(4)}`;
    const [inserted] = await db
      .insert(messages)
      .values({
        id: messageId,
        dealId,
        senderId,
        content,
        type,
        documentUrl: documentUrl || null,
        isRead: false,
        createdAt: new Date(),
      })
      .returning();

    // 4. Get sender details
    let senderName = "System";
    let senderAvatarUrl = null;
    if (!isSystem) {
      const [user] = await db.select().from(users).where(eq(users.id, senderId)).limit(1);
      if (user) {
        senderName = user.name || "Participant";
        senderAvatarUrl = user.avatarUrl || null;
      }
    }

    const messageWithSender = {
      ...inserted,
      senderName,
      senderAvatarUrl,
    };

    // 5. Trigger Pusher 'new-message'
    await triggerPusher(dealId, "new-message", { message: messageWithSender });

    return { success: true, message: messageWithSender };
  } catch (error: any) {
    console.error("Error in sendMessage server action:", error);
    return { success: false, error: error.message };
  }
}

export async function markMessagesRead(dealId: string, userId: string) {
  try {
    // Validate deal participant
    const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
    if (!deal) {
      return { success: false, error: "Deal not found" };
    }
    if (deal.buyerId !== userId && deal.sellerId !== userId) {
      return { success: false, error: "Access Denied." };
    }

    // Update unread messages sent by the other user to is_read = true
    const updated = await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.dealId, dealId),
          ne(messages.senderId, userId),
          eq(messages.isRead, false)
        )
      )
      .returning();

    // Trigger read-receipt event on Pusher
    const lastReadAt = new Date().toISOString();
    await triggerPusher(dealId, "read-receipt", { userId, lastReadAt });

    return { success: true, count: updated.length };
  } catch (error: any) {
    console.error("Error in markMessagesRead server action:", error);
    return { success: false, error: error.message };
  }
}
