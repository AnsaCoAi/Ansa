const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../services/supabase');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.ansaco.ai';
const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;

// POST /api/stripe/checkout — create Stripe Checkout session
router.post('/checkout', async (req, res) => {
  const { businessId } = req.body;
  if (!businessId) return res.status(400).json({ error: 'businessId required' });

  const { data: biz, error } = await supabase
    .from('businesses')
    .select('id, name, owner_phone, stripe_customer_id')
    .eq('id', businessId)
    .single();

  if (error || !biz) return res.status(404).json({ error: 'Business not found' });

  let customerId = biz.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      name: biz.name,
      metadata: { businessId },
    });
    customerId = customer.id;
    await supabase
      .from('businesses')
      .update({ stripe_customer_id: customerId })
      .eq('id', businessId);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
    subscription_data: { trial_period_days: 30, metadata: { businessId } },
    success_url: `${FRONTEND_URL}/#/onboarding`,
    cancel_url: `${FRONTEND_URL}/#/billing?b=${businessId}`,
  });

  res.json({ url: session.url });
});

// POST /api/stripe/portal — create Billing Portal session
router.post('/portal', async (req, res) => {
  const { businessId } = req.body;
  if (!businessId) return res.status(400).json({ error: 'businessId required' });

  const { data: biz, error } = await supabase
    .from('businesses')
    .select('stripe_customer_id')
    .eq('id', businessId)
    .single();

  if (error || !biz?.stripe_customer_id)
    return res.status(400).json({ error: 'No Stripe customer found' });

  const session = await stripe.billingPortal.sessions.create({
    customer: biz.stripe_customer_id,
    return_url: `${FRONTEND_URL}/#/dashboard/settings`,
  });

  res.json({ url: session.url });
});

// POST /api/stripe/webhook — handle Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  const sub = event.data.object;

  const statusMap = {
    'customer.subscription.created': sub.status,
    'customer.subscription.updated': sub.status,
    'customer.subscription.deleted': 'canceled',
    'invoice.payment_failed': 'past_due',
  };

  if (event.type in statusMap) {
    const businessId = sub.metadata?.businessId;
    if (businessId) {
      await supabase
        .from('businesses')
        .update({
          stripe_subscription_id: sub.id,
          subscription_status: statusMap[event.type],
        })
        .eq('id', businessId);
    }
  }

  res.json({ received: true });
});

module.exports = router;
