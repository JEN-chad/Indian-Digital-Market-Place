import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { offers, deals, dealDocuments, dealChecklistItems, messages, reviews } from "../lib/db/schema.ts";

export type Offer = InferSelectModel<typeof offers>;
export type NewOffer = InferInsertModel<typeof offers>;

export type Deal = InferSelectModel<typeof deals>;
export type NewDeal = InferInsertModel<typeof deals>;

export type DealDocument = InferSelectModel<typeof dealDocuments>;
export type NewDealDocument = InferInsertModel<typeof dealDocuments>;

export type DealChecklistItem = InferSelectModel<typeof dealChecklistItems>;
export type NewDealChecklistItem = InferInsertModel<typeof dealChecklistItems>;

export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

export type Review = InferSelectModel<typeof reviews>;
export type NewReview = InferInsertModel<typeof reviews>;

export type OfferStatus = "pending" | "countered" | "accepted" | "rejected" | "expired" | "withdrawn";
export type DealStage = "nda" | "due_diligence" | "agreement" | "escrow" | "transfer" | "closed" | "cancelled";
export type EscrowStatus = "not_created" | "pending" | "funded" | "released" | "refunded";
export type DealDocType = "proof_of_funds" | "agreement" | "transfer_proof" | "nda" | "other";
export type DealDocVisibility = "both" | "buyer_only" | "seller_only" | "admin_only";
export type ChecklistAssignee = "buyer" | "seller" | "platform";
export type MessageType = "text" | "system" | "document";
export type ReviewerRole = "buyer" | "seller";
