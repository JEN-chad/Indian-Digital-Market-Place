import { eq, and, ne, or } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { offers, listings, users, ndaAgreements, deals, dealChecklistItems } from "../lib/db/schema.ts";
import { getResend, EMAIL_FROM, sendEmail } from "../lib/resend.ts";
import { createNotification } from "../lib/notifications.ts";


export interface SubmitOfferInput {
  listingId: string;
  buyerId: string;
  amount: number;
  upfrontPercent: number;
  earnoutPercent: number;
  earnoutTerms?: string;
  message?: string;
  validityDays: number;
}

// 1. Submit Offer
export async function submitOffer(data: SubmitOfferInput) {
  try {
    const { listingId, buyerId, amount, upfrontPercent, earnoutPercent, earnoutTerms, message, validityDays } = data;

    // Validate listing
    const [listing] = await db.select().from(listings).where(eq(listings.id, listingId));
    if (!listing) {
      return { success: false, error: "Listing not found" };
    }

    // Validate buyer
    const [buyer] = await db.select().from(users).where(eq(users.id, buyerId));
    if (!buyer) {
      return { success: false, error: "Buyer not found" };
    }

    if (buyer.kycStatus !== "approved") {
      return { success: false, error: "Complete KYC to make offers" };
    }

    // Validate NDA
    if (listing.ndaRequired) {
      const [nda] = await db.select().from(ndaAgreements).where(
        and(
          eq(ndaAgreements.listingId, listing.id),
          eq(ndaAgreements.buyerId, buyer.id),
          eq(ndaAgreements.status, "signed")
        )
      );
      if (!nda) {
        return { success: false, error: "Sign NDA first" };
      }
    }

    // Validate no other pending offer from same buyer
    const existingPending = await db.select().from(offers).where(
      and(
        eq(offers.listingId, listing.id),
        eq(offers.buyerId, buyer.id),
        eq(offers.status, "pending")
      )
    );
    if (existingPending.length > 0) {
      return { success: false, error: "You already have an active pending offer on this listing" };
    }

    // Calculate expiration
    const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

    // Create offer
    const [newOffer] = await db.insert(offers).values({
      listingId: listing.id,
      buyerId: buyer.id,
      sellerId: listing.sellerId,
      amount: String(amount),
      upfrontPercent: String(upfrontPercent),
      earnoutPercent: String(earnoutPercent),
      earnoutTerms: earnoutTerms || null,
      message: message || null,
      status: "pending",
      expiresAt,
    }).returning();

    // Create notification for seller
    await createNotification(
      listing.sellerId,
      "new_offer",
      `New offer received on ${listing.title}`,
      `You have received a new offer of ₹${Number(amount).toLocaleString("en-IN")} from ${buyer.name || "a buyer"}.`,
      { offerId: newOffer.id, listingId: listing.id }
    );

    // Send email to seller via Resend
    const [seller] = await db.select().from(users).where(eq(users.id, listing.sellerId));
    if (seller && seller.email) {
      const appUrl = process.env.VITE_APP_URL || "http://localhost:3000";
      await sendEmail({
        to: seller.email,
        subject: `[FMI] New Offer Received — ₹${Number(amount).toLocaleString("en-IN")}`,
        template: "new-offer-seller",
        data: {
          sellerName: seller.name || "Seller",
          listingTitle: listing.title,
          offerAmount: amount,
          buyerMessage: message || "No message provided.",
          viewOfferUrl: `${appUrl}/seller/offers`,
        }
      });
    }

    return { success: true, offerId: newOffer.id };
  } catch (error: any) {
    console.error("Error in submitOffer action:", error);
    return { success: false, error: error.message };
  }
}

