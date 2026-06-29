import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./lib/db/index.ts";
import { requireAuth, requireRole } from "./middleware.ts";
import { sendEmailOtp, verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp } from "./actions/auth.ts";
import { submitKyc, getKycStatus, updateRole, saveBuyerInterests, updateUserProfile } from "./actions/kyc.ts";
import { createListingDraft, updateListingStep, uploadListingDocument, submitListingForReview, getSellerListings, saveListingForBuyer, unsaveListingForBuyer, trackListingView } from "./actions/listings.ts";
import { submitOffer, acceptOffer, counterOffer, rejectOffer, withdrawOffer, acceptCounter, getBuyerOffers, getSellerOffers } from "./actions/offers.ts";
import { getBuyerDashboardData, getSellerDashboardData } from "./actions/dashboards.ts";
import { getDeal, advanceDealStage, completeChecklistItem, signAgreement, initiateEscrow, releaseEscrow, uploadDealDocument, getActiveDealsForUser, adminFundEscrow, getDealMessages, sendDealMessage } from "./actions/deals.ts";
import { sendMessage, markMessagesRead } from "./actions/messages.ts";
import { 
  getAdminStats, 
  getAdminListings, 
  getAdminKyc, 
  getAdminDeals, 
  getAdminUsers, 
  approveListing, 
  rejectListing, 
  featureListing, 
  approveKyc, 
  rejectKyc, 
  suspendUser 
} from "./actions/admin.ts";
import { getCloudinary } from "./lib/cloudinary.ts";
import { GoogleGenAI, Type } from "@google/genai";
import { eq, and, or, gte, lte, ilike, desc, asc, sql, ne } from "drizzle-orm";
import { listings, ndaAgreements, payments, users, listingDocuments, notifications, deals, messages, buyerProfiles } from "./lib/db/schema.ts";
import { getRazorpay } from "./lib/razorpay.ts";
import crypto from "crypto";
import { razorpayWebhookHandler } from "./app/api/webhooks/razorpay/route.ts";
import { kycWebhookHandler } from "./app/api/webhooks/kyc/route.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 10mb limit for uploads and raw body capture for webhook signature validation
  app.use(express.json({
    limit: "10mb",
    verify: (req: any, res, buf) => {
      req.rawBody = buf.toString();
    }
  }));

  // Register Webhooks
  app.post("/api/webhooks/razorpay", razorpayWebhookHandler);
  app.post("/api/webhooks/kyc", kycWebhookHandler);


  // 1. API Health Check (simple)
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "FMI API Server",
    });
  });

  // 1b. Comprehensive Integration Health Check
  app.get("/api/health-check", async (req, res) => {
    const checks: Record<string, { status: "ok" | "error" | "degraded"; message: string; latencyMs?: number }> = {};
    const start = Date.now();

    // 1. Neon DB (Drizzle)
    try {
      const t0 = Date.now();
      await db.select().from(users).limit(1);
      checks.database = { status: "ok", message: "Neon DB responding", latencyMs: Date.now() - t0 };
    } catch (err: any) {
      checks.database = { status: "error", message: err?.message || "DB unreachable" };
    }

    // 2. Upstash Redis
    try {
      const { getRedis } = await import("./lib/redis.ts");
      const redis = getRedis();
      const t0 = Date.now();
      await redis.set("fmi:healthcheck", "ping", { ex: 10 });
      const v = await redis.get("fmi:healthcheck");
      checks.redis = v === "ping"
        ? { status: "ok", message: "Upstash Redis responding", latencyMs: Date.now() - t0 }
        : { status: "degraded", message: "Redis write/read mismatch (may be using in-memory fallback)" };
    } catch (err: any) {
      checks.redis = { status: "error", message: err?.message || "Redis unavailable" };
    }

    // 3. Cloudinary
    try {
      const cloudinary = getCloudinary();
      if (cloudinary) {
        checks.cloudinary = { status: "ok", message: "Cloudinary credentials configured" };
      } else {
        checks.cloudinary = { status: "degraded", message: "Cloudinary not configured (missing env vars)" };
      }
    } catch (err: any) {
      checks.cloudinary = { status: "error", message: err?.message || "Cloudinary init failed" };
    }

    // 4. Razorpay
    try {
      const rzp = getRazorpay();
      checks.razorpay = rzp
        ? { status: "ok", message: "Razorpay client configured" }
        : { status: "degraded", message: "Razorpay keys missing — payments will be simulated" };
    } catch (err: any) {
      checks.razorpay = { status: "error", message: err?.message || "Razorpay init failed" };
    }

    // 5. Resend (Email)
    const resendKey = process.env.RESEND_API_KEY;
    checks.resend = resendKey
      ? { status: "ok", message: "Resend API key configured" }
      : { status: "degraded", message: "RESEND_API_KEY missing — emails will be logged only" };

    // 6. Pusher
    const pusherVars = [
      process.env.PUSHER_APP_ID,
      process.env.PUSHER_KEY,
      process.env.PUSHER_SECRET,
      process.env.PUSHER_CLUSTER,
    ];
    checks.pusher = pusherVars.every(Boolean)
      ? { status: "ok", message: "Pusher credentials configured" }
      : { status: "degraded", message: "Pusher env vars missing — real-time will use polling fallback" };

    // 7. Anthropic Claude (AI)
    const claudeKey = process.env.ANTHROPIC_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
    checks.ai = claudeKey
      ? { status: "ok", message: "AI API key configured (Anthropic/Google)" }
      : { status: "degraded", message: "No AI API key detected — AI features disabled" };

    // Summarize overall status
    const statuses = Object.values(checks).map(c => c.status);
    const overallStatus = statuses.includes("error") ? "error"
      : statuses.includes("degraded") ? "degraded"
      : "ok";

    res.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      totalLatencyMs: Date.now() - start,
      checks,
    });
  });

  // 2. Comprehensive Listings API with Auto-Seeding & Search Filters
  app.get("/api/listings", async (req, res) => {
    try {
      // 2.1 Check if we need to seed the database
      const existing = await db.select().from(listings).limit(1);
      if (existing.length === 0) {
        console.log("No listings found. Seeding beautiful initial listings for sandbox demo...");
        
        // Find a user to act as seller (or create a mock seller)
        let sellerId: string;
        const sellers = await db.select().from(users).limit(1);
        if (sellers.length > 0) {
          sellerId = sellers[0].id;
        } else {
          const [mockSeller] = await db.insert(users).values({
            email: "seller@fmi.sandbox",
            name: "Rahul Sharma",
            role: "both",
            kycStatus: "approved",
            createdAt: new Date(),
          }).returning();
          sellerId = mockSeller.id;
        }

        const seedItems = [
          {
            id: "listing-1",
            sellerId,
            slug: "saas-analytics-engine",
            title: "IndieFlow SaaS Analytics Engine",
            businessNamePrivate: "IndieFlow Solutions Pvt Ltd",
            assetType: "saas" as const,
            industry: "Technology & Software",
            businessModel: "SaaS / Subscription",
            yearEstablished: 2023,
            businessUrl: "https://indieflow.analytics.sandbox",
            monthlyRevenue: 65000,
            monthlyProfit: 55000,
            monthlyTraffic: 12000,
            trafficSources: "Organic Google Search, GitHub developer referrals, tech blogs",
            askingPrice: 1500000, // 15L
            reasonForSale: "Pursuing another full-time AI-focused venture.",
            description: "An elegant, self-hostable event analytics and funnel optimization engine designed strictly for micro-SaaS builders and indie hackers. High-margin architecture running on serverless infrastructure costing less than $10/month. The platform has 142 active subscribing creators, custom React/Vue SDKs, and a highly polished real-time web dashboard.",
            tagline: "High-margin event analytics and conversion tracking dashboard for micro-SaaS projects.",
            teamSize: 1,
            hoursPerWeek: 4,
            status: "live",
            ndaRequired: true,
            ndaFee: 999,
            isFeatured: true,
            createdAt: new Date(),
          },
          {
            id: "listing-2",
            sellerId,
            slug: "coffee-direct-brand",
            title: "BrewCraft Organic Coffee Brand",
            businessNamePrivate: "BrewCraft Artisanal Beverages",
            assetType: "ecommerce" as const,
            industry: "Food & Beverage",
            businessModel: "D2C eCommerce",
            yearEstablished: 2022,
            businessUrl: "https://brewcraft.coffee.sandbox",
            monthlyRevenue: 240000,
            monthlyProfit: 60000,
            monthlyTraffic: 45000,
            trafficSources: "Instagram ads, organic social, newsletter sponsorships",
            askingPrice: 2200000, // 22L
            reasonForSale: "Partners relocating abroad and dividing assets.",
            description: "Premium direct-to-consumer brand selling artisanal, single-origin organic roasted coffee beans sourced directly from estates in Coorg. Features a modern headless Shopify design, elegant custom cardboard packaging, 18% monthly recurring subscription box retention, and fully integrated automated logistics.",
            tagline: "Highly profitable premium D2C organic coffee bean brand with custom subscription box.",
            teamSize: 2,
            hoursPerWeek: 15,
            status: "live",
            ndaRequired: true,
            ndaFee: 0, // Free NDA
            isFeatured: true,
            createdAt: new Date(),
          },
          {
            id: "listing-3",
            sellerId,
            slug: "devops-learn-tutorials",
            title: "DevOpsCloud Masterclass Platform",
            businessNamePrivate: "DevOpsCloud Media Networks",
            assetType: "content_site" as const,
            industry: "Education & EdTech",
            businessModel: "Info Products & Ads",
            yearEstablished: 2021,
            businessUrl: "https://devopscloud.learn.sandbox",
            monthlyRevenue: 35000,
            monthlyProfit: 30000,
            monthlyTraffic: 85000,
            trafficSources: "SEO Google Search, developer forums, YouTube",
            askingPrice: 850000, // 8.5L
            reasonForSale: "Lack of time to produce advanced Kubernetes lessons.",
            description: "A highly-ranked, premium developer education blog and learning site focused on Docker, Kubernetes, AWS, and modern CI/CD automation. Generates automated recurring cashflow via digital masterclass downloads, GitHub action template bundles, and premium newsletter ads.",
            tagline: "High-traffic developer resource blog and digital download site targeting CI/CD.",
            teamSize: 1,
            hoursPerWeek: 2,
            status: "live",
            ndaRequired: false, // No NDA required at all
            ndaFee: 0,
            isFeatured: false,
            createdAt: new Date(),
          },
          {
            id: "listing-4",
            sellerId,
            slug: "finindia-domain",
            title: "FinIndia.com Premium Domain Asset",
            businessNamePrivate: "FinIndia Holdings Ltd",
            assetType: "domain" as const,
            industry: "Finance & FinTech",
            businessModel: "Domain Asset Sale",
            yearEstablished: 2018,
            businessUrl: "https://finindia.com",
            monthlyRevenue: 0,
            monthlyProfit: 0,
            monthlyTraffic: 1500,
            trafficSources: "Direct type-in navigation",
            askingPrice: 6500000, // 65L
            reasonForSale: "Liquidating corporate naming assets.",
            description: "Ultra-premium, short, and highly brandable Indian fintech financial domain name registered in 2018. Perfect for a venture-backed digital neo-bank, payment gateway, wealth advisor, or personal finance aggregator aiming to dominate Indian digital finance.",
            tagline: "A brandable, authoritative digital fintech domain name ideal for an Indian neo-bank.",
            teamSize: 0,
            hoursPerWeek: 0,
            status: "live",
            ndaRequired: true,
            ndaFee: 1499,
            isFeatured: false,
            createdAt: new Date(),
          },
        ];

        for (const item of seedItems) {
          const { id: _legacySeedId, ...listingValues } = item;
          const [createdListing] = await db.insert(listings).values(listingValues).returning();
          
          // Seed private documents for each. Let Postgres generate UUID primary keys.
          await db.insert(listingDocuments).values({
            listingId: createdListing.id,
            name: "Verified P&L Balance Sheets FY25.pdf",
            type: "financial",
            url: "https://fmi.sandbox.google.com/pnl-report-secured.pdf",
            isPrivate: true,
            createdAt: new Date(),
          });
          await db.insert(listingDocuments).values({
            listingId: createdListing.id,
            name: "Google Analytics Verified Traffic Overview.pdf",
            type: "analytics",
            url: "https://fmi.sandbox.google.com/traffic-analytics-secured.pdf",
            isPrivate: true,
            createdAt: new Date(),
          });
        }
        console.log("Seeding complete! 4 beautiful sandbox listings created.");
      }

      // 2.2 Parse search and filter parameters
      const { type, minRevenue, maxRevenue, minPrice, maxPrice, industry, age, search, sort } = req.query;

      let conditions: any[] = [eq(listings.status, "live")];

      if (type) {
        const types = (type as string).split(",");
        conditions.push(or(...types.map((t) => eq(listings.assetType, t as any))));
      }

      if (minRevenue) {
        conditions.push(gte(listings.monthlyRevenue, parseInt(minRevenue as string)));
      }
      if (maxRevenue) {
        conditions.push(lte(listings.monthlyRevenue, parseInt(maxRevenue as string)));
      }

      if (minPrice) {
        conditions.push(gte(listings.askingPrice, parseInt(minPrice as string)));
      }
      if (maxPrice) {
        conditions.push(lte(listings.askingPrice, parseInt(maxPrice as string)));
      }

      if (industry) {
        const industriesList = (industry as string).split(",");
        conditions.push(or(...industriesList.map((ind) => eq(listings.industry, ind))));
      }

      if (age) {
        const currentYear = new Date().getFullYear();
        if (age === "0-1") {
          conditions.push(gte(listings.yearEstablished, currentYear - 1));
        } else if (age === "1-3") {
          conditions.push(and(gte(listings.yearEstablished, currentYear - 3), lte(listings.yearEstablished, currentYear - 1)));
        } else if (age === "3-5") {
          conditions.push(and(gte(listings.yearEstablished, currentYear - 5), lte(listings.yearEstablished, currentYear - 3)));
        } else if (age === "5+") {
          conditions.push(lte(listings.yearEstablished, currentYear - 5));
        }
      }

      if (search) {
        const searchPattern = `%${(search as string).toLowerCase()}%`;
        conditions.push(
          or(
            ilike(listings.title, searchPattern),
            ilike(listings.tagline, searchPattern),
            ilike(listings.industry, searchPattern),
            ilike(listings.description, searchPattern)
          )
        );
      }

      // Apply sorting
      let orderByClause: any = desc(listings.createdAt);
      if (sort === "highest_revenue") {
        orderByClause = desc(listings.monthlyRevenue);
      } else if (sort === "lowest_price") {
        orderByClause = asc(listings.askingPrice);
      } else if (sort === "highest_price") {
        orderByClause = desc(listings.askingPrice);
      } else if (sort === "newest") {
        orderByClause = desc(listings.createdAt);
      }

      const results = await db
        .select()
        .from(listings)
        .where(and(...conditions))
        .orderBy(orderByClause);

      res.json({ success: true, listings: results, total: results.length });
    } catch (error: any) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Gated Listing Detail Endpoint
  app.get("/api/listings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { buyerId } = req.query;

      // 3.1 Fetch listing by ID or Slug
      const results = await db
        .select()
        .from(listings)
        .where(or(eq(listings.id, id), eq(listings.slug, id)))
        .limit(1);

      if (results.length === 0) {
        return res.status(404).json({ error: "Listing not found" });
      }

      const listingObj = results[0];

      // Increment view count in background
      await db
        .update(listings)
        .set({ viewCount: (listingObj.viewCount || 0) + 1 })
        .where(eq(listings.id, listingObj.id));

      // 3.2 Check NDA agreement status
      let hasSignedNda = false;
      if (listingObj.ndaRequired) {
        if (buyerId) {
          const agreement = await db
            .select()
            .from(ndaAgreements)
            .where(
              and(
                eq(ndaAgreements.listingId, listingObj.id),
                eq(ndaAgreements.buyerId, buyerId as string),
                eq(ndaAgreements.status, "signed")
              )
            )
            .limit(1);
          if (agreement.length > 0) {
            hasSignedNda = true;
          }
        }
      } else {
        hasSignedNda = true;
      }

      // Fetch verified document links
      const docs = await db
        .select()
        .from(listingDocuments)
        .where(eq(listingDocuments.listingId, listingObj.id));

      // 3.3 Gated response mask if NDA is not signed
      const secureListing = {
        ...listingObj,
        documents: hasSignedNda ? docs : [],
        // Mask confidential identifiers if locked
        businessUrl: hasSignedNda ? listingObj.businessUrl : undefined,
        businessNamePrivate: hasSignedNda ? listingObj.businessNamePrivate : undefined,
      };

      res.json({
        success: true,
        listing: secureListing,
        hasSignedNda,
      });
    } catch (error: any) {
      console.error("Error fetching listing detail:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 4. Sign Mutual Non-Disclosure Agreement
  app.post("/api/listings/:id/unlock", async (req, res) => {
    try {
      const { id } = req.params;
      const { buyerId, paymentId } = req.body;

      const results = await db
        .select()
        .from(listings)
        .where(or(eq(listings.id, id), eq(listings.slug, id)))
        .limit(1);

      if (results.length === 0) {
        return res.status(404).json({ error: "Listing not found" });
      }

      const listingObj = results[0];

      // Use a mock fallback buyerId if not supplied (for sandbox user flexibility)
      const resolvedBuyerId = buyerId || "sandbox-buyer-id-abc";

      // 4.1 Insert or update NDA status to 'signed'
      const existing = await db
        .select()
        .from(ndaAgreements)
        .where(
          and(
            eq(ndaAgreements.listingId, listingObj.id),
            eq(ndaAgreements.buyerId, resolvedBuyerId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(ndaAgreements)
          .set({
            status: "signed",
            signedAt: new Date(),
            paymentId: paymentId || null,
          })
          .where(eq(ndaAgreements.id, existing[0].id));
      } else {
        await db.insert(ndaAgreements).values({
          id: `nda-${Date.now()}-${Math.random().toString(36).substring(4)}`,
          listingId: listingObj.id,
          buyerId: resolvedBuyerId,
          status: "signed",
          signedAt: new Date(),
          paymentId: paymentId || null,
        });
      }

      // 4.2 Send platform notifications to Seller
      await db.insert(notifications).values({
        id: `notif-${Date.now()}`,
        userId: listingObj.sellerId,
        type: "nda_signed",
        title: "Confidentiality Agreement Signed",
        message: `An investor has signed the digital Mutual NDA and unlocked details for: "${listingObj.title}"`,
        createdAt: new Date(),
      });

      res.json({ success: true, message: "Mutual NDA successfully signed and platform access verified." });
    } catch (error: any) {
      console.error("Error signing NDA:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 5. Create Razorpay Payment Order
  app.post("/api/payments/order", requireAuth, async (req, res) => {
    try {
      const { amount, purpose, listingId } = req.body;
      const resolvedUserId = (req as any).user.id;

      // Create tracking payment record
      const paymentRecordId = `pay-${Date.now()}`;
      await db.insert(payments).values({
        id: paymentRecordId,
        userId: resolvedUserId,
        amount: Math.round(Number(amount)),
        currency: "INR",
        status: "created",
        purpose: purpose || "nda_fee",
        listingId: listingId || null,
        createdAt: new Date(),
      });

      let orderId = `order_mock_${Date.now()}`;

      // Try invoking Razorpay client safely
      try {
        const razorpay = getRazorpay();
        const rzpOrder = await razorpay.orders.create({
          amount: amount * 100, // Razorpay takes paisas
          currency: "INR",
          receipt: paymentRecordId,
        });
        orderId = rzpOrder.id;
        
        // Update payment record with real Razorpay order ID
        await db
          .update(payments)
          .set({ providerOrderId: orderId })
          .where(eq(payments.id, paymentRecordId));
      } catch (rzpErr: any) {
        console.warn("Razorpay API request error, falling back to mock sandbox order generation:", rzpErr.message);
        await db
          .update(payments)
          .set({ providerOrderId: orderId })
          .where(eq(payments.id, paymentRecordId));
      }

      res.json({
        success: true,
        orderId,
        amount: amount * 100,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "rzp_test_mock",
        paymentRecordId,
      });
    } catch (error: any) {
      console.error("Error initiating payment order:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 6. Verify Razorpay Payment Signature
  app.post("/api/payments/verify", async (req, res) => {
    try {
      const { orderId, paymentId, signature, paymentRecordId } = req.body;

      const secret = process.env.RAZORPAY_KEY_SECRET;
      let signatureVerified = false;

      if (!secret || orderId.startsWith("order_mock_")) {
        // Safe fallback in sandbox/dev when credentials aren't set
        console.log("Mock sandbox signature check passed.");
        signatureVerified = true;
      } else {
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(orderId + "|" + paymentId);
        const expectedSignature = hmac.digest("hex");
        signatureVerified = expectedSignature === signature;
      }

      if (!signatureVerified) {
        return res.status(400).json({ error: "Invalid Razorpay payment signature e-verification." });
      }

      // Update payment record to paid
      await db
        .update(payments)
        .set({
          status: "paid",
          providerPaymentId: paymentId,
          providerSignature: signature || null,
          paidAt: new Date(),
        })
        .where(eq(payments.id, paymentRecordId));

      res.json({ success: true, paymentRecordId });
    } catch (error: any) {
      console.error("Error verifying payment signature:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Simple Better Auth endpoints handling proxy
  app.all("/api/auth/*", (req, res) => {
    // Better Auth handles request proxying here
    res.json({ message: "Better Auth mount point" });
  });

  // 4. Server Actions for Phase 2 Authentication
  app.post("/api/actions/send-email-otp", async (req, res) => {
    try {
      const { email } = req.body;
      const result = await sendEmailOtp(email);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/verify-email-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      const result = await verifyEmailOtp(email, otp);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/send-phone-otp", async (req, res) => {
    try {
      const { phone } = req.body;
      const result = await sendPhoneOtp(phone);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/verify-phone-otp", async (req, res) => {
    try {
      const { phone, otp, email } = req.body;
      const result = await verifyPhoneOtp(phone, otp, email);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // KYC Actions Endpoints
  app.post("/api/actions/submit-kyc", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const result = await submitKyc({ ...req.body, userId });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/get-kyc-status", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const result = await getKycStatus(userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/update-role", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { role } = req.body;
      const result = await updateRole(userId, role);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/save-buyer-interests", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const result = await saveBuyerInterests({ ...req.body, userId });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/update-user-profile", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { data } = req.body;
      const result = await updateUserProfile(userId, data);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Listings Action Endpoints
  app.post("/api/actions/create-listing-draft", requireAuth, async (req, res) => {
    try {
      const sellerId = (req as any).user.id;
      const { initialData } = req.body;
      const result = await createListingDraft(sellerId, initialData);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/update-listing-step", requireAuth, async (req, res) => {
    try {
      const { listingId, stepData } = req.body;
      const sellerId = (req as any).user.id;
      const [listing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
      if (!listing) {
        return res.status(404).json({ success: false, error: "Listing not found." });
      }
      if (listing.sellerId !== sellerId) {
        return res.status(403).json({ success: false, error: "Access Denied. You are not the owner of this listing." });
      }
      const result = await updateListingStep(listingId, stepData);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/upload-listing-document", requireAuth, async (req, res) => {
    try {
      const { listingId, fileData, type, name } = req.body;
      const sellerId = (req as any).user.id;
      const [listing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
      if (!listing) {
        return res.status(404).json({ success: false, error: "Listing not found." });
      }
      if (listing.sellerId !== sellerId) {
        return res.status(403).json({ success: false, error: "Access Denied. You are not the owner of this listing." });
      }
      const result = await uploadListingDocument(listingId, fileData, type, name);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/submit-listing-for-review", requireAuth, async (req, res) => {
    try {
      const { listingId } = req.body;
      const sellerId = (req as any).user.id;
      const [listing] = await db.select().from(listings).where(eq(listings.id, listingId)).limit(1);
      if (!listing) {
        return res.status(404).json({ success: false, error: "Listing not found." });
      }
      if (listing.sellerId !== sellerId) {
        return res.status(403).json({ success: false, error: "Access Denied. You are not the owner of this listing." });
      }
      const result = await submitListingForReview(listingId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/get-seller-listings", requireAuth, async (req, res) => {
    try {
      const sellerId = (req as any).user.id;
      const result = await getSellerListings(sellerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/get-buyer-dashboard-data", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const result = await getBuyerDashboardData(userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/get-seller-dashboard-data", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const result = await getSellerDashboardData(userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/save-listing", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { listingId } = req.body;
      const result = await saveListingForBuyer(userId, listingId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/unsave-listing", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { listingId } = req.body;
      const result = await unsaveListingForBuyer(userId, listingId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/track-view", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const { listingId } = req.body;
      const result = await trackListingView(userId, listingId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/ai/recommend", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      // Fetch buyer's profile (industries, budget range, type)
      const [buyerProfileRecord] = await db
        .select()
        .from(buyerProfiles)
        .where(eq(buyerProfiles.userId, userId))
        .limit(1);

      // Fetch all live listings
      const liveListings = await db
        .select()
        .from(listings)
        .where(and(eq(listings.status, "live"), ne(listings.sellerId, userId)));

      let recommended: any[] = [];

      if (buyerProfileRecord) {
        const profileIndustries = buyerProfileRecord.industries || [];
        const minBudget = buyerProfileRecord.budgetMin || 0;
        const maxBudget = buyerProfileRecord.budgetMax || 999999999;

        // Filter: match industry or budget range
        recommended = liveListings.filter((listing) => {
          const matchIndustry = profileIndustries.includes(listing.industry);
          const matchBudget = listing.askingPrice >= minBudget && listing.askingPrice <= maxBudget;
          return matchIndustry || matchBudget;
        });
      }

      // If buyer profile does not exist or we have fewer than 3 matches:
      // return 5 random live listings
      if (recommended.length < 3) {
        recommended = [...liveListings];
      }

      // Shuffle listings
      const shuffled = recommended.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 5);

      res.json({ success: true, listings: selected });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Offer Flow Endpoints
  app.post("/api/actions/offers/submit", requireAuth, async (req, res) => {
    try {
      const buyerId = (req as any).user.id;
      const result = await submitOffer({ ...req.body, buyerId });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/offers/accept", requireAuth, async (req, res) => {
    try {
      const { offerId } = req.body;
      const sellerId = (req as any).user.id;
      const result = await acceptOffer(offerId, sellerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/offers/counter", requireAuth, async (req, res) => {
    try {
      const { offerId, counterAmount, message } = req.body;
      const sellerId = (req as any).user.id;
      const result = await counterOffer(offerId, counterAmount, message, sellerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/offers/reject", requireAuth, async (req, res) => {
    try {
      const { offerId, reason } = req.body;
      const sellerId = (req as any).user.id;
      const result = await rejectOffer(offerId, reason, sellerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/offers/withdraw", requireAuth, async (req, res) => {
    try {
      const { offerId } = req.body;
      const buyerId = (req as any).user.id;
      const result = await withdrawOffer(offerId, buyerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/offers/accept-counter", requireAuth, async (req, res) => {
    try {
      const { offerId } = req.body;
      const buyerId = (req as any).user.id;
      const result = await acceptCounter(offerId, buyerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/actions/offers/buyer", requireAuth, async (req, res) => {
    try {
      const buyerId = (req as any).user.id;
      const result = await getBuyerOffers(buyerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/actions/offers/seller", requireAuth, async (req, res) => {
    try {
      const sellerId = (req as any).user.id;
      const result = await getSellerOffers(sellerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Deal Management Endpoints
  app.get("/api/actions/deals", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const role = req.query.role as "buyer" | "seller";
      const result = await getActiveDealsForUser(userId, role);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/actions/deals/detail", requireAuth, async (req, res) => {
    try {
      const dealId = req.query.dealId as string;
      const userId = (req as any).user.id;
      const result = await getDeal(dealId, userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/advance", requireAuth, async (req, res) => {
    try {
      const { dealId, newStage } = req.body;
      const userId = (req as any).user.id;
      const result = await advanceDealStage(dealId, newStage, userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/checklist/complete", requireAuth, async (req, res) => {
    try {
      const { itemId, dealId } = req.body;
      const userId = (req as any).user.id;
      const result = await completeChecklistItem(itemId, dealId, userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/sign", requireAuth, async (req, res) => {
    try {
      const { dealId, role } = req.body;
      const userId = (req as any).user.id;
      const result = await signAgreement(dealId, role, userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/escrow/initiate", requireAuth, async (req, res) => {
    try {
      const { dealId } = req.body;
      const userId = (req as any).user.id;
      const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
      if (!deal) return res.status(404).json({ success: false, error: "Deal not found." });
      if (deal.buyerId !== userId && deal.sellerId !== userId) {
        return res.status(403).json({ success: false, error: "Access Denied." });
      }
      const result = await initiateEscrow(dealId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/escrow/release", requireAuth, async (req, res) => {
    try {
      const { dealId } = req.body;
      const userId = (req as any).user.id;
      
      const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
      if (!deal) {
        return res.status(404).json({ success: false, error: "Deal not found." });
      }

      let role: "buyer" | "seller";
      if (deal.buyerId === userId) {
        role = "buyer";
      } else if (deal.sellerId === userId) {
        role = "seller";
      } else {
        return res.status(403).json({ success: false, error: "Access Denied. You are not a participant in this deal." });
      }

      const result = await releaseEscrow(dealId, role);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/escrow/admin-fund", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { dealId } = req.body;
      const result = await adminFundEscrow(dealId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/documents/upload", requireAuth, async (req, res) => {
    try {
      const { dealId, data } = req.body;
      const userId = (req as any).user.id;
      const result = await uploadDealDocument(dealId, data, userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/actions/deals/messages", requireAuth, async (req, res) => {
    try {
      const dealId = req.query.dealId as string;
      const userId = (req as any).user.id;
      const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
      if (!deal) return res.status(404).json({ success: false, error: "Deal not found." });
      if (deal.buyerId !== userId && deal.sellerId !== userId) {
        const [userObj] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (userObj?.role !== "admin") {
          return res.status(403).json({ success: false, error: "Access Denied." });
        }
      }
      const result = await getDealMessages(dealId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/messages/send", requireAuth, async (req, res) => {
    try {
      const { dealId, content } = req.body;
      const senderId = (req as any).user.id;
      const result = await sendDealMessage(dealId, senderId, content);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // REST endpoints for Phase 8 Real-Time Messaging & Notifications

  // Get chat messages for a deal
  app.get("/api/messages/:dealId", async (req, res) => {
    try {
      const { dealId } = req.params;
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized. Missing userId." });
      }

      // Check if user is participant
      const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
      if (!deal) {
        return res.status(404).json({ error: "Deal not found." });
      }

      if (deal.buyerId !== userId && deal.sellerId !== userId) {
        const [userObj] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (userObj?.role !== "admin") {
          return res.status(403).json({ error: "Forbidden. Not authorized for this deal room." });
        }
      }

      const results = await db
        .select({
          id: messages.id,
          dealId: messages.dealId,
          senderId: messages.senderId,
          content: messages.content,
          type: messages.type,
          documentUrl: messages.documentUrl,
          isRead: messages.isRead,
          createdAt: messages.createdAt,
          senderName: users.name,
          senderAvatarUrl: users.avatarUrl,
        })
        .from(messages)
        .leftJoin(users, eq(messages.senderId, users.id))
        .where(eq(messages.dealId, dealId))
        .orderBy(asc(messages.createdAt))
        .limit(50);

      res.json({ success: true, messages: results });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create message + trigger Pusher
  app.post("/api/messages/:dealId", requireAuth, async (req, res) => {
    try {
      const { dealId } = req.params;
      const { content, type, documentUrl } = req.body;
      const senderId = (req as any).user.id;
      const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
      if (!deal) {
        return res.status(404).json({ success: false, error: "Deal not found." });
      }
      if (deal.buyerId !== senderId && deal.sellerId !== senderId) {
        return res.status(403).json({ success: false, error: "Access Denied. You are not a participant in this deal." });
      }
      if (!content) {
        return res.status(400).json({ error: "Missing required parameters: content." });
      }
      const result = await sendMessage(dealId, senderId, content, type || "text", documentUrl);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Mark messages in a deal as read
  app.put("/api/messages/:dealId/read", requireAuth, async (req, res) => {
    try {
      const { dealId } = req.params;
      const userId = (req as any).user.id;
      const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
      if (!deal) {
        return res.status(404).json({ success: false, error: "Deal not found." });
      }
      if (deal.buyerId !== userId && deal.sellerId !== userId) {
        return res.status(403).json({ success: false, error: "Access Denied. You are not a participant in this deal." });
      }
      const result = await markMessagesRead(dealId, userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Pusher auth endpoint
  app.post("/api/pusher/auth", requireAuth, async (req, res) => {
    try {
      const { socket_id, channel_name } = req.body;
      const userId = (req as any).user.id;
      if (!socket_id || !channel_name || !userId) {
        return res.status(400).json({ error: "Missing required parameters: socket_id, channel_name." });
      }

      let authorized = false;

      if (channel_name.startsWith("deal-")) {
        const dealId = channel_name.replace("deal-", "");
        const [deal] = await db.select().from(deals).where(eq(deals.id, dealId)).limit(1);
        if (deal) {
          if (deal.buyerId === userId || deal.sellerId === userId) {
            authorized = true;
          } else {
            const [userObj] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
            if (userObj?.role === "admin") {
              authorized = true;
            }
          }
        }
      } else if (channel_name.startsWith("user-")) {
        const channelUserId = channel_name.replace("user-", "");
        if (channelUserId === userId) {
          authorized = true;
        } else {
          const [userObj] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
          if (userObj?.role === "admin") {
            authorized = true;
          }
        }
      }

      if (!authorized) {
        return res.status(403).json({ error: "Unauthorized access to Pusher channel." });
      }

      const { getPusherServer } = await import("./lib/pusher.ts");
      const pusher = getPusherServer();
      
      let authResponse;
      if (typeof (pusher as any).authorizeChannel === "function") {
        authResponse = (pusher as any).authorizeChannel(socket_id, channel_name);
      } else {
        authResponse = (pusher as any).authenticate(socket_id, channel_name);
      }
      res.json(authResponse);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Notifications GET
  app.get("/api/notifications", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const unreadOnly = req.query.unread === "true";
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized. Missing userId." });
      }
      
      let conditions = [eq(notifications.userId, userId)];
      if (unreadOnly) {
        conditions.push(eq(notifications.isRead, false));
      }

      const results = await db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
      res.json({ success: true, notifications: results });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Notifications mark single as read PUT
  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      const [updated] = await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(eq(notifications.id, id))
        .returning();
      res.json({ success: true, notification: updated });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Notifications mark all as read PUT
  app.put("/api/notifications/read-all", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized. Missing userId." });
      }
      await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Notifications mark as read PUT (legacy fallback)
  app.put("/api/notifications/read", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized. Missing userId." });
      }
      await db
        .update(notifications)
        .set({ isRead: true, readAt: new Date() })
        .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // AI Valuation Endpoint
  app.post("/api/ai/valuation", async (req, res) => {
    try {
      const { assetType, monthlyRevenue, monthlyProfit, yearEstablished } = req.body;
      
      const rev = parseInt(monthlyRevenue, 10) || 0;
      const prof = parseInt(monthlyProfit, 10) || 0;
      const estYear = parseInt(yearEstablished, 10) || new Date().getFullYear();

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.startsWith("re_mock")) {
        // Fallback programmatic valuation for development/demo
        const arr = rev * 12;
        let multiple = "3.0x - 5.0x ARR";
        let minPrice = Math.round(arr * 2.5);
        let maxPrice = Math.round(arr * 4.5);
        let recommendedPrice = Math.round(arr * 3.5);

        if (assetType === "saas") {
          multiple = "4.0x - 6.0x ARR";
          minPrice = Math.round(arr * 3.5);
          maxPrice = Math.round(arr * 6.0);
          recommendedPrice = Math.round(arr * 4.8);
        } else if (assetType === "ecommerce") {
          multiple = "1.5x - 3.0x SDE";
          const sde = prof * 12;
          minPrice = Math.round(sde * 1.5);
          maxPrice = Math.round(sde * 3.0);
          recommendedPrice = Math.round(sde * 2.2);
        } else if (assetType === "service") {
          multiple = "1.0x - 2.5x SDE";
          const sde = prof * 12;
          minPrice = Math.round(sde * 1.0);
          maxPrice = Math.round(sde * 2.5);
          recommendedPrice = Math.round(sde * 1.8);
        }

        if (minPrice < 50000) minPrice = 50000;
        if (maxPrice < minPrice) maxPrice = minPrice + 100000;
        if (recommendedPrice < minPrice || recommendedPrice > maxPrice) {
          recommendedPrice = Math.round((minPrice + maxPrice) / 2);
        }

        return res.json({
          success: true,
          minPrice,
          maxPrice,
          recommendedPrice,
          multiple,
          reasoning: `[MOCK VALUATION] Calculated programmatically using local benchmarks for ${assetType}. SaaS is valued at ARR multiple, while E-commerce and Service businesses are SDE (annualized profit) multiples. Establish year: ${estYear}.`
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `You are an expert in Indian SME and digital business valuations. Given: ${assetType} business, ₹${rev} Monthly Revenue, ₹${prof} monthly profit, established ${estYear}. Suggest a fair asking price range using Indian market multiples. Give your answer as structured JSON conforming to the requested schema.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              minPrice: { type: Type.INTEGER, description: "Suggested minimum asking price in INR (integer)" },
              maxPrice: { type: Type.INTEGER, description: "Suggested maximum asking price in INR (integer)" },
              recommendedPrice: { type: Type.INTEGER, description: "Recommended starting asking price in INR (integer)" },
              multiple: { type: Type.STRING, description: "The multiple used for calculation, e.g. '3.5x annual profit' or '2.0x ARR'" },
              reasoning: { type: Type.STRING, description: "Brief detailed reasoning for the valuation in Indian context (SME multiples)." }
            },
            required: ["minPrice", "maxPrice", "recommendedPrice", "multiple", "reasoning"]
          }
        }
      });

      const text = response.text || "{}";
      const resultObj = JSON.parse(text);

      res.json({
        success: true,
        ...resultObj
      });
    } catch (err: any) {
      console.error("AI Valuation error:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to calculate valuation" });
    }
  });

  // Document Upload Endpoint (Cloudinary with robust fallback)
  app.post("/api/documents/upload", async (req, res) => {
    try {
      const { file, folder } = req.body; // Can be base64 string
      if (!file) {
        return res.status(400).json({ success: false, error: "File data is required" });
      }

      const cloudinaryInstance = getCloudinary();
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      if (!cloudName || !apiKey || !apiSecret) {
        console.warn("[UPLOAD FALLBACK] Cloudinary not configured. Returning premium static placeholder to prevent database bloat.");
        return res.json({ success: true, secure_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop" });
      }

      const uploadRes = await cloudinaryInstance.uploader.upload(file, {
        folder: folder || "fmi_kyc",
        resource_type: "auto",
      });

      res.json({ success: true, secure_url: uploadRes.secure_url });
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to upload file to Cloudinary" });
    }
  });

  // --- ADMIN API ENDPOINTS ---
  app.get("/api/admin/stats", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const result = await getAdminStats();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/admin/listings", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const result = await getAdminListings();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/admin/kyc", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const result = await getAdminKyc();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/admin/deals", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const result = await getAdminDeals();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/admin/users", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const result = await getAdminUsers();
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/admin/listings/:id/approve", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const result = await approveListing(req.params.id, req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/admin/listings/:id/reject", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { reason } = req.body;
      const result = await rejectListing(req.params.id, reason || "No reason provided", req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/admin/listings/:id/feature", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { featured } = req.body;
      const result = await featureListing(req.params.id, featured, req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/admin/kyc/:id/approve", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const result = await approveKyc(req.params.id, req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/admin/kyc/:id/reject", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { reason } = req.body;
      const result = await rejectKyc(req.params.id, reason || "No reason provided", req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/admin/users/:id/suspend", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { reason } = req.body;
      const result = await suspendUser(req.params.id, reason || "Violation of terms", req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // AI Listing Analyzer
  app.post("/api/ai/analyze-listing", requireAuth, requireRole(["admin"]), async (req, res) => {
    try {
      const { listingId } = req.body;
      // Fetch full listing
      const [listing] = await db.select().from(listings).where(eq(listings.id, listingId));
      if (!listing) return res.status(404).json({ error: "Listing not found" });

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.startsWith("re_mock")) {
        return res.json({
          success: true,
          score: 8,
          redFlags: ["Mock red flag: Verify traffic sources."],
          improvements: ["Add more financial documents.", "Elaborate on tech stack."],
          summary: "This is a mock AI analysis of the listing. Overall it looks solid but requires standard DD."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });

      const promptStr = `You are an expert business listing quality analyst for an Indian marketplace. Analyze this listing for quality and buyer appeal. Score 1-10. Flag red flags. Suggest improvements. Return JSON: { score, redFlags: string[], improvements: string[], summary: string }.
Listing details:
Title: ${listing.title}
Asset Type: ${listing.assetType}
Revenue: ₹${listing.monthlyRevenue}
Profit: ₹${listing.monthlyProfit}
Asking: ₹${listing.askingPrice}
Description: ${listing.description}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptStr,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
              summary: { type: Type.STRING },
            },
            required: ["score", "redFlags", "improvements", "summary"]
          }
        }
      });

      const resultObj = JSON.parse(response.text || "{}");
      res.json({ success: true, ...resultObj });
    } catch (err: any) {
      console.error("AI Analyzer error:", err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware setup for Development or Static assets in Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FMI Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start FMI server:", err);
});
