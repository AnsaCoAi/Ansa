const { sendSMS } = require("./twilio");

async function notifyOwner(business, customerPhone, summary, type = "new_lead") {
  const messages = {
    new_lead: `🔔 ANSA: Missed call from ${customerPhone}. AI is handling it.`,
    urgent: `🚨 ANSA URGENT: ${customerPhone} needs immediate help. "${summary}" — Call them back ASAP.`,
    booked: `✅ ANSA: Appointment booked!\n${summary}\nCustomer: ${customerPhone}`,
  };

  const message = messages[type] || messages.new_lead;

  await sendSMS(business.ownerPhone, process.env.TWILIO_PHONE_NUMBER, message);
  console.log(`[Notify] Owner ${business.ownerName} notified (${type})`);
}

module.exports = { notifyOwner };
