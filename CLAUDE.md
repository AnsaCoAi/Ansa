# Ansa — Claude Project Context

## Identity
- Tyler calls Claude "Silas"
- Be direct, no fluff, no mistakes
- Business: Ansa Co LLC — AI missed call text-back + booking SaaS for home service businesses
- Legal: CA Entity No: B20260181275 | EIN: 42-2247633 | 2158 Loggia, Newport Beach CA 92660

## Codebase
- Root: /Users/tylerlofaro/Agentics Workflow/ansa/
- GitHub: github.com/AnsaCoAi/Ansa (main branch)
- Backend: Node/Express (src/)
- Frontend: React/Vite (client/)
- Services: Supabase, Twilio, Claude AI, Google Calendar, Resend, Stripe
- Domain: ansaco.ai — registered on Namecheap, DNS managed on Namecheap

## Supabase Schema
- businesses: id(text PK), name, owner_name, owner_phone, owner_auth_id(uuid), trade, twilio_number, google_calendar_id, google_tokens, services, business_hours, timezone, appointment_duration, greeting, created_at, stripe_customer_id, stripe_subscription_id, subscription_status
- conversations: id, business_id, customer_phone, status(active/booked/closed), created_at, updated_at
- messages: id, conversation_id, role(user/assistant/system), content, created_at
- appointments: id, business_id, conversation_id, customer_phone, customer_name, service_description, scheduled_at, google_event_id, status(confirmed/pending/completed/cancelled), created_at

