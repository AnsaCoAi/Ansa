const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic();

// In-memory conversation store (per phone number)
const conversations = new Map();

function getConversation(phoneNumber) {
  if (!conversations.has(phoneNumber)) {
    conversations.set(phoneNumber, []);
  }
  return conversations.get(phoneNumber);
}

function buildSystemPrompt(business, availableSlots) {
  const slotsText =
    availableSlots && availableSlots.length > 0
      ? availableSlots
          .map(
            (s) =>
              `- ${s.date} at ${s.time}`
          )
          .join("\n")
      : "No available slots right now — let the customer know someone will call them back to schedule.";

  return `You are a friendly, professional AI assistant responding via text message on behalf of "${business.name}", a ${business.trade} business owned by ${business.ownerName}.

Your job:
1. Greet the customer warmly (the first message is already sent, so don't re-greet on follow-ups)
2. Find out what they need help with
3. Determine if it's urgent/emergency or can be scheduled
4. If urgent: tell them you're notifying ${business.ownerName} right away and someone will call back ASAP
5. If schedulable: offer available time slots and book an appointment

Available appointment slots:
${slotsText}

Services offered: ${business.services.join(", ")}

Rules:
- Keep messages SHORT. This is texting, not email. 1-3 sentences max.
- Be warm but professional. You represent a real business.
- Never say you're an AI. You're the office/front desk.
- If the customer asks something you can't answer, say "${business.ownerName} will follow up with details."
- When the customer picks a time slot, confirm it clearly: "You're all set for [date] at [time]. ${business.ownerName} will see you then!"
- If the issue doesn't match the services offered, still be helpful and say you'll pass the message along.
- Collect the customer's name if they haven't given it.

When a booking is confirmed, end your message with the exact tag: [BOOKED: YYYY-MM-DD HH:MM]
When the issue is urgent, include the tag: [URGENT]`;
}

async function getAIResponse(phoneNumber, customerMessage, business, availableSlots) {
  const history = getConversation(phoneNumber);

  history.push({
    role: "user",
    content: customerMessage,
  });

  const systemPrompt = buildSystemPrompt(business, availableSlots);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    system: systemPrompt,
    messages: history,
  });

  const aiMessage = response.content[0].text;

  history.push({
    role: "assistant",
    content: aiMessage,
  });

  // Keep conversation history manageable
  if (history.length > 20) {
    history.splice(0, 2);
  }

  return aiMessage;
}

function clearConversation(phoneNumber) {
  conversations.delete(phoneNumber);
}

module.exports = { getAIResponse, clearConversation };
