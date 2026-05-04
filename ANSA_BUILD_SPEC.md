# Ansa — Full Product Build Specification

## What Is Ansa?

Ansa is an AI-powered missed call text-back and appointment booking platform built specifically for home service businesses (plumbers, HVAC technicians, electricians, roofers, landscapers, etc.).

When a home service business misses a call, Ansa automatically sends a personalized text message to the caller within seconds, engages them in a two-way SMS conversation, and books them into the business owner's calendar — all without the business owner lifting a finger.

**The core problem:** Home service businesses are owner-operated. The owner is often on a job, under a sink, or on a roof when the phone rings. They miss the call. The customer calls the next guy. The business loses $200-$2,000 in potential revenue. This happens multiple times per day.

**The solution:** Ansa sits between the missed call and the lost customer. It responds instantly, sounds human, answers basic questions, and captures the booking.

---

## Business Model

- **SaaS, monthly subscription**
- Target price: **$297–$497/month per business**
- Target customer: Small home service businesses, 1–10 employees, owner-operated
- Geographic focus (initial): Southern California — Los Angeles, Orange County, San Diego
- Goal: 20–25 paying customers = $10,000/month recurring revenue

---

## Core Features (MVP)

### 1. Missed Call Detection
- Integrate with the business's existing phone number via **Twilio**
- When a call is missed (not answered within X rings), trigger the Ansa workflow
- Log the missed call with timestamp, caller ID, and duration

### 2. Instant SMS Text-Back
- Within 5–15 seconds of a missed call, send an automated SMS to the caller
- Message is personalized with the business name
- Example: *"Hey, this is Mike's Plumbing! Sorry we missed you — we're on a job right now. Can I help you schedule something or answer a quick question?"*
- The message must feel human, not robotic

### 3. Two-Way AI SMS Conversation
- Powered by Claude API (Anthropic) or OpenAI GPT-4
- The AI handles inbound replies from the caller
- Can answer basic FAQs (service area, pricing range, availability)
- Qualifies the lead (what do they need? when?)
- Guides the conversation toward booking an appointment

### 4. Appointment Booking
- When the caller is ready to book, Ansa sends a booking link or handles booking inline via SMS
- Integration options:
  - **Calendly** (Phase 1 — simple)
  - **Custom booking calendar** (Phase 2)
- Booking is synced to the business owner's Google Calendar
- Confirmation SMS sent to both the caller and the business owner

### 5. Business Owner Dashboard
- Simple web dashboard where the business owner can:
  - See all missed calls
  - See all active SMS conversations
  - See all booked appointments
  - View/edit their business info, FAQs, and AI responses
  - Set their availability/hours
  - Connect their phone number
- Mobile-friendly — these are contractors, they're on their phones

### 6. Onboarding Flow
- Business owner signs up at ansaco.ai
- Enters business name, phone number, service type, service area
- Uploads or inputs FAQs (or Ansa generates them based on business type)
- Connects Google Calendar
- Goes live — entire setup should take under 10 minutes

---

## Technical Architecture

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Auth:** Clerk or NextAuth
- **Hosting:** Vercel

### Backend
- **Framework:** Next.js API routes or separate Node.js/Express server
- **Database:** Supabase (PostgreSQL) or PlanetScale
- **ORM:** Prisma
- **Queue/Jobs:** Inngest or Trigger.dev (for async missed call workflows)

### Telephony
- **Provider:** Twilio
- Twilio Programmable Voice — webhook fires on missed/unanswered call
- Twilio Programmable SMS — send and receive text messages
- Each business gets a Twilio number that forwards to their real number (or we intercept via webhook)

### AI Layer
- **Model:** Claude 3.5 Sonnet (Anthropic) — preferred for natural conversation
- System prompt is customized per business (name, services, FAQs, tone)
- Conversation history stored per session in the database
- Guardrails: AI should never quote exact prices unless the business provides them, never make promises it can't keep

### Calendar Integration
- Google Calendar API — OAuth2 connection per business
- Read availability, write new appointments
- Send calendar invites to both parties

### Notifications
- SMS confirmation via Twilio
- Email confirmation via Resend or Postmark
- Push/in-app notification to business owner dashboard

---

## Database Schema (Core Tables)

### businesses
- id, name, phone_number, twilio_number, service_type, service_area
- owner_name, owner_email, owner_phone
- faqs (JSON), ai_system_prompt
- google_calendar_token
- subscription_status, subscription_tier
- created_at, updated_at

### missed_calls
- id, business_id, caller_phone, called_at, duration_seconds
- sms_sent (boolean), sms_sent_at
- outcome (booked | no_response | not_interested | callback_requested)
- created_at

### conversations
- id, business_id, missed_call_id, caller_phone
- status (active | closed | booked)
- created_at, updated_at

### messages
- id, conversation_id, role (user | assistant), content, sent_at

