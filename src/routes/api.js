const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');
const twilio = require('twilio');

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
  const allowed = ['name', 'owner_name', 'owner_phone', 'trade', 'services', 'business_hours', 'timezone', 'appointment_duration', 'greeting'];
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
    .order('created_at', { ascending: false });
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

  res.json({
    callsToday: todayCalls,
    totalCalls,
    responseRate: totalCalls > 0 ? Math.round((totalCalls / totalCalls) * 100) : 0,
    bookingRate: totalCalls > 0 ? Math.round((bookedConvs / totalCalls) * 100) : 0,
    conversationsActive: activeConvs,
    appointmentsThisWeek: apptThisWeek,
  });
});

// PATCH /api/conversations/:id
router.patch('/conversations/:id', async (req, res) => {
  const { status } = req.body;
  const allowed = ['active', 'booked', 'closed'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const { data, error } = await supabase
    .from('conversations')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH /api/appointments/:id
router.patch('/appointments/:id', async (req, res) => {
  const { status } = req.body;
  const allowed = ['confirmed', 'pending', 'completed', 'cancelled'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
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
    await supabase.from('messages').insert({
      conversation_id: req.params.id,
      role: 'assistant',
      content: message,
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/create-business
// Called during signup — uses service role to bypass RLS
router.post('/create-business', async (req, res) => {
  const { id, owner_auth_id, name, owner_name, owner_phone, trade, greeting } = req.body;
  if (!id || !owner_auth_id) return res.status(400).json({ error: 'id and owner_auth_id required' });

  const { error } = await supabase.from('businesses').insert({
    id, owner_auth_id, name, owner_name, owner_phone, trade, greeting,
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
