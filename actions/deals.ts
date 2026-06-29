import { eq, and, ne, or } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { deals, dealDocuments, dealChecklistItems, messages, notifications, users, listings, offers } from "../lib/db/schema.ts";
import { createNotification } from "../lib/notifications.ts";
import { getPusherServer } from "../lib/pusher.ts";
import { sendEmail } from "../lib/resend.ts";


// Linear stage progression array
export const DEAL_STAGES = ["due_diligence", "agreement", "escrow", "transfer", "closed"] as const;
export type DealStage = typeof DEAL_STAGES[number];

// In-memory escrow approvals tracker for dual-approval
const escrowApprovals = new Map<string, { buyer: boolean; seller: boolean }>();

// Helper to push Pusher events safely
async function triggerPusher(dealId: string, eventName: string, data: any) {
  try {
    const pusher = getPusherServer();
    await pusher.trigger(`deal-${dealId}`, eventName, data);
  } catch (err) {
    console.warn(`[Pusher Warning] Failed to trigger ${eventName} for deal ${dealId}:`, err);
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

// 17. getDeal
export async function getDeal(dealId: string, userId: string) {
  try {
    const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
    if (!deal) {
      return { success: false, error: "Deal not found" };
    }

    // Verify participant authorization (buyer, seller, or admin role)
    const [userObj] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const isAdmin = userObj?.role === "admin";
    if (deal.buyerId !== userId && deal.sellerId !== userId && !isAdmin) {
      return { success: false, error: "Access Denied. You are not a registered participant in this deal room." };
    }

    // Fetch listing
    const [listing] = await db.select().from(listings).where(eq(listings.id, deal.listingId)).limit(1);
    
    // Fetch original offer
    const [offer] = await db.select().from(offers).where(eq(offers.id, deal.offerId)).limit(1);

    // Fetch checklist items
    const checklist = await db.select().from(dealChecklistItems).where(eq(dealChecklistItems.dealId, dealId));

    // Fetch documents enforce visibility
    const rawDocs = await db.select().from(dealDocuments).where(eq(dealDocuments.dealId, dealId));
    const filteredDocs = rawDocs.filter((doc) => {
      if (isAdmin) return true;
      if (doc.visibility === "both") return true;
      if (doc.visibility === "buyer_only" && userId === deal.buyerId) return true;
      if (doc.visibility === "seller_only" && userId === deal.sellerId) return true;
      return false;
    });

    // Fetch parties names
    const [buyerUser] = await db.select().from(users).where(eq(users.id, deal.buyerId)).limit(1);
    const [sellerUser] = await db.select().from(users).where(eq(users.id, deal.sellerId)).limit(1);

    // Get current escrow approval state
    const approval = escrowApprovals.get(dealId) || { buyer: false, seller: false };

    return {
      success: true,
      deal: {
        ...deal,
        listing,
        offer,
        checklist,
        documents: filteredDocs,
        buyerName: buyerUser?.name || "Buyer",
        buyerEmail: buyerUser?.email || "buyer@fmi.digital",
        sellerName: sellerUser?.name || "Seller",
        sellerEmail: sellerUser?.email || "seller@fmi.digital",
        escrowApproved: approval,
      },
    };
  } catch (error: any) {
    console.error("Error in getDeal action:", error);
    return { success: false, error: error.message };
  }
}

// 18. advanceDealStage
export async function advanceDealStage(dealId: string, newStage: DealStage, userId: string) {
  try {
    const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
    if (!deal) {
      return { success: false, error: "Deal not found" };
    }

    // Auth check
    const [userObj] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const isAdmin = userObj?.role === "admin";
    if (deal.buyerId !== userId && deal.sellerId !== userId && !isAdmin) {
      return { success: false, error: "Unauthorized operation." };
    }

    const currentIdx = DEAL_STAGES.indexOf(deal.stage as any);
    const nextIdx = DEAL_STAGES.indexOf(newStage);

    if (currentIdx === -1 || nextIdx === -1) {
      return { success: false, error: "Invalid stage specified." };
    }

    // Validate sequential progress
    if (nextIdx !== currentIdx + 1) {
      return { success: false, error: `Stage progression must be sequential. Cannot jump from "${deal.stage}" to "${newStage}".` };
    }

    // Update deal stage
    await db.update(deals)
      .set({ stage: newStage, updatedAt: new Date() })
      .where(eq(deals.id, dealId));

    // Create system message
    const formattedStage = newStage.replace("_", " ").toUpperCase();
    await createSystemMessage(dealId, `Deal workspace moved to [${formattedStage}] stage.`);

    // Trigger Pusher event
    await triggerPusher(dealId, "stage-changed", { stage: newStage });

    // Create notifications for both parties
    const otherUserId = userId === deal.buyerId ? deal.sellerId : deal.buyerId;
    await createNotification(
      otherUserId,
      "stage_advanced",
      `Deal Stage Updated: ${formattedStage}`,
      `Your active transaction workspace has progressed to the ${formattedStage} stage.`,
      { dealId }
    );
    await createNotification(
      userId,
      "stage_advanced",
      `Deal Stage Updated: ${formattedStage}`,
      `Your active transaction workspace has progressed to the ${formattedStage} stage.`,
      { dealId }
    );

    // Send Deal Stage Change Emails
    try {
      const [buyer] = await db.select().from(users).where(eq(users.id, deal.buyerId)).limit(1);
      const [seller] = await db.select().from(users).where(eq(users.id, deal.sellerId)).limit(1);
      const [listing] = await db.select().from(listings).where(eq(listings.id, deal.listingId)).limit(1);
      const appUrl = process.env.VITE_APP_URL || "http://localhost:3000";
      const dealRoomUrl = `${appUrl}/deals/${deal.id}`;

      const stageDescriptions: Record<string, string> = {
        due_diligence: "Both parties are reviewing financial and operational records. Verification documents are uploaded to the vault.",
        agreement: "The purchase agreement is being finalized and requires digital signatures from both parties.",
        escrow: "Buyer funds the secure escrow account to lock down the transaction and confirm payment capability.",
        transfer: "Escrow funded! Seller is transferring hosting, codebases, domains, and credential controls to the buyer.",
        closed: "🎉 Transaction completed! All assets transferred and escrow released.",
      };

      const stageActions: Record<string, string[]> = {
        due_diligence: [
          "Buyer: Review verified files in document vault",
          "Seller: Respond to buyer messages and questions",
        ],
        agreement: [
          "Buyer: Read and digitally sign the Purchase Agreement",
          "Seller: Read and digitally sign the Purchase Agreement",
        ],
        escrow: [
          "Buyer: Complete escrow deposit wire instructions",
          "Seller: Await confirmation of escrow funding",
        ],
        transfer: [
          "Seller: Handover domain, code, and admin permissions",
          "Buyer: Confirm asset reception and verify details",
        ],
        closed: [
          "Both: Leave transaction review/rating for counterparty",
        ],
      };

      if (buyer && buyer.email) {
        await sendEmail({
          to: buyer.email,
          subject: `[FMI] Deal Stage Update: ${formattedStage}`,
          template: "deal-stage-change",
          data: {
            userName: buyer.name || "Buyer",
            listingTitle: listing?.title || "Listing",
            stageName: formattedStage,
            stageDescription: stageDescriptions[newStage] || "The transaction has moved to the next phase.",
            requiredActions: stageActions[newStage] || [],
            dealRoomUrl,
          }
        });
      }

      if (seller && seller.email) {
        await sendEmail({
          to: seller.email,
          subject: `[FMI] Deal Stage Update: ${formattedStage}`,
          template: "deal-stage-change",
          data: {
            userName: seller.name || "Seller",
            listingTitle: listing?.title || "Listing",
            stageName: formattedStage,
            stageDescription: stageDescriptions[newStage] || "The transaction has moved to the next phase.",
            requiredActions: stageActions[newStage] || [],
            dealRoomUrl,
          }
        });
      }
    } catch (emailErr) {
      console.error("Failed to send stage change emails:", emailErr);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error advancing deal stage:", error);
    return { success: false, error: error.message };
  }
}

// 19. completeChecklistItem
export async function completeChecklistItem(itemId: string, dealId: string, userId: string) {
  try {
    const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
    if (!deal) {
      return { success: false, error: "Deal not found" };
    }

    const [item] = await db.select().from(dealChecklistItems).where(eq(dealChecklistItems.id, itemId)).limit(1);
    if (!item) {
      return { success: false, error: "Checklist item not found" };
    }

    if (item.dealId !== dealId) {
      return { success: false, error: "Item does not belong to this deal." };
    }

    // Validation current user is assigned to this item
    const isBuyer = userId === deal.buyerId;
    const isSeller = userId === deal.sellerId;
    const [userObj] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const isAdmin = userObj?.role === "admin";

    if (item.assignedTo === "buyer" && !isBuyer && !isAdmin) {
      return { success: false, error: "Unauthorized. This task is assigned to the Buyer." };
    }
    if (item.assignedTo === "seller" && !isSeller && !isAdmin) {
      return { success: false, error: "Unauthorized. This task is assigned to the Seller." };
    }
    if (item.assignedTo === "platform" && !isAdmin) {
      return { success: false, error: "Unauthorized. This task is assigned to Platform Administrators." };
    }

    // Toggle completion status
    const newStatus = !item.isCompleted;

    await db.update(dealChecklistItems)
      .set({
        isCompleted: newStatus,
        completedBy: newStatus ? userId : null,
        completedAt: newStatus ? new Date() : null,
      })
      .where(eq(dealChecklistItems.id, itemId));

    // Create system message and trigger notifications
    const actorRole = isBuyer ? "Buyer" : isSeller ? "Seller" : "Platform Admin";
    const statusText = newStatus ? "completed" : "reopened";
    await createSystemMessage(dealId, `${actorRole} marked task "${item.title}" as ${statusText}.`);

    // Trigger Pusher
    await triggerPusher(dealId, "checklist-updated", { itemId, isCompleted: newStatus });

    const otherPartyId = isBuyer ? deal.sellerId : deal.buyerId;
    await createNotification(
      otherPartyId,
      "checklist_updated",
      `Task ${statusText.toUpperCase()}`,
      `${actorRole} ${statusText}: "${item.title}"`,
      { dealId }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error completing checklist item:", error);
    return { success: false, error: error.message };
  }
}

// 20. signAgreement
export async function signAgreement(dealId: string, role: "buyer" | "seller", userId: string) {
  try {
    const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
    if (!deal) {
      return { success: false, error: "Deal not found" };
    }

    // Validation
    if (role === "buyer" && deal.buyerId !== userId) {
      return { success: false, error: "Unauthorized signature attempt." };
    }
    if (role === "seller" && deal.sellerId !== userId) {
      return { success: false, error: "Unauthorized signature attempt." };
    }

    const updateObj: any = {};
    if (role === "buyer") {
      updateObj.buyerSigned = true;
    } else {
      updateObj.sellerSigned = true;
    }

    // Check if other party signed too
    const otherSigned = role === "buyer" ? deal.sellerSigned : deal.buyerSigned;
    if (otherSigned) {
      updateObj.signedAt = new Date();
      updateObj.stage = "escrow";
    }

    await db.update(deals).set(updateObj).where(eq(deals.id, dealId));

    // Create system logs
    const signerRole = role === "buyer" ? "Buyer" : "Seller";
    await createSystemMessage(dealId, `Purchase Agreement formally signed and timestamped by ${signerRole}.`);

    if (otherSigned) {
      await createSystemMessage(dealId, "Purchase Agreement fully executed. Both signatures securely recorded. Advancing stage to ESCROW.");
      await triggerPusher(dealId, "stage-changed", { stage: "escrow" });
    }

    await triggerPusher(dealId, "agreement-signed", { role });

    // Notify other party
    const otherUserId = role === "buyer" ? deal.sellerId : deal.buyerId;
    await createNotification(
      otherUserId,
      "agreement_signed",
      `Agreement Signed by ${signerRole}`,
      `The ${signerRole} has signed the Purchase Agreement. View signing state in the Deal Room.`,
      { dealId }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error signing agreement:", error);
    return { success: false, error: error.message };
  }
}

// 21. initiateEscrow
export async function initiateEscrow(dealId: string) {
  try {
    const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
    if (!deal) {
      return { success: false, error: "Deal not found" };
    }

    const ref = "ESC-" + Math.floor(100000 + Math.random() * 900000);
    await db.update(deals)
      .set({
        escrowStatus: "pending",
        escrowReference: ref,
        updatedAt: new Date(),
      })
      .where(eq(deals.id, dealId));

    await createSystemMessage(dealId, `Escrow workspace initiated. Deposit Reference: ${ref}. Waiting for buyer wire verification...`);

    // Notify parties
    await createNotification(
      deal.buyerId,
      "escrow_updated",
      "Escrow Initiated",
      `FMI safe custody escrow initiated. Reference: ${ref}. Fund the account to progress.`,
      { dealId }
    );
    await createNotification(
      deal.sellerId,
      "escrow_updated",
      "Escrow Initiated",
      `Buyer was issued the escrow funding wire instructions. Reference: ${ref}.`,
      { dealId }
    );

    await triggerPusher(dealId, "escrow-updated", { status: "pending", reference: ref });

    return { success: true, escrowReference: ref };
  } catch (error: any) {
    console.error("Error initiating escrow:", error);
    return { success: false, error: error.message };
  }
}

// 22. releaseEscrow
export async function releaseEscrow(dealId: string, role: "buyer" | "seller") {
  try {
    const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
    if (!deal) {
      return { success: false, error: "Deal not found" };
    }

    const currentApprovals = escrowApprovals.get(dealId) || { buyer: false, seller: false };

    if (role === "buyer") {
      currentApprovals.buyer = true;
    } else {
      currentApprovals.seller = true;
    }

    escrowApprovals.set(dealId, currentApprovals);

    await createSystemMessage(dealId, `Escrow release authorization received from ${role === "buyer" ? "Buyer" : "Seller"}.`);

    // Dual approval check
    if (currentApprovals.buyer && currentApprovals.seller) {
      // Advance to closed
      await db.update(deals)
        .set({
          escrowStatus: "released",
          stage: "closed",
          closedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(deals.id, dealId));

      await createSystemMessage(dealId, "🎉 Escrow Released successfully! Transaction completed. Deal closed. Deal room archiving triggered.");
      
      await createNotification(
        deal.buyerId,
        "deal_closed",
        "🎉 Deal Closed! Escrow Released",
        "Congratulations on acquiring your new digital asset! Feedback requested.",
        { dealId }
      );
      await createNotification(
        deal.sellerId,
        "deal_closed",
        "🎉 Deal Closed! Escrow Released",
        "Congratulations on selling your asset! Escrow has payout wire active.",
        { dealId }
      );

      // Trigger emails
      try {
        const [buyer] = await db.select().from(users).where(eq(users.id, deal.buyerId)).limit(1);
        const [seller] = await db.select().from(users).where(eq(users.id, deal.sellerId)).limit(1);
        const [listing] = await db.select().from(listings).where(eq(listings.id, deal.listingId)).limit(1);
        const appUrl = process.env.VITE_APP_URL || "http://localhost:3000";
        const partiesText = `${buyer?.name || "Buyer"} & ${seller?.name || "Seller"}`;
        const closedDateText = new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });

        if (buyer && buyer.email) {
          await sendEmail({
            to: buyer.email,
            subject: "🎉 Congratulations — Deal Closed!",
            template: "deal-closed",
            data: {
              userName: buyer.name || "Buyer",
              listingTitle: listing?.title || "Listing",
              dealValue: Number(deal.dealValue || 0),
              parties: partiesText,
              closedDate: closedDateText,
              reviewUrl: `${appUrl}/deals/${deal.id}/review`,
            }
          });
        }

        if (seller && seller.email) {
          await sendEmail({
            to: seller.email,
            subject: "🎉 Congratulations — Deal Closed!",
            template: "deal-closed",
            data: {
              userName: seller.name || "Seller",
              listingTitle: listing?.title || "Listing",
              dealValue: Number(deal.dealValue || 0),
              parties: partiesText,
              closedDate: closedDateText,
              reviewUrl: `${appUrl}/deals/${deal.id}/review`,
            }
          });
        }
      } catch (emailErr) {
        console.error("Failed to send deal closed emails:", emailErr);
      }

      await triggerPusher(dealId, "stage-changed", { stage: "closed" });
    }

    await triggerPusher(dealId, "escrow-approval-updated", currentApprovals);

    return { success: true, approvals: currentApprovals };
  } catch (error: any) {
    console.error("Error releasing escrow:", error);
    return { success: false, error: error.message };
  }
}

// 23. uploadDealDocument
export async function uploadDealDocument(
  dealId: string,
  data: { url: string; name: string; type: "proof_of_funds" | "agreement" | "transfer_proof" | "nda" | "other"; visibility: "both" | "buyer_only" | "seller_only"; cloudinaryId?: string },
  userId: string
) {
  try {
    const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
    if (!deal) {
      return { success: false, error: "Deal not found" };
    }

    const [inserted] = await db.insert(dealDocuments).values({
      id: `deal-doc-${Date.now()}-${Math.random().toString(36).substring(4)}`,
      dealId,
      uploadedBy: userId,
      type: data.type,
      name: data.name,
      url: data.url,
      cloudinaryId: data.cloudinaryId || null,
      visibility: data.visibility || "both",
    }).returning();

    // System log
    const [userObj] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const uploaderRole = userId === deal.buyerId ? "Buyer" : "Seller";
    await createSystemMessage(dealId, `${uploaderRole} uploaded document "${data.name}" (Type: ${data.type.toUpperCase()}).`);

    // Trigger Pusher
    await triggerPusher(dealId, "document-uploaded", inserted);

    // Notify other party
    const otherUserId = userId === deal.buyerId ? deal.sellerId : deal.buyerId;
    if (data.visibility === "both") {
      await createNotification(
        otherUserId,
        "document_uploaded",
        "New Document Uploaded",
        `${uploaderRole} uploaded "${data.name}" to Document Vault.`,
        { dealId }
      );
    }

    return { success: true, document: inserted };
  } catch (error: any) {
    console.error("Error uploading deal document:", error);
    return { success: false, error: error.message };
  }
}

// Additional helpers for UI listings
export async function getActiveDealsForUser(userId: string, role: "buyer" | "seller") {
  try {
    const condition = role === "buyer" ? eq(deals.buyerId, userId) : eq(deals.sellerId, userId);
    
    const results = await db
      .select({
        deal: deals,
        listing: {
          title: listings.title,
          slug: listings.slug,
          askingPrice: listings.askingPrice,
        },
        buyer: {
          name: users.name,
        },
        seller: {
          name: users.name,
        }
      })
      .from(deals)
      .innerJoin(listings, eq(deals.listingId, listings.id))
      .innerJoin(users, eq(role === "buyer" ? deals.sellerId : deals.buyerId, users.id))
      .where(condition)
      .orderBy(deals.createdAt);

    return {
      success: true,
      deals: results.map((row) => ({
        ...row.deal,
        listingTitle: row.listing.title,
        listingSlug: row.listing.slug,
        listingPrice: row.listing.askingPrice,
        partyName: role === "buyer" ? row.seller.name || "Seller" : row.buyer.name || "Buyer",
      })),
    };
  } catch (error: any) {
    console.error("Error fetching active user deals:", error);
    return { success: false, error: error.message };
  }
}

// Admin complete deal funding / release escrow hooks
export async function adminFundEscrow(dealId: string) {
  try {
    await db.update(deals).set({ escrowStatus: "funded", stage: "transfer" }).where(eq(deals.id, dealId));
    await createSystemMessage(dealId, "🔒 Escrow funding successfully verified by FMI Compliance team. Escrow funded. Workspace advanced to TRANSFER stage.");
    await triggerPusher(dealId, "stage-changed", { stage: "transfer" });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// Deal Room Chat Messages Actions
export async function getDealMessages(dealId: string) {
  try {
    const results = await db
      .select({
        id: messages.id,
        dealId: messages.dealId,
        senderId: messages.senderId,
        content: messages.content,
        type: messages.type,
        createdAt: messages.createdAt,
        senderName: users.name,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.dealId, dealId))
      .orderBy(messages.createdAt);

    return { success: true, messages: results };
  } catch (error: any) {
    console.error("Error fetching deal messages:", error);
    return { success: false, error: error.message };
  }
}

export async function sendDealMessage(dealId: string, senderId: string, content: string) {
  try {
    const [inserted] = await db
      .insert(messages)
      .values({
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(4)}`,
        dealId,
        senderId,
        content,
        type: "user",
        isRead: false,
      })
      .returning();

    // Fetch sender info for real-time notification/pusher payload
    const [senderObj] = await db.select().from(users).where(eq(users.id, senderId)).limit(1);

    await triggerPusher(dealId, "new-message", {
      ...inserted,
      senderName: senderObj?.name || "Participant",
    });

    return { success: true, message: inserted };
  } catch (error: any) {
    console.error("Error sending deal message:", error);
    return { success: false, error: error.message };
  }
}
