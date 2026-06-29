import { pgTable, uuid, text, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").default(false),
  phone: text("phone").unique(),
  phoneVerified: boolean("phone_verified").default(false),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  role: text("role").$type<"buyer" | "seller" | "both" | "admin">().default("buyer"),
  kycStatus: text("kyc_status").$type<"not_started" | "pending" | "in_review" | "approved" | "rejected">().default("not_started"),
  kycType: text("kyc_type").$type<"individual" | "company">(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. KYC Profiles Table
export const kycProfiles = pgTable("kyc_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  fullName: text("full_name"),
  dob: text("dob"),
  street: text("street"),
  city: text("city"),
  state: text("state"),
  pinCode: text("pin_code"),
  panNumber: text("pan_number"),
  aadhaarLast4: text("aadhaar_last4"),
  panDocUrl: text("pan_doc_url"),
  aadhaarDocUrl: text("aadhaar_doc_url"),
  selfieUrl: text("selfie_url"),
  bankAccountName: text("bank_account_name"),
  bankAccountNumber: text("bank_account_number"),
  bankIfsc: text("bank_ifsc"),
  companyName: text("company_name"),
  cin: text("cin"),
  gstin: text("gstin"),
  companyPan: text("company_pan"),
  directorName: text("director_name"),
  status: text("status").$type<"pending" | "in_review" | "approved" | "rejected">().default("pending").notNull(),
  rejectionReason: text("rejection_reason"),
  reviewedBy: uuid("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Buyer Profiles Table
export const buyerProfiles = pgTable("buyer_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  investorType: text("investor_type").$type<"individual" | "pe_fund" | "family_office" | "corporate">(),
  industries: text("industries").array(),
  states: text("states").array(),
  budgetMin: integer("budget_min"),
  budgetMax: integer("budget_max"),
  acquisitionGoal: text("acquisition_goal"),
  experienceLevel: text("experience_level").$type<"first_time" | "some" | "experienced" | "serial">(),
  proofOfFundsVerified: boolean("proof_of_funds_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Listings Table
export const listings = pgTable("listings", {
  id: uuid("id").primaryKey().defaultRandom(),
  sellerId: uuid("seller_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  businessNamePrivate: text("business_name_private"),
  assetType: text("asset_type").$type<"saas" | "ecommerce" | "app" | "blog" | "domain" | "content_site" | "service">().notNull(),
  industry: text("industry").notNull(),
  businessModel: text("business_model"),
  yearEstablished: integer("year_established"),
  businessUrl: text("business_url"),
  monthlyRevenue: integer("monthly_revenue"),
  monthlyProfit: integer("monthly_profit"),
  monthlyTraffic: integer("monthly_traffic"),
  trafficSources: text("traffic_sources"),
  askingPrice: integer("asking_price").notNull(),
  reasonForSale: text("reason_for_sale"),
  description: text("description"),
  tagline: text("tagline"),
  teamSize: integer("team_size"),
  hoursPerWeek: integer("hours_per_week"),
  pricingModel: text("pricing_model").$type<"auction" | "classified">().default("classified").notNull(),
  reservePrice: integer("reserve_price"),
  status: text("status").$type<"draft" | "in_review" | "approved" | "live" | "paused" | "sold" | "rejected">().default("draft").notNull(),
  ndaRequired: boolean("nda_required").default(true).notNull(),
  ndaFee: integer("nda_fee").default(0).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  coverImageUrl: text("cover_image_url"),
  tags: text("tags").array(),
  viewCount: integer("view_count").default(0).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5. Listing Documents Table
export const listingDocuments = pgTable("listing_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: "cascade" }).notNull(),
  type: text("type").$type<"financial" | "analytics" | "ownership" | "pitch_deck" | "other">().notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  cloudinaryId: text("cloudinary_id"),
  isPrivate: boolean("is_private").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. NDA Agreements Table
export const ndaAgreements = pgTable("nda_agreements", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: "cascade" }).notNull(),
  buyerId: uuid("buyer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: text("status").$type<"pending" | "signed" | "expired">().default("pending").notNull(),
  signedAt: timestamp("signed_at"),
  paymentId: uuid("payment_id"),
  feePaid: integer("fee_paid"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Offers Table
export const offers = pgTable("offers", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: "cascade" }).notNull(),
  buyerId: uuid("buyer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sellerId: uuid("seller_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  amount: integer("amount").notNull(),
  upfrontPercent: decimal("upfront_percent", { precision: 5, scale: 2 }).default("100"),
  earnoutPercent: decimal("earnout_percent", { precision: 5, scale: 2 }).default("0"),
  earnoutTerms: text("earnout_terms"),
  message: text("message"),
  status: text("status").$type<"pending" | "countered" | "accepted" | "rejected" | "expired" | "withdrawn">().default("pending").notNull(),
  counterAmount: integer("counter_amount"),
  counterMessage: text("counter_message"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 8. Deals Table
export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().defaultRandom(),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: "cascade" }).notNull(),
  offerId: uuid("offer_id").references(() => offers.id, { onDelete: "cascade" }).notNull(),
  buyerId: uuid("buyer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sellerId: uuid("seller_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  stage: text("stage").$type<"nda" | "due_diligence" | "agreement" | "escrow" | "transfer" | "closed" | "cancelled">().default("due_diligence").notNull(),
  dealValue: integer("deal_value"),
  escrowStatus: text("escrow_status").$type<"not_created" | "pending" | "funded" | "released" | "refunded">().default("not_created").notNull(),
  escrowReference: text("escrow_reference"),
  buyerSigned: boolean("buyer_signed").default(false).notNull(),
  sellerSigned: boolean("seller_signed").default(false).notNull(),
  signedAt: timestamp("signed_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 9. Deal Documents Table
export const dealDocuments = pgTable("deal_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }).notNull(),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").$type<"proof_of_funds" | "agreement" | "transfer_proof" | "nda" | "other">().notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  cloudinaryId: text("cloudinary_id"),
  visibility: text("visibility").$type<"both" | "buyer_only" | "seller_only" | "admin_only">().default("both").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 10. Deal Checklist Items Table
export const dealChecklistItems = pgTable("deal_checklist_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: text("assigned_to").$type<"buyer" | "seller" | "platform">().notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  completedBy: uuid("completed_by").references(() => users.id),
  completedAt: timestamp("completed_at"),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 11. Messages Table
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }).notNull(),
  senderId: uuid("sender_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  content: text("content").notNull(),
  type: text("type").$type<"text" | "system" | "document">().default("text").notNull(),
  documentUrl: text("document_url"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 12. Notifications Table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  body: text("body"),
  data: jsonb("data"),
  isRead: boolean("is_read").default(false).notNull(),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 13. Payments Table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  listingId: uuid("listing_id").references(() => listings.id, { onDelete: "set null" }),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "set null" }),
  purpose: text("purpose").$type<"nda_fee" | "listing_fee" | "escrow">().notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").default("INR").notNull(),
  provider: text("provider").default("razorpay").notNull(),
  providerOrderId: text("provider_order_id"),
  providerPaymentId: text("provider_payment_id"),
  status: text("status").$type<"created" | "paid" | "failed" | "refunded">().default("created").notNull(),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 14. Reviews Table
export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  dealId: uuid("deal_id").references(() => deals.id, { onDelete: "cascade" }).notNull(),
  reviewerId: uuid("reviewer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  revieweeId: uuid("reviewee_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  role: text("role").$type<"buyer" | "seller">().notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


// RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
  kycProfiles: many(kycProfiles),
  buyerProfiles: many(buyerProfiles),
  listings: many(listings),
  ndaAgreements: many(ndaAgreements),
  buyerOffers: many(offers, { relationName: "buyerOffers" }),
  sellerOffers: many(offers, { relationName: "sellerOffers" }),
  buyerDeals: many(deals, { relationName: "buyerDeals" }),
  sellerDeals: many(deals, { relationName: "sellerDeals" }),
  uploadedDealDocuments: many(dealDocuments),
  completedChecklistItems: many(dealChecklistItems),
  messages: many(messages),
  notifications: many(notifications),
  payments: many(payments),
  reviewsWritten: many(reviews, { relationName: "reviewer" }),
  reviewsReceived: many(reviews, { relationName: "reviewee" }),
}));

export const kycProfilesRelations = relations(kycProfiles, ({ one }) => ({
  user: one(users, { fields: [kycProfiles.userId], references: [users.id], relationName: "kycProfiles" }),
  reviewer: one(users, { fields: [kycProfiles.reviewedBy], references: [users.id], relationName: "kycReviewer" }),
}));

export const buyerProfilesRelations = relations(buyerProfiles, ({ one }) => ({
  user: one(users, { fields: [buyerProfiles.userId], references: [users.id] }),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  seller: one(users, { fields: [listings.sellerId], references: [users.id] }),
  documents: many(listingDocuments),
  ndaAgreements: many(ndaAgreements),
  offers: many(offers),
  deals: many(deals),
  payments: many(payments),
}));

export const listingDocumentsRelations = relations(listingDocuments, ({ one }) => ({
  listing: one(listings, { fields: [listingDocuments.listingId], references: [listings.id] }),
}));

export const ndaAgreementsRelations = relations(ndaAgreements, ({ one }) => ({
  listing: one(listings, { fields: [ndaAgreements.listingId], references: [listings.id] }),
  buyer: one(users, { fields: [ndaAgreements.buyerId], references: [users.id] }),
}));

export const offersRelations = relations(offers, ({ one, many }) => ({
  listing: one(listings, { fields: [offers.listingId], references: [listings.id] }),
  buyer: one(users, { fields: [offers.buyerId], references: [users.id], relationName: "buyerOffers" }),
  seller: one(users, { fields: [offers.sellerId], references: [users.id], relationName: "sellerOffers" }),
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  listing: one(listings, { fields: [deals.listingId], references: [listings.id] }),
  offer: one(offers, { fields: [deals.offerId], references: [offers.id] }),
  buyer: one(users, { fields: [deals.buyerId], references: [users.id], relationName: "buyerDeals" }),
  seller: one(users, { fields: [deals.sellerId], references: [users.id], relationName: "sellerDeals" }),
  documents: many(dealDocuments),
  checklistItems: many(dealChecklistItems),
  messages: many(messages),
  payments: many(payments),
  reviews: many(reviews),
}));

export const dealDocumentsRelations = relations(dealDocuments, ({ one }) => ({
  deal: one(deals, { fields: [dealDocuments.dealId], references: [deals.id] }),
  uploader: one(users, { fields: [dealDocuments.uploadedBy], references: [users.id] }),
}));

export const dealChecklistItemsRelations = relations(dealChecklistItems, ({ one }) => ({
  deal: one(deals, { fields: [dealChecklistItems.dealId], references: [deals.id] }),
  completer: one(users, { fields: [dealChecklistItems.completedBy], references: [users.id] }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  deal: one(deals, { fields: [messages.dealId], references: [deals.id] }),
  sender: one(users, { fields: [messages.senderId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, { fields: [payments.userId], references: [users.id] }),
  listing: one(listings, { fields: [payments.listingId], references: [listings.id] }),
  deal: one(deals, { fields: [payments.dealId], references: [deals.id] }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  deal: one(deals, { fields: [reviews.dealId], references: [deals.id] }),
  reviewer: one(users, { fields: [reviews.reviewerId], references: [users.id], relationName: "reviewer" }),
  reviewee: one(users, { fields: [reviews.revieweeId], references: [users.id], relationName: "reviewee" }),
}));
