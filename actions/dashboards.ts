import { eq, and, ne, or, inArray, not, desc, sql } from "drizzle-orm";
import { db } from "../lib/db/index.ts";
import { 
  users, 
  kycProfiles, 
  buyerProfiles, 
  listings, 
  offers, 
  deals, 
  notifications, 
  ndaAgreements 
} from "../lib/db/schema.ts";
import { getRedis } from "../lib/redis.ts";

export async function getBuyerDashboardData(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    // 1. Fetch User and KYC Profile status
    const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!userRecord) {
      return { success: false, error: "User not found" };
    }

    // 2. Fetch Stats
    // Active Offers count: pending or countered offers
    let activeOffersCount = 0;
    try {
      const buyerOffers = await db
        .select()
        .from(offers)
        .where(
          and(
            eq(offers.buyerId, userId),
            inArray(offers.status, ["pending", "countered"])
          )
        );
      activeOffersCount = buyerOffers.length;
    } catch (e) {
      console.warn("Error fetching buyer offers count:", e);
    }

    // Active Deals count: deals that are NOT closed or cancelled
    let activeDealsCount = 0;
    try {
      const buyerDeals = await db
        .select()
        .from(deals)
        .where(
          and(
            eq(deals.buyerId, userId),
            not(inArray(deals.stage, ["closed", "cancelled"]))
          )
        );
      activeDealsCount = buyerDeals.length;
    } catch (e) {
      console.warn("Error fetching buyer deals count:", e);
    }

    // NDAs Signed count
    let ndasSignedCount = 0;
    try {
      const buyerNdas = await db
        .select()
        .from(ndaAgreements)
        .where(
          and(
            eq(ndaAgreements.buyerId, userId),
            eq(ndaAgreements.status, "signed")
          )
        );
      ndasSignedCount = buyerNdas.length;
    } catch (e) {
      console.warn("Error fetching buyer NDAs count:", e);
    }

    // Listings Saved count (Redis set: saved:{userId})
    let listingsSavedCount = 0;
    let savedListingIds: any[] = [];
    try {
      const redis = getRedis();
      savedListingIds = await redis.smembers(`saved:${userId}`);
      listingsSavedCount = savedListingIds.length;
    } catch (e) {
      console.warn("Error fetching saved listings from Redis:", e);
    }

    // 3. Active Deals Details
    // Join with listings to show progress
    let activeDealsDetails: any[] = [];
    try {
      activeDealsDetails = await db
        .select({
          deal: deals,
          listing: listings
        })
        .from(deals)
        .innerJoin(listings, eq(deals.listingId, listings.id))
        .where(
          and(
            eq(deals.buyerId, userId),
            not(inArray(deals.stage, ["closed", "cancelled"]))
          )
        )
        .orderBy(desc(deals.updatedAt));
    } catch (e) {
      console.warn("Error fetching active deals details:", e);
    }

    // 4. Offers Awaiting Response: countered offers that need buyer action
    let offersAwaitingResponse: any[] = [];
    try {
      offersAwaitingResponse = await db
        .select({
          offer: offers,
          listing: listings
        })
        .from(offers)
        .innerJoin(listings, eq(offers.listingId, listings.id))
        .where(
          and(
            eq(offers.buyerId, userId),
            eq(offers.status, "countered")
          )
        )
        .orderBy(desc(offers.updatedAt));
    } catch (e) {
      console.warn("Error fetching offers awaiting response:", e);
    }

    // 5. Recommended For You:
    // Calls recommend logic with buyer profile
    let buyerProfileRecord: any = null;
    try {
      const profiles = await db
        .select()
        .from(buyerProfiles)
        .where(eq(buyerProfiles.userId, userId))
        .limit(1);
      buyerProfileRecord = profiles[0] || null;
    } catch (e) {
      console.warn("Error fetching buyer profile:", e);
    }

    let recommendedListings: any[] = [];
    try {
      if (buyerProfileRecord) {
        // Find listings matching buyer's budget and industries
        const profileIndustries = buyerProfileRecord.industries || [];
        const minBudget = buyerProfileRecord.budgetMin || 0;
        const maxBudget = buyerProfileRecord.budgetMax || 999999999;

        let matchingConditions = [
          eq(listings.status, "live"),
          ne(listings.sellerId, userId) // Don't recommend own listings
        ];

        // Build conditions dynamically
        const queryConditions: any[] = [];
        if (profileIndustries.length > 0) {
          queryConditions.push(inArray(listings.industry, profileIndustries));
        }
        queryConditions.push(
          and(
            sql`${listings.askingPrice} >= ${minBudget}`,
            sql`${listings.askingPrice} <= ${maxBudget}`
          )
        );

        recommendedListings = await db
          .select()
          .from(listings)
          .where(
            and(
              ...matchingConditions,
              or(...queryConditions)
            )
          )
          .limit(6);
      }
    } catch (e) {
      console.warn("Error querying recommended listings by profile:", e);
    }

    // Fallback: If no buyer profile or fewer than 3 matches, get random live listings
    try {
      if (recommendedListings.length < 3) {
        const moreListings = await db
          .select()
          .from(listings)
          .where(
            and(
              eq(listings.status, "live"),
              ne(listings.sellerId, userId)
            )
          )
          .limit(6);
        
        // Shuffle & merge unique items
        const existingIds = new Set(recommendedListings.map(l => l.id));
        for (const item of moreListings) {
          if (!existingIds.has(item.id)) {
            recommendedListings.push(item);
          }
        }
      }
    } catch (e) {
      console.warn("Error querying fallback recommendations:", e);
    }
    
    // Slice to 5 recommended items
    recommendedListings = recommendedListings.slice(0, 5);

    // 6. Recently Viewed Listings
    let recentlyViewedListings: any[] = [];
    try {
      const redis = getRedis();
      const viewedListingIds = await redis.zrange(`viewed:${userId}`, 0, 5, { rev: true });
      if (viewedListingIds && viewedListingIds.length > 0) {
        recentlyViewedListings = await db
          .select()
          .from(listings)
          .where(
            and(
              eq(listings.status, "live"),
              inArray(listings.id, viewedListingIds as string[])
            )
          );
        
        // Sort to match viewed order from Redis
        recentlyViewedListings.sort((a, b) => viewedListingIds.indexOf(b.id) - viewedListingIds.indexOf(a.id));
      }
    } catch (e) {
      console.warn("Error fetching recently viewed listings:", e);
    }

    // 7. Activity Feed (user's recent notifications serves as chronological audit trail)
    let activityFeed: any[] = [];
    try {
      activityFeed = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(20);
    } catch (e) {
      console.warn("Error fetching activity feed:", e);
    }

    // Saved Listings (detailed cards for rendering)
    let savedListings: any[] = [];
    try {
      if (savedListingIds && savedListingIds.length > 0) {
        savedListings = await db
          .select()
          .from(listings)
          .where(
            and(
              eq(listings.status, "live"),
              inArray(listings.id, savedListingIds as string[])
            )
          );
      }
    } catch (e) {
      console.warn("Error fetching saved listings details:", e);
    }

    return {
      success: true,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        phone: userRecord.phone,
        avatarUrl: userRecord.avatarUrl,
        kycStatus: userRecord.kycStatus,
        role: userRecord.role,
        kycType: userRecord.kycType
      },
      stats: {
        activeOffers: activeOffersCount,
        activeDeals: activeDealsCount,
        ndasSigned: ndasSignedCount,
        listingsSaved: listingsSavedCount
      },
      activeDeals: activeDealsDetails,
      offersAwaitingResponse,
      recommendedListings,
      recentlyViewed: recentlyViewedListings,
      savedListings,
      activityFeed
    };

  } catch (error: any) {
    console.error("getBuyerDashboardData error:", error);
    return { success: false, error: error.message || "Failed to fetch buyer dashboard data" };
  }
}

