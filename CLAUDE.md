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
- Services: Supabase, Twilio, Claude AI, Google Calendar
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
  - POST /api/create-business (creates business row using service role, bypasses RLS — called during signup)
  - POST /api/stripe/checkout, POST /api/stripe/portal, POST /api/stripe/webhook

### Frontend (client/src/)
- No mock data anywhere — mockData.js deleted, all pages use real API/Supabase
- Auth: Supabase email/password login, signup, forgot password (sends reset email)
- Logged-in users redirected from landing/login/signup → dashboard
- AuthContext: session management, business loading by owner_auth_id
- DashboardLayout: real business name/initials from auth, working logout

### Pages — all wired to real data
- LandingPage — full marketing page, Log In link in nav, working CTAs, mailto footer
- LoginPage — real auth, forgot password sends Supabase reset email
- SignupPage — creates user + business row, auto-provisions Twilio number
- OnboardingPage — 4-step wizard, saves business_hours + greeting to Supabase on Launch
- DashboardHome — live stats, real weekly chart from DB, real recent activity
- MissedCallsPage — real conversations from DB, date filter, search, pagination
- ConversationsPage — real data, status tab filters
- ConversationDetail — real messages, Take Over mode sends real SMS via Twilio, Mark as Closed updates DB
- AppointmentsPage — real data, Cancel updates DB
- AnalyticsPage — real stats, real charts built from conversation data
- SettingsPage — loads real business data, Save writes to Supabase, Integrations shows real Twilio/Calendar status
- TermsPage — full Terms of Service at #/terms (TCPA, liability cap, indemnification, class action waiver, all US states)
- PrivacyPage — full Privacy Policy at #/privacy (CCPA/CPRA, Virginia, Colorado, Connecticut, Texas, TCPA)
- LandingPage — single Pro plan $297/mo, 30-day free trial CTA, Terms/Privacy in footer
- DashboardLayout — 30-day trial banner computed from business.created_at, notification bell removed

## Twilio A2P Status
- Business Profile BU7688c9bbfecc7d74fe22763133ff11fd — APPROVED
- Brand registration FAILING — Error 30795 (legal name mismatch)
- Emailed trusthub-verify@twilio.com — awaiting fix
- Business Identity: Direct Customer (correct)
- SMS may be carrier-filtered until A2P clears

## Signup Flow Status (as of 2026-05-05)
- RLS fix: business creation moved from frontend Supabase insert → POST /api/create-business (service role)
- AuthContext no longer does direct Supabase insert — calls backend instead
- Backend endpoint confirmed working (tested, returns success)
- Supabase email confirmation is ON (Tyler received confirmation email during test)
- Vercel deploy lag may cause old frontend to be cached — hard refresh (Cmd+Shift+R) if seeing old RLS error
- Test accounts created during testing may need to be deleted from Supabase Auth dashboard

## Next Up
1. **Verify signup works end-to-end** — wait for Vercel deploy, use fresh email, hard refresh first
2. **Twilio A2P brand fix** — sent CP575 to trusthub-verify@twilio.com on 2026-05-05, awaiting resolution
3. **Turn off Supabase email confirmation** for testing, back ON before launch
4. **Test full end-to-end flow** — signup → onboarding → missed call → AI texts back → books appointment
5. **Get first client**

## Stripe Billing (fully wired as of 2026-05-04)
- Checkout: POST /api/stripe/checkout → opens Stripe hosted checkout at $297/mo
- Portal: POST /api/stripe/portal → opens Stripe billing portal (manage/cancel)
- Webhook: POST /api/stripe/webhook → updates subscription_status in businesses table
- Supabase columns added: stripe_customer_id, stripe_subscription_id, subscription_status
- Env vars set on Railway: STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, STRIPE_WEBHOOK_SECRET, FRONTEND_URL
- Price ID: price_1TTZJHQyXVAhKN7gwWxT8xxB | Webhook: Ansa Production (4 events)

## Reminders
- See PRELAUNCH.md for full launch checklist
- Supabase email confirmation OFF — turn back ON before launch
- Upgrade Supabase to Pro when first client onboards ($25/mo)
- CA Statement of Information due ~July 2026 ($20)
- CA $800 franchise tax due April 2027
- GitHub token expires April 9, 2027

## Credentials
Credentials are stored in Claude memory only — not in this file.
Run `cat ~/.claude/projects/-Users-tylerlofaro-Agentics-Workflow/memory/project_credentials.md` to view.
