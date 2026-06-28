"use server";

import { eq, and } from "drizzle-orm";
import slugify from "slugify";
import { db } from "../lib/db/index.ts";
import { listings, listingDocuments, users, notifications } from "../lib/db/schema.ts";
import { getCloudinary } from "../lib/cloudinary.ts";
import { getResend, EMAIL_FROM } from "../lib/resend.ts";

// Stub to satisfy requirements
const revalidatePath = (path: string) => {
  console.log(`[Revalidate] Path ${path} revalidated.`);
};

// 1. Create Listing Draft
export async function createListingDraft(sellerId: string, initialData?: { title?: string; assetType?: "saas" | "ecommerce" | "app" | "blog" | "domain" | "content_site" | "service" }) {
  try {
    if (!sellerId) {
      return { success: false, error: "Seller ID is required" };
    }

    const title = initialData?.title || "Draft Listing";
    const assetType = initialData?.assetType || "saas";

    // Generate unique slug
    const baseSlug = slugify(title, { lower: true, strict: true }) || "draft";
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const slug = `${baseSlug}-${randomSuffix}`;

    const [newListing] = await db.insert(listings).values({
      sellerId,
      title,
      slug,
      assetType,
      industry: "Technology", // default placeholder
      askingPrice: 0,
      status: "draft",
      ndaRequired: true,
      ndaFee: 999,
    }).returning();

    return { success: true, listingId: newListing.id, listing: newListing };
  } catch (error: any) {
    console.error("createListingDraft error:", error);
    return { success: false, error: error.message || "Failed to create draft listing" };
  }
}

// 2. Update Listing Step
export async function updateListingStep(listingId: string, stepData: any) {
  try {
    if (!listingId) {
      return { success: false, error: "Listing ID is required" };
    }

    // Clean step data to match schema
    const updateData: any = {};
    
    // Step 1
    if (stepData.assetType) updateData.assetType = stepData.assetType;
    
    // Step 2
    if (stepData.title) {
      updateData.title = stepData.title;
      // Also regenerate slug if title changes and is not default
      const baseSlug = slugify(stepData.title, { lower: true, strict: true }) || "listing";
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      updateData.slug = `${baseSlug}-${randomSuffix}`;
    }
    if (stepData.businessNamePrivate !== undefined) updateData.businessNamePrivate = stepData.businessNamePrivate;
    if (stepData.industry) updateData.industry = stepData.industry;
    if (stepData.businessUrl !== undefined) updateData.businessUrl = stepData.businessUrl;
    if (stepData.yearEstablished !== undefined) updateData.yearEstablished = parseInt(stepData.yearEstablished, 10) || null;
    if (stepData.teamSize !== undefined) updateData.teamSize = parseInt(stepData.teamSize, 10) || null;
    if (stepData.hoursPerWeek !== undefined) updateData.hoursPerWeek = parseInt(stepData.hoursPerWeek, 10) || null;
    if (stepData.businessModel !== undefined) updateData.businessModel = stepData.businessModel;

    // Step 3
    if (stepData.monthlyRevenue !== undefined) updateData.monthlyRevenue = parseInt(stepData.monthlyRevenue, 10) || 0;
    if (stepData.monthlyProfit !== undefined) updateData.monthlyProfit = parseInt(stepData.monthlyProfit, 10) || 0;
    if (stepData.monthlyTraffic !== undefined) updateData.monthlyTraffic = parseInt(stepData.monthlyTraffic, 10) || 0;
    if (stepData.trafficSources !== undefined) updateData.trafficSources = stepData.trafficSources;

    // Step 5
    if (stepData.tagline) updateData.tagline = stepData.tagline;
    if (stepData.description) updateData.description = stepData.description;
    if (stepData.reasonForSale) updateData.reasonForSale = stepData.reasonForSale;

    // Step 6
    if (stepData.askingPrice !== undefined) updateData.askingPrice = parseInt(stepData.askingPrice, 10) || 0;
    if (stepData.pricingModel) updateData.pricingModel = stepData.pricingModel;
    if (stepData.reservePrice !== undefined) updateData.reservePrice = parseInt(stepData.reservePrice, 10) || null;
    if (stepData.ndaRequired !== undefined) updateData.ndaRequired = !!stepData.ndaRequired;
    if (stepData.ndaFee !== undefined) updateData.ndaFee = parseInt(stepData.ndaFee, 10) || 0;
    if (stepData.coverImageUrl !== undefined) updateData.coverImageUrl = stepData.coverImageUrl;
    if (stepData.tags !== undefined) updateData.tags = Array.isArray(stepData.tags) ? stepData.tags : [];

    updateData.updatedAt = new Date();

    const [updatedListing] = await db.update(listings)
      .set(updateData)
      .where(eq(listings.id, listingId))
      .returning();

    revalidatePath("/seller/listings");

    return { success: true, listing: updatedListing };
  } catch (error: any) {
    console.error("updateListingStep error:", error);
    return { success: false, error: error.message || "Failed to update listing step" };
  }
}

