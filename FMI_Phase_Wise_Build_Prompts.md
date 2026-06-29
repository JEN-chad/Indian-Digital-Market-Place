# FMI — Phase-Wise AI Build Prompts
## Complete Implementation Guide: Indian Digital Business Marketplace

> **How to use this guide**: Copy each phase prompt exactly into your AI coding agent (Cursor, Windsurf, Claude Code, etc.). Complete each phase fully and verify outputs before moving to the next. Each phase is self-contained and builds on the previous without conflicts.

---

## PRE-BUILD CHECKLIST

Before starting Phase 1, provision all services and collect these credentials:

- [ ] **Neon** → Create PostgreSQL database → copy `DATABASE_URL`
- [ ] **Cloudinary** → Create account → copy `CLOUD_NAME`, `API_KEY`, `API_SECRET`
- [ ] **Pusher** → Create Channels app (cluster: `ap2`) → copy `APP_ID`, `KEY`, `SECRET`
- [ ] **Razorpay** → Test mode → copy `KEY_ID`, `KEY_SECRET`
- [ ] **Resend** → Create account → copy `API_KEY`, set `EMAIL_FROM`
- [ ] **Upstash Redis** → Create database → copy `REST_URL`, `REST_TOKEN`
- [ ] **Anthropic** → Copy `API_KEY`
- [ ] **Better Auth** → Generate a random 32-char `BETTER_AUTH_SECRET`

---

## PHASE 1 — Project Bootstrap & Infrastructure

> **Goal**: Running Next.js app with all dependencies, all DB tables created, all services configured.

```
You are building FMI — an Indian digital business marketplace (like Flippa for India). This is Phase 1: Project Bootstrap & Infrastructure.

Bootstrap the project with this exact setup:

1. CREATE the Next.js project:
   npx create-next-app@latest fmi --typescript --tailwind --app --src-dir=false --eslint

2. INSTALL all dependencies:
   npm install drizzle-orm @neondatabase/serverless drizzle-kit
   npm install better-auth
   npm install @tanstack/react-query zustand
   npm install react-hook-form @hookform/resolvers zod
   npm install framer-motion lucide-react
   npm install pusher pusher-js
   npm install razorpay
   npm install resend @react-email/components
   npm install cloudinary
   npm install @upstash/redis
   npm install @anthropic-ai/sdk openai
   npm install slugify date-fns

3. INITIALIZE shadcn/ui:
   npx shadcn@latest init (use Default style, Slate base color, CSS variables)
   npx shadcn@latest add button card input textarea select checkbox radio-group switch tabs dialog sheet dropdown-menu badge avatar separator skeleton toast tooltip progress scroll-area table label popover command alert

4. CREATE .env.local with ALL these variables (user will fill values):
   DATABASE_URL=
   BETTER_AUTH_SECRET=
   BETTER_AUTH_URL=http://localhost:3000
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   PUSHER_APP_ID=
   PUSHER_KEY=
   PUSHER_SECRET=
   PUSHER_CLUSTER=ap2
   NEXT_PUBLIC_PUSHER_KEY=
   NEXT_PUBLIC_PUSHER_CLUSTER=ap2
   RAZORPAY_KEY_ID=
   RAZORPAY_KEY_SECRET=
   NEXT_PUBLIC_RAZORPAY_KEY_ID=
   RESEND_API_KEY=
   EMAIL_FROM=noreply@fmi.in
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=
   ANTHROPIC_API_KEY=
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development

5. CREATE lib/db/schema.ts with the COMPLETE Drizzle schema for ALL tables:
   - users (id, email, emailVerified, phone, phoneVerified, name, avatarUrl, role[buyer|seller|both|admin], kycStatus[not_started|pending|in_review|approved|rejected], kycType[individual|company], createdAt, updatedAt)
   - kyc_profiles (id, userId FK, panNumber, aadhaarLast4, panDocUrl, aadhaarDocUrl, selfieUrl, bankAccountName, bankAccountNumber, bankIfsc, companyName, cin, gstin, companyPan, directorName, status[pending|in_review|approved|rejected], rejectionReason, reviewedBy FK, reviewedAt, createdAt)
   - buyer_profiles (id, userId FK, investorType[individual|pe_fund|family_office|corporate], industries text[], states text[], budgetMin int, budgetMax int, acquisitionGoal, experienceLevel[first_time|some|experienced|serial], proofOfFundsVerified bool, createdAt)
   - listings (id, sellerId FK, slug unique, title, businessNamePrivate, assetType[saas|ecommerce|app|blog|domain|content_site|service], industry, businessModel, yearEstablished, businessUrl, monthlyRevenue int, monthlyProfit int, monthlyTraffic int, trafficSources, askingPrice int, reasonForSale, description, tagline, teamSize int, hoursPerWeek int, pricingModel[auction|classified], reservePrice int, status[draft|in_review|approved|live|paused|sold|rejected], ndaRequired bool default true, ndaFee int default 0, isFeatured bool, coverImageUrl, tags text[], viewCount int default 0, publishedAt, createdAt, updatedAt)
   - listing_documents (id, listingId FK, type[financial|analytics|ownership|pitch_deck|other], name, url, cloudinaryId, isPrivate bool default true, createdAt)
   - nda_agreements (id, listingId FK, buyerId FK, status[pending|signed|expired], signedAt, paymentId uuid, feePaid decimal, expiresAt, createdAt)
   - offers (id, listingId FK, buyerId FK, sellerId FK, amount decimal, upfrontPercent decimal default 100, earnoutPercent decimal default 0, earnoutTerms, message, status[pending|countered|accepted|rejected|expired|withdrawn], counterAmount decimal, counterMessage, expiresAt, createdAt, updatedAt)
   - deals (id, listingId FK, offerId FK, buyerId FK, sellerId FK, stage[nda|due_diligence|agreement|escrow|transfer|closed|cancelled], dealValue decimal, escrowStatus[not_created|pending|funded|released|refunded], escrowReference, buyerSigned bool, sellerSigned bool, signedAt, closedAt, createdAt, updatedAt)
   - deal_documents (id, dealId FK, uploadedBy FK, type[proof_of_funds|agreement|transfer_proof|nda|other], name, url, cloudinaryId, visibility[both|buyer_only|seller_only|admin_only], createdAt)
   - deal_checklist_items (id, dealId FK, title, description, assignedTo[buyer|seller|platform], isCompleted bool, completedBy FK, completedAt, sortOrder int, createdAt)
   - messages (id, dealId FK, senderId FK, content, type[text|system|document], documentUrl, isRead bool, createdAt)
   - notifications (id, userId FK, type, title, body, data jsonb, isRead bool, readAt, createdAt)
   - payments (id, userId FK, listingId FK nullable, dealId FK nullable, purpose[nda_fee|listing_fee|escrow], amount decimal, currency default 'INR', provider default 'razorpay', providerOrderId, providerPaymentId, status[created|paid|failed|refunded], paidAt, createdAt)
   - reviews (id, dealId FK, reviewerId FK, revieweeId FK, role[buyer|seller], rating int, comment, createdAt)

   Export all Drizzle relations for each table using the `relations()` helper.

6. CREATE drizzle.config.ts:
   import type { Config } from 'drizzle-kit'
   export default { schema: './lib/db/schema.ts', out: './drizzle', dialect: 'postgresql', dbCredentials: { url: process.env.DATABASE_URL! } } satisfies Config

7. CREATE lib/db/index.ts:
   Use @neondatabase/serverless neon() function + drizzle(). Export `db`.

8. CREATE all service client files:
   - lib/auth.ts → Better Auth config with email OTP plugin, custom role field
   - lib/cloudinary.ts → Cloudinary v2 config
   - lib/pusher.ts → Pusher server + PusherJS client exports
   - lib/razorpay.ts → Razorpay client
   - lib/resend.ts → Resend client
   - lib/redis.ts → Upstash Redis client
   - lib/ai.ts → Anthropic client + OpenAI client exports
   - lib/utils.ts → cn() utility, formatCurrency(INR), formatDate(), generateSlug()

9. CREATE config/constants.ts with:
   - ASSET_TYPES array with label, value, color, icon for each type
   - INDIAN_STATES array
   - INDUSTRIES array
   - DEAL_STAGES array with label, description
   - NDA_FEE_DEFAULT = 999

10. CREATE config/site.ts with site metadata (name: 'FMI', description, url, etc.)

11. CREATE types/index.ts, types/listing.ts, types/deal.ts, types/user.ts, types/kyc.ts — export all TypeScript types inferred from the Drizzle schema using `InferSelectModel` and `InferInsertModel`.

12. ADD to package.json scripts:
    "db:push": "drizzle-kit push"
    "db:studio": "drizzle-kit studio"
    "db:generate": "drizzle-kit generate"

13. CREATE middleware.ts:
    - Protect /buyer/*, /seller/*, /admin/*, /onboarding/* routes
    - Redirect unauthenticated users to /login
    - Redirect admin/* to /login if not admin role
    - Use Better Auth session check

14. UPDATE next.config.ts:
    - Allow Cloudinary image domain
    - Enable server external packages for better-auth

Run `npm run db:push` to create all tables. Confirm output: all tables created with 0 errors.

Do NOT create any pages yet — only the infrastructure listed above.
```

---

## PHASE 2 — Authentication & Session Management

> **Goal**: Complete auth flow — signup, login, email OTP, phone OTP, session, middleware.

