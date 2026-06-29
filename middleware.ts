import { type Request, type Response, type NextFunction } from "express";
import { db } from "./lib/db/index.ts";
import { users } from "./lib/db/schema.ts";
import { eq } from "drizzle-orm";

// Express-based Middleware to protect API routes and session verification
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized. Auth session or token is missing." });
  }

  const userId = authHeader.replace("Bearer ", "").trim();
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Invalid token." });
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. User session not found." });
    }
    
    // Attach user record to request context
    (req as any).user = user;
    next();
  } catch (err: any) {
    console.error("Middleware requireAuth error:", err);
    return res.status(500).json({ error: "Internal server error during authentication." });
  }
}

// Role-based protection
export function requireRole(roles: ("buyer" | "seller" | "admin" | "both")[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized. Please authenticate first." });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: "Forbidden. Insufficient permissions." });
    }
    next();
  };
}

// Check KYC status
export function requireKYC(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ error: "Unauthorized." });
  }
  if (user.kycStatus !== "approved") {
    return res.status(403).json({ error: "KYC verification required." });
  }
  next();
}

