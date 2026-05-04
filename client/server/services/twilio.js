const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSMS(to, from, body) {
  const message = await client.messages.create({
    body,
    from,
    to,
  });
  console.log(`[SMS] Sent to ${to}: "${body.substring(0, 50)}..." (SID: ${message.sid})`);
  return message;
}

module.exports = { sendSMS };