```
You are building FMI. Phase 1 (infrastructure) is complete. Now build Phase 2: Authentication & Session Management.

The tech stack is: Next.js 15 App Router, TypeScript, Better Auth, Drizzle ORM on Neon, shadcn/ui, Tailwind CSS, Framer Motion.

BUILD the following pages and components. All pages must be in the (auth) route group with no sidebar layout.

PAGES TO CREATE:

1. app/(auth)/layout.tsx
   - Centered card layout (no sidebar)
   - FMI logo top-left
   - Clean white background

2. app/(auth)/login/page.tsx
   - Email input + "Send OTP" button
   - OR divider
   - Google OAuth button (stub if not configured)
   - Link to /signup
   - On submit: call sendEmailOtp() server action → redirect to /verify-email?email=...

3. app/(auth)/signup/page.tsx
   - Fields: Full Name, Email, Password (optional, email OTP is primary)
   - "Create Account" button → sends email OTP → redirects to /verify-email
   - Link to /login

4. app/(auth)/verify-email/page.tsx
   - Display "We sent a code to {email}"
   - 6-digit OTP input (individual digit boxes, auto-focus next)
   - "Verify" button → calls verifyEmailOtp() → on success redirect to /verify-phone
   - "Resend code" link (30s cooldown)
   - DEV NOTE: In development, hardcode OTP acceptance for "123456"

5. app/(auth)/verify-phone/page.tsx
   - Phone number input with +91 prefix selector
   - "Send OTP" → calls sendPhoneOtp() → shows OTP input
   - 6-digit OTP input
   - On verify: redirect to /onboarding/role
   - DEV NOTE: hardcode OTP "123456" acceptance in dev

COMPONENTS TO CREATE:

6. components/auth/otp-input.tsx
   - 6 individual digit boxes
   - Auto-focus next box on input
   - Backspace goes to previous box
   - Paste handling (fills all 6 at once)
   - Animated border highlight on focus
   - Props: length, value, onChange, disabled

7. components/auth/login-form.tsx
   - Email field with validation
   - Loading state during OTP send
   - Error display

8. components/auth/signup-form.tsx
   - Name + Email fields
   - Zod validation schema

SERVER ACTIONS (actions/auth.ts):

9. sendEmailOtp(email: string)
   - Validate email format
   - Generate 6-digit OTP
   - Store in Upstash Redis with 10-min TTL (key: `otp:email:{email}`)
   - Send via Resend email (React Email template)
   - In DEV: console.log the OTP
   - Return: { success: boolean, error?: string }

10. verifyEmailOtp(email: string, otp: string)
    - Check Redis for stored OTP
    - Compare (accept "123456" in development)
    - On success: create/update user in DB, set emailVerified=true
    - Create Better Auth session
    - Delete OTP from Redis
    - Return: { success: boolean, userId?: string }

11. sendPhoneOtp(phone: string)
    - Validate Indian phone (+91, 10 digits)
    - Generate 6-digit OTP
    - Store in Redis (key: `otp:phone:{phone}`, TTL 10min)
    - In DEV: console.log OTP (MSG91 is stubbed)
    - Return: { success: boolean }

12. verifyPhoneOtp(phone: string, otp: string)
    - Check Redis (accept "123456" in dev)
    - Update user: phone=phone, phoneVerified=true
    - Return: { success: boolean }

EMAIL TEMPLATE (emails/otp.tsx):
- React Email template with FMI branding
- Display 6-digit OTP prominently
- "Valid for 10 minutes" note
- Professional Indian business styling

HOOKS:
- hooks/use-auth.ts → useAuth() hook returning { user, session, isLoading, isAuthenticated }

STORE:
- store/auth-store.ts → Zustand store: { user, setUser, clearUser }

IMPORTANT RULES:
- All forms use React Hook Form + Zod validation
- All server actions use 'use server' directive
- Show loading spinners on all async operations
- Show toast notifications on success/error
- Mobile responsive (inputs full-width on mobile)
- No page should be accessible without auth except /login, /signup, /verify-email, /verify-phone, and public marketing pages (/)
```

---

## PHASE 3 — Onboarding: Role Selection & KYC Wizard

> **Goal**: Post-auth onboarding — role picker, individual KYC, company KYC, buyer interests.

```
You are building FMI. Phases 1–2 are complete (infrastructure + auth). Now build Phase 3: Onboarding.

After a user verifies their phone, they land on /onboarding/role. Build the complete onboarding flow.

PAGES TO CREATE (in app/(onboarding)/ route group):

1. app/(onboarding)/layout.tsx
   - Progress bar at top showing onboarding step (Step 1 of 3, etc.)
   - FMI logo
   - "Skip for now" link (goes to dashboard)
   - No sidebar

2. app/(onboarding)/role/page.tsx
   - Heading: "How will you use FMI?"
   - 3 large selectable cards with icons + descriptions:
     * BUYER — "I want to acquire digital businesses"
     * SELLER — "I want to sell my digital business"  
     * BOTH — "I want to buy and sell"
   - On select + Continue: update user.role in DB → redirect to /onboarding/kyc/individual OR /onboarding/kyc/company based on what they choose next, OR go straight to /onboarding/kyc/individual as default
   - Framer Motion animation on card selection

3. app/(onboarding)/kyc/individual/page.tsx
   - Multi-step wizard (4 steps):
     STEP 1 — Personal Details:
       * Full Legal Name (from auth prefilled)
       * Date of Birth
       * Address (Street, City, State, PIN)
     STEP 2 — PAN Verification:
       * PAN Number input (masked: ABCDE1234F format enforced)
       * Upload PAN Card (image, max 5MB)
       * Validation: regex /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
     STEP 3 — Aadhaar:
       * Last 4 digits of Aadhaar
       * Upload Aadhaar (front + back images)
       * Note: "We only store last 4 digits for privacy"
     STEP 4 — Selfie + Bank Details (for sellers):
       * Selfie upload (camera capture or file upload)
       * Bank Account Number
       * Bank IFSC
       * Account Holder Name
   - Progress bar through steps
   - "Back" and "Next" buttons
   - On final Submit: call submitKyc() → show "KYC Submitted" success screen
   - Success screen: "Your KYC is under review (24–48 hours)"

4. app/(onboarding)/kyc/company/page.tsx
   - Multi-step wizard (4 steps):
     STEP 1 — Company Details:
       * Company Name
       * CIN (format: U12345MH2020PTC123456 — regex validate)
       * GSTIN (format: 22AAAAA0000A1Z5 — regex validate)
       * Year of Incorporation
     STEP 2 — Company PAN:
       * Company PAN number
       * Upload Certificate of Incorporation
     STEP 3 — Director Details:
       * Director's Full Name
       * Director's PAN
       * Director's Aadhaar last 4
     STEP 4 — Bank Details:
       * Company bank account number + IFSC
       * Upload cancelled cheque
   - Same submit/success flow as individual KYC

5. app/(onboarding)/interests/page.tsx (Buyer only):
   - Heading: "What are you looking to buy?"
   - Multi-select: Asset Types (SaaS, eCommerce, App, Blog, Domain, Content Site)
   - Multi-select: Industries (Ed-Tech, FinTech, Health, D2C, etc.)
   - Multi-select: Target States (All India or specific states)
   - Budget Range: Min / Max (₹ input with Indian format)
   - Acquisition Goal: textarea
   - Experience Level: First-time buyer / Some experience / Experienced / Serial acquirer
   - On submit: create/update buyer_profiles record → redirect to /buyer/dashboard

COMPONENTS TO CREATE:

6. components/kyc/kyc-wizard.tsx
   - Stepper component at top
   - Animated step transitions (Framer Motion slide)
   - Step content rendered based on current step
   - Back/Next button logic
   - Persists step in Zustand store (survives refresh)

7. components/kyc/pan-input.tsx
   - Custom input that auto-capitalizes
   - Real-time format validation
   - Green checkmark when valid format

8. components/kyc/aadhaar-upload.tsx
   - Dropzone for front + back separately
   - Preview thumbnails
   - 5MB size limit
   - Upload to Cloudinary via API route

9. components/kyc/selfie-capture.tsx
   - Primary: File upload button
   - Secondary (future): camera capture
   - Preview of uploaded selfie

10. components/kyc/kyc-status-badge.tsx
    - Props: status (pending|in_review|approved|rejected)
    - Color-coded pill badge
    - Used across the app wherever KYC status is shown

11. components/auth/role-selector.tsx
    - 3 cards (Buyer/Seller/Both)
    - Icons: ShoppingBag, Store, Repeat2 (Lucide)
    - Selected state with ring outline + checkmark

SERVER ACTIONS (actions/kyc.ts):

12. submitKyc(data: KycFormData)
    - Validate all fields
    - Create kyc_profiles record with status='pending'
    - Update users.kycStatus='pending'
    - Create notification for admin
    - In DEV: after 3s delay, auto-approve (simulate): update status='approved', users.kycStatus='approved'
    - Send email via Resend: "KYC Submitted — Under Review"
    - Return: { success: boolean }

13. getKycStatus(userId: string)
    - Return kyc_profiles record for user
    - Return: { status, rejectionReason, reviewedAt }

14. updateRole(userId: string, role: 'buyer'|'seller'|'both')
    - Update users.role
    - revalidatePath('/onboarding')

15. saveBuyerInterests(data: BuyerProfileData)
    - Upsert buyer_profiles record
    - revalidatePath('/buyer/dashboard')

STORE:
- store/kyc-wizard-store.ts → Zustand persisted store with step + formData per step

KYC AUTO-APPROVAL STUB (dev only):
In submitKyc(), after saving to DB, if NODE_ENV==='development', schedule a mock approval:
  setTimeout(async () => {
    await db.update(kycProfiles).set({ status: 'approved' })
    await db.update(users).set({ kycStatus: 'approved' })
  }, 3000)

RULES:
- All file uploads go through POST /api/documents/upload (creates Cloudinary URL, returns secure_url)
- Wizard state persists via Zustand with localStorage
- Zod schemas validate every field before moving steps
- Show inline field errors below each input
- Mobile fully responsive
```

---

## PHASE 4 — Listing Wizard (Seller Side)

> **Goal**: Full 6-step listing creation wizard for sellers.

