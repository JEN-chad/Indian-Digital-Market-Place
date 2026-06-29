// Augment Express Request to include authenticated user context
// This prevents TS2339 "Property 'user' does not exist on type Request" errors.
// The middleware.ts requireAuth populates this when a valid session is detected.

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: "buyer" | "seller" | "admin" | "both";
        email: string;
      };
    }
  }
}

export {};
