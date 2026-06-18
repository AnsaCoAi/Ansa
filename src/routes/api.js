const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const twilio = require('twilio');
const { bookAppointment } = require('../services/calendar');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const WEBHOOK_BASE = process.env.RAILWAY_PUBLIC_DOMAIN
  ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
  : 'https://ansa-production.up.railway.app';

// GET /api/businesses/:id
router.get('/businesses/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// GET /api/conversations/:id
router.get('/conversations/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*, messages(id, role, content, created_at)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

// PATCH /api/businesses/:id
router.patch('/businesses/:id', async (req, res) => {
  const allowed = ['name', 'owner_name', 'owner_phone', 'trade', 'services', 'business_hours', 'timezone', 'appointment_duration', 'greeting', 'tone', 'faqs', 'require_approval', 'blocked_numbers'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
  const { data, error } = await supabase
    .from('businesses')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/conversations?businessId=xxx
router.get('/conversations', async (req, res) => {
  const { businessId } = req.query;
  let query = supabase
    .from('conversations')
    .select('*, messages(id, role, content, created_at)')
    .order('updated_at', { ascending: false });
  if (businessId) query = query.eq('business_id', businessId);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/appointments?businessId=xxx
router.get('/appointments', async (req, res) => {
  const { businessId } = req.query;
  let query = supabase
    .from('appointments')
    .select('*')
    .order('scheduled_at', { ascending: true });
  if (businessId) query = query.eq('business_id', businessId);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET /api/stats?businessId=xxx
router.get('/stats', async (req, res) => {
  const { businessId } = req.query;

  let convQuery = supabase.from('conversations').select('id, status, created_at');
  let apptQuery = supabase.from('appointments').select('id, scheduled_at, status');
  if (businessId) {
    convQuery = convQuery.eq('business_id', businessId);
    apptQuery = apptQuery.eq('business_id', businessId);
  }

  const [{ data: convs, error: e1 }, { data: appts, error: e2 }] = await Promise.all([
    convQuery,
    apptQuery,
  ]);

  if (e1 || e2) return res.status(500).json({ error: (e1 || e2).message });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  const todayCalls = (convs || []).filter(c => new Date(c.created_at) >= today).length;
  const totalCalls = (convs || []).length;
  const bookedConvs = (convs || []).filter(c => c.status === 'booked').length;
  const activeConvs = (convs || []).filter(c => c.status === 'active').length;
  const apptThisWeek = (appts || []).filter(a => new Date(a.scheduled_at) >= weekStart).length;

  // Response rate = % of calls where customer replied back (has at least one user message)
  let responded = 0;
  const convIds = (convs || []).map(c => c.id);
  if (convIds.length > 0) {
    const { data: userMessages } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', convIds)
      .eq('role', 'user');
    responded = new Set((userMessages || []).map(m => m.conversation_id)).size;
  }

  res.json({
    callsToday: todayCalls,
    totalCalls,
    responseRate: totalCalls > 0 ? Math.round((responded / totalCalls) * 100) : 0,
    bookingRate: totalCalls > 0 ? Math.round((bookedConvs / totalCalls) * 100) : 0,
    conversationsActive: activeConvs,
    appointmentsThisWeek: apptThisWeek,
  });
});

// PATCH /api/conversations/:id
router.patch('/conversations/:id', async (req, res) => {
  const { status, manual_mode } = req.body;
  const update = { updated_at: new Date().toISOString() };
  if (status !== undefined) {
    if (!['active', 'booked', 'closed'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    update.status = status;
  }
  if (manual_mode !== undefined) update.manual_mode = manual_mode;
  const { data, error } = await supabase
    .from('conversations')
    .update(update)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/appointments/:id
router.patch('/appointments/:id', async (req, res) => {
  const { status, notify_customer, cancellation_message } = req.body;
  const allowed = ['confirmed', 'pending', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const { data: appt, error: apptErr } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();
  if (apptErr) return res.status(500).json({ error: apptErr.message });

  // When owner confirms a pending appointment: send SMS + book calendar
  if (status === 'confirmed') {
    try {
      const { data: biz } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', appt.business_id)
        .single();

      if (biz) {
        // Send confirmation SMS to customer
        if (biz.twilio_number && appt.customer_phone) {
          const dt = new Date(appt.scheduled_at);
          const dateStr = dt.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });
          const timeStr = dt.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit', hour12:true });
          await twilioClient.messages.create({
            body: `Hi ${appt.customer_name || 'there'} — your appointment with ${biz.name} is confirmed for ${dateStr} at ${timeStr}. We'll see you then!`,
            from: biz.twilio_number,
            to: appt.customer_phone,
          });
        }

        // Book Google Calendar event
        const booking = await bookAppointment(
          biz.id, biz, appt.scheduled_at,
          appt.customer_name, appt.service_description
        );
        if (booking.eventId) {
          await supabase.from('appointments').update({ google_event_id: booking.eventId }).eq('id', appt.id);
          appt.google_event_id = booking.eventId;
        }
      }
    } catch (e) {
      console.error('[Confirm] SMS/calendar error:', e.message);
      // Don't fail the request — status is already confirmed
    }
  }

  // When owner cancels: optionally notify customer via SMS
  if (status === 'cancelled' && notify_customer && cancellation_message) {
    try {
      const { data: biz } = await supabase
        .from('businesses')
        .select('twilio_number')
        .eq('id', appt.business_id)
        .single();
      if (biz?.twilio_number && appt.customer_phone) {
        await twilioClient.messages.create({
          body: cancellation_message,
          from: biz.twilio_number,
          to: appt.customer_phone,
        });
      }
    } catch (e) {
      console.error('[Cancel] SMS notify error (non-fatal):', e.message);
    }
  }

  res.json(appt);
});

// DELETE /api/conversations/:id
router.delete('/conversations/:id', async (req, res) => {
  await supabase.from('messages').delete().eq('conversation_id', req.params.id);
  const { error } = await supabase.from('conversations').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// GET /api/conversations/:id/appointment
router.get('/conversations/:id/appointment', async (req, res) => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('conversation_id', req.params.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || null);
});

// POST /api/conversations/:id/send
// Owner sends a manual SMS from the dashboard
router.post('/conversations/:id/send', async (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'message required' });

  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .select('customer_phone, business_id')
    .eq('id', req.params.id)
    .single();
  if (convErr || !conv) return res.status(404).json({ error: 'Conversation not found' });

  const { data: biz, error: bizErr } = await supabase
    .from('businesses')
    .select('twilio_number')
    .eq('id', conv.business_id)
    .single();
  if (bizErr || !biz?.twilio_number) return res.status(400).json({ error: 'Business has no Twilio number' });

  try {
    await twilioClient.messages.create({
      body: message,
      from: biz.twilio_number,
      to: conv.customer_phone,
    });
    await supabase.from('messages').insert({ conversation_id: req.params.id, role: 'assistant', content: message });
    await supabase.from('conversations').update({ manual_mode: true }).eq('id', req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/businesses/:id/disconnect-google
router.post('/businesses/:id/disconnect-google', async (req, res) => {
  const { error } = await supabase
    .from('businesses')
    .update({ google_calendar_id: null, google_tokens: null })
    .eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// POST /api/create-business
// Called during signup — uses service role to bypass RLS
router.post('/create-business', async (req, res) => {
  const { id, owner_auth_id, name, owner_name, owner_phone, trade, greeting, business_hours, services } = req.body;
  if (!id || !owner_auth_id) return res.status(400).json({ error: 'id and owner_auth_id required' });

  const { error } = await supabase.from('businesses').insert({
    id, owner_auth_id, name, owner_name, owner_phone, trade, greeting,
    ...(business_hours && { business_hours }),
    ...(services && { services }),
  });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// POST /api/provision-number
// Called after signup — finds and buys a local number, wires webhooks, saves to business record
router.post('/provision-number', async (req, res) => {
  const { businessId, areaCode } = req.body;
  if (!businessId) return res.status(400).json({ error: 'businessId required' });

  try {
    // Search for an available local number
    const searchParams = { voiceEnabled: true, smsEnabled: true, limit: 1 };
    if (areaCode) searchParams.areaCode = areaCode;

    const available = await twilioClient.availablePhoneNumbers('US').local.list(searchParams);
    if (!available.length) return res.status(404).json({ error: 'No numbers available for that area code' });

    const numberToBuy = available[0].phoneNumber;

    // Purchase the number and configure webhooks
    const purchased = await twilioClient.incomingPhoneNumbers.create({
      phoneNumber: numberToBuy,
      voiceUrl: `${WEBHOOK_BASE}/webhook/missed-call`,
      voiceMethod: 'POST',
      smsUrl: `${WEBHOOK_BASE}/webhook/sms`,
      smsMethod: 'POST',
    });

    // Add number to A2P messaging service so carrier filtering is bypassed
    await twilioClient.messaging.v1.services(process.env.TWILIO_MESSAGING_SERVICE_SID).phoneNumbers.create({
      phoneNumberSid: purchased.sid,
    });

    // Save to businesses table
    const { error } = await supabase
      .from('businesses')
      .update({ twilio_number: purchased.phoneNumber })
      .eq('id', businessId);

    if (error) {
      // Bought the number but couldn't save — release it to avoid orphaned charges
      await twilioClient.incomingPhoneNumbers(purchased.sid).remove();
      return res.status(500).json({ error: 'Failed to save number: ' + error.message });
    }

    res.json({ phoneNumber: purchased.phoneNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/send-monthly-reports — called by Railway cron on the 1st of each month
router.post('/send-monthly-reports', async (req, res) => {
  if (req.headers['x-cron-secret'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { sendMonthlyReportEmail } = require('../services/email');

  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const month = firstOfLastMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, owner_name, owner_auth_id')
    .eq('subscription_status', 'active');

  if (!businesses?.length) return res.json({ sent: 0 });

  let sent = 0;
  for (const biz of businesses) {
    try {
      const [{ count: missedCallsHandled }, { count: appointmentsBooked }, { count: conversationsClosed }] = await Promise.all([
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', biz.id).gte('created_at', firstOfLastMonth.toISOString()).lt('created_at', firstOfMonth.toISOString()),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('business_id', biz.id).gte('created_at', firstOfLastMonth.toISOString()).lt('created_at', firstOfMonth.toISOString()),
        supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('business_id', biz.id).eq('status', 'closed').gte('created_at', firstOfLastMonth.toISOString()).lt('created_at', firstOfMonth.toISOString()),
      ]);

      const { data: { user } } = await supabase.auth.admin.getUserById(biz.owner_auth_id);
      if (!user?.email) continue;

      await sendMonthlyReportEmail({
        to: user.email,
        ownerName: biz.owner_name,
        businessName: biz.name,
        month,
        missedCallsHandled: missedCallsHandled || 0,
        appointmentsBooked: appointmentsBooked || 0,
        conversationsClosed: conversationsClosed || 0,
      });
      sent++;
    } catch (e) {
      console.error(`Monthly report failed for ${biz.id}:`, e.message);
    }
  }

  res.json({ sent });
});

module.exports = router;