```
You are building FMI. Phases 1–3 are complete. Now build Phase 4: Listing Creation Wizard (Seller Side).

This is the core seller flow — creating a business listing. Build a 6-step wizard at /seller/listings/new.

PAGES TO CREATE:

1. app/(seller)/layout.tsx
   - Left sidebar navigation
   - Links: Dashboard, My Listings, Offers, Deals, Settings
   - User avatar + name at bottom
   - Mobile: hamburger + Sheet drawer
   - Show KYC status banner if kycStatus !== 'approved'

2. app/(seller)/dashboard/page.tsx (STUB — build fully in Phase 9)
   - For now: just a welcome heading + "Create Your First Listing" CTA button

3. app/(seller)/listings/page.tsx (STUB)
   - Simple list of seller's listings with status badges
   - "New Listing" button top-right

4. app/(seller)/listings/new/page.tsx
   - 6-step wizard (full page, no table scroll)
   - Stepper at top showing steps 1–6
   - Animate step transitions

WIZARD STEPS:

STEP 1 — Asset Type:
  - Card grid (2×3 or 3×2): SaaS, eCommerce, Mobile App, Blog/Content, Domain, Service Business
  - Each card: icon, label, brief description
  - Single select (required)

STEP 2 — Basic Information:
  - Listing Title (public, describe without revealing name)
  - Business Name (private — only shown post-NDA)
  - Industry (select from INDUSTRIES constant)
  - Business URL (optional, shown post-NDA)
  - Year Established
  - Team Size
  - Hours per week seller spends on it
  - Business Model (SaaS/Subscription, One-time, Freemium, Ad-based, etc.)

STEP 3 — Financial Metrics:
  - Monthly Revenue (₹)
  - Monthly Profit (₹)
  - Monthly Expenses (calculated automatically)
  - Monthly Traffic (visitors)
  - Traffic Sources (SEO/Direct/Paid/Social — multi-select)
  - Show calculated metrics: Profit Margin %, Revenue Multiple preview
  - AI ASSIST BUTTON: "Suggest Asking Price" — calls POST /api/ai/valuation with revenue+profit+type, displays suggested range

STEP 4 — Document Upload:
  - Upload sections (each with dropzone):
    * Financial Statements (last 12 months P&L) — required
    * Analytics Screenshot (GA/similar) — required
    * Ownership Proof — required
    * Pitch Deck — optional
    * Other Documents — optional
  - Each upload shows file name, size, remove button
  - Upload via POST /api/documents/upload → Cloudinary

STEP 5 — Listing Story:
  - Tagline (1 sentence, shown on listing card)
  - Full Description (rich textarea — markdown supported)
  - Reason for Sale (dropdown: Lifestyle change, New opportunities, Partner issues, Retirement, Other)
  - What's included in sale (checklist: Source code, Domain, Social accounts, Customer list, Contracts, etc.)
  - Highlight strengths (textarea)
  - Known weaknesses (textarea — optional but builds trust)

STEP 6 — Pricing & Settings:
  - Asking Price (₹)
  - Pricing Model: Classified (fixed price) OR Auction
  - If Auction: Reserve Price
  - NDA Required: Yes/No toggle
  - NDA Fee: ₹ amount (default ₹999, can be ₹0)
  - Cover Image upload (shown on listing card)
  - Tags (multi-input: add tags for searchability)
  - Preview card showing how listing will look
  - Submit for Review button

COMPONENTS TO CREATE:

5. components/listings/listing-wizard.tsx
   - Wizard shell: stepper, step content, back/next buttons
   - Step validation before allowing Next
   - Auto-save draft on every step completion

6. components/listings/asset-type-selector.tsx
   - Icon grid cards
   - Hover + selected states

7. components/listings/financial-input-group.tsx
   - Revenue/Profit/Traffic inputs
   - Live calculated fields (margin, multiple)
   - INR formatting (₹ prefix, comma formatting)

8. components/shared/file-dropzone.tsx
   - Drag-and-drop zone
   - Multiple or single file mode
   - Shows upload progress bar
   - Preview for images, file icon for PDFs
   - 10MB max per file
   - Calls /api/documents/upload on drop

9. components/listings/listing-preview.tsx
   - Shows what the card will look like on marketplace
   - Updates live as user fills in Step 6

STORE:
10. store/listing-wizard-store.ts
    - Zustand persisted store
    - Stores: currentStep, formData (all 6 steps merged)
    - Actions: setStep, updateStep1Data...updateStep6Data, resetWizard

SERVER ACTIONS (actions/listings.ts):

11. createListingDraft(sellerId: string)
    - Creates listing record with status='draft'
    - Generates slug from title using slugify
    - Returns listingId

12. updateListingStep(listingId: string, stepData: Partial<Listing>)
    - Updates listing fields for current step
    - revalidatePath('/seller/listings')

13. uploadListingDocument(listingId: string, file: FormData, type: DocType)
    - Upload to Cloudinary via cloudinary.uploader.upload()
    - Create listing_documents record
    - Return { url, cloudinaryId }

14. submitListingForReview(listingId: string)
    - Validate: listing must have title, assetType, financials, at least 1 document
    - Update status='in_review'
    - Create notification for admin: "New listing submitted for review"
    - Send email to seller: "Listing submitted — under review (24–48h)"
    - revalidatePath('/seller/listings')
    - Return { success: boolean }

API ROUTE:
15. app/api/documents/upload/route.ts (POST)
    - Accept FormData with file
    - Upload to Cloudinary: cloudinary.uploader.upload(fileBuffer, { folder: 'fmi/listings', resource_type: 'auto' })
    - Return { url: secure_url, cloudinaryId: public_id }

API ROUTE:
16. app/api/ai/valuation/route.ts (POST)
    - Accept: { assetType, monthlyRevenue, monthlyProfit, yearEstablished }
    - Call Anthropic API:
      "You are an expert in Indian SME business valuations. Given: {assetType} business, ₹{revenue} MRR, ₹{profit} monthly profit, established {year}. Suggest a fair asking price range using Indian market multiples. Return JSON: { minPrice, maxPrice, recommendedPrice, reasoning, multiple }"
    - Return the JSON to client

RULES:
- Wizard state must persist across browser refresh (Zustand localStorage)
- Draft is auto-saved to DB after each completed step
- All monetary values stored in INR (paise optional, use integers)
- File size enforced client-side before upload attempt
- Show validation errors inline per field
- KYC gate: if seller kycStatus !== 'approved', show banner + redirect to KYC
```

---

## PHASE 5 — Marketplace & Listing Detail (Buyer Side)

> **Goal**: Browse listings, filter/search, view listing detail, NDA gate, contact seller.

```
You are building FMI. Phases 1–4 are complete. Now build Phase 5: Marketplace & Listing Detail.

This is the core buyer-facing feature — the business marketplace.

PAGES TO CREATE:

1. app/(buyer)/layout.tsx
   - Left sidebar: Dashboard, Browse Listings, My Offers, My Deals, Settings
   - KYC status banner if not approved
   - Notification bell in header
   - Mobile responsive (Sheet drawer)

2. app/(buyer)/dashboard/page.tsx (STUB — full build in Phase 9)
   - Welcome heading + stats placeholders
   - "Browse Listings" CTA

3. app/(marketing)/listings/page.tsx (PUBLIC — accessible without login)
   - This is the public marketplace — no auth required to browse
   - Two-column layout: left sidebar filters + right listing grid
   - Page title: "Browse Businesses for Sale"
   - Sorting: Newest / Highest Revenue / Lowest Price / Best Multiple
   - Results count: "Showing 24 of 142 listings"
   - Pagination: 12 per page

4. app/(marketing)/listings/[slug]/page.tsx (PUBLIC listing detail page)
   ABOVE-THE-FOLD (visible without login/NDA):
   - Asset type badge + industry tag
   - Listing title + tagline
   - MetricsBar: Monthly Revenue / Monthly Profit / Profit Margin / Asking Price / Revenue Multiple / Traffic
   - "Unlock Full Details" card (if NDA required): shows lock icon, NDA fee, "Sign NDA" button
   - Description (truncated at 200 chars if NDA required)
   - Year established, team size, hours/week, business model
   - Similar listings (3 cards at bottom)
   
   GATED (visible only after NDA signed):
   - Full description
   - Business URL
   - Business name
   - Detailed financials section
   - Traffic breakdown
   - Document links (with watermark overlay)
   - "Contact Seller" button (also requires KYC approval)

COMPONENTS TO CREATE:

5. components/listings/listing-card.tsx
   - Cover image (or gradient placeholder)
   - Asset type badge (color-coded: SaaS=purple, eCommerce=blue, App=green, Blog=orange, Domain=yellow, Service=gray)
   - Title (truncated)
   - Tagline (1 line)
   - Metrics row: Revenue / Profit / Multiple
   - Asking price (bottom right, bold)
   - NDA lock icon if ndaRequired=true
   - "Featured" badge if isFeatured=true
   - Hover: subtle shadow lift

6. components/listings/listing-grid.tsx
   - Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop
   - Skeleton loading (6 skeleton cards)
   - Empty state when no results

7. components/listings/listing-filters.tsx
   - Asset Type: checkbox list
   - Revenue Range: dual slider or min/max inputs (₹)
   - Asking Price Range: dual slider (₹)
   - Industry: searchable multi-select
   - Business Age: 0–1yr, 1–3yr, 3–5yr, 5yr+
   - "Apply Filters" button
   - "Clear All" link
   - Filter state synced to URL params (?type=saas&minRev=100000)

8. components/listings/listing-search.tsx
   - Search input with icon
   - Debounced 300ms
   - Searches: title, tagline, industry, tags
   - Clear button

9. components/listings/metrics-bar.tsx
   - Horizontal strip of metric pills
   - Each: label + formatted value
   - Revenue/Profit highlighted
   - Multiple shown as "3.2x"

10. components/listings/asset-type-badge.tsx
    - Color-coded pill: purple/blue/green/orange/yellow/gray
    - Small icon + label

11. components/documents/nda-modal.tsx
    - Triggered when clicking "Unlock Full Details"
    - Shows NDA terms (summary text)
    - If ndaFee > 0: shows Razorpay payment button
    - If ndaFee === 0: just "I Agree" checkbox + Sign button
    - On sign: calls signNda() server action
    - On success: page refreshes showing gated content

12. components/listings/listing-detail.tsx (client component for gated toggle)
    - Receives: listing, hasSignedNda, isKycApproved
    - Shows/hides sections based on props

API ROUTES:

13. app/api/listings/route.ts (GET)
    - Accept query params: type, minRevenue, maxRevenue, minPrice, maxPrice, industry, age, search, sort, page
    - Build Drizzle query with ILIKE search on title+description+tags
    - Filter by status='live' only (public marketplace)
    - Return: { listings, total, page, pageSize }

14. app/api/listings/[id]/route.ts (GET)
    - Return full listing data
    - If caller has signed NDA: include private fields
    - Increment viewCount

15. app/api/listings/[id]/unlock/route.ts (POST)
    - Verify payment if ndaFee > 0 (via paymentId)
    - Create nda_agreements record: status='signed', signedAt=now, expiresAt=now+1year
    - Send notification to seller: "New NDA signed by buyer"
    - Return { success: true }

SERVER ACTIONS (add to actions/listings.ts):

16. signNda(listingId: string, paymentId?: string)
    - Check if NDA already exists for this buyer+listing
    - If ndaFee > 0: verify payment
    - Insert nda_agreements record
    - revalidatePath(`/listings/${slug}`)

17. getListings(filters: FilterParams)
    - Server-side data fetch for RSC
    - Return typed listing array

PAYMENTS INTEGRATION:

18. app/api/payments/order/route.ts (POST)
    - Accept: { amount, purpose, listingId }
    - Create Razorpay order: razorpay.orders.create({ amount: amount*100, currency: 'INR' })
    - Insert payments record with status='created'
    - Return: { orderId, amount, currency, keyId }

19. app/api/payments/verify/route.ts (POST)
    - Accept: { orderId, paymentId, signature }
    - Verify signature: crypto.createHmac('sha256', secret).update(orderId+'|'+paymentId).digest('hex')
    - Update payments record: status='paid', paidAt=now
    - Return: { success: boolean, paymentId }

20. Client-side Razorpay integration in nda-modal.tsx:
    - Load Razorpay script dynamically
    - Open Razorpay checkout with order details
    - On success: call /api/payments/verify → then signNda()

RULES:
- Listing cards show ONLY public info (no revenue exact if NDA required — show ranges like "₹1L–₹5L MRR")
- NDA gate must work client-side (check hasSignedNda from session/DB)
- All financial numbers formatted as Indian currency (₹1,23,456 format using Indian locale)
- Filter state must sync with URL query params (shareable filtered URLs)
- Featured listings appear first in grid regardless of sort
```

