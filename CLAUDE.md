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
- index.js — CORS allows both https://www.ansaco.ai and https://ansaco.ai

### Frontend (client/src/)
- No mock data anywhere — mockData.js deleted, all pages use real API/Supabase
- Auth: Supabase email/password login, signup, forgot password (sends reset email)
- Logged-in users with no business → redirect to #/onboarding
- Logged-in users with business → redirect to #/dashboard
- AuthContext: session management, business loading by owner_auth_id
- DashboardLayout: real business name/initials from auth, working logout

### Pages — all wired to real data
- LandingPage — full marketing page, Log In link in nav, working CTAs, mailto footer
- LoginPage — real auth, forgot password sends Supabase reset email via Resend
- SignupPage — creates user + business row, auto-provisions Twilio number, redirects to #/onboarding
- OnboardingPage — 4-step wizard (service area/desc, hours, AI setup, connect tools), Launch Ansa button saves data then opens Stripe checkout
- BillingPage — shown at #/billing if user cancels Stripe, has "Add payment method" button to reopen Stripe
- DashboardHome — live stats, real weekly chart from DB, real recent activity
- MissedCallsPage — real conversations from DB, date filter, search, pagination
- ConversationsPage — real data, status tab filters
- ConversationDetail — real messages, Take Over mode sends real SMS via Twilio, Mark as Closed updates DB
- AppointmentsPage — real data, Cancel updates DB
- AnalyticsPage — real stats, real charts built from conversation data
- SettingsPage — loads real business data, Save writes to Supabase, Integrations shows real Twilio/Calendar status
- TermsPage — full Terms of Service at #/terms
- PrivacyPage — full Privacy Policy at #/privacy
- DashboardLayout — 30-day trial banner computed from business.created_at, notification bell removed

## Signup Flow (current as of 2026-05-05)
1. User fills out signup form (name, email, password, business name, phone, type)
2. Supabase auth user created
3. POST /api/create-business creates business row (service role, bypasses RLS)
4. POST /api/provision-number auto-buys Twilio number
5. Redirect to #/onboarding
6. Onboarding step 1: service area (city autocomplete) + business description
7. Onboarding step 2: business hours
8. Onboarding step 3: AI greeting + tone + FAQs
9. Onboarding step 4: connect tools (Google Calendar, Twilio status, billing)
10. Launch Ansa → saves settings → POST /api/stripe/checkout → Stripe opens with 30-day trial
11. Stripe success → #/onboarding (redirects to dashboard since business exists)
12. Stripe cancel → #/billing page

## Stripe Billing
- Checkout: POST /api/stripe/checkout → opens Stripe hosted checkout at $297/mo with 30-day trial
- Portal: POST /api/stripe/portal → opens Stripe billing portal (manage/cancel)
- Webhook: POST /api/stripe/webhook → updates subscription_status in businesses table
- Supabase columns: stripe_customer_id, stripe_subscription_id, subscription_status
- Env vars on Railway: STRIPE_SECRET_KEY, STRIPE_PRO_PRICE_ID, STRIPE_WEBHOOK_SECRET, FRONTEND_URL
- Price ID: price_1TTZJHQyXVAhKN7gwWxT8xxB | Webhook: Ansa Production (4 events)
- Stripe success_url: /#/onboarding | cancel_url: /#/billing

## Email (Resend SMTP)
- Resend account: tyler@ansaco.ai
- Domain verified: ansaco.ai (DNS records added to Namecheap)
- Resend API key: stored in Claude memory (project_credentials.md)
- Supabase SMTP: smtp.resend.com, port 465, username: resend
- Sender: hello@ansaco.ai | Sender name: Ansa
- Email confirmation: OFF (turn back ON before launch)
- Custom email templates done: Confirm signup, Reset password

## Twilio A2P Status
- Business Profile BU7688c9bbfecc7d74fe22763133ff11fd — APPROVED
- Brand registration FAILING — Error 30795 (legal name mismatch)
- Emailed trusthub-verify@twilio.com on 2026-05-05 — awaiting fix
- SMS may be carrier-filtered until A2P clears

## Current Blocker (as of 2026-05-05 session)
- Stripe checkout not firing after Launch Ansa button
- Root cause was duplicate phone check in /api/create-business causing 409 → business not created → business is null → handleLaunch exits early
- Fix: removed duplicate phone check (committed a89baf5)
- Railway needs to redeploy this fix before testing again
- To test: delete auth user from Supabase, sign up fresh, go through all 4 onboarding steps, hit Launch Ansa

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
