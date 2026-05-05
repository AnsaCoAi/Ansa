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
- conversations: id, business_id, customer_phone, status, created_at, updated_at
- messages: id, conversation_id, role, content, created_at
- appointments: id, business_id, conversation_id, customer_phone, customer_name, service_description, scheduled_at, google_event_id, status, created_at

## Deployments
- Frontend: Vercel → www.ansaco.ai (auto-deploys from GitHub main)
- Backend: Railway → ansa-production.up.railway.app
- Railway UI canvas is broken (Railway bug) — use CLI to deploy
- After every backend code change run: `railway up --service Ansa --detach` from repo root
- Railway CLI is logged in and linked to the project
- Railway project: compassionate-surprise | service: Ansa

## What's Built
- Supabase wired into backend for all data persistence
- Backend API routes: GET /api/stats, /api/conversations, /api/appointments, /api/businesses/:id
- CORS enabled for ansaco.ai and localhost
- Frontend Supabase client (client/src/services/supabase.js)
- Frontend API client (client/src/services/api.js)
- Real auth: AuthContext, SignupPage, LoginPage — Supabase email/password
- Duplicate business phone check on signup
- Protected routes — redirects to /login if no session
- Dashboard shows real logged-in business name and live stats
- Supabase email confirmation is OFF (testing) — turn ON before launch

## Twilio A2P Status
- Business Profile BU7688c9bbfecc7d74fe22763133ff11fd — APPROVED
- Brand registration FAILING — Error 30795 (legal name mismatch)
- Emailed trusthub-verify@twilio.com — awaiting fix
- Business Identity: Direct Customer (correct)
- SMS may be carrier-filtered until A2P clears

## Next Up
1. Wait for Twilio A2P brand fix
2. Test full signup flow on ansaco.ai
3. Onboarding — auto-provision Twilio number on signup
4. Connect dashboard pages to real data (conversations, appointments still mock)
5. Stripe billing
6. Connect Railway to GitHub auto-deploy when UI loads

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