---

## PHASE 6 — Offer Flow (Buyer Makes Offer, Seller Responds)

> **Goal**: Buyer submits offer, seller accepts/counters/rejects, accepted offer creates a deal.

```
You are building FMI. Phases 1–5 are complete. Now build Phase 6: Offer Flow.

This is the negotiation layer between buyer and seller before a deal is created.

PAGES TO CREATE:

1. app/(buyer)/offers/page.tsx
   - List all offers made by this buyer
   - Group by status: Active / Countered / Accepted / Rejected
   - Each offer card: listing title, offer amount, status badge, time ago
   - "View Deal" button for accepted offers

2. app/(seller)/offers/page.tsx
   - List all incoming offers for seller's listings
   - Group by: New / Pending Response / Countered / Closed
   - Each card: buyer name (masked as "Buyer #123"), listing, offer amount, message preview
   - Accept / Counter / Reject action buttons on each card

COMPONENTS TO CREATE:

3. components/deal-room/offer-card.tsx
   - Listing thumbnail + title
   - Offer amount (large, bold) + deal structure (upfront % + earnout %)
   - Buyer/Seller message
   - Status badge: pending (yellow), countered (blue), accepted (green), rejected (red), expired (gray)
   - Timeline: "Submitted 2 days ago · Expires in 5 days"
   - Action buttons (varies by role + status)

4. components/deal-room/offer-form.tsx
   - Used as a modal/sheet when making an offer from listing detail page
   - Fields:
     * Offer Amount (₹)
     * Deal Structure: Upfront % + Earnout % (must sum to 100%)
     * Earnout Terms (if earnout > 0%)
     * Message to Seller (textarea)
     * Offer Validity: 7 days / 14 days / 30 days
   - Validation: buyer must be KYC approved
   - Submit button: "Submit Offer"
   - Shows on listing detail page as a sticky sidebar card OR "Make an Offer" button that opens Sheet

5. components/deal-room/counter-offer-modal.tsx (for sellers)
   - Dialog showing original offer
   - Input: Counter Amount
   - Counter Message
   - Submit → calls counterOffer() action

6. components/deal-room/offer-timeline.tsx
   - Vertical timeline of all offer events:
     * "Buyer submitted ₹X" (timestamp)
     * "Seller countered ₹Y" (timestamp)
     * "Buyer accepted counter" (timestamp)
   - Color-coded dots per event type

SERVER ACTIONS (actions/offers.ts):

7. submitOffer(data: OfferInput)
   - Validate: buyer KYC approved, buyer has signed NDA for this listing
   - Validate: no other pending offer from same buyer on same listing
   - Insert offers record (status='pending')
   - Calculate expiresAt from validity days
   - Create notification for seller: "New offer received on [Listing Title]"
   - Send email to seller via Resend
   - revalidatePath('/buyer/offers')
   - Return { offerId }

8. acceptOffer(offerId: string)
   - Verify caller is the seller on this offer
   - Update offer: status='accepted'
   - Create deals record:
     * stage='due_diligence'
     * dealValue=offer.amount
     * escrowStatus='not_created'
   - Auto-create default deal checklist items:
     BUYER tasks:
       - "Upload Proof of Funds"
       - "Complete Due Diligence Review"
       - "Sign Purchase Agreement"
       - "Fund Escrow Account"
       - "Confirm Asset Handover Complete"
     SELLER tasks:
       - "Upload Detailed Financial Statements"
       - "Grant Analytics Platform Access"
       - "Sign Purchase Agreement"
       - "Transfer Domain Name"
       - "Transfer Code Repository Access"
       - "Transfer Admin Accounts (hosting, payment, etc.)"
     PLATFORM tasks:
       - "Admin: Verify Escrow Funding"
       - "Admin: Confirm Transfer Complete"
   - Reject all other pending offers on same listing
   - Create notifications: buyer ("Your offer was accepted!"), admin ("Deal created")
   - Send emails to both parties
   - revalidatePath('/seller/offers', '/buyer/offers')
   - Return { dealId }

9. counterOffer(offerId: string, counterAmount: number, message: string)
   - Verify caller is seller
   - Update offer: status='countered', counterAmount, counterMessage
   - Create notification for buyer: "Seller countered your offer"
   - Send email to buyer
   - Return { success }

10. rejectOffer(offerId: string, reason?: string)
    - Verify caller is seller
    - Update offer: status='rejected'
    - Notify buyer
    - Return { success }

11. withdrawOffer(offerId: string)
    - Verify caller is buyer + offer status is 'pending' or 'countered'
    - Update offer: status='withdrawn'
    - Notify seller
    - Return { success }

12. acceptCounter(offerId: string)
    - Buyer accepts seller's counter-offer
    - Update offer: status='accepted', amount=counterAmount
    - Trigger same deal creation flow as acceptOffer()
    - Return { dealId }

NOTIFICATIONS (create a shared helper):
13. lib/notifications.ts
    - createNotification(userId, type, title, body, data)
    - Inserts into notifications table
    - Triggers Pusher event on channel `user-{userId}` with event 'notification'

RULES:
- Buyers cannot make offers if KYC not approved — show "Complete KYC to make offers" wall
- Buyers cannot make offers if NDA not signed — show "Sign NDA first" wall
- Offer expiry is enforced: expired offers cannot be accepted (check expiresAt)
- All monetary amounts shown in Indian format (₹X,XX,XXX)
- Mobile: offer form as full-screen Sheet on mobile
```

---

## PHASE 7 — Deal Room (Core Transaction Workspace)

> **Goal**: Complete deal room — stage tracker, checklist, documents vault, e-sign stub, escrow status.

```
You are building FMI. Phases 1–6 are complete. Now build Phase 7: The Deal Room.

The Deal Room is the secure workspace created when a seller accepts an offer. Build it for both buyer and seller views.

PAGES TO CREATE:

1. app/(buyer)/deals/page.tsx
   - List all active deals for this buyer
   - Each deal: listing title, seller name, deal value, current stage, last activity
   - Stage progress mini-bar on each card
   - Click → /buyer/deals/[dealId]

2. app/(buyer)/deals/[dealId]/page.tsx (Deal Room Overview)
   - Deal header: listing title + deal value + deal ID
   - Stage Pipeline (horizontal tracker)
   - Two-column layout: left (main content) + right (sidebar)
   - Main: current stage instructions + required actions
   - Sidebar: deal summary card (parties, value, created date)
   - Tab navigation: Overview / Documents / Messages / Checklist

3. app/(buyer)/deals/[dealId]/documents/page.tsx
   - Document Vault
   - Upload new documents (categorized by type)
   - List uploaded documents with: name, type, uploader, date, visibility badge
   - "View" button → opens in new tab with watermark overlay
   - Visibility controls: buyer-only, seller-only, both

4. app/(buyer)/deals/[dealId]/messages/page.tsx
   - Chat interface (built in Phase 8)
   - For now: placeholder "Chat coming in Phase 8"

5. app/(buyer)/deals/[dealId]/checklist/page.tsx
   - Grouped checklist: "Your Tasks" + "Seller's Tasks" + "Platform Tasks"
   - Each item: checkbox, title, description, assigned-to icon, completed-by + timestamp
   - Buyer can only complete their own tasks
   - Progress bar per group
   - "Mark Complete" triggers DB update + notification to other party

6. Duplicate all deal pages for SELLER:
   app/(seller)/deals/page.tsx
   app/(seller)/deals/[dealId]/page.tsx (same structure, seller perspective)
   app/(seller)/deals/[dealId]/documents/page.tsx
   app/(seller)/deals/[dealId]/checklist/page.tsx

COMPONENTS TO CREATE:

7. components/deal-room/deal-stage-progress.tsx
   - Horizontal pipeline with 5 stages: Due Diligence → Agreement → Escrow → Transfer → Closed
   - Active stage highlighted (filled circle)
   - Completed stages with checkmark
   - Future stages grayed out
   - Stage labels below dots
   - Click on stage: show stage description tooltip

8. components/deal-room/deal-room-layout.tsx
   - Top: deal header (title, deal value badge, stage badge)
   - Tab bar: Overview / Documents / Messages / Checklist
   - Main content area
   - Right sidebar: Deal Summary Card

9. components/deal-room/deal-checklist.tsx
   - Props: items, userRole, onComplete
   - Groups items by assignedTo
   - Checkbox disabled if not assigned to current user's role
   - Animated checkmark on completion
   - Shows who completed + when

10. components/deal-room/escrow-status-card.tsx
    - Shows escrow stages: Not Created → Pending → Funded → Released
    - Deal value
    - "Initiate Escrow" button (stub → shows "Escrow process initiated" toast)
    - "Confirm Funding" (stub)
    - "Release Funds" (dual approval — both buyer + seller must click)

11. components/deal-room/agreement-viewer.tsx
    - Renders a mock Purchase Agreement document
    - Fills in: buyer name, seller name, deal value, listing title, date
    - Watermarked "DRAFT"
    - Scroll to bottom before enabling sign button

12. components/deal-room/e-sign-section.tsx
    - Below agreement viewer
    - Checkbox: "I have read and agree to the terms of this Purchase Agreement"
    - "Sign Agreement" button (enabled only after checkbox + scrolled to bottom)
    - On click: calls signAgreement() → records timestamp + userId as "signed"
    - Shows: "Signed by [Name] on [Date]" badge when complete
    - Shows other party's signature status

13. components/deal-room/deal-timeline.tsx
    - Chronological list of deal events:
      * Deal created
      * Stage changed
      * Document uploaded
      * Checklist item completed
      * Message sent (count, not content)
      * Signatures completed
    - Built from notifications table filtered by deal

14. components/documents/document-vault.tsx
    - Upload dropzone + document list
    - Filter by type
    - Visibility badge on each document
    - "View" opens in new tab

15. components/documents/document-viewer.tsx
    - iFrame or anchor link to Cloudinary URL
    - CSS watermark overlay: "CONFIDENTIAL — FMI DEAL #{dealId}" diagonal text
    - Download button

16. components/documents/document-upload.tsx
    - Dropzone for deal documents
    - Type selector: proof_of_funds / agreement / transfer_proof / other
    - Visibility selector: both / buyer_only / seller_only
    - Upload to /api/documents/upload → create deal_documents record

SERVER ACTIONS (actions/deals.ts):

17. getDeal(dealId: string)
    - Return full deal with listing, buyer, seller, checklist, documents, offer

18. advanceDealStage(dealId: string, newStage: DealStage)
    - Validate stage progression is sequential
    - Update deals.stage
    - Create system message in messages table: "Deal moved to [Stage] stage"
    - Push Pusher event: channel `deal-{dealId}`, event 'stage-changed'
    - Create notifications for both parties
    - revalidatePath

19. completeChecklistItem(itemId: string, dealId: string)
    - Validate item belongs to deal
    - Validate current user is assigned to this item
    - Update: isCompleted=true, completedBy=userId, completedAt=now
    - Create notification for other party: "Buyer completed: [Task Title]"
    - Push Pusher event: 'checklist-updated'
    - revalidatePath

20. signAgreement(dealId: string, role: 'buyer'|'seller')
    - Update deal: buyerSigned=true OR sellerSigned=true
    - If both signed: update signedAt=now, advance stage to 'escrow'
    - Create notification for other party
    - Trigger system message in chat
    - revalidatePath

21. initiateEscrow(dealId: string)
    - Stub: update escrowStatus='pending', escrowReference='ESC-'+random6digits
    - Create system message: "Escrow initiated. Reference: {ref}"
    - Notify both parties + admin
    - revalidatePath

22. releaseEscrow(dealId: string, role: 'buyer'|'seller')
    - Track who approved (store in deal metadata or separate booleans)
    - When both approved: update escrowStatus='released', advance stage to 'closed', closedAt=now
    - Create review requests for both parties
    - Notify both parties: "🎉 Deal Closed! Escrow Released."
    - revalidatePath

23. uploadDealDocument(dealId: string, data: { url, name, type, visibility, cloudinaryId })
    - Insert deal_documents record
    - Create notification for other party: "New document uploaded: [Name]"
    - Push Pusher event: 'document-uploaded'
    - revalidatePath

RULES:
- Deal Room is only accessible to buyer, seller, and admin of that specific deal
- Documents visibility strictly enforced: buyer_only docs not shown to seller and vice versa
- All deal actions create notifications AND pusher events
- Stage progression is linear (can't skip stages)
- E-sign is a stub: checkbox + timestamp = legally sufficient for MVP
- Escrow is fully stubbed — no real money moves
- Both buyer and seller views use same components, just with different permissions
```

