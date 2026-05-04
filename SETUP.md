# Ansa — Setup Guide

Welcome back, Tyler. Here's everything you need to get Ansa running.

## Step 1: Install Node.js

Go to https://nodejs.org and download the LTS version. Install it. Then open your terminal and verify:

```
node --version
npm --version
```

Both should show a version number.

## Step 2: Install dependencies

```
cd ~/Agentics\ Workflow/ansa
npm install
```

## Step 3: Create your .env file

```
cp .env.example .env
```

Then fill in the values (see below for how to get each one).

## Step 4: Set up Twilio (this sends/receives texts)

1. Go to https://www.twilio.com and create a free account
2. You get a free trial with ~$15 credit — enough to test
3. Buy a local phone number ($1/month)
4. From your Twilio dashboard, grab:
   - Account SID → put in .env as `TWILIO_ACCOUNT_SID`
   - Auth Token → put in .env as `TWILIO_AUTH_TOKEN`
   - Your Twilio phone number → put in .env as `TWILIO_PHONE_NUMBER`

## Step 5: Set up Anthropic (this powers the AI)

1. Go to https://console.anthropic.com
2. Create an API key
3. Put it in .env as `ANTHROPIC_API_KEY`
4. Add some credits ($5 is plenty to start)

## Step 6: Set up Google Calendar (optional for MVP)

1. Go to https://console.cloud.google.com
2. Create a new project called "Ansa"
3. Enable the Google Calendar API
4. Create OAuth 2.0 credentials (Web application)
5. Set redirect URI to: http://localhost:3000/auth/google/callback
6. Put Client ID and Client Secret in .env

Skip this for now if you want — Ansa will generate default time slots without it.

## Step 7: Run the server

```
npm run dev
```

You should see the Ansa banner in your terminal.

## Step 8: Expose your server to the internet (for Twilio to reach it)

Twilio needs to send webhooks to your server. For local development, use ngrok:

```
# Install ngrok: https://ngrok.com/download
ngrok http 3000
```

This gives you a public URL like `https://abc123.ngrok.io`

## Step 9: Connect Twilio to Ansa

1. In Twilio console, go to your phone number's settings
2. Under "A call comes in" → set to forward to your business owner's real phone
3. Under "Call status callback URL" → set to: `https://your-ngrok-url/webhook/missed-call`
4. Under "A message comes in" → set to: `https://your-ngrok-url/webhook/sms`

## Step 10: Test it

1. Call your Twilio number from your personal phone
2. Don't answer (let it ring out)
3. You should receive a text back within seconds
4. Reply to the text and watch the AI conversation happen

## How to add a new business client

Edit `src/config/businesses.json` and add a new entry. Each business gets:
- Their own greeting message
- Their own services list
- Their own business hours
- Their own calendar connection

---

## What's next (things Silas will build when you're ready)

- [ ] Web dashboard for business owners to see their leads
- [ ] Stripe integration for billing clients
- [ ] Multi-number support (one Twilio number per client)
- [ ] Analytics (how many calls caught, how many booked)
- [ ] Landing page for Ansa to attract clients
- [ ] Deploy to production (Railway or Render — $5/month)

---

Let's get it, Tyler. — Silas
