/**
 * Direct SQL migration script – adds ALL missing columns from schema.ts
 * to the existing Neon DB tables without interactive prompts.
 * Run with: npx tsx scripts/migrate.ts
 */
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const migrations = [
  // ── users table ──────────────────────────────────────────────────────────
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT UNIQUE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_type TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'not_started'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'buyer'`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`,

  // ── kyc_profiles table ────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS kyc_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT,
    dob TEXT,
    street TEXT,
    city TEXT,
    state TEXT,
    pin_code TEXT,
    pan_number TEXT,
    aadhaar_last4 TEXT,
    pan_doc_url TEXT,
    aadhaar_doc_url TEXT,
    selfie_url TEXT,
    bank_account_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    company_name TEXT,
    cin TEXT,
    gstin TEXT,
    company_pan TEXT,
    director_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS full_name TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS dob TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS street TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS city TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS state TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS pin_code TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS pan_number TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS aadhaar_last4 TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS pan_doc_url TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS aadhaar_doc_url TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS selfie_url TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS bank_account_name TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS bank_account_number TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS bank_ifsc TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS company_name TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS cin TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS gstin TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS company_pan TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS director_name TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS rejection_reason TEXT`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS reviewed_by UUID`,
  `ALTER TABLE kyc_profiles ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP`,

  // ── buyer_profiles table ──────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS buyer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    investor_type TEXT,
    industries TEXT[],
    states TEXT[],
    budget_min INTEGER,
    budget_max INTEGER,
    acquisition_goal TEXT,
    experience_level TEXT,
    proof_of_funds_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,

  // ── listings table ────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    asset_type TEXT,
    industry TEXT,
    state TEXT,
    city TEXT,
    asking_price DECIMAL(15,2),
    revenue DECIMAL(15,2),
    ebitda DECIMAL(15,2),
    net_profit DECIMAL(15,2),
    asking_price_multiple DECIMAL(5,2),
    year_established INTEGER,
    employee_count INTEGER,
    primary_image_url TEXT,
    gallery_images TEXT[],
    documents JSONB,
    financial_highlights JSONB,
    key_assets TEXT[],
    reason_for_sale TEXT,
    confidentiality_level TEXT DEFAULT 'standard',
    is_featured BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    nda_count INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,

  // ── offers table ──────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,

  // ── deals table ───────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES offers(id),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stage TEXT NOT NULL DEFAULT 'nda_signed',
    deal_value DECIMAL(15,2),
    escrow_amount DECIMAL(15,2),
    escrow_paid BOOLEAN DEFAULT FALSE,
    payment_id TEXT,
    signed_nda_url TEXT,
    signed_spa_url TEXT,
    due_diligence_report_url TEXT,
    notes TEXT,
    closed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,

  // ── deal_room_messages table ──────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS deal_room_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type TEXT DEFAULT 'text',
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,

  // ── notifications table ───────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,

  // ── nda_requests table ────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS nda_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    signed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  )`,
];

async function runMigrations() {
  const client = await pool.connect();
  console.log("Connected to Neon DB successfully");

  let success = 0;
  let failed = 0;

  for (const sql of migrations) {
    const preview = sql.trim().split("\n")[0].slice(0, 80);
    try {
      await client.query(sql);
      console.log(`  OK: ${preview}`);
      success++;
    } catch (err: any) {
      // Ignore "column already exists" (42701) and "table already exists" (42P07)
      if (err.code === "42701" || err.code === "42P07") {
        console.log(`  SKIP (already exists): ${preview}`);
        success++;
      } else {
        console.error(`  FAIL: ${preview}\n    -> ${err.message}`);
        failed++;
      }
    }
  }

  client.release();
  await pool.end();

  console.log(`\nMigration complete: ${success} succeeded, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

runMigrations().catch((err) => {
  console.error("Migration script crashed:", err);
  process.exit(1);
});