---

## PHASE 8 — Real-Time Messaging (Pusher Chat)

> **Goal**: Full real-time chat within deal rooms using Pusher Channels.

```
You are building FMI. Phases 1–7 are complete. Now build Phase 8: Real-Time Messaging.

Build a full-featured real-time chat system inside deal rooms. Each deal has one chat channel.

COMPLETE THE PAGES:
- app/(buyer)/deals/[dealId]/messages/page.tsx (was placeholder in Phase 7)
- app/(seller)/deals/[dealId]/messages/page.tsx

These pages should render the ChatWindow component.

COMPONENTS TO CREATE:

1. components/messaging/chat-window.tsx
   - Full-height chat layout (header + messages list + input)
   - Header: deal title + other party's name + avatar
   - Messages area: scrollable, newest at bottom
   - Input area: fixed at bottom
   - On mount: subscribe to Pusher channel + fetch existing messages
   - Auto-scroll to bottom on new messages

2. components/messaging/message-list.tsx
   - Renders array of messages
   - Groups messages by sender with date separators ("Today", "Yesterday", "June 15")
   - Auto-scrolls to bottom ref on new message arrival
   - Shows "Loading..." skeleton on initial fetch

3. components/messaging/message-bubble.tsx
   - Sent (right-aligned, blue/primary background): user's own messages
   - Received (left-aligned, gray background): other party
   - System messages (centered, gray italic): deal stage updates
   - Shows: avatar, message content, timestamp, read indicator
   - Document message type: shows file icon + name + "View" link

4. components/messaging/message-input.tsx
   - Textarea (auto-expand, max 4 rows)
   - Send button (or Enter key)
   - Attach file button (opens file picker → uploads to Cloudinary)
   - Typing indicator trigger (emit pusher event on keystroke, throttled 2s)
   - Emoji button (basic — optional)
   - Disable input when deal is 'closed' or 'cancelled'

5. components/messaging/typing-indicator.tsx
   - Animated 3 dots
   - Shows "[Name] is typing..."
   - Disappears after 3s of no typing events

6. components/messaging/system-message.tsx
   - Centered pill: "Deal moved to Agreement stage · June 15, 2:30 PM"
   - Used for deal stage changes, document uploads, checklist completions

HOOKS:

7. hooks/use-messages.ts
   - useMessages(dealId: string)
   - Fetches messages via TanStack Query
   - Returns: { messages, isLoading, sendMessage, isSending }
   - Optimistic update: add message immediately before server confirms

8. hooks/use-pusher.ts
   - usePusher(channelName: string, events: Record<string, (data) => void>)
   - Subscribes to Pusher channel on mount
   - Unsubscribes on unmount
   - Handles reconnection

PUSHER SETUP:
   Channel naming: `deal-{dealId}` (private channels)
   Events:
   - 'new-message': { message: MessageObject }
   - 'user-typing': { userId, userName }
   - 'read-receipt': { userId, lastReadAt }
   - 'stage-changed': { newStage }
   - 'document-uploaded': { document }
   - 'checklist-updated': { itemId }
   - 'notification': { title, body } (on user-specific channel `user-{userId}`)

SERVER ACTIONS (actions/messages.ts):

9. sendMessage(dealId: string, content: string, type: 'text'|'document', documentUrl?: string)
   - Validate: deal exists + user is buyer or seller of deal
   - Insert messages record
   - Trigger Pusher: channel `deal-{dealId}`, event 'new-message', data: { message }
   - Return { message }

10. markMessagesRead(dealId: string)
    - Update all messages in deal where senderId != currentUser and isRead=false → isRead=true
    - Trigger Pusher: 'read-receipt', { userId, lastReadAt: now }
    - Return { count }

API ROUTE:

11. app/api/messages/[dealId]/route.ts (GET)
    - Auth check: user must be party to deal
    - Return last 50 messages, ordered by createdAt ASC
    - Include sender info (name, avatarUrl)

12. app/api/messages/[dealId]/route.ts (POST)
    - Create message + trigger Pusher
    - (Alternatively use Server Action — choose Server Action for consistency)

PUSHER AUTH (required for private channels):

13. app/api/pusher/auth/route.ts
    - POST endpoint
    - Validates session
    - Returns: pusher.authenticate(socketId, channelName)
    - Only allow user to subscribe to channels they're authorized for

NOTIFICATION BELL:

14. components/shared/notification-bell.tsx
    - Bell icon in header
    - Red badge with unread count
    - Click → dropdown with last 10 notifications
    - "Mark all read" button
    - Each notification: icon, title, body, time ago, link
    - Subscribe to Pusher channel `user-{userId}` for real-time bell updates

15. hooks/use-notifications.ts
    - Fetches notifications from DB
    - Subscribes to user's Pusher channel
    - Appends new notifications in real-time
    - unreadCount derived

STORE:
16. store/notification-store.ts
    - Zustand: { notifications, unreadCount, addNotification, markAllRead }

API ROUTE:
17. app/api/notifications/route.ts (GET)
    - Return current user's notifications, newest first, limit 50
18. app/api/notifications/read/route.ts (PUT)
    - Mark all as read

RULES:
- Pusher auth endpoint is required — private channels need server-side auth
- Messages optimistically added to UI before server confirms
- System messages auto-inserted when deal actions happen (stage changes, doc uploads)
- Read receipts triggered when chat window is focused and user can see messages
- Typing indicator disappears after 3 seconds with no new typing events
- No message editing/deletion in MVP (audit trail)
- Mobile: full-screen chat takes full viewport height
```

---

## PHASE 9 — Admin Panel

> **Goal**: Full admin panel — KYC review, listing moderation, deal monitoring, user management.

