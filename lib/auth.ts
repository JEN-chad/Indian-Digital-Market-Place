import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db/index.ts";
import * as schema from "./db/schema.ts";

// Guard better auth initialization with an optional secret or fallback in development to prevent startup crashes
const secret = process.env.BETTER_AUTH_SECRET || "fallback-secret-for-development-only-replace-immediately";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users: schema.users,
    },
  }),
  secret: secret,
  emailAndPassword: {
    enabled: true,
  },
  // We can add the OTP and custom field structures as requested
  plugins: [],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "buyer",
      },
      phone: {
        type: "string",
      },
      kycStatus: {
        type: "string",
        defaultValue: "not_started",
      },
    },
  },
});
