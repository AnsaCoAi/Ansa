const express = require("express");
const { sendSMS } = require("../services/twilio");
const { getAIResponse } = require("../services/ai");
const { getAvailableSlots, bookAppointment } = require("../services/calendar");
const { notifyOwner } = require("../services/notifications");
const { getDistanceMiles } = require("../services/geocoding");
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
    const { From, To, Called } = req.body;
    const calledNumber = To || Called;

    const business = await findBusinessByNumber(calledNumber);
    if (!business) {
      console.log(`[Missed Call] No business found for number: ${calledNumber}`);
      return res.status(200).send("<Response></Response>");
    }

    console.log(`[Missed Call] ${From} → ${business.name}`);

    // Check blocked numbers — compare last 10 digits to handle formatting differences
    const fromDigits = From.replace(/\D/g, '').slice(-10);
    const isBlocked = (business.blocked_numbers || []).some(n => n.replace(/\D/g, '').slice(-10) === fromDigits);
    if (isBlocked) {
      console.log(`[Missed Call] Blocked number ${From} — skipping text-back`);
      return res.status(200).send("<Response></Response>");
    }

    const conversation = await getOrCreateConversation(business.id, From);

    // Dedup: if greeting was already sent in the last 60s, skip (handles Twilio double-fire)
    const { data: recentGreeting } = await supabase
      .from('messages')
      .select('id, created_at')
      .eq('conversation_id', conversation.id)
      .eq('role', 'assistant')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recentGreeting && (Date.now() - new Date(recentGreeting.created_at).getTime()) < 60000) {
      console.log(`[Missed Call] Duplicate detected — skipping greeting for ${From}`);
      return res.status(200).send("<Response></Response>");
    }

    await saveMessage(conversation.id, "assistant", business.greeting);
    await sendSMS(From, calledNumber, business.greeting);

    try {
      await notifyOwner(business, From, "Missed call — AI is following up via text.");
    } catch (notifyErr) {
      console.error("[Missed Call] Owner notify failed (non-fatal):", notifyErr.message);
    }

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
    await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversation.id);

    if (conversation.manual_mode) {
      console.log(`[SMS] Manual mode — skipping AI for conversation ${conversation.id}`);
      return res.status(200).send("<Response></Response>");
    }

    const slots = await getAvailableSlots(business.id, business);

    // Load DB message history so AI survives server restarts
    const { data: dbMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(20);

    // Use the customer's first inbound message as service_description (much better than last message)
    const firstCustomerMsg = (dbMessages || []).find(m => m.role === 'user');
    const serviceDescription = firstCustomerMsg ? firstCustomerMsg.content : Body;

    const aiReply = await getAIResponse(From, Body, business, slots, dbMessages || []);

    // Strip all control tags and extract their values
    const nameMatch  = aiReply.match(/\[NAME:\s*([^\]]+)\]/i);
    const addrMatch  = aiReply.match(/\[ADDRESS:\s*([^\]]+)\]/i);
    const bookedMatch = aiReply.match(/\[BOOKED:\s*(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})\]/i);

    const cleanAiReply = aiReply
      .replace(/\[NAME:[^\]]*\]/gi, '')
      .replace(/\[ADDRESS:[^\]]*\]/gi, '')
      .replace(/\[BOOKED:[^\]]*\]/gi, '')
      .replace(/\[URGENT\]/gi, '')
      .trim();

    // Persist extracted metadata
    if (nameMatch) {
      await supabase.from('conversations').update({ customer_name: nameMatch[1].trim() }).eq('id', conversation.id);
    }

    // Save address to conversation so it's available across turns
    const customerAddress = addrMatch?.[1]?.trim() || conversation.customer_address || null;
    if (addrMatch) {
      await supabase.from('conversations').update({ customer_address: customerAddress }).eq('id', conversation.id);
    }

    await saveMessage(conversation.id, "assistant", cleanAiReply);

    // ── URGENT ─────────────────────────────────────────────────────────────
    if (aiReply.match(/\[URGENT\]/i)) {
      await notifyOwner(business, From, Body, "urgent");
      await sendSMS(From, To, cleanAiReply);
      return res.status(200).send("<Response></Response>");
    }

    // ── BOOKING ────────────────────────────────────────────────────────────
    if (bookedMatch) {
      const dateTimeISO = new Date(bookedMatch[1]).toISOString();
      const cleanReply = cleanAiReply.replace(/\[BOOKED:[^\]]*\]/gi, "").trim();

      // ── Radius check ───────────────────────────────────────────────────
      if (customerAddress && business.service_base_address && business.service_radius_miles) {
        let distanceMiles = null;
        try {
          distanceMiles = await getDistanceMiles(business.service_base_address, customerAddress);
        } catch (geoErr) {
          console.error('[SMS] Geocoding error (non-fatal):', geoErr.message);
        }

        if (distanceMiles !== null && distanceMiles > business.service_radius_miles) {
          console.log(`[SMS] Address outside service area: ${Math.round(distanceMiles)} mi — behavior: ${business.outside_radius_behavior}`);

          if (business.outside_radius_behavior === 'pending') {
            // Create pending appointment — owner reviews
            await supabase.from("appointments").insert({
              business_id: business.id,
              conversation_id: conversation.id,
              customer_phone: From,
              customer_name: nameMatch?.[1]?.trim() || null,
              customer_address: customerAddress,
              service_description: serviceDescription,
              scheduled_at: dateTimeISO,
              status: "pending",
            });
            await supabase.from("conversations").update({ status: "active" }).eq("id", conversation.id);
            await notifyOwner(business, From, `Outside service area (${Math.round(distanceMiles)} mi away): ${customerAddress} — pending your review`, "pending");
            await sendSMS(From, To, `Your appointment request for ${bookedMatch[1]} is pending — your address is just outside our usual service area. We'll confirm within 24 hours if we can make it work.`);
          } else {
            // Decline — don't create appointment
            await notifyOwner(business, From, `Outside service area (${Math.round(distanceMiles)} mi): ${customerAddress} — declined`, "pending");
            await sendSMS(From, To, `Thanks for reaching out! Unfortunately ${customerAddress} is outside our current service area (we cover within ${business.service_radius_miles} miles of ${business.service_base_address}). We hope to expand soon!`);
          }

          return res.status(200).send("<Response></Response>");
        }
      }

      // ── Normal booking (in range or no geo config) ──────────────────────
      const requireApproval = !!business.require_approval;

      if (requireApproval) {
        await supabase.from("appointments").insert({
          business_id: business.id,
          conversation_id: conversation.id,
          customer_phone: From,
          customer_name: nameMatch?.[1]?.trim() || null,
          customer_address: customerAddress,
          service_description: serviceDescription,
          scheduled_at: dateTimeISO,
          status: "pending",
        });
        await supabase.from("conversations").update({ status: "active" }).eq("id", conversation.id);
        await notifyOwner(business, From, `Pending approval: ${bookedMatch[1]} — ${serviceDescription}`, "pending");
        await sendSMS(From, To, `Got it! We'll review and confirm your appointment for ${bookedMatch[1]}. You'll hear from us shortly.`);
      } else {
        const booking = await bookAppointment(business.id, business, dateTimeISO, From, serviceDescription);
        await supabase.from("appointments").insert({
          business_id: business.id,
          conversation_id: conversation.id,
          customer_phone: From,
          customer_name: nameMatch?.[1]?.trim() || null,
          customer_address: customerAddress,
          service_description: Body,
          scheduled_at: dateTimeISO,
          google_event_id: booking.eventId || null,
          status: "confirmed",
        });
        await supabase.from("conversations").update({ status: "booked" }).eq("id", conversation.id);
        await notifyOwner(business, From, `${bookedMatch[1]} — ${serviceDescription}`, "booked");
        await sendSMS(From, To, cleanReply);
      }

      return res.status(200).send("<Response></Response>");
    }

    // ── Normal reply ───────────────────────────────────────────────────────
    await sendSMS(From, To, cleanAiReply);
    res.status(200).send("<Response></Response>");

  } catch (error) {
    console.error("[SMS Error]", error);
    res.status(500).send("<Response></Response>");
  }
});

module.exports = router;
