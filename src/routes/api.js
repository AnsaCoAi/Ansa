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

module.exports = router;
