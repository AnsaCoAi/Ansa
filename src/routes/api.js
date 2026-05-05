const express = require('express');
const router = express.Router();
const supabase = require('../services/supabase');

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

module.exports = router;