// 3. Upload Listing Document
export async function uploadListingDocument(listingId: string, fileData: string, type: "financial" | "analytics" | "ownership" | "pitch_deck" | "other", name: string) {
  try {
    if (!listingId) {
      return { success: false, error: "Listing ID is required" };
    }

    let secureUrl = fileData;
    let cloudinaryId = "";

    // If fileData is a base64 string, upload to Cloudinary
    if (fileData.startsWith("data:") || !fileData.startsWith("http")) {
      const cloudinaryInstance = getCloudinary();
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        console.warn("[UPLOAD FALLBACK] Cloudinary not configured. Storing data URL directly.");
        secureUrl = fileData;
        cloudinaryId = "mock_" + Date.now();
      } else {
        const uploadRes = await cloudinaryInstance.uploader.upload(fileData, {
          folder: "fmi/listings",
          resource_type: "auto",
        });
        secureUrl = uploadRes.secure_url;
        cloudinaryId = uploadRes.public_id;
      }
    }

    const [doc] = await db.insert(listingDocuments).values({
      listingId,
      type,
      name,
      url: secureUrl,
      cloudinaryId,
      isPrivate: true,
    }).returning();

    return { success: true, doc, url: secureUrl, cloudinaryId };
  } catch (error: any) {
    console.error("uploadListingDocument error:", error);
    return { success: false, error: error.message || "Failed to upload document" };
  }
}

// 4. Submit Listing For Review
export async function submitListingForReview(listingId: string) {
  try {
    if (!listingId) {
      return { success: false, error: "Listing ID is required" };
    }

    const [listing] = await db.select().from(listings).where(eq(listings.id, listingId));
    if (!listing) {
      return { success: false, error: "Listing not found" };
    }

    // Validation
    if (!listing.title || listing.title === "Draft Listing") {
      return { success: false, error: "Please provide a valid listing title." };
    }
    if (!listing.assetType) {
      return { success: false, error: "Please select an asset type." };
    }
    if (listing.monthlyRevenue === null || listing.monthlyProfit === null) {
      return { success: false, error: "Please provide financial metrics (monthly revenue & profit)." };
    }

    // Check for at least 1 document
    const docs = await db.select().from(listingDocuments).where(eq(listingDocuments.listingId, listingId));
    if (docs.length === 0) {
      return { success: false, error: "Please upload at least one required verification document (e.g., Financial statements, Analytics)." };
    }

    // Update status to in_review
    await db.update(listings)
      .set({ status: "in_review", updatedAt: new Date() })
      .where(eq(listings.id, listingId));

    // Create notification for admin
    const adminUsers = await db.select().from(users).where(eq(users.role, "admin"));
    for (const admin of adminUsers) {
      await db.insert(notifications).values({
        userId: admin.id,
        type: "admin_listing_review",
        title: "New listing submitted for review",
        body: `Listing "${listing.title}" has been submitted for admin review.`,
        isRead: false,
      });
    }

    // If no admin users exist, create an admin alert in system logs
    if (adminUsers.length === 0) {
      console.log(`[SYSTEM ALERT] No admin found to notify for listing review of "${listing.title}"`);
    }

    // Send email to seller
    const [seller] = await db.select().from(users).where(eq(users.id, listing.sellerId));
    if (seller && seller.email) {
      const resend = getResend();
      try {
        await resend.emails.send({
          from: EMAIL_FROM,
          to: seller.email,
          subject: "Listing Submitted — Under Review",
          html: `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
              <h2>Listing Received</h2>
              <p>Hi ${seller.name || "Seller"},</p>
              <p>Your listing <strong>"${listing.title}"</strong> has been successfully submitted and is under review.</p>
              <p>Our curation team will review the details and verified documents. This typically takes <strong>24–48 hours</strong>.</p>
              <p>Once approved, your listing will go live on the FMI marketplace!</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #666;">This is an automated notification from FMI Digital Exchange.</p>
            </div>
          `
        });
      } catch (err) {
        console.error("Failed to send review email to seller:", err);
      }
    }

    revalidatePath("/seller/listings");

    return { success: true };
  } catch (error: any) {
    console.error("submitListingForReview error:", error);
    return { success: false, error: error.message || "Failed to submit listing for review" };
  }
}

// 5. Get Seller's Listings
export async function getSellerListings(sellerId: string) {
  try {
    const list = await db.select().from(listings)
      .where(eq(listings.sellerId, sellerId))
      .orderBy(listings.createdAt);
    return { success: true, listings: list };
  } catch (error: any) {
    console.error("getSellerListings error:", error);
    return { success: false, error: error.message || "Failed to fetch listings" };
  }
}
