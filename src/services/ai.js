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

function formatServicesForPrompt(services) {
  if (!services || services.length === 0) return "No specific services configured — be helpful and pass complex questions to the owner.";

  return services.map(svc => {
    if (typeof svc === "string") return `• ${svc}`;

    const name = svc.name;
    const pt = svc.pricing_type;

    if (pt === "free_estimate") {
      return `• ${name}: Requires a free on-site estimate — never quote a number over text. Say: "We'd need to take a look to give you an accurate quote — it's a free visit, no obligation."`;
    }

    const low = svc.price_low;
    const high = svc.price_high;
    const min = svc.min_charge;

    let unitStr = "";
    let mathInstruction = "";
    if (pt === "per_sq_ft") {
      unitStr = "/sq ft";
      mathInstruction = `\n  → MATH: If customer gives sq footage, multiply: ${low}×qty to ${high}×qty. Example: 200 sq ft = $${Math.round(low*200).toLocaleString()}–$${Math.round(high*200).toLocaleString()}.`;
    } else if (pt === "per_linear_ft") {
      unitStr = "/linear ft";
      mathInstruction = `\n  → MATH: If customer gives linear footage, multiply: ${low}×qty to ${high}×qty.`;
    } else if (pt === "per_unit") {
      const unit = svc.unit || "unit";
      unitStr = `/${unit}`;
      mathInstruction = `\n  → MATH: If customer gives quantity, multiply: ${low}×qty to ${high}×qty.`;
    } else if (pt === "hourly") {
      unitStr = "/hour";
    }

    let priceStr = pt === "starting_at"
      ? `Starting at $${low}`
      : high ? `$${low}–$${high}${unitStr}` : `$${low}${unitStr}`;

    if (min) priceStr += ` (min $${min})`;

    let line = `• ${name}: ${priceStr}`;
    if (svc.notes) line += `\n  → ${svc.notes}`;
    if (mathInstruction) line += mathInstruction;

    return line;
  }).join("\n\n");
}

function buildSystemPrompt(business, availableSlots) {
  const slotsText =
    availableSlots && availableSlots.length > 0
      ? availableSlots.map((s) => `- ${s.date} at ${s.time}`).join("\n")
      : "No available slots right now — let the customer know someone will call them back to schedule.";

  const servicesText = formatServicesForPrompt(business.services);

  return `You are a professional AI assistant responding via SMS on behalf of "${business.name}", a ${business.trade} business owned by ${business.ownerName || business.owner_name}.

SERVICES & PRICING:
${servicesText}

AVAILABLE APPOINTMENT SLOTS:
${slotsText}

YOUR JOB:
1. Find out what the customer needs
2. If they ask about price/cost: use the pricing above to give a real estimate. Do the math if they give you dimensions or quantity.
3. If urgent/emergency (leaking, flooding, no AC, no heat, sparking, sewage smell, no hot water): tell them you're notifying ${business.ownerName || business.owner_name} immediately
4. Otherwise: offer available time slots and book an appointment

PRICING RULES:
- Give real dollar ranges from the pricing above — don't dodge price questions
- For per-unit/sq ft/linear ft services: do the math if the customer gives you a quantity. Show your work briefly: "200 sq ft at $8–$15/sq ft comes to around $1,600–$3,000 for labor"
- Always give a range (low–high), never a single exact number
- If a service requires a free estimate: say so and invite them in — never guess a number
- Emergency jobs (urgent keywords above): mention pricing may be higher and owner will call right back
- Always end pricing discussions with a booking CTA

RULES:
- Keep messages SHORT — 1-3 sentences. This is texting, not email.
- Never say you're an AI. You're the front desk.
- NEVER open with "Hi", "Hey", or "Hello" if this isn't the very first message.
- If you can't answer something, say "${business.ownerName || business.owner_name} will follow up with details."
- When a time slot is confirmed: "You're all set for [date] at [time]. ${business.ownerName || business.owner_name} will see you then!"
- Collect the customer's name if they haven't given it.
- Vary your language — don't repeat the same phrasing.
- No emojis.

When a booking is confirmed: [BOOKED: YYYY-MM-DD HH:MM]
When urgent: [URGENT]
First time customer gives name: [NAME: FirstName LastName]`;
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
    max_tokens: 400,
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
