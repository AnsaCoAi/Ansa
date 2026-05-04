const express = require("express");
const { sendSMS } = require("../services/twilio");
const { getAIResponse } = require("../services/ai");
const { getAvailableSlots, bookAppointment } = require("../services/calendar");
const { notifyOwner } = require("../services/notifications");
const supabase = require("../services/supabase");

const router = express.Router();

async function findBusinessByNumber(twilioNumber) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("twilio_number", twilioNumber)
    .single();
  if (error || !data) return null;
  return data;
}

async function getOrCreateConversation(businessId, customerPhone) {
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("business_id", businessId)
    .eq("customer_phone", customerPhone)
    .eq("status", "active")
    .single();

  if (existing) return existing;

  const { data: created } = await supabase
    .from("conversations")
    .insert({ business_id: businessId, customer_phone: customerPhone })
    .select()
    .single();

  return created;
}

async function saveMessage(conversationId, role, content) {
  await supabase.from("messages").insert({ conversation_id: conversationId, role, content });
}

router.post("/missed-call", async (req, res) => {
  try {
    const { CallStatus, From, To, Called } = req.body;
    const calledNumber = To || Called;

    if (!["no-answer", "busy", "failed", "canceled"].includes(CallStatus)) {
      return res.status(200).send("<Response></Response>");
    }

    const business = await findBusinessByNumber(calledNumber);
    if (!business) {
      console.log(`[Missed Call] No business found for number: ${calledNumber}`);
      return res.status(200).send("<Response></Response>");
    }

    console.log(`[Missed Call] ${From} → ${business.name} (${CallStatus})`);

    const conversation = await getOrCreateConversation(business.id, From);
    await saveMessage(conversation.id, "assistant", business.greeting);
    await sendSMS(From, calledNumber, business.greeting);
    await notifyOwner(business, From, "Missed call — AI is following up via text.");

    res.status(200).send("<Response></Response>");
  } catch (error) {
    console.error("[Missed Call Error]", error);
    res.status(500).send("<Response></Response>");
  }
});

router.post("/sms", async (req, res) => {
  try {
    const { From, To, Body } = req.body;

    const business = await findBusinessByNumber(To);
    if (!business) {
      console.log(`[SMS] No business found for number: ${To}`);
      return res.status(200).send("<Response></Response>");
    }

    console.log(`[SMS] ${From} → ${business.name}: "${Body}"`);

    const conversation = await getOrCreateConversation(business.id, From);
    await saveMessage(conversation.id, "user", Body);

    const slots = await getAvailableSlots(business.id, business);
    const aiReply = await getAIResponse(From, Body, business, slots);

    await saveMessage(conversation.id, "assistant", aiReply);

    if (aiReply.includes("[URGENT]")) {
      const cleanReply = aiReply.replace("[URGENT]", "").trim();
      await notifyOwner(business, From, Body, "urgent");
      await sendSMS(From, To, cleanReply);
    } else if (aiReply.includes("[BOOKED:")) {
      const match = aiReply.match(/\[BOOKED:\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\]/);
      const cleanReply = aiReply.replace(/\[BOOKED:.*?\]/, "").trim();

      if (match) {
        const dateTimeISO = new Date(match[1]).toISOString();
        const booking = await bookAppointment(business.id, business, dateTimeISO, From, Body);

        await supabase.from("appointments").insert({
          business_id: business.id,
          conversation_id: conversation.id,
          customer_phone: From,
          service_description: Body,
          scheduled_at: dateTimeISO,
          google_event_id: booking.eventId || null,
          status: "booked",
        });

        await supabase
          .from("conversations")
          .update({ status: "booked" })
          .eq("id", conversation.id);

        await notifyOwner(business, From, `${match[1]} — ${Body}`, "booked");
      }

      await sendSMS(From, To, cleanReply);
    } else {
      await sendSMS(From, To, aiReply);
    }

    res.status(200).send("<Response></Response>");
  } catch (error) {
    console.error("[SMS Error]", error);
    res.status(500).send("<Response></Response>");
  }
});

module.exports = router;
