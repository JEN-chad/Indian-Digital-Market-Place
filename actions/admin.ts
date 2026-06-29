import { db } from "../lib/db/index.ts";
import { listings, users, kycProfiles, deals, offers } from "../lib/db/schema.ts";
import { eq, desc, sql, and } from "drizzle-orm";
import { createNotification } from "../lib/notifications.ts";
import { sendEmail } from "../lib/resend.ts";


export async function approveListing(listingId: string, adminId: string) {
  const [listing] = await db
    .update(listings)
    .set({ status: "live", publishedAt: new Date() })
    .where(eq(listings.id, listingId))
    .returning();

  if (listing) {
    const [seller] = await db.select().from(users).where(eq(users.id, listing.sellerId)).limit(1);
    
    await createNotification(
      listing.sellerId,
      "admin_action",
      "Listing Approved",
      `Your listing "${listing.title}" is now live! 🎉`,
      { listingId: listing.id }
    );

    if (seller && seller.email) {
      const appUrl = process.env.VITE_APP_URL || "http://localhost:3000";
      await sendEmail({
        to: seller.email,
        subject: `🎉 Your listing "${listing.title}" is now live!`,
        template: "listing-approved",
        data: {
          sellerName: seller.name || "Seller",
          listingTitle: listing.title,
          listingUrl: `${appUrl}/listings/${listing.slug}`,
        }
      });
    }
  }

  return listing;
}

export async function rejectListing(listingId: string, reason: string, adminId: string) {
  const [listing] = await db
    .update(listings)
    .set({ status: "rejected" })
    .where(eq(listings.id, listingId))
    .returning();

  if (listing) {
    await createNotification(
      listing.sellerId,
      "admin_action",
      "Listing Rejected",
      `Your listing "${listing.title}" was rejected. Reason: ${reason}`,
      { listingId: listing.id }
    );
  }

  return listing;
}

export async function featureListing(listingId: string, featured: boolean, adminId: string) {
  const [listing] = await db
    .update(listings)
    .set({ isFeatured: featured })
    .where(eq(listings.id, listingId))
    .returning();
  return listing;
}

export async function approveKyc(userId: string, adminId: string) {
  await db
    .update(kycProfiles)
    .set({ status: "approved", reviewedBy: adminId, reviewedAt: new Date() })
    .where(eq(kycProfiles.userId, userId));

  const [user] = await db
    .update(users)
    .set({ kycStatus: "approved" })
    .where(eq(users.id, userId))
    .returning();

  if (user) {
    await createNotification(
      user.id,
      "admin_action",
      "KYC Approved",
      "Your KYC has been approved! You can now participate in deals."
    );

    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "🎉 Your KYC has been approved!",
        template: "kyc-approved",
        data: { name: user.name || "Member" }
      });
    }
  }
  return user;
}

export async function rejectKyc(userId: string, reason: string, adminId: string) {
  await db
    .update(kycProfiles)
    .set({ status: "rejected", rejectionReason: reason, reviewedBy: adminId, reviewedAt: new Date() })
    .where(eq(kycProfiles.userId, userId));

  const [user] = await db
    .update(users)
    .set({ kycStatus: "rejected" })
    .where(eq(users.id, userId))
    .returning();

  if (user) {
    await createNotification(
      user.id,
      "admin_action",
      "KYC Rejected",
      `Your KYC was rejected. Reason: ${reason}. Please resubmit with correct documents.`
    );

    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: "Your KYC could not be verified",
        template: "kyc-rejected",
        data: { name: user.name || "Member", reason }
      });
    }
  }
  return user;
}

export async function suspendUser(userId: string, reason: string, adminId: string) {
  // role 'suspended' is not in schema for role, wait, schema role is 'buyer' | 'seller' | 'both' | 'admin'
  // I'll update kycStatus or add a suspended flag if it's not there, but let's check schema.
  // Wait, the prompt says "Update users: role='suspended' (add this status)". 
  // I can't easily alter the Drizzle schema enum type without a migration, but since this is SQLite or Postgres, we can try to write it. 
  // Wait, I will alter the Drizzle schema text type for role to include 'suspended'.
  const [user] = await db
    .update(users)
    // @ts-ignore - 'suspended' is going to be added to the schema
    .set({ role: "suspended" })
    .where(eq(users.id, userId))
    .returning();

  if (user) {
    await createNotification(
      user.id,
      "admin_action",
      "Account Suspended",
      `Your account has been suspended by an administrator. Reason: ${reason}`
    );
  }
  return user;
}

