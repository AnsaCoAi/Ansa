const { sendSMS } = require("./twilio");

async function notifyOwner(business, customerPhone, summary, type = "new_lead") {
  const ownerPhone = business.owner_phone;
  if (!ownerPhone) {
    console.log(`[Notify] No owner_phone on business ${business.id} — skipping`);
    return;
  }

  const messages = {
    new_lead: `🔔 ANSA: Missed call from ${customerPhone}. AI is handling it.`,
    urgent: `🚨 ANSA URGENT: ${customerPhone} needs immediate help. "${summary}" — Call them back ASAP.`,
    booked: `✅ ANSA: Appointment booked!\n${summary}\nCustomer: ${customerPhone}`,
    pending: `⏳ ANSA: Pending appointment needs your approval.\n${summary}\nCustomer: ${customerPhone}\nConfirm in your Appointments dashboard.`,
  };

  const message = messages[type] || messages.new_lead;

  await sendSMS(ownerPhone, process.env.TWILIO_PHONE_NUMBER, message);
  console.log(`[Notify] Owner ${business.owner_name} notified (${type})`);
}

module.exports = { notifyOwner };
