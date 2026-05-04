const express = require("express");
const { sendSMS } = require("../services/twilio");
const { getAIResponse, clearConversation } = require("../services/ai");
const { getAvailableSlots, bookAppointment } = require("../services/calendar");
const { notifyOwner } = require("../services/notifications");
const businessConfig = require("../config/businesses.json");

const router = express.Router();

// Find business by Twilio phone number
function findBusiness(twilioNumber) {
  for (const [id, biz] of Object.entries(businessConfig.businesses)) {
    if (biz.twilioNumber === twilioNumber) {
      return { id, ...biz };
    }
  }
  return null;
}

// Twilio calls this when a call comes in — treat every call as missed and send SMS
router.post("/voice", async (req, res) => {
  try {
    const { From, To, Called } = req.body;
    const calledNumber = To || Called;

    const business = findBusiness(calledNumber);
    if (business) {
      console.log(`[Voice] Missed call from ${From} → ${business.name}`);
      await sendSMS(From, calledNumber, business.greeting);
    } else {
      console.log(`[Voice] No business found for ${calledNumber}`);
    }
  } catch (error) {
    console.error("[Voice Error]", error);
  }

  res.set("Content-Type", "text/xml");
  res.send(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`);
});

// Twilio calls this when a call goes unanswered (call status webhook)
router.post("/missed-call", async (req, res) => {
  try {
    const { CallStatus, From, To, Called } = req.body;
    const calledNumber = To || Called;

    // Only trigger on missed calls
    if (!["no-answer", "busy", "failed", "canceled"].includes(CallStatus)) {
      return res.status(200).send("<Response></Response>");
    }

    const business = findBusiness(calledNumber);
    if (!business) {
      console.log(`[Missed Call] No business found for number: ${calledNumber}`);
      return res.status(200).send("<Response></Response>");
    }

    console.log(`[Missed Call] ${From} → ${business.name} (${CallStatus})`);

    // Send the initial text-back
    await sendSMS(From, calledNumber, business.greeting);

    // Notify the owner
    await notifyOwner(business, From, "Missed call — AI is following up via text.");

    res.status(200).send("<Response></Response>");
  } catch (error) {
    console.error("[Missed Call Error]", error);
    res.status(500).send("<Response></Response>");
  }
});

// Twilio calls this when the customer replies via SMS
router.post("/sms", async (req, res) => {
  try {
    const { From, To, Body } = req.body;

    const business = findBusiness(To);
    if (!business) {
      console.log(`[SMS] No business found for number: ${To}`);
      return res.status(200).send("<Response></Response>");
    }

    console.log(`[SMS] ${From} → ${business.name}: "${Body}"`);

    // Get available slots for the AI to reference
    const slots = await getAvailableSlots(business.id, business);

    // Get AI response
    const aiReply = await getAIResponse(From, Body, business, slots);

    // Check if AI flagged this as urgent
    if (aiReply.includes("[URGENT]")) {
      const cleanReply = aiReply.replace("[URGENT]", "").trim();
      await notifyOwner(business, From, Body, "urgent");
      await sendSMS(From, To, cleanReply);
    }
    // Check if AI booked an appointment
    else if (aiReply.includes("[BOOKED:")) {
      const match = aiReply.match(/\[BOOKED:\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\]/);
      const cleanReply = aiReply.replace(/\[BOOKED:.*?\]/, "").trim();

      if (match) {
        const dateTimeISO = new Date(match[1]).toISOString();
        await bookAppointment(business.id, business, dateTimeISO, From, Body);
        await notifyOwner(business, From, `${match[1]} — ${Body}`, "booked");
      }

      await sendSMS(From, To, cleanReply);
    }
    // Normal conversation
    else {
      await sendSMS(From, To, aiReply);
    }

    res.status(200).send("<Response></Response>");
  } catch (error) {
    console.error("[SMS Error]", error);
    res.status(500).send("<Response></Response>");
  }
});

module.exports = router;