```
You are building FMI. Phases 1–8 are complete. Now build Phase 9: Admin Panel.

Build the complete internal admin panel for platform operators.

PAGES TO CREATE (all under app/(admin)/ route group):

1. app/(admin)/layout.tsx
   - Admin-specific sidebar: Dashboard, Listings, KYC, Deals, Users, Reports
   - Red "ADMIN" badge in sidebar header
   - Access control: if user.role !== 'admin' → redirect to /login

2. app/(admin)/dashboard/page.tsx
   - 4 KPI cards (top row): Total Users / Active Listings / Active Deals / Total Deal Value
   - 4 Action cards (second row): Pending KYC Reviews / Pending Listing Reviews / Open Disputes / Flagged Users
   - Recent Activity feed (last 20 events across all users)
   - Charts: New users per day (last 7 days) + Deals created per day

3. app/(admin)/listings/page.tsx — Moderation Queue
   - Two tabs: "Pending Review" | "All Listings"
   - Each listing card in queue:
     * Listing title, asset type, seller name, submitted date
     * Revenue/Profit/Asking price metrics
     * "Review" button → opens listing review modal
   - Filters: by status, by asset type, by date range
   - Bulk actions: approve all, reject selected

4. app/(admin)/kyc/page.tsx — KYC Review Queue
   - Two tabs: "Pending Review" | "All KYC"
   - Each KYC card:
     * User name, email, KYC type (individual/company), submitted date
     * "Review" button → opens full KYC review panel
   - Filters: by status, by KYC type

5. app/(admin)/deals/page.tsx — Deal Monitor
   - Table of all active deals
   - Columns: Deal ID, Listing, Buyer, Seller, Deal Value, Stage, Escrow Status, Created
   - Sortable columns
   - Click row → /admin/deals/[dealId] (admin view of deal room)
   - Filters: by stage, by escrow status

6. app/(admin)/users/page.tsx — User Management
   - Searchable table: all users
   - Columns: Name, Email, Role, KYC Status, Listings Count, Deals Count, Joined
   - Actions per row: View Profile, Suspend, Change Role
   - Filters: by role, by KYC status

7. app/(admin)/reports/page.tsx (stub)
   - Placeholder with "Analytics coming soon" and key metrics cards

COMPONENTS TO CREATE:

8. components/admin/admin-stats-grid.tsx
   - 4 or 8 metric cards
   - Each: icon, label, number (animated count-up), trend arrow + % vs last week

9. components/admin/review-queue.tsx
   - Generic queue component
   - Props: items, renderCard, onAction
   - Filters + search at top
   - Pagination

10. components/admin/listing-review-modal.tsx
    - Dialog showing FULL listing preview exactly as a buyer would see it
    - All fields: title, financials, documents list, description
    - AI Score section: calls /api/ai/analyze-listing → shows score 1–10 + flags
    - Approve button (green) → approveListing()
    - Reject button (red) → opens rejection reason textarea → rejectListing()
    - "Request Changes" button → sends message to seller

11. components/admin/kyc-review-card.tsx
    - Full-screen panel (or large dialog) with:
      LEFT: Document viewer (PAN image, Aadhaar image, Selfie)
      RIGHT: Submitted data (name, PAN number, Aadhaar last 4, bank details)
    - Approve button → approveKyc()
    - Reject button + reason input → rejectKyc()
    - Notes field for internal admin notes

12. components/admin/user-table.tsx
    - TanStack Table implementation
    - Sortable columns
    - Pagination (25 per page)
    - Search by name/email
    - Action dropdown per row

13. components/admin/deal-monitor-table.tsx
    - Similar to user-table but for deals
    - Color-coded stage badges
    - Quick escrow actions column

SERVER ACTIONS (actions/admin.ts):

14. approveListing(listingId: string)
    - Validate: caller is admin
    - Update listing: status='live', publishedAt=now
    - Notify seller: "Your listing is now live! 🎉"
    - Send email to seller
    - revalidatePath('/admin/listings')

15. rejectListing(listingId: string, reason: string)
    - Update listing: status='rejected'
    - Notify seller with rejection reason
    - revalidatePath('/admin/listings')

16. featureListing(listingId: string, featured: boolean)
    - Toggle isFeatured
    - revalidatePath('/admin/listings')

17. approveKyc(userId: string)
    - Update kyc_profiles: status='approved', reviewedBy=adminId, reviewedAt=now
    - Update users: kycStatus='approved'
    - Notify user: "Your KYC has been approved! You can now make offers."
    - Send email to user
    - revalidatePath('/admin/kyc')

18. rejectKyc(userId: string, reason: string)
    - Update kyc_profiles: status='rejected', rejectionReason=reason
    - Update users: kycStatus='rejected'
    - Notify user with rejection reason + "Please resubmit with correct documents"
    - revalidatePath('/admin/kyc')

19. suspendUser(userId: string, reason: string)
    - Update users: role='suspended' (add this status)
    - Terminate active sessions
    - Notify user
    - revalidatePath('/admin/users')

20. getAdminStats()
    - Return: totalUsers, activeListings, activeDeals, totalDealValue, pendingKyc, pendingListings

AI INTEGRATION:

21. app/api/ai/analyze-listing/route.ts (POST)
    - Accept: { listingId } → fetch full listing from DB
    - Call Anthropic API:
      System: "You are an expert business listing quality analyst for an Indian marketplace."
      User: "Analyze this listing for quality and buyer appeal. Score 1-10. Flag red flags. Suggest improvements. Return JSON: { score, redFlags: string[], improvements: string[], summary: string }"
    - Return the JSON

RULES:
- All admin actions are logged in notifications table with type='admin_action'
- Admin can access ALL deal rooms (bypass buyer/seller-only check for admins)
- Admin panel shows real data — no fake seeding needed for MVP review
- KYC documents viewable via Cloudinary URL (already uploaded in Phase 3)
- Implement simple rate limiting on admin actions (prevent accidental bulk approvals)
```

---

## PHASE 10 — Buyer & Seller Dashboards + Notifications

> **Goal**: Full personalized dashboards for both roles, complete notification system.

```
You are building FMI. Phases 1–9 are complete. Now build Phase 10: Dashboards & Notifications.

Build the fully-featured dashboards for buyers and sellers, and complete the notification system.

BUYER DASHBOARD — app/(buyer)/dashboard/page.tsx:

Replace the stub from Phase 5. Build a real dashboard:

SECTIONS:
1. Welcome Hero: "Good morning, {name}" + KYC status card (if not approved, prominent CTA)
2. Stats Row (4 cards): Active Offers / Active Deals / NDAs Signed / Listings Saved
3. "Your Active Deals" section: deal cards with stage progress bar, last activity
4. "Offers Awaiting Response" section: countered offers that need buyer action
5. "Recommended For You" section:
   - Calls /api/ai/recommend with buyer profile (industries, budget, type)
   - Shows 3–6 listing cards with "Recommended" badge
   - Stub: return 5 random live listings if no buyer profile set
6. "Recently Viewed" section: last 6 listings the buyer clicked
7. Activity Feed: chronological list of all buyer's deal + offer events

SELLER DASHBOARD — app/(seller)/dashboard/page.tsx:

SECTIONS:
1. Welcome Hero: "{name}'s Listings" + KYC status card + "Create Listing" button
2. Stats Row (4 cards): Total Revenue (sum of closed deals) / Active Listings / Pending Offers / Active Deals
3. "Listing Performance" section:
   - For each active listing: views this week, NDAs unlocked, offers received
   - Sparkline or mini bar chart per listing
4. "Offers Requiring Action" section: pending offers needing seller response
5. "Active Deals" section: all deals with stage + last activity
6. "Listing Status" table: all listings with status badges + quick actions

COMPONENTS TO CREATE:

1. components/shared/metrics-card.tsx
   - Number (large, bold, animated count-up with Framer Motion)
   - Label (small, muted)
   - Trend indicator: arrow up/down + % change vs last period
   - Icon (Lucide)
   - Optional: sparkline mini chart

2. components/shared/activity-feed.tsx
   - Chronological event list (newest first)
   - Each event: icon, description, time ago
   - Events: offer received, NDA signed, deal stage changed, message received, KYC approved
   - "Load more" pagination
   - Real-time: subscribe to user's Pusher channel for live feed updates

3. components/shared/empty-state.tsx
   - SVG illustration (simple, inline)
   - Heading + description
   - Optional CTA button
   - Variants: no-listings, no-offers, no-deals, no-messages, no-notifications

4. components/shared/loading-skeleton.tsx
   - Skeleton variants for each major component:
     * listing-card-skeleton
     * metrics-card-skeleton
     * activity-feed-skeleton
     * deal-card-skeleton
     * notification-skeleton

5. Buyer-specific listing card variant:
   components/listings/saved-listing-card.tsx
   - Compact card for dashboard
   - Remove from saved button
   - "Sign NDA" or "Make Offer" quick action

6. components/shared/notification-page.tsx (for /notifications route)
   - Full page: all notifications, grouped by date
   - Each: icon, title, body, time, read/unread state, clickable link
   - "Mark all read" button

COMPLETE NOTIFICATION SYSTEM:

7. app/api/notifications/route.ts (GET)
   - Return user's notifications (newest first, limit 50)
   - Filter: ?unread=true

8. app/api/notifications/[id]/read/route.ts (PUT)
   - Mark single notification as read

9. app/api/notifications/read-all/route.ts (PUT)
   - Mark all user's notifications as read

10. Update hooks/use-notifications.ts (from Phase 8 stub):
    - Full implementation:
    - Initial fetch from API
    - Pusher subscription on `user-{userId}` for real-time
    - Returns: { notifications, unreadCount, markAsRead, markAllRead }

11. app/(buyer)/notifications/page.tsx + app/(seller)/notifications/page.tsx
    - Full notification history page
    - Uses notification-page.tsx component

RECENTLY VIEWED LISTINGS:

12. Track listing views:
    - In app/(marketing)/listings/[slug]/page.tsx, call trackView(listingId) server action
    - Store in Redis: `viewed:{userId}` → sorted set, score = timestamp, member = listingId
    - Keep only last 20

13. getRecentlyViewed(userId) → fetch listingIds from Redis → batch fetch listings from DB

AI RECOMMENDATIONS:

14. app/api/ai/recommend/route.ts (POST)
    - Fetch buyer's profile (industries, budget, type)
    - Fetch all live listings
    - If buyer profile exists: filter listings matching profile criteria, shuffle top 10, return 5
    - Stub (no real ML): just return 5 listings that match buyer's budget range and industries
    - Return: { listings: Listing[] }

SERVER ACTIONS (add to existing actions):

15. saveListingForBuyer(listingId: string) / unsaveListingForBuyer(listingId: string)
    - Store in a buyer_saved_listings table (create this table if not exists)
    - OR store in Redis set: `saved:{userId}` → set of listingIds
    - Use Redis for speed

16. getBuyerDashboardData(userId: string)
    - Parallel fetch: active offers, active deals, recommended listings, recent activity
    - Return aggregated dashboard data

17. getSellerDashboardData(userId: string)
    - Parallel fetch: listings with metrics, pending offers, active deals
    - Return aggregated dashboard data

SETTINGS PAGES (simple):

18. app/(buyer)/settings/page.tsx
    - Profile: name, phone, email (read-only)
    - Buyer preferences: update industries, budget, type
    - KYC status display
    - Change avatar (Cloudinary upload)

19. app/(seller)/settings/page.tsx
    - Profile: name, phone, email
    - Bank details (read-only, links to re-submit KYC)
    - Notification preferences (which emails to receive)
    - Change avatar

RULES:
- All dashboard data fetched server-side in RSC for fast initial load
- TanStack Query used for interactive refetchable sections (offers, deals)
- Empty states on every section — never show blank space
- Mobile: stack all cards vertically, single column
- Notification bell always visible in header across all authenticated pages
```

---

## PHASE 11 — Landing Page & Public Pages

> **Goal**: Investor-demo quality landing page and public marketing pages.

