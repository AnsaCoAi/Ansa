require("dotenv").config();
const express = require("express");
const webhookRoutes = require("./routes/webhooks");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Parse incoming Twilio webhook data
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
