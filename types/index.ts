import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { notifications, payments } from "../lib/db/schema.ts";

export * from "./user.ts";
export * from "./kyc.ts";
export * from "./listing.ts";
export * from "./deal.ts";

export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;

export type Payment = InferSelectModel<typeof payments>;
export type NewPayment = InferInsertModel<typeof payments>;

export type PaymentPurpose = "nda_fee" | "listing_fee" | "escrow";
export type PaymentStatus = "created" | "paid" | "failed" | "refunded";
