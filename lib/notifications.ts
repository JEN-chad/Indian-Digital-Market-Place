import { db } from "./db/index.ts";
import { notifications } from "./db/schema.ts";
import { getPusherServer } from "./pusher.ts";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body?: string | null,
  data?: any
) {
  try {
    const [inserted] = await db.insert(notifications).values({
      userId,
      type,
      title,
      body: body || null,
      data: data || null,
      isRead: false,
    }).returning();

    // Trigger Pusher event
    try {
      const pusher = getPusherServer();
      await pusher.trigger(`user-${userId}`, "notification", {
        id: inserted.id,
        userId,
        type,
        title,
        body,
        data,
        isRead: false,
        createdAt: inserted.createdAt,
      });
    } catch (pusherErr) {
      console.warn("Failed to trigger Pusher notification:", pusherErr);
    }

    return inserted;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}
