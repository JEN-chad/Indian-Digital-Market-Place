import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { kycProfiles } from "../lib/db/schema.ts";

export type KYCProfile = InferSelectModel<typeof kycProfiles>;
export type NewKYCProfile = InferInsertModel<typeof kycProfiles>;

export type KYCProfileStatus = "pending" | "in_review" | "approved" | "rejected";