### appointments
- id, business_id, conversation_id
- caller_name, caller_phone, caller_email
- service_requested, appointment_at, notes
- calendar_event_id, status (scheduled | cancelled | completed)
- created_at

---

## User Flows

### Flow 1: Missed Call → Booking
1. Caller dials business number
2. Business doesn't answer (busy on job)
3. Twilio webhook fires → Ansa detects missed call
4. Ansa sends SMS within 15 seconds: *"Hey, sorry we missed you! This is [Business]. Can I help you book something or answer a question?"*
5. Caller replies: *"Yeah I need my AC fixed asap"*
6. AI responds: *"Got it! We can usually get out same-day or next-day for AC. What city are you in?"*
7. Conversation continues until booking confirmed
8. Ansa sends calendar link or books directly
9. Business owner gets notification: new appointment booked

### Flow 2: Business Owner Onboarding
1. Owner visits ansaco.ai
2. Clicks "Get Started" → enters email, creates account
3. Enters business name, type, service area, phone number
4. Connects Google Calendar (OAuth)
5. Reviews/edits AI-generated FAQs for their business
6. Gets assigned a Twilio number (or sets up call forwarding)
7. Dashboard goes live — Ansa is now watching for missed calls

### Flow 3: Business Owner Reviews Conversations
1. Owner logs into dashboard
2. Sees list of missed calls from today
3. Clicks on a conversation — sees full SMS thread
4. Can jump in manually if needed (takeover mode)
5. Sees upcoming appointments booked by Ansa

---

## Landing Page (ansaco.ai)

The landing page is the first thing potential customers see. It must be:

- **Dark theme** — clean, modern, high contrast
- **Direct and simple** — contractors don't read walls of text
- **Benefit-first** — lead with what they get, not how it works

### Landing Page Sections:
1. **Hero** — "Never Lose Another Customer to a Missed Call" — CTA: "Start Free Trial"
2. **Problem** — "You're on the job. The phone rings. You can't answer. That's money walking out the door."
3. **Solution** — "Ansa texts them back in seconds. Books the appointment. You find out when you're done."
4. **How It Works** — 3 steps: Miss the call → Ansa texts back → Appointment booked
5. **Social Proof** — Placeholder for testimonials (real ones added after first customers)
6. **Pricing** — Simple 1-2 tier pricing, monthly
7. **CTA** — "Get Started Free — No Credit Card Required"

---

## Pricing Tiers

### Starter — $297/month
- Up to 100 missed calls/month
- AI text-back
- Booking link (Calendly integration)
- Basic dashboard
- Email support

### Pro — $497/month
- Unlimited missed calls
- Full AI conversation (multi-turn)
- Direct calendar booking (no Calendly needed)
- Advanced dashboard with analytics
- Priority support
- Custom AI tone/voice for the business

---

## Phase 1 MVP Scope (Build This First)

The agent should focus on building these in order:

1. Landing page (Next.js + Tailwind, dark theme, full sections listed above)
2. Auth (Clerk — sign up / sign in)
3. Onboarding flow (business info, calendar connect)
4. Twilio webhook handler (missed call detection)
5. SMS send on missed call
6. AI conversation handler (Claude API, multi-turn SMS)
7. Basic dashboard (missed calls list, conversations view, appointments list)
8. Google Calendar booking integration
9. Stripe subscription billing

---

## Phase 2 (After First 10 Customers)

- Custom booking calendar (no Calendly dependency)
- CRM-lite features (customer history, notes)
- Review request automation (ask for Google review after job complete)
- Multi-location support
- White-label option for agencies
- Native mobile app (React Native)

---

## Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS, shadcn/ui |
| Auth | Clerk |
| Database | Supabase (PostgreSQL + Prisma) |
| Backend/API | Next.js API Routes |
| Telephony | Twilio (Voice + SMS) |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Calendar | Google Calendar API |
| Payments | Stripe |
| Email | Resend |
| Jobs/Queue | Inngest |
| Hosting | Vercel |
| Domain | ansaco.ai (Namecheap) |

---

## Brand

- **Name:** Ansa
- **Domain:** ansaco.ai
- **Tagline:** "Every missed call, answered."
- **Voice:** Direct, confident, no fluff — speaks to contractors not tech people
- **Colors:** Dark background (#0a0a0a or similar), white text, accent color TBD (green or electric blue preferred)
- **Font:** Clean sans-serif — Inter or Geist

---

## Notes for the Agent

- Tyler (the founder) is non-technical. The build should be deployable to Vercel with minimal CLI knowledge required.
- Prioritize working over perfect. Ship the MVP fast.
- All environment variables should be clearly documented in a `.env.example` file.
- Each major feature should have its own clear file/folder structure.
- The AI system prompt for each business should be easy to customize from the dashboard.
- Twilio setup instructions should be included in a SETUP.md file.
- The product must work on mobile — business owners check their phones, not laptops.
