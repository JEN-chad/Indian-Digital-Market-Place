import "dotenv/config";
import { db } from "../lib/db/index.ts";
import { users } from "../lib/db/schema.ts";
import { eq } from "drizzle-orm";

async function createAdmin() {
  const email = "admin@zuntra.in";
  
  // Check if user already exists
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (existing) {
    console.log(`User ${email} already exists. Updating role to admin...`);
    await db.update(users)
      .set({
        role: "admin",
        name: "Admin",
        emailVerified: true,
        kycStatus: "approved"
      })
      .where(eq(users.email, email));
    console.log("Admin updated successfully!");
  } else {
    console.log(`Creating Admin user ${email}...`);
    await db.insert(users).values({
      email,
      name: "Admin",
      role: "admin",
      emailVerified: true,
      phone: "+919999999999",
      phoneVerified: true,
      kycStatus: "approved"
    });
    console.log("Admin created successfully!");
  }
  process.exit(0);
}

createAdmin().catch(err => {
  console.error("Failed to run createAdmin script:", err);
  process.exit(1);
});