```
You are building FMI. Phases 1–10 are complete. Now build Phase 11: Landing Page & Public Marketing Pages.

Build an exceptional, investor-demo quality landing page for FMI — India's trusted digital business marketplace.

PAGES TO CREATE:

1. app/(marketing)/page.tsx — Landing Page

Build ALL these sections in order:

SECTION 1 — NAVBAR:
   - FMI logo (left)
   - Nav links: How It Works, Browse Businesses, About
   - Right: "List Your Business" button + "Sign In" button
   - Sticky on scroll with blur backdrop
   - Mobile: hamburger menu → Sheet drawer

SECTION 2 — HERO:
   - Headline: "Buy & Sell Digital Businesses in India — With Trust Built In"
   - Subheadline: "The first Indian marketplace with mandatory KYC, NDA-gated financials, escrow protection, and structured deal rooms."
   - Two CTA buttons: "Browse Businesses →" (primary) + "List Your Business" (outline)
   - Trust badges row: "KYC Verified Sellers", "NDA Protected", "Escrow Secured", "₹50Cr+ in Deals"
   - Hero image/illustration: abstract marketplace graphic OR screenshot of the deal room
   - Framer Motion: fade-in + slide-up on mount

SECTION 3 — STATS BAR:
   - 4 animated numbers (count-up on scroll into view):
     * 500+ Businesses Listed
     * ₹50 Cr+ Deal Value
     * 200+ Verified Buyers
     * 98% Deal Completion Rate
   - Subtle gradient background
   - Framer Motion: countUp animation using useInView

SECTION 4 — PROBLEM/SOLUTION:
   - Left: "The Problem with Buying Indian Businesses Today"
     * ❌ Fake listings with inflated revenue
     * ❌ No verified buyer qualification
     * ❌ Manual, unstructured negotiations
     * ❌ No secure document sharing
     * ❌ No escrow or asset protection
   - Right: "The FMI Way"
     * ✅ PAN + Aadhaar verified sellers
     * ✅ KYC-gated buyer access
     * ✅ Structured deal room + NDA flow
     * ✅ Secure document vault
     * ✅ Escrow protection
   - Animated: right column reveals as user scrolls

SECTION 5 — HOW IT WORKS (3 tabs: Buyer / Seller / Both):
   - Tab: FOR BUYERS
     Step 1: Browse verified listings (icon: Search)
     Step 2: Sign NDA to unlock financials (icon: Lock → Unlock)
     Step 3: Make an offer (icon: Handshake)
     Step 4: Close the deal in your Deal Room (icon: CheckCircle)
   - Tab: FOR SELLERS
     Step 1: Complete KYC verification (icon: Shield)
     Step 2: Create your listing (icon: PlusCircle)
     Step 3: Receive and negotiate offers (icon: MessageCircle)
     Step 4: Transfer assets + receive payment (icon: Banknote)
   - Visual: horizontal stepper with icons + descriptions
   - Animated step transitions

SECTION 6 — ASSET TYPES:
   - "What Types of Businesses Can You Buy?"
   - 6 category cards in 2-row grid:
     * SaaS Products (purple)
     * eCommerce Stores (blue)
     * Mobile Apps (green)
     * Blogs & Content Sites (orange)
     * Domain Names (yellow)
     * Service Businesses (gray)
   - Each card: icon, label, typical multiple range (e.g., "2–4x Revenue")
   - Click → /listings?type=saas

SECTION 7 — FEATURED LISTINGS:
   - "Recently Listed Businesses"
   - Fetch 6 live isFeatured listings from DB (or first 6 live listings)
   - Use ListingCard components
   - "Browse All 500+ Listings →" button at bottom
   - If no live listings: show 6 sample/demo listing cards with fake data

SECTION 8 — TRUST & COMPLIANCE:
   - "Built for India's Compliance Requirements"
   - Icons + explanations:
     * PAN + Aadhaar Verification
     * NDA Execution (Digital Consent)
     * GST Compliant Invoicing
     * Escrow via Licensed Partners
     * Data Residency in India
   - Indian flag motif, saffron/green/navy color accents

SECTION 9 — TESTIMONIALS:
   - "What Our Users Say"
   - 3 testimonial cards (demo/fake for MVP):
     * Buyer: "Found my first SaaS acquisition on FMI. The NDA and deal room made the whole process feel safe and structured."
     * Seller: "Listed my eCommerce store and had 12 NDA requests in the first week. Sold in 45 days."
     * Buyer: "As a PE investor, FMI's KYC requirements meant every seller I spoke to was legitimate."
   - Star ratings, avatar initials, name + role
   - Carousel on mobile

SECTION 10 — FAQ:
   - Accordion component with 8 questions:
     * "What is FMI?"
     * "How is my identity verified?"
     * "What does KYC cost?"
     * "How does the NDA process work?"
     * "How is escrow handled?"
     * "What fees does FMI charge?"
     * "How long does it take to sell a business?"
     * "Is FMI regulated?"

SECTION 11 — FINAL CTA:
   - "Ready to Buy or Sell Your Digital Business?"
   - Two buttons: "Start Browsing" + "List My Business"
   - Background: dark navy with Indian pattern watermark

SECTION 12 — FOOTER:
   - Logo + tagline
   - Links: About, How It Works, Browse, Blog, Careers
   - Legal: Privacy Policy, Terms of Service, Refund Policy
   - "© 2024 FMI Technologies Pvt. Ltd. | CIN: XXXXXXXX"
   - Social links (stub)

2. app/(marketing)/how-it-works/page.tsx
   - Detailed 3-tab process (Buyer / Seller / Both)
   - Step-by-step with screenshots/illustrations
   - FAQ section
   - CTA at bottom

3. app/(marketing)/about/page.tsx
   - Mission statement
   - Team section (placeholder avatars)
   - "Why we built FMI" story

NAVBAR for authenticated users:
   - When logged in: replace Sign In with user avatar dropdown
   - Dropdown: Dashboard, Settings, Sign Out

SHARED COMPONENTS:
4. components/layout/navbar.tsx (public, polished)
5. components/layout/footer.tsx
6. components/layout/mobile-nav.tsx (Sheet drawer for mobile)

RULES:
- Landing page must load fast: use static data where possible
- Featured listings fetched server-side in RSC
- All animations use Framer Motion with useInView (only animate when scrolled into view)
- Mobile-first responsive design — test all sections at 375px width
- Indian branding: use ₹ symbol, mention India-specific compliance, saffron/green accents
- Fonts: use Inter or a clean system font
- Color palette: Navy (#0F172A), Saffron (#FF9933), Green (#138808), White
```

---

## PHASE 12 — Polish, Error Handling & Mobile Responsiveness

> **Goal**: Production-ready polish — empty states, loading skeletons, error boundaries, 404, toasts, mobile.

```
You are building FMI. Phases 1–11 are complete. Now build Phase 12: Polish & Production Readiness.

This phase makes the app feel complete and production-quality.

EMPTY STATES — Create for every section that can be empty:

1. components/shared/empty-state.tsx (generic, with variants):
   - Buyer: no-saved-listings, no-offers, no-deals, no-notifications
   - Seller: no-listings, no-incoming-offers, no-deals
   - Admin: no-pending-kyc, no-pending-listings, no-active-deals
   - Marketplace: no-results (with "Clear filters" CTA)
   Each variant: inline SVG illustration + heading + description + optional CTA button

LOADING SKELETONS — Add to every data-loading state:

2. Create skeleton variants for ALL these components:
   - ListingCardSkeleton (matches exact dimensions of ListingCard)
   - MetricsCardSkeleton
   - DealCardSkeleton
   - OfferCardSkeleton
   - NotificationSkeleton
   - ChatMessageSkeleton (3 alternating left/right bubbles)
   - TableRowSkeleton
   - KycStatusSkeleton
   - DashboardStatsSkeleton (4 cards)
   
   Use shadcn Skeleton component. Wrap in Suspense boundaries in all RSC pages.

ERROR HANDLING:

3. app/error.tsx (global error boundary)
   - "Something went wrong" page
   - Error details in dev only
   - "Try again" button (calls reset())
   - "Go home" button

4. app/not-found.tsx (404 page)
   - "Page not found" with FMI branding
   - Search bar to find listings
   - "Browse all listings" CTA

5. app/loading.tsx (global loading)
   - FMI logo with spinning indicator
   - Shown during navigation

6. Add error.tsx to each major route group: (buyer), (seller), (admin)

7. Wrap all Server Actions in try/catch:
   - Return consistent { success: boolean, error?: string, data?: T }
   - Client side: show toast on error, success toast on completion

TOAST NOTIFICATIONS:
8. Ensure Sonner or shadcn toast is configured in root layout
9. Add success/error toasts to ALL user actions:
   - "OTP sent!" / "Wrong OTP, try again"
   - "KYC submitted — under review"
   - "Listing saved as draft"
   - "Listing submitted for review"
   - "Offer submitted!"
   - "Offer accepted — Deal Room created"
   - "Message sent"
   - "Document uploaded"
   - "Checklist item completed"
   - "Agreement signed"

FORM VALIDATION:
10. Audit ALL forms — every field must have:
    - Zod schema validation
    - Inline error messages (red, below field)
    - Disabled submit button while submitting
    - Loading spinner on submit button

MOBILE RESPONSIVENESS — audit and fix ALL pages:
11. Test and fix at 375px (iPhone SE), 390px (iPhone 14), 768px (iPad):
    - Marketplace: 1 column grid, full-width filter sheet
    - Listing detail: stacked layout, NDA modal full-screen on mobile
    - Deal Room: tab bar scrollable on mobile, chat full-height
    - Dashboards: single column, cards full-width
    - Admin: tables become cards on mobile (or horizontal scroll)
    - Wizard steps: full-width on mobile, stepper text hidden (show dots only)
    - Offer form: full-screen Sheet on mobile

ANIMATIONS:
12. Add Framer Motion to:
    - Page transitions: wrap content in motion.div with fadeIn
    - Listing cards: stagger children animation on grid load
    - Wizard step transitions: slide left/right
    - Notification bell badge: scale animation on new notification
    - Deal stage progress: animate completion checkmarks
    - Dashboard metrics: count-up animation on mount

PAGE HEADERS:
13. components/layout/page-header.tsx
    - Title (h1)
    - Optional breadcrumb
    - Optional action slot (right side)
    - Used on ALL interior pages for consistency

FINAL AUDIT CHECKLIST — verify each item works end-to-end:
14. Create app/(marketing)/health/page.tsx:
    - Shows connection status for: DB, Redis, Pusher, Cloudinary, Resend, Razorpay, Anthropic
    - Each: green check or red X with error message
    - Admin only in production

PERFORMANCE:
15. Add these to next.config.ts:
    - Image optimization for Cloudinary (remotePatterns)
    - Bundle analyzer
16. Add React Suspense boundaries to all heavy components
17. Ensure no client components unnecessarily large — keep 'use client' at leaf components
```

---

## PHASE 13 — Email Templates & Final Integration

> **Goal**: All transactional emails, webhook handlers, final wiring of all notification flows.

