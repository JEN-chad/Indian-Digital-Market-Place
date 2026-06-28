import { type InferSelectModel, type InferInsertModel } from "drizzle-orm";
import { users, buyerProfiles } from "../lib/db/schema.ts";

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type BuyerProfile = InferSelectModel<typeof buyerProfiles>;
export type NewBuyerProfile = InferInsertModel<typeof buyerProfiles>;

export type UserRole = "buyer" | "seller" | "both" | "admin";
export type KYCStatus = "not_started" | "pending" | "in_review" | "approved" | "rejected";
export type KYCType = "individual" | "company";
export type InvestorType = "individual" | "pe_fund" | "family_office" | "corporate";
export type ExperienceLevel = "first_time" | "some" | "experienced" | "serial";
