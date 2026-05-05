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

## Supabase Schema
- businesses: id(text PK), name, owner_name, owner_phone, owner_auth_id(uuid), trade, twilio_number, google_calendar_id, google_tokens, services, business_hours, timezone, appointment_duration, greeting, created_at
- conversations: id, business_id, customer_phone, status(active/booked/closed), created_at, updated_at
- messages: id, conversation_id, role(user/assistant/system), content, created_at
- appointments: id, business_id, conversation_id, customer_phone, customer_name, service_description, scheduled_at, google_event_id, status(confirmed/pending/completed/cancelled), created_at

## Deployments
- Frontend: Vercel → www.ansaco.ai (auto-deploys from GitHub main)
- Backend: Railway → ansa-production.up.railway.app
- Railway UI canvas is broken (Railway bug) — use CLI to deploy
- After every backend code change run: `railway up --service Ansa --detach` from repo root
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

## Twilio A2P Status
- Business Profile BU7688c9bbfecc7d74fe22763133ff11fd — APPROVED
- Brand registration FAILING — Error 30795 (legal name mismatch)
- Emailed trusthub-verify@twilio.com — awaiting fix
- Business Identity: Direct Customer (correct)
- SMS may be carrier-filtered until A2P clears

## Next Up
1. Wait for Twilio A2P brand fix
2. Test full signup flow on ansaco.ai with a real test account
3. Stripe billing (Change Plan / Cancel Subscription buttons are the only dead ones left)
4. Connect Railway to GitHub auto-deploy when UI loads

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
