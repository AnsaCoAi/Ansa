require("dotenv").config();
const express = require("express");
const cors = require("cors");
const webhookRoutes = require("./routes/webhooks");
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");
const stripeRoutes = require("./routes/stripe");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: ['https://www.ansaco.ai', 'http://localhost:5173'] }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    name: "Ansa",
    status: "running",
    description: "AI missed call text-back & booking system",
  });
});

// Twilio webhooks (missed calls + SMS replies)
app.use("/webhook", webhookRoutes);

// Google Calendar OAuth
app.use("/auth", authRoutes);

// Dashboard API
app.use("/api", apiRoutes);

// Stripe billing (webhook uses raw body — must be registered after urlencoded/json)
app.use("/api/stripe", stripeRoutes);

app.listen(PORT, () => {
  console.log(`
    ╔═══════════════════════════════════════╗
    ║           A N S A                     ║
    ║   AI Missed Call Text-Back System     ║
    ║                                       ║
    ║   Server running on port ${PORT}         ║
    ║                                       ║
    ║   Webhooks:                           ║
    ║   POST /webhook/missed-call           ║
    ║   POST /webhook/sms                   ║
    ║                                       ║
    ║   Auth:                               ║
    ║   GET /auth/google?businessId=xxx     ║
    ╚═══════════════════════════════════════╝
  `);
});