// Shared helper to create a Deal & default checklist items
async function createDealFromOffer(offer: any, listing: any) {
  // Create deal record
  const [deal] = await db.insert(deals).values({
    listingId: offer.listingId,
    offerId: offer.id,
    buyerId: offer.buyerId,
    sellerId: offer.sellerId,
    stage: "due_diligence",
    dealValue: offer.amount,
    escrowStatus: "not_created",
  }).returning();

  // Create default checklist items
  const buyerTasks = [
    "Upload Proof of Funds",
    "Complete Due Diligence Review",
    "Sign Purchase Agreement",
    "Fund Escrow Account",
    "Confirm Asset Handover Complete"
  ];
  const sellerTasks = [
    "Upload Detailed Financial Statements",
    "Grant Analytics Platform Access",
    "Sign Purchase Agreement",
    "Transfer Domain Name",
    "Transfer Code Repository Access",
    "Transfer Admin Accounts (hosting, payment, etc.)"
  ];
  const platformTasks = [
    "Admin: Verify Escrow Funding",
    "Admin: Confirm Transfer Complete"
  ];

  const checklistItems = [];
  let sortOrder = 1;

  for (const task of buyerTasks) {
    checklistItems.push({
      dealId: deal.id,
      title: task,
      assignedTo: "buyer" as const,
      isCompleted: false,
      sortOrder: sortOrder++,
    });
  }

  for (const task of sellerTasks) {
    checklistItems.push({
      dealId: deal.id,
      title: task,
      assignedTo: "seller" as const,
      isCompleted: false,
      sortOrder: sortOrder++,
    });
  }

  for (const task of platformTasks) {
    checklistItems.push({
      dealId: deal.id,
      title: task,
      assignedTo: "platform" as const,
      isCompleted: false,
      sortOrder: sortOrder++,
    });
  }

  await db.insert(dealChecklistItems).values(checklistItems);

  // Reject all other pending offers on the same listing
  await db.update(offers)
    .set({ status: "rejected", updatedAt: new Date() })
    .where(
      and(
        eq(offers.listingId, offer.listingId),
        ne(offers.id, offer.id),
        or(eq(offers.status, "pending"), eq(offers.status, "countered"))
      )
    );

  // Notify buyer and platform admin
  await createNotification(
    offer.buyerId,
    "deal_created",
    "Your offer was accepted!",
    `Congratulations! Your offer on ${listing.title} has been accepted. Deal Room is now active.`,
    { dealId: deal.id, listingId: listing.id }
  );

  // Send email notifications to both parties
  const [buyer] = await db.select().from(users).where(eq(users.id, offer.buyerId));
  const [seller] = await db.select().from(users).where(eq(users.id, offer.sellerId));

  const appUrl = process.env.VITE_APP_URL || "http://localhost:3000";
  const dealRoomUrl = `${appUrl}/deals/${deal.id}`;

  if (buyer && buyer.email) {
    await sendEmail({
      to: buyer.email,
      subject: `[FMI] Offer ACCEPTED! Deal Room Opened — ${listing.title}`,
      template: "offer-accepted-buyer",
      data: {
        buyerName: buyer.name || "Buyer",
        listingTitle: listing.title,
        offerAmount: Number(offer.amount),
        dealRoomUrl,
      }
    });
  }

  if (seller && seller.email) {
    await sendEmail({
      to: seller.email,
      subject: `[FMI] Deal Created! Secure Deal Room Activated`,
      template: "deal-stage-change",
      data: {
        userName: seller.name || "Seller",
        listingTitle: listing.title,
        stageName: "Due Diligence",
        stageDescription: "You have accepted the offer. A secure Deal Room has been initialized for you and the buyer.",
        requiredActions: [
          "Upload detailed financial statements",
          "Grant analytics platform access",
          "Sign purchase agreement",
        ],
        dealRoomUrl,
      }
    });
  }

  return deal.id;
}

// 2. Accept Offer
export async function acceptOffer(offerId: string, sellerId: string) {
  try {
    const [offer] = await db.select().from(offers).where(eq(offers.id, offerId));
    if (!offer) {
      return { success: false, error: "Offer not found" };
    }

    if (offer.sellerId !== sellerId) {
      return { success: false, error: "Unauthorized. You are not the seller of this listing." };
    }

    if (offer.status !== "pending") {
      return { success: false, error: `Cannot accept offer in "${offer.status}" state.` };
    }

    // Check expiry
    if (offer.expiresAt && new Date() > new Date(offer.expiresAt)) {
      await db.update(offers).set({ status: "expired" }).where(eq(offers.id, offerId));
      return { success: false, error: "This offer has expired and cannot be accepted." };
    }

    const [listing] = await db.select().from(listings).where(eq(listings.id, offer.listingId));
    if (!listing) {
      return { success: false, error: "Listing not found" };
    }

    // Update status to accepted
    await db.update(offers)
      .set({ status: "accepted", updatedAt: new Date() })
      .where(eq(offers.id, offerId));

    const dealId = await createDealFromOffer(offer, listing);

    return { success: true, dealId };
  } catch (error: any) {
    console.error("Error in acceptOffer action:", error);
    return { success: false, error: error.message };
  }
}