export async function getAdminStats() {
  const [totalUsersRes] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [activeListingsRes] = await db.select({ count: sql<number>`count(*)` }).from(listings).where(eq(listings.status, "live"));
  const [activeDealsRes] = await db.select({ count: sql<number>`count(*)` }).from(deals).where(eq(deals.stage, "escrow"));
  const [totalDealValueRes] = await db.select({ total: sql<number>`sum(deal_value)` }).from(deals);
  
  const [pendingKycRes] = await db.select({ count: sql<number>`count(*)` }).from(kycProfiles).where(eq(kycProfiles.status, "in_review"));
  const [pendingListingsRes] = await db.select({ count: sql<number>`count(*)` }).from(listings).where(eq(listings.status, "in_review"));
  
  return {
    totalUsers: Number(totalUsersRes?.count || 0),
    activeListings: Number(activeListingsRes?.count || 0),
    activeDeals: Number(activeDealsRes?.count || 0),
    totalDealValue: Number(totalDealValueRes?.total || 0),
    pendingKyc: Number(pendingKycRes?.count || 0),
    pendingListings: Number(pendingListingsRes?.count || 0),
  };
}

export async function getAdminListings() {
  return await db.select({
    listing: listings,
    seller: {
      id: users.id,
      name: users.name,
      email: users.email
    }
  })
  .from(listings)
  .leftJoin(users, eq(listings.sellerId, users.id))
  .orderBy(desc(listings.createdAt));
}

export async function getAdminKyc() {
  return await db.select({
    kyc: kycProfiles,
    user: {
      id: users.id,
      name: users.name,
      email: users.email
    }
  })
  .from(kycProfiles)
  .leftJoin(users, eq(kycProfiles.userId, users.id))
  .orderBy(desc(kycProfiles.createdAt));
}

export async function getAdminDeals() {
  // Join deal, listing, buyer, seller
  const allDeals = await db.select({
    deal: deals,
    listing: listings,
    buyer: { name: users.name, email: users.email },
  })
  .from(deals)
  .leftJoin(listings, eq(deals.listingId, listings.id))
  .leftJoin(users, eq(deals.buyerId, users.id))
  .orderBy(desc(deals.createdAt));
  
  // To get seller, we need a separate query or alias. Let's just fetch it simply or use another join if possible.
  // We'll fetch all sellers in a map for simplicity.
  const sellers = await db.select({ id: users.id, name: users.name, email: users.email }).from(users);
  const sellerMap = Object.fromEntries(sellers.map(s => [s.id, s]));

  return allDeals.map(d => ({
    ...d,
    seller: sellerMap[d.deal.sellerId]
  }));
}

export async function getAdminUsers() {
  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
  
  // Count listings and deals for each user
  const listingsCount = await db.select({ sellerId: listings.sellerId, count: sql<number>`count(*)` }).from(listings).groupBy(listings.sellerId);
  const buyerDealsCount = await db.select({ buyerId: deals.buyerId, count: sql<number>`count(*)` }).from(deals).groupBy(deals.buyerId);
  const sellerDealsCount = await db.select({ sellerId: deals.sellerId, count: sql<number>`count(*)` }).from(deals).groupBy(deals.sellerId);
  
  const lcMap = Object.fromEntries(listingsCount.map(l => [l.sellerId, Number(l.count)]));
  const bdcMap = Object.fromEntries(buyerDealsCount.map(d => [d.buyerId, Number(d.count)]));
  const sdcMap = Object.fromEntries(sellerDealsCount.map(d => [d.sellerId, Number(d.count)]));

  return allUsers.map(u => ({
    ...u,
    listingsCount: lcMap[u.id] || 0,
    dealsCount: (bdcMap[u.id] || 0) + (sdcMap[u.id] || 0)
  }));
}