## Deployments
- Frontend: Vercel → www.ansaco.ai (auto-deploys from GitHub main)
- Backend: Railway → ansa-production.up.railway.app
- Railway UI canvas is broken (Railway bug) but GitHub auto-deploy IS wired via API (AnsaCoAi/Ansa main → Ansa service)
- Backend auto-deploys on every push to main — no manual `railway up` needed
- Railway plan: Hobby ($5/mo)
- Railway CLI is logged in and linked to the project
- Railway project: compassionate-surprise | service: Ansa
- Railway GraphQL API auth: use accessToken from ~/.config/railway/config.json (NOT the stored Railway token in credentials — that one doesn't work)

## What's Built — Full Feature List

### Backend (src/)
- webhooks.js — missed call handler, SMS handler, AI response, booking
- auth.js — Google Calendar OAuth (GET /auth/google, GET /auth/google/callback)
- api.js — all dashboard API routes:
  - GET /api/businesses/:id
  - PATCH /api/businesses/:id (saves name, phone, services, business_hours, greeting)
  - GET /api/conversations?businessId=xxx
  - GET /api/conversations/:id (with nested messages)
  - PATCH /api/conversations/:id (update status)
  - POST /api/conversations/:id/send (owner sends manual SMS via Twilio)
  - GET /api/appointments?businessId=xxx
  - PATCH /api/appointments/:id (update status)
  - GET /api/stats?businessId=xxx
  - POST /api/provision-number (buys Twilio number, wires webhooks, saves to DB)
  - POST /api/create-business (creates business row using service role, bypasses RLS)
  - POST /api/stripe/checkout, POST /api/stripe/portal, POST /api/stripe/webhook
  - POST /api/send-monthly-reports (secured with CRON_SECRET header — called by Railway cron)
- index.js — CORS allows both https://www.ansaco.ai and https://ansaco.ai
- src/services/email.js — Resend email service (welcome, cancellation, monthly report)

### Frontend (client/src/)
- No mock data anywhere — all pages use real API/Supabase
- Auth: Supabase email/password login, signup, forgot password
- AuthContext: session management, business loading by owner_auth_id
- DashboardLayout: real business name/initials from auth, working logout

### Pages — all wired to real data
- LandingPage — full marketing page
- LoginPage — real auth, forgot password sends Supabase reset email via Resend
- SignupPage — collects credentials + business info, saves to localStorage ONLY (no account created yet)
- OnboardingPage — 4-step wizard, creates account on Launch Ansa
- BillingPage — shown at #/billing if user cancels Stripe, has "Add payment method" + "← Back to onboarding"
- DashboardHome, MissedCallsPage, ConversationsPage, ConversationDetail, AppointmentsPage, AnalyticsPage, SettingsPage — all real data
- TermsPage, PrivacyPage

## Signup Flow (CURRENT as of 2026-05-05 session — CRITICAL)

### The fix that took all session to get right:
**Old broken flow:** Signup created auth user immediately → race condition where onAuthStateChange fired before create-business completed → business was null → handleLaunch exited early → Stripe never opened.

**Current working flow:**
1. SignupPage collects name/email/password/business info → saves to localStorage as `ansa_signup` → redirects to #/onboarding (NO account created yet)
2. App.jsx allows unauthenticated users through to #/onboarding
3. Onboarding steps 1-4 collect settings (service area, hours, AI greeting/tone, tools)
4. Launch Ansa → handleLaunch() reads localStorage → calls signUp() in AuthContext
5. signUp() creates Supabase auth user → POST /api/create-business → loadBusiness() → provisions Twilio number → returns { businessId }
6. handleLaunch() uses returned businessId → POST /api/stripe/checkout → Stripe opens with 30-day trial
7. Stripe success → #/onboarding (redirects to dashboard since business now exists)
8. Stripe cancel → #/billing?b={businessId} (businessId in URL so billing page works without auth context)
9. localStorage.removeItem('ansa_signup') called after account created successfully

### Key files for signup flow:
- client/src/pages/SignupPage.jsx — just saves to localStorage, no auth
- client/src/context/AuthContext.jsx — signUp() now accepts businessHours/services/greeting, returns { businessId }
- client/src/pages/OnboardingPage.jsx — handleLaunch() does everything
- client/src/App.jsx — #/onboarding is before the auth gate
- client/src/pages/BillingPage.jsx — reads businessId from URL query param ?b=

## Onboarding UX Details
- Step 1: Service area (city autocomplete) + business description. "← Back to home" button clears localStorage and goes to #/
- Step 2: Business hours schedule
- Step 3: AI greeting + tone (Professional/Friendly/Casual — each changes the greeting text live) + FAQs. Note says "You can change any of this later in Settings → AI Assistant."
- Step 4: Connect tools (Google Calendar, Phone Number, Billing — all informational, no links since account doesn't exist yet)
- Steps 2-4 have "← Back" to go to previous step

## Stripe Billing
- Checkout: POST /api/stripe/checkout → opens Stripe hosted checkout at $297/mo with 30-day trial
- Portal: POST /api/stripe/portal → opens Stripe billing portal (manage/cancel)
- Webhook: POST /api/stripe/webhook → updates subscription_status, sends welcome email on created, cancellation email on deleted
- Supabase columns: stripe_customer_id, stripe_subscription_id, subscription_status
- Env vars on Railway: STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, STRIPE_WEBHOOK_SECRET, FRONTEND_URL
- Price ID: price_1TTZJHQyXVAhKN7gwWxT8xxB | Webhook: Ansa Production (4 events)
- Stripe success_url: /#/onboarding | cancel_url: /#/billing?b={businessId}

## Email (Resend)
- Resend API key: re_JHFEp6gy_HE6ZhN7Zjhbt3azXMHXYfE14 (also set as RESEND_API_KEY on Railway)
- Sender: hello@ansaco.ai | Sender name: Ansa
- Domain verified: ansaco.ai
- Supabase SMTP: smtp.resend.com, port 465, username: resend, password = Resend API key
- Email confirmation: OFF (turn back ON before launch)
- src/services/email.js has: sendWelcomeEmail, sendCancellationEmail, sendMonthlyReportEmail
- Welcome email: fires on customer.subscription.created webhook
- Cancellation email: fires on customer.subscription.deleted webhook
- Monthly report: fires via Railway cron (service: "Monthly Report Cron") at 0 9 1 * * (9am on 1st of month), secured with CRON_SECRET header
- CRON_SECRET: df2324158d2ab6c8f26f8c2c8474f9bc5952c2603d4944e2bd440e1f2ab633ca (set on Railway)
- Monthly report cron service ID: ab5a9992-13b7-4a33-9b05-be31a070b37e
- All emails use table-based layout (not flexbox) for mobile compatibility
- List-Unsubscribe header added to monthly report for spam compliance

## DNS (Namecheap)
- DMARC record: _dmarc → v=DMARC1; p=none; rua=mailto:hello@ansaco.ai (updated this session)
- SPF: set by Resend
- DKIM: set by Resend (google._domain... and resend._domain...)
- Deliverability: domain is new, will warm up over time. Tell clients to add hello@ansaco.ai to contacts.

## Twilio A2P Status — FULLY APPROVED ✅
- Business Profile BU7688c9bbfecc7d74fe22763133ff11fd — APPROVED
- Brand BN4a1d91889d77361779ae61f0634d4c47 — VERIFIED
- Campaign SID: CM10e21b310cc2e2148b4a6ec9079bb384 — VERIFIED (Customer Care)
- External Campaign ID: CKA4U2Z
- Messaging Service SID: MGec409220e1be176d425d3b085853e13d
- Campaign approved 2026-06-08 after manual review by Saurabh (Twilio 10DLC Onboarding team)
- Rejection history: rejected 3x total. Final fix was adding voicemail opt-in script + sample SMS to consent field
- SMS is fully unblocked — no carrier filtering

## Railway Cron — Monthly Report
- Service name: "Monthly Report Cron" | Service ID: ab5a9992-13b7-4a33-9b05-be31a070b37e
- Schedule: 0 9 1 * * (9am UTC, 1st of each month)
- Command: curl -s -X POST https://ansa-production.up.railway.app/api/send-monthly-reports -H 'x-cron-secret: df2324158d2ab6c8f26f8c2c8474f9bc5952c2603d4944e2bd440e1f2ab633ca'
- Queries all businesses with subscription_status = 'active', sends monthly stats email to each

## Current Status (as of 2026-06-08) — READY TO LAUNCH
- Stripe: fully working ✅
- Emails: welcome, cancellation, monthly report all built and deployed via Resend ✅
- Supabase email confirmation: ON ✅
- A2P campaign: VERIFIED ✅ (Customer Care, CKA4U2Z, approved 2026-06-08)
- Static legal pages: client/public/privacy.html and client/public/terms.html (pure HTML, no JS required)
- Favicon + OG image: deployed ✅
- Node.js: pinned to >=20 ✅
- PRELAUNCH.md is stale — ignore it
- RLS policies added to businesses table: SELECT and UPDATE for owner ✅
- Admin bypass: ADMIN_EMAILS env var on Railway skips Stripe, sets subscription_status=active directly ✅
- Owner/demo account: tylerlofaro@yahoo.com, business "Johns Contracting" (General Contractor), Twilio +14246225851
- Supabase Site URL fixed to https://www.ansaco.ai ✅
- businesses table: tone (text), faqs (jsonb), require_approval (boolean default false) columns added ✅
- All dead buttons fixed: settings save, AI tab, conversation close/send, appointment cancel, billing errors ✅
- Silent reloadBusiness (no loading spinner) after settings save ✅
- Smooth page transitions: fade-in on nav, button press animation ✅
- Settings has Account tab: edit name, view email, member since, password reset ✅
- Contact support link in sidebar (hello@ansaco.ai) ✅

## Landing Page — Full Overhaul (2026-06-08 session)
- New accent color #4F6EF7 (blue-indigo, not Tailwind default)
- Hero headline: "Every Missed Call Is a Job You Didn't Book"
- Trust micro-copy under all CTAs: "No credit card required · Setup in 5 minutes · Cancel anytime" — color #888
- Social proof marquee strip (10 trade types) + stats row below hero
- Before/After comparison table section
- Features in chess layout (alternating text/visual blocks) with live mock UIs
- Animated stat counters on scroll (62%, 85%, $1,200)
- Integrations row: Google Calendar, Phone, SMS, Claude AI — Lucide SVG icons (no emojis)
- ROI anchor on pricing: avg $2,400/mo recovery = 8× ROI
- Testimonials moved above features (right after Problem section)
- Sticky mobile CTA bar at bottom of screen
- Nav updated: How It Works | See the Dashboard | Pro Plan | FAQ
- "Most Popular" badge removed from pricing (only one plan)

## Dashboard Showcase (landing page — updated 2026-06-08 session 2)
- Browser chrome mockup: lock icon + "ansaco.ai" URL bar (no path)
- Sidebar: #111111 bg, #1e1e1e border, Lucide icons on all 6 nav items, active state rgba(59,130,246,.1) + #3b82f6 text/icon
- Accent color in showcase: #3b82f6 (matches real dashboard, NOT landing page #4F6EF7)
- Top bar: #0a0a0a bg, #1e1e1e border, JL avatar #1e1e1e bg #333 border
- Sidebar footer: Johns Contracting business card, HeadphonesIcon + LogOut icons
- Stat cards: icon circle (36px round, color-matched bg), 2×2 grid
- Rows: 36px round avatar with Lucide icon, proper phone/preview/badge/time
- Conversations tabs: #141414 bg, #222 active — matches real app
- Settings: proper input styling, Friendly tone active (blue)
- Auto-cycles every 5s, clickable sidebar nav, progress bar below
- "Click any section in the sidebar to explore ↑" hint at #666

## Hero Phone Mockups (3-up, 2026-06-08 session 2)
- 3 phones in a row below hero CTAs
- Fixed DOM order (no position swapping) — clicking a side phone only changes CSS class for smooth transition
- Active phone: blue border glow, side phones: brightness(.75) filter on .ansa-phone only (hint text unaffected)
- Height: 520px fixed, messages scroll inside with thin scrollbar
- "tap to expand" hint: #aaa (visible)
- Conversations:
  1. Mike's Plumbing — instant same-day booking (no customer name)
  2. Rodriguez Plumbing — team is on a job, customer requests callback, blue banner
  3. Chen's HVAC — after-hours emergency, booked for 8 AM
- Chat bubbles: iOS dark mode style (#2c2c2e incoming, #4F6EF7 outgoing), align-items:flex-start + align-self:flex-end

## Owner Notification Texts Section (landing page)
- Phone lock screen mockup between Integrations and Pricing
- Shows 3 stacked notification cards: Missed Call, Appointment Booked, Callback Requested
- Section header: "You'll Know the Second Anything Happens"

## Appointment Approval Feature (2026-06-08 session)
- Settings > Business Info: toggle "Require approval before confirming"
- When ON: AI books appointment as status=pending, customer gets "we'll confirm shortly" SMS
- When OFF (default): AI confirms instantly as before — DEFAULT IS OFF
- Appointments page: green Confirm button appears on pending appointments
- Confirming: sets status=confirmed + sends customer confirmation SMS + books Google Calendar event + saves google_event_id
- Owner always gets SMS notifications (missed call, booked, pending) via notifyOwner()
- Bug fixed: was using business.ownerPhone (wrong) → now business.owner_phone ✅
- Bug fixed: "pending" type was missing from notifications.js messages object ✅
- Supabase: require_approval boolean column added (migration run 2026-06-08) ✅
- Files changed: src/routes/webhooks.js, src/routes/api.js, src/services/notifications.js, client/src/pages/SettingsPage.jsx, client/src/pages/AppointmentsPage.jsx

## Outstanding Before Launch
1. SMS end-to-end test: real missed call → AI text-back. Demo number: +14246225851
2. Full signup test with real card (separate account, not admin email)
3. Set up Namecheap email forwarding: hello@ansaco.ai → Tyler's personal email (not Yahoo)
4. Supabase free tier pauses after 7 days inactivity — unpause at supabase.com if down. Upgrade to Pro ($25/mo) at first client

## Future Features (not yet built)
- Profile photo support in dashboard
- Logo image in emails (currently text)
- Google Business profile setup

## Reminders
- Supabase pauses every 7 days on free tier — check before each session and unpause if needed
- Upgrade Supabase to Pro when first client onboards ($25/mo)
- CA Statement of Information due ~July 2026 ($20)
- CA $800 franchise tax due April 2027
- GitHub token expires April 9, 2027
- hello@ansaco.ai is send-only (Resend) — no inbox until Namecheap forwarding is configured

## Credentials
Credentials are stored in Claude memory only — not in this file.
Run `cat ~/.claude/projects/-Users-tylerlofaro-Agentics-Workflow/memory/project_credentials.md` to view.
