const express = require("express");
const { getAuthUrl, handleAuthCallback } = require("../services/calendar");

const router = express.Router();

// Start Google Calendar OAuth flow for a business
router.get("/google", (req, res) => {
  const { businessId } = req.query;
  if (!businessId) {
    return res.status(400).send("Missing businessId parameter");
  }
  const url = getAuthUrl(businessId);
  res.redirect(url);
});

// Google OAuth callback
router.get("/google/callback", async (req, res) => {
  try {
    const { code, state: businessId } = req.query;
    await handleAuthCallback(code, businessId);
    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>Calendar Connected!</h1>
          <p>Google Calendar is now linked for your business.</p>
          <p>Ansa will now check your real availability when booking appointments.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("[Auth Error]", error);
    res.status(500).send("Failed to connect calendar. Please try again.");
  }
});

module.exports = router;
