import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./lib/db/index.ts";
import { requireAuth, requireRole } from "./middleware.ts";
import { sendEmailOtp, verifyEmailOtp, sendPhoneOtp, verifyPhoneOtp } from "./actions/auth.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser
  app.use(express.json());

  // 1. API Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "FMI API Server",
    });
  });

  // 2. Sample Listings Endpoint (Database-backed or empty array placeholder)
  app.get("/api/listings", async (req, res) => {
    try {
      // Direct Drizzle database query example
      // const allListings = await db.query.listings.findMany();
      res.json({ success: true, listings: [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 3. Simple Better Auth endpoints handling proxy
  app.all("/api/auth/*", (req, res) => {
    // Better Auth handles request proxying here
    res.json({ message: "Better Auth mount point" });
  });

  // 4. Server Actions for Phase 2 Authentication
  app.post("/api/actions/send-email-otp", async (req, res) => {
    try {
      const { email } = req.body;
      const result = await sendEmailOtp(email);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/verify-email-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      const result = await verifyEmailOtp(email, otp);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/send-phone-otp", async (req, res) => {
    try {
      const { phone } = req.body;
      const result = await sendPhoneOtp(phone);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/actions/verify-phone-otp", async (req, res) => {
    try {
      const { phone, otp, email } = req.body;
      const result = await verifyPhoneOtp(phone, otp, email);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Vite middleware setup for Development or Static assets in Production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FMI Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start FMI server:", err);
});