// 3. Counter Offer
export async function counterOffer(offerId: string, counterAmount: number, message: string, sellerId: string) {
  try {
    const [offer] = await db.select().from(offers).where(eq(offers.id, offerId));
    if (!offer) {
      return { success: false, error: "Offer not found" };
    }

    if (offer.sellerId !== sellerId) {
      return { success: false, error: "Unauthorized. You are not the seller of this listing." };
    }

    if (offer.status !== "pending") {
      return { success: false, error: "You can only counter a pending offer." };
    }

    // Update offer to countered
    await db.update(offers)
      .set({
        status: "countered",
        counterAmount: String(counterAmount),
        counterMessage: message || null,
        updatedAt: new Date(),
      })
      .where(eq(offers.id, offerId));

    const [listing] = await db.select().from(listings).where(eq(listings.id, offer.listingId));

    // Notify buyer
    await createNotification(
      offer.buyerId,
      "counter_offer",
      `Seller countered your offer on ${listing?.title || "Listing"}`,
      `The seller proposed a counter-offer of ₹${Number(counterAmount).toLocaleString("en-IN")}.`,
      { offerId: offer.id, listingId: offer.listingId }
    );

    // Send email to buyer
    const [buyer] = await db.select().from(users).where(eq(users.id, offer.buyerId));
    if (buyer && buyer.email) {
      const appUrl = process.env.VITE_APP_URL || "http://localhost:3000";
      await sendEmail({
        to: buyer.email,
        subject: `[FMI] Counter-Offer Received — ₹${Number(counterAmount).toLocaleString("en-IN")}`,
        template: "offer-countered",
        data: {
          receiverName: buyer.name || "Buyer",
          listingTitle: listing?.title || "Listing",
          originalAmount: Number(offer.amount),
          counterAmount: Number(counterAmount),
          viewCounterUrl: `${appUrl}/buyer/offers`,
        }
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in counterOffer action:", error);
    return { success: false, error: error.message };
  }
}

// 4. Reject Offer
export async function rejectOffer(offerId: string, reason: string | undefined, sellerId: string) {
  try {
    const [offer] = await db.select().from(offers).where(eq(offers.id, offerId));
    if (!offer) {
      return { success: false, error: "Offer not found" };
    }

    if (offer.sellerId !== sellerId) {
      return { success: false, error: "Unauthorized." };
    }

    await db.update(offers)
      .set({ status: "rejected", updatedAt: new Date() })
      .where(eq(offers.id, offerId));

    const [listing] = await db.select().from(listings).where(eq(listings.id, offer.listingId));

    // Notify buyer
    await createNotification(
      offer.buyerId,
      "offer_rejected",
      `Offer declined on ${listing?.title || "Listing"}`,
      `The seller has declined your offer. Reason: ${reason || "Not specified."}`,
      { offerId: offer.id, listingId: offer.listingId }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error in rejectOffer action:", error);
    return { success: false, error: error.message };
  }
}

// 5. Withdraw Offer
export async function withdrawOffer(offerId: string, buyerId: string) {
  try {
    const [offer] = await db.select().from(offers).where(eq(offers.id, offerId));
    if (!offer) {
      return { success: false, error: "Offer not found" };
    }

    if (offer.buyerId !== buyerId) {
      return { success: false, error: "Unauthorized." };
    }

    if (offer.status !== "pending" && offer.status !== "countered") {
      return { success: false, error: "You can only withdraw active pending or countered offers." };
    }

    await db.update(offers)
      .set({ status: "withdrawn", updatedAt: new Date() })
      .where(eq(offers.id, offerId));

    const [listing] = await db.select().from(listings).where(eq(listings.id, offer.listingId));

    // Notify seller
    await createNotification(
      offer.sellerId,
      "offer_withdrawn",
      `Offer withdrawn on ${listing?.title || "Listing"}`,
      "The buyer has withdrawn their offer.",
      { offerId: offer.id, listingId: offer.listingId }
    );

    return { success: true };
  } catch (error: any) {
    console.error("Error in withdrawOffer action:", error);
    return { success: false, error: error.message };
  }
}

// 6. Accept Counter
export async function acceptCounter(offerId: string, buyerId: string) {
  try {
    const [offer] = await db.select().from(offers).where(eq(offers.id, offerId));
    if (!offer) {
      return { success: false, error: "Offer not found" };
    }

    if (offer.buyerId !== buyerId) {
      return { success: false, error: "Unauthorized." };
    }

    if (offer.status !== "countered") {
      return { success: false, error: "No counter-offer exists to accept." };
    }

    if (!offer.counterAmount) {
      return { success: false, error: "Invalid counter-offer amount." };
    }

    const [listing] = await db.select().from(listings).where(eq(listings.id, offer.listingId));
    if (!listing) {
      return { success: false, error: "Listing not found" };
    }

    // Update status to accepted, and amount to counterAmount
    const [updatedOffer] = await db.update(offers)
      .set({
        status: "accepted",
        amount: offer.counterAmount,
        updatedAt: new Date(),
      })
      .where(eq(offers.id, offerId))
      .returning();

    const dealId = await createDealFromOffer(updatedOffer, listing);

    return { success: true, dealId };
  } catch (error: any) {
    console.error("Error in acceptCounter action:", error);
    return { success: false, error: error.message };
  }
}

// 7. Get Buyer Offers
export async function getBuyerOffers(buyerId: string) {
  try {
    const { desc } = await import("drizzle-orm");
    const results = await db
      .select({
        offer: offers,
        listing: {
          title: listings.title,
          slug: listings.slug,
          coverImageUrl: listings.coverImageUrl,
        },
      })
      .from(offers)
      .innerJoin(listings, eq(offers.listingId, listings.id))
      .where(eq(offers.buyerId, buyerId))
      .orderBy(desc(offers.createdAt));

    const offersWithDeals = [];
    for (const row of results) {
      let dealId: string | null = null;
      if (row.offer.status === "accepted") {
        const [deal] = await db.select().from(deals).where(eq(deals.offerId, row.offer.id)).limit(1);
        if (deal) {
          dealId = deal.id;
        }
      }
      offersWithDeals.push({
        ...row.offer,
        listingTitle: row.listing.title,
        listingSlug: row.listing.slug,
        coverImageUrl: row.listing.coverImageUrl,
        dealId,
      });
    }

    return { success: true, offers: offersWithDeals };
  } catch (error: any) {
    console.error("Error in getBuyerOffers:", error);
    return { success: false, error: error.message };
  }
}

// 8. Get Seller Offers
export async function getSellerOffers(sellerId: string) {
  try {
    const { desc } = await import("drizzle-orm");
    const results = await db
      .select({
        offer: offers,
        listing: {
          title: listings.title,
          slug: listings.slug,
        },
        buyer: {
          id: users.id,
          name: users.name,
          email: users.email,
        }
      })
      .from(offers)
      .innerJoin(listings, eq(offers.listingId, listings.id))
      .innerJoin(users, eq(offers.buyerId, users.id))
      .where(eq(offers.sellerId, sellerId))
      .orderBy(desc(offers.createdAt));

    const offersWithDeals = [];
    for (const row of results) {
      let dealId: string | null = null;
      if (row.offer.status === "accepted") {
        const [deal] = await db.select().from(deals).where(eq(deals.offerId, row.offer.id)).limit(1);
        if (deal) {
          dealId = deal.id;
        }
      }
      // Mask name as "Buyer #1234"
      const lastFour = row.buyer.id ? row.buyer.id.slice(-4).toUpperCase() : "ABCD";
      const maskedName = `Buyer #${lastFour}`;

      offersWithDeals.push({
        ...row.offer,
        listingTitle: row.listing.title,
        listingSlug: row.listing.slug,
        buyerName: maskedName,
        buyerEmail: row.buyer.email,
        dealId,
      });
    }

    return { success: true, offers: offersWithDeals };
  } catch (error: any) {
    console.error("Error in getSellerOffers:", error);
    return { success: false, error: error.message };
  }
}

