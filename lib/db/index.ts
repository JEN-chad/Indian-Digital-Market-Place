import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.ts";

const sql = neon(process.env.DATABASE_URL || "postgres://localhost/mock");
export const db = drizzle(sql, { schema });