export async function getSellerDashboardData(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    // 1. Fetch User record
    const [userRecord] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!userRecord) {
      return { success: false, error: "User not found" };
    }

    // 2. Query Stats
    // Active Listings count
    let activeListingsCount = 0;
    try {
      const activeListings = await db
        .select()
        .from(listings)
        .where(
          and(
            eq(listings.sellerId, userId),
            eq(listings.status, "live")
          )
        );
      activeListingsCount = activeListings.length;
    } catch (e) {
      console.warn("Error fetching active listings count:", e);
    }

    // Total Listings count
    let sellerListings: any[] = [];
    try {
      sellerListings = await db
        .select()
        .from(listings)
        .where(eq(listings.sellerId, userId));
    } catch (e) {
      console.warn("Error fetching seller listings:", e);
    }

    // Pending Offers count: offers with status = 'pending' on seller's listings
    let pendingOffersCount = 0;
    try {
      const pendingOffers = await db
        .select()
        .from(offers)
        .where(
          and(
            eq(offers.sellerId, userId),
            eq(offers.status, "pending")
          )
        );
      pendingOffersCount = pendingOffers.length;
    } catch (e) {
      console.warn("Error fetching pending offers count:", e);
    }

    // Active Deals count: deals with sellerId = userId and not closed/cancelled
    let activeDealsCount = 0;
    try {
      const sellerDeals = await db
        .select()
        .from(deals)
        .where(
          and(
            eq(deals.sellerId, userId),
            not(inArray(deals.stage, ["closed", "cancelled"]))
          )
        );
      activeDealsCount = sellerDeals.length;
    } catch (e) {
      console.warn("Error fetching active deals count:", e);
    }

    // Total Revenue: Sum of dealValue for closed deals
    let totalRevenue = 0;
    try {
      const closedDeals = await db
        .select({ value: deals.dealValue })
        .from(deals)
        .where(
          and(
            eq(deals.sellerId, userId),
            eq(deals.stage, "closed")
          )
        );
      totalRevenue = closedDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
    } catch (e) {
      console.warn("Error fetching total revenue:", e);
    }

    // 3. Listing Performance
    // NDA Sign count and Offers count for each of seller's listings
    const listingPerformance: any[] = [];
    try {
      for (const listing of sellerListings) {
        // NDAs unlocked
        const ndas = await db
          .select()
          .from(ndaAgreements)
          .where(
            and(
              eq(ndaAgreements.listingId, listing.id),
              eq(ndaAgreements.status, "signed")
            )
          );
        
        // Offers received
        const recOffers = await db
          .select()
          .from(offers)
          .where(eq(offers.listingId, listing.id));

        listingPerformance.push({
          id: listing.id,
          title: listing.title,
          slug: listing.slug,
          status: listing.status,
          askingPrice: listing.askingPrice,
          viewCount: listing.viewCount,
          ndasUnlocked: ndas.length,
          offersReceived: recOffers.length
        });
      }
    } catch (e) {
      console.warn("Error fetching listing performance stats:", e);
    }

    // 4. Offers Requiring Action (pending offers)
    let offersRequiringAction: any[] = [];
    try {
      offersRequiringAction = await db
        .select({
          offer: offers,
          listing: listings,
          buyer: users
        })
        .from(offers)
        .innerJoin(listings, eq(offers.listingId, listings.id))
        .innerJoin(users, eq(offers.buyerId, users.id))
        .where(
          and(
            eq(offers.sellerId, userId),
            eq(offers.status, "pending")
          )
        )
        .orderBy(desc(offers.createdAt));
    } catch (e) {
      console.warn("Error fetching offers requiring action:", e);
    }

    // 5. Active Deals details
    let activeDealsDetails: any[] = [];
    try {
      activeDealsDetails = await db
        .select({
          deal: deals,
          listing: listings,
          buyer: users
        })
        .from(deals)
        .innerJoin(listings, eq(deals.listingId, listings.id))
        .innerJoin(users, eq(deals.buyerId, users.id))
        .where(
          and(
            eq(deals.sellerId, userId),
            not(inArray(deals.stage, ["closed", "cancelled"]))
          )
        )
        .orderBy(desc(deals.updatedAt));
    } catch (e) {
      console.warn("Error fetching active deals details:", e);
    }

    // 6. Listing Status List (All Listings)
    const listingsStatusList = sellerListings.map(l => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      status: l.status,
      askingPrice: l.askingPrice,
      createdAt: l.createdAt
    }));

    return {
      success: true,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        phone: userRecord.phone,
        avatarUrl: userRecord.avatarUrl,
        kycStatus: userRecord.kycStatus,
        role: userRecord.role
      },
      stats: {
        totalRevenue,
        activeListings: activeListingsCount,
        pendingOffers: pendingOffersCount,
        activeDeals: activeDealsCount
      },
      listingPerformance,
      offersRequiringAction,
      activeDeals: activeDealsDetails,
      listingsStatusList
    };

  } catch (error: any) {
    console.error("getSellerDashboardData error:", error);
    return { success: false, error: error.message || "Failed to fetch seller dashboard data" };
  }
}
