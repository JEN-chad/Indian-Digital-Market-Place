import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { listings, listingDocuments, ndaAgreements } from "../lib/db/schema.ts";

export type Listing = InferSelectModel<typeof listings>;
export type NewListing = InferInsertModel<typeof listings>;

export type ListingDocument = InferSelectModel<typeof listingDocuments>;
export type NewListingDocument = InferInsertModel<typeof listingDocuments>;

export type NDAAgreement = InferSelectModel<typeof ndaAgreements>;
export type NewNDAAgreement = InferInsertModel<typeof ndaAgreements>;

export type AssetType = "saas" | "ecommerce" | "app" | "blog" | "domain" | "content_site" | "service";
export type ListingStatus = "draft" | "in_review" | "approved" | "live" | "paused" | "sold" | "rejected";
export type PricingModel = "auction" | "classified";
export type ListingDocType = "financial" | "analytics" | "ownership" | "pitch_deck" | "other";
export type NDAAgreementStatus = "pending" | "signed" | "expired";