```
You are building FMI. Phases 1–12 are complete. This is Phase 13: Email Templates & Final Integration.

Complete all email templates and wire together every notification flow end-to-end.

EMAIL TEMPLATES (all in emails/ folder using React Email):

1. emails/otp.tsx — OTP Email
   - FMI logo
   - "Your verification code"
   - 6-digit code in large box
   - "This code expires in 10 minutes"
   - "If you didn't request this, ignore this email"

2. emails/kyc-submitted.tsx — KYC Submission Confirmation
   - "We've received your KYC documents"
   - Expected review time: 24–48 hours
   - List of submitted document types
   - "You'll be notified once approved" 

3. emails/kyc-approved.tsx — KYC Approval
   - "🎉 Your KYC has been approved!"
   - "You can now make offers and access deal rooms"
   - CTA: "Browse Businesses" or "Create Your Listing"

4. emails/kyc-rejected.tsx — KYC Rejection
   - "Your KYC could not be verified"
   - Rejection reason displayed
   - Instructions: "Please resubmit with..."
   - CTA: "Resubmit KYC"

5. emails/listing-submitted.tsx — Listing Under Review
   - "Your listing has been submitted for review"
   - Listing title
   - "Expected review: 24–48 hours"
   - Tips: "You'll be notified when it goes live"

6. emails/listing-approved.tsx — Listing Live
   - "🎉 Your listing is now live!"
   - Listing title + link
   - "Share your listing to attract buyers"
   - Listing URL

7. emails/new-offer-seller.tsx — New Offer Received (for seller)
   - "You have a new offer on [Listing Title]"
   - Offer amount
   - Buyer's message (preview)
   - CTA: "View Offer" button

8. emails/offer-accepted-buyer.tsx — Offer Accepted (for buyer)
   - "Your offer has been accepted! 🎉"
   - Deal details: listing, amount
   - CTA: "Enter Your Deal Room"

9. emails/offer-countered.tsx — Counter Offer
   - "The seller has made a counter offer"
   - Original offer: ₹X
   - Counter offer: ₹Y
   - CTA: "View Counter Offer"

10. emails/deal-stage-change.tsx — Deal Stage Update (generic)
    - "Your deal has moved to: [Stage Name]"
    - Stage description
    - Required actions for this stage
    - CTA: "Open Deal Room"

11. emails/deal-closed.tsx — Deal Closed
    - "🎉 Congratulations — Deal Closed!"
    - Deal summary: listing, parties, value, date
    - "Please leave a review for your counterparty"
    - Thank you note

WEBHOOK HANDLERS:

12. app/api/webhooks/razorpay/route.ts
    - Verify Razorpay signature using raw body
    - Handle events:
      * payment.captured → update payment status='paid', trigger NDA unlock or listing fee processing
      * payment.failed → update payment status='failed', notify user
      * refund.created → update payment status='refunded'
    - Return 200 OK immediately

13. app/api/webhooks/kyc/route.ts (for future KYC provider)
    - Accept mock webhook in dev:
      POST /api/webhooks/kyc with { userId, status: 'approved'|'rejected', reason? }
    - Calls approveKyc() or rejectKyc() internally
    - Sends appropriate email

COMPLETE NOTIFICATION FLOWS — audit and confirm ALL these flows work end-to-end:

14. FLOW: New User Signup
    → Send OTP email → Verify → Send welcome email

15. FLOW: KYC Submission
    → DB record created → Admin notification (in-app) → Email to user "under review"
    → In DEV: auto-approve after 3s → Email to user "approved"

16. FLOW: Listing Created & Reviewed
    → Draft created → Submitted for review → Admin notified (in-app + email if configured)
    → Admin approves → Seller notified (in-app + email) → Listing live

17. FLOW: NDA Signed
    → Payment verified → NDA record created → Seller notified (in-app) → Buyer sees unlocked content

18. FLOW: Offer Submitted
    → Offer in DB → Seller notified (in-app + email) → Seller responds
    → If accepted: both notified (in-app + email) → Deal room created

19. FLOW: Deal Stage Change
    → advanceDealStage() called → Both parties notified (in-app + email) → Pusher event sent → System message in chat

20. FLOW: Deal Closed
    → escrowStatus=released → Deal closed → Both parties emailed → Review requests created

FINAL WIRING:
21. Ensure EVERY Server Action that creates a notification also:
    a. Inserts into notifications table
    b. Pushes Pusher event to relevant user channel(s)
    c. Sends email via Resend

22. Add Resend sendEmail() helper in lib/resend.ts:
    - sendEmail({ to, subject, template, data })
    - Maps template name to React Email component
    - Catches errors without crashing the main action

ENVIRONMENT VALIDATION:
23. Create lib/env.ts:
    - Zod schema validating all required env vars at startup
    - Throws clear error if any missing
    - Import in lib/db/index.ts to validate on first DB call
```

---

## PHASE 14 — Deployment & Final QA

> **Goal**: Deploy to Vercel, connect all production services, run end-to-end QA.

```
You are building FMI. All 13 previous phases are complete. This is Phase 14: Deployment & Final QA.

Deploy the app to Vercel and run end-to-end verification.

DEPLOYMENT STEPS:

1. FINAL BUILD CHECK:
   Run: npm run build
   Fix ALL TypeScript errors and build errors before deploying.
   Common fixes needed:
   - Add 'use client' to components with hooks
   - Fix async Server Component patterns
   - Resolve missing type imports
   - Fix any Zod schema mismatches

2. VERCEL SETUP:
   - npx vercel login
   - npx vercel link (or connect GitHub repo via Vercel dashboard)
   - Set ALL environment variables in Vercel dashboard (copy from .env.local)
   - Set NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   - Set NODE_ENV=production
   - Deploy: npx vercel --prod

3. POST-DEPLOY VERIFICATION:
   Test each user journey end-to-end on the live URL:

   JOURNEY 1 — BUYER:
   [ ] Visit / → landing page loads, Featured Listings show
   [ ] Click "Sign Up" → signup form
   [ ] Signup with test email → OTP email received
   [ ] Enter OTP → verify-phone page
   [ ] Enter phone → OTP (use 123456 in dev or SMS in prod)
   [ ] /onboarding/role → select Buyer
   [ ] /onboarding/kyc/individual → complete all 4 steps
   [ ] KYC submitted → see "under review" status
   [ ] /buyer/dashboard → dashboard loads with empty states
   [ ] /listings → marketplace loads
   [ ] Click a listing → detail page loads
   [ ] Click "Unlock" → NDA modal → sign NDA (₹0 fee for testing)
   [ ] Gated content revealed
   [ ] Make an offer → offer form → submit
   [ ] /buyer/offers → offer visible

   JOURNEY 2 — SELLER:
   [ ] Create second test account → role: Seller
   [ ] Complete seller KYC
   [ ] /seller/listings/new → complete 6-step wizard
   [ ] Submit listing for review
   [ ] (In admin) approve listing → listing goes live
   [ ] /seller/offers → see buyer's offer
   [ ] Accept offer → Deal Room created
   [ ] /seller/deals/[id] → deal room accessible

   JOURNEY 3 — DEAL ROOM:
   [ ] Both buyer and seller open deal room
   [ ] Chat messages send/receive in real-time (Pusher working)
   [ ] Upload document → appears for both parties
   [ ] Complete checklist items
   [ ] Advance stages
   [ ] E-sign agreement (both sides)
   [ ] Initiate escrow → mark funded → release escrow
   [ ] Deal closed

   JOURNEY 4 — ADMIN:
   [ ] Login as admin (set user.role='admin' in DB via Drizzle Studio)
   [ ] /admin/dashboard → stats load
   [ ] /admin/kyc → pending KYC visible → approve
   [ ] /admin/listings → pending listing visible → approve
   [ ] /admin/deals → active deal visible

4. PERFORMANCE CHECK:
   - Run Lighthouse on /listings (public page)
   - Target: Performance > 80, Accessibility > 90
   - Fix largest LCP issues if failing

5. MOBILE CHECK:
   - Open on real phone or Chrome DevTools mobile mode
   - Test all pages at 375px
   - Fix any overflow or broken layouts

6. CREATE DEMO SEED DATA:
   Create a script: scripts/seed-demo.ts
   Using Drizzle, insert:
   - 1 admin user (role='admin', kycStatus='approved')
   - 2 seller users (kycStatus='approved')
   - 3 buyer users (kycStatus='approved')
   - 8 live listings with varied types, realistic metrics
   - 4 NDA agreements (signed)
   - 2 active deals in different stages
   - 10 messages in each active deal
   - 20 notifications
   Run: npx tsx scripts/seed-demo.ts

7. FINAL CHECKLIST:
   [ ] All env vars set in Vercel
   [ ] drizzle-kit push ran against production Neon DB
   [ ] Pusher cluster set to ap2 (India region)
   [ ] Cloudinary upload preset configured
   [ ] Resend domain verified (or use onboarding@resend.dev for testing)
   [ ] Razorpay webhook URL set to https://your-domain.vercel.app/api/webhooks/razorpay
   [ ] Admin user created in production DB
   [ ] Demo seed data loaded
   [ ] Vercel Analytics enabled (optional but adds investor trust)
   [ ] Custom domain configured (optional)

8. SHARE DEMO CREDENTIALS (for investor demo):
   Create /demo page (admin only) showing:
   - Demo Buyer login: buyer@demo.fmi.in / (OTP: 123456)
   - Demo Seller login: seller@demo.fmi.in / (OTP: 123456)
   - Admin login: admin@fmi.in / (OTP: 123456)
   - Direct links to key pages to showcase
```

---

## QUICK REFERENCE

### Phase Summary

| Phase | Focus | Key Output |
|---|---|---|
| 1 | Bootstrap + DB | All tables created, all services configured |
| 2 | Authentication | Signup → OTP → Login → Session |
| 3 | Onboarding | Role selection → KYC wizard → Buyer interests |
| 4 | Listing Wizard | Seller 6-step listing creation |
| 5 | Marketplace | Browse + filter + NDA gate + Razorpay |
| 6 | Offer Flow | Make offer → counter → accept → deal created |
| 7 | Deal Room | Stage tracker + checklist + documents + e-sign |
| 8 | Messaging | Pusher real-time chat + notifications |
| 9 | Admin Panel | KYC review + listing moderation + deal monitor |
| 10 | Dashboards | Buyer/Seller dashboards + notification system |
| 11 | Landing Page | Hero + How-it-works + Featured listings + FAQ |
| 12 | Polish | Empty states + skeletons + mobile + animations |
| 13 | Emails + Wiring | All transactional emails + notification flows |
| 14 | Deploy + QA | Vercel deploy + end-to-end testing + seed data |

### Stubbed Features (Dev Only)
- KYC: auto-approves after 3-second delay
- SMS OTP: hardcoded accept "123456"
- PAN/Aadhaar: regex format validation only
- GST/CIN: regex format check only
- Escrow: fake status tracker, no real money
- E-signature: checkbox + timestamp = "signed"
- AI Recommendations: filtered random listings

### Key Tech Decisions
- **Auth**: Better Auth (self-hosted, India data residency)
- **DB**: Drizzle ORM + Neon PostgreSQL
- **Storage**: Cloudinary (images, documents, CDN)
- **Realtime**: Pusher Channels (deal room + notifications)
- **Payments**: Razorpay (UPI, cards, test mode)
- **Email**: Resend + React Email
- **State**: Zustand (wizard state) + TanStack Query (server data)
- **AI**: Anthropic Claude API (listing quality, valuation)

---

*FMI — Indian Digital Business Marketplace | Phase-Wise Build Guide v1.0*
