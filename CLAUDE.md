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

## Twilio A2P Status
- Business Profile BU7688c9bbfecc7d74fe22763133ff11fd — APPROVED
- Brand registration FAILING — Error 30795 (legal name mismatch)
- Emailed trusthub-verify@twilio.com on 2026-05-05 — awaiting fix
- SMS may be carrier-filtered until A2P clears

## Railway Cron — Monthly Report
- Service name: "Monthly Report Cron" | Service ID: ab5a9992-13b7-4a33-9b05-be31a070b37e
- Schedule: 0 9 1 * * (9am UTC, 1st of each month)
- Command: curl -s -X POST https://ansa-production.up.railway.app/api/send-monthly-reports -H 'x-cron-secret: df2324158d2ab6c8f26f8c2c8474f9bc5952c2603d4944e2bd440e1f2ab633ca'
- Queries all businesses with subscription_status = 'active', sends monthly stats email to each

## Reminders
- See PRELAUNCH.md for full launch checklist
- Supabase email confirmation OFF — turn back ON before launch
- Upgrade Supabase to Pro when first client onboards ($25/mo)
- CA Statement of Information due ~July 2026 ($20)
- CA $800 franchise tax due April 2027
- GitHub token expires April 9, 2027
- Brand polish todos: profile photo in app, logo in emails, Google Business profile

## Credentials
Credentials are stored in Claude memory only — not in this file.
Run `cat ~/.claude/projects/-Users-tylerlofaro-Agentics-Workflow/memory/project_credentials.md` to view.
