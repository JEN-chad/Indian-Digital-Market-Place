import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./lib/db/index.ts";
import { requireAuth, requireRole } from "./middleware.ts";
import { sendEmailOtp, verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp } from "./actions/auth.ts";
import { submitKyc, getKycStatus, updateRole, saveBuyerInterests } from "./actions/kyc.ts";
import { createListingDraft, updateListingStep, uploadListingDocument, submitListingForReview, getSellerListings } from "./actions/listings.ts";
import { submitOffer, acceptOffer, counterOffer, rejectOffer, withdrawOffer, acceptCounter, getBuyerOffers, getSellerOffers } from "./actions/offers.ts";
import { getDeal, advanceDealStage, completeChecklistItem, signAgreement, initiateEscrow, releaseEscrow, uploadDealDocument, getActiveDealsForUser, adminFundEscrow, getDealMessages, sendDealMessage } from "./actions/deals.ts";
import { getCloudinary } from "./lib/cloudinary.ts";
import { GoogleGenAI, Type } from "@google/genai";
import { eq, and, or, gte, lte, ilike, desc, asc, sql } from "drizzle-orm";
import { listings, ndaAgreements, payments, users, listingDocuments, notifications } from "./lib/db/schema.ts";
import { getRazorpay } from "./lib/razorpay.ts";
import crypto from "crypto";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 10mb limit for uploads
  app.use(express.json({ limit: "10mb" }));

  // 1. API Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "FMI API Server",
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
        let sellerId = "mock-seller-id-123";
        const sellers = await db.select().from(users).limit(1);
        if (sellers.length > 0) {
          sellerId = sellers[0].id;
        } else {
          // Insert a mock seller user
          await db.insert(users).values({
            id: sellerId,
            email: "seller@fmi.sandbox",
            name: "Rahul Sharma",
            role: "both",
            kycStatus: "approved",
            createdAt: new Date(),
          });
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
          await db.insert(listings).values(item);
          
          // Seed private documents for each
          await db.insert(listingDocuments).values({
            id: `doc-${item.id}-1`,
            listingId: item.id,
            name: "Verified P&L Balance Sheets FY25.pdf",
            type: "financial",
            url: "https://fmi.sandbox.google.com/pnl-report-secured.pdf",
            isPrivate: true,
            createdAt: new Date(),
          });
          await db.insert(listingDocuments).values({
            id: `doc-${item.id}-2`,
            listingId: item.id,
            name: "Google Analytics Verified Traffic Overview.pdf",
            type: "traffic",
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
  app.post("/api/payments/order", async (req, res) => {
    try {
      const { amount, purpose, listingId, userId } = req.body;
      const resolvedUserId = userId || "sandbox-buyer-id-abc";

      // Create tracking payment record
      const paymentRecordId = `pay-${Date.now()}`;
      await db.insert(payments).values({
        id: paymentRecordId,
        userId: resolvedUserId,
        amount: amount,
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
  app.post("/api/actions/submit-kyc", async (req, res) => {
    try {
      const result = await submitKyc(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/get-kyc-status", async (req, res) => {
    try {
      const { userId } = req.body;
      const result = await getKycStatus(userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/update-role", async (req, res) => {
    try {
      const { userId, role } = req.body;
      const result = await updateRole(userId, role);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/save-buyer-interests", async (req, res) => {
    try {
      const result = await saveBuyerInterests(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Listings Action Endpoints
  app.post("/api/actions/create-listing-draft", async (req, res) => {
    try {
      const { sellerId, initialData } = req.body;
      const result = await createListingDraft(sellerId, initialData);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/update-listing-step", async (req, res) => {
    try {
      const { listingId, stepData } = req.body;
      const result = await updateListingStep(listingId, stepData);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/upload-listing-document", async (req, res) => {
    try {
      const { listingId, fileData, type, name } = req.body;
      const result = await uploadListingDocument(listingId, fileData, type, name);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/submit-listing-for-review", async (req, res) => {
    try {
      const { listingId } = req.body;
      const result = await submitListingForReview(listingId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/get-seller-listings", async (req, res) => {
    try {
      const { sellerId } = req.body;
      const result = await getSellerListings(sellerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Offer Flow Endpoints
  app.post("/api/actions/offers/submit", async (req, res) => {
    try {
      const result = await submitOffer(req.body);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/offers/accept", async (req, res) => {
    try {
      const { offerId, sellerId } = req.body;
      const result = await acceptOffer(offerId, sellerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/offers/counter", async (req, res) => {
    try {
      const { offerId, counterAmount, message, sellerId } = req.body;
      const result = await counterOffer(offerId, counterAmount, message, sellerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/offers/reject", async (req, res) => {
    try {
      const { offerId, reason, sellerId } = req.body;
      const result = await rejectOffer(offerId, reason, sellerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/offers/withdraw", async (req, res) => {
    try {
      const { offerId, buyerId } = req.body;
      const result = await withdrawOffer(offerId, buyerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/offers/accept-counter", async (req, res) => {
    try {
      const { offerId, buyerId } = req.body;
      const result = await acceptCounter(offerId, buyerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/actions/offers/buyer", async (req, res) => {
    try {
      const buyerId = req.query.buyerId as string;
      const result = await getBuyerOffers(buyerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/actions/offers/seller", async (req, res) => {
    try {
      const sellerId = req.query.sellerId as string;
      const result = await getSellerOffers(sellerId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Deal Management Endpoints
  app.get("/api/actions/deals", async (req, res) => {
    try {
      const { userId, role } = req.query;
      const result = await getActiveDealsForUser(userId as string, role as "buyer" | "seller");
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/actions/deals/detail", async (req, res) => {
    try {
      const { dealId, userId } = req.query;
      const result = await getDeal(dealId as string, userId as string);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/advance", async (req, res) => {
    try {
      const { dealId, newStage, userId } = req.body;
      const result = await advanceDealStage(dealId, newStage, userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/checklist/complete", async (req, res) => {
    try {
      const { itemId, dealId, userId } = req.body;
      const result = await completeChecklistItem(itemId, dealId, userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/sign", async (req, res) => {
    try {
      const { dealId, role, userId } = req.body;
      const result = await signAgreement(dealId, role, userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/escrow/initiate", async (req, res) => {
    try {
      const { dealId } = req.body;
      const result = await initiateEscrow(dealId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/escrow/release", async (req, res) => {
    try {
      const { dealId, role } = req.body;
      const result = await releaseEscrow(dealId, role);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/escrow/admin-fund", async (req, res) => {
    try {
      const { dealId } = req.body;
      const result = await adminFundEscrow(dealId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/documents/upload", async (req, res) => {
    try {
      const { dealId, data, userId } = req.body;
      const result = await uploadDealDocument(dealId, data, userId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/actions/deals/messages", async (req, res) => {
    try {
      const dealId = req.query.dealId as string;
      const result = await getDealMessages(dealId);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/deals/messages/send", async (req, res) => {
    try {
      const { dealId, senderId, content } = req.body;
      const result = await sendDealMessage(dealId, senderId, content);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
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
        console.warn("[UPLOAD FALLBACK] Cloudinary not configured. Using data URL fallback.");
        const mockUrl = file.startsWith("data:") ? file : `data:image/png;base64,${file}`;
        return res.json({ success: true, secure_url: mockUrl });
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
