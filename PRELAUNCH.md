# Ansa Pre-Launch Checklist

## Twilio / A2P
- [ ] A2P Brand registration approved (waiting on Twilio support — Error 30795)
- [ ] A2P Campaign registered after brand approval
- [ ] Test SMS end-to-end with real missed call

## Supabase
- [ ] Turn email confirmation back ON (Authentication → Providers → Email → Confirm email)
- [ ] Upgrade to Pro plan ($25/mo) when first client onboards — free tier pauses after 7 days inactivity

## Auth & Onboarding
- [ ] Test full signup flow end-to-end
- [ ] Auto-provision Twilio number on signup
- [ ] Onboarding page actually sets up the business (currently placeholder)

## Dashboard
- [ ] Replace hardcoded "Mike's Plumbing" with real logged-in business name
- [ ] Connect all dashboard pages to real Supabase data (not mock)
- [ ] Conversations page shows real SMS threads
- [ ] Appointments page shows real bookings

## Backend / Railway
- [ ] Confirm Railway is running latest code (api/stats returns real data)
- [ ] Set up auto-deploy from GitHub so Railway always picks up new pushes

## Billing
- [ ] Stripe integration — charge clients monthly
- [ ] Pricing page wired to actual checkout

## Legal / Admin
- [ ] CA Statement of Information due ~July 2026 at bizfile.sos.ca.gov ($20)
- [ ] CA $800 franchise tax due April 2027
- [ ] GitHub token expires April 9, 2027 — rotate before then

## Security
- [ ] Remove any hardcoded credentials from codebase
- [ ] Enable Supabase Row Level Security (RLS) on all tables
- [ ] Rate limit API endpoints
