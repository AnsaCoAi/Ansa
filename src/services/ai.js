const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic();

// ─── In-memory history cache ─────────────────────────────────────────────────
// Primary cache. On server restart it rebuilds from DB messages passed in.
const conversationCache = new Map();

// ─── Trade-specific intelligence ─────────────────────────────────────────────
// Gives the AI deep context about each home service trade:
// what to ask, what constitutes an emergency, what jobs are typical, fallback pricing.
const TRADE_CONTEXT = {
  Plumber: {
    commonJobs:
      'drain cleaning, water heater repair/install, toilet repair/replacement, faucet install, pipe repair/repipe, sewer line inspection/repair, garbage disposal install, leak detection, water softener install, sump pump, shower/tub install',
    urgencyPhrases: [
      'leaking', 'flooding', 'flooded', 'burst pipe', 'pipe burst', 'no water',
      'sewage', 'sewer', 'backup', 'overflow', 'overflowing', 'toilet overflowing',
      'no hot water', 'water everywhere', 'gushing', 'dripping from ceiling',
      'water damage', 'wet ceiling', 'water heater burst',
    ],
    urgencyNote:
      'Active leaks, burst pipes, sewage backup, no water, or no hot water are emergencies — tell them you are notifying the owner immediately and they will call back ASAP.',
    qualifyingQuestions:
      "What's the issue and where in the home is it located? Is water actively leaking or flowing right now? How long has this been happening?",
    pricingContext:
      'Service/diagnostic call typically $75–$150. Water heater install $800–$1,800 depending on type (tank vs. tankless). Drain clearing $150–$350. Toilet replacement $250–$450 including parts. After-hours or emergency rates are typically 1.5–2× standard.',
    bookingInfo:
      'Ask: what is the specific issue, and what is the address? Both are needed to schedule correctly.',
  },

  HVAC: {
    commonJobs:
      'AC tune-up, furnace inspection/cleaning, duct cleaning, refrigerant recharge, compressor replacement, thermostat install, new system install (AC, furnace, heat pump, mini-split), filter replacement, air quality testing, zone system install',
    urgencyPhrases: [
      'no heat', 'no ac', 'not cooling', 'not heating', 'ac down', 'ac stopped',
      'furnace out', 'heat stopped', 'hvac out', 'freezing inside', 'burning smell from vents',
      'unit stopped', 'ac not working', 'heater not working', 'no air conditioning',
    ],
    urgencyNote:
      'No heat in cold weather or no AC in extreme heat are emergencies — families and elderly are affected. Notify owner immediately.',
    qualifyingQuestions:
      "Is the system not turning on at all, or is it running but not heating/cooling? What does the thermostat show? How old is the system and what brand?",
    pricingContext:
      'Service/diagnostic call $85–$175. Annual tune-up $89–$179. Refrigerant recharge $200–$500 depending on refrigerant type. New AC install $3,500–$7,500. New furnace install $2,500–$5,500. Mini-split $2,000–$5,000 installed.',
    bookingInfo:
      'Ask: what is happening with the system, and what is the address? Mention that a technician will diagnose on arrival.',
  },

  Electrician: {
    commonJobs:
      'outlet/switch install, panel upgrade, EV charger install, ceiling fan install, outdoor and landscape lighting, generator hookup and transfer switch, home rewire, smoke/CO detector install, circuit breaker replacement, dedicated circuit add, bath fan install',
    urgencyPhrases: [
      'no power', 'sparking', 'sparks', 'burning smell', 'outlet not working', 'power out',
      'flickering lights', 'hot outlet', 'tripped breaker won\'t reset', 'smell of burning',
      'electrical fire', 'smoking outlet', 'arc', 'buzzing outlet',
    ],
    urgencyNote:
      'Sparking, burning smells, smoking outlets, or any fire hazard — treat as a safety emergency. Notify owner immediately and tell customer to avoid using that circuit.',
    qualifyingQuestions:
      "What's the specific issue and which area of the home? Is it affecting one outlet/circuit or a broader area? Have you tried resetting the breakers?",
    pricingContext:
      'Service call $75–$150. Outlet install $150–$300. Panel upgrade $1,500–$4,500. EV charger install $500–$1,200. Ceiling fan install $150–$300. Most small jobs are 1–2 hours at $85–$150/hr labor.',
    bookingInfo:
      'Ask: what is the specific issue and what is the address?',
  },

  Roofer: {
    commonJobs:
      'shingle repair, full roof replacement, flat/TPO roof repair, gutter install and cleaning, fascia/soffit repair, roof inspection, storm damage assessment, skylight install, chimney flashing, ridge vent install, ice dam removal',
    urgencyPhrases: [
      'leaking roof', 'water coming in', 'ceiling is wet', 'wet ceiling', 'storm damage',
      'shingles off', 'missing shingles', 'hole in roof', 'roof collapsed', 'hail damage',
      'tree fell', 'tree on roof', 'wind damage', 'active leak', 'raining inside',
    ],
    urgencyNote:
      'Active water intrusion, a hole in the roof, or storm damage — notify owner immediately. Interior damage gets worse every hour.',
    qualifyingQuestions:
      "What type of roof do you have (shingle, tile, metal, flat)? Roughly how old is it? Is there active water coming inside the home right now?",
    pricingContext:
      'Roof inspection $150–$300 (often credited toward repair). Shingle repair $300–$1,500 depending on scope. Full replacement varies by size/material — typical residential $8,000–$18,000. Gutter install $1,500–$3,000.',
    bookingInfo:
      'Ask: what is the issue and what is the property address? A crew will come out and assess before any work begins.',
  },

  Landscaper: {
    commonJobs:
      'lawn mowing, edging, trimming, leaf cleanup, mulching, planting, irrigation system install/repair, tree and shrub trimming, sod install, fertilization, aerating, seasonal cleanup, weed control, flower bed maintenance',
    urgencyPhrases: [
      'hoa violation', 'hoa letter', 'hoa deadline', 'inspection this week', 'party this weekend',
      'wedding', 'event this weekend', 'guests coming', 'sell the house', 'listing this week',
      'overgrown', 'citation',
    ],
    urgencyNote:
      'HOA deadlines, property listings, or events this week are time-sensitive — check availability and flag to owner.',
    qualifyingQuestions:
      "What services are you looking for? Is this a one-time visit or recurring? Roughly how large is the yard (or how many square feet/acres)?",
    pricingContext:
      'Lawn mowing starts at $40–$80 for a standard yard (up to 5,000 sq ft), more for larger. Seasonal cleanups $200–$600. Mulch installation $300–$800. Sod and irrigation vary by scope and sq footage.',
    bookingInfo:
      'Ask: what services, property address, and is this a one-time or recurring need?',
  },

  'Pest Control': {
    commonJobs:
      'ant treatment, general pest control, rodent exclusion/trapping, cockroach treatment, bed bug inspection and treatment, termite inspection/treatment, bee and wasp removal/relocation, spider treatment, flea treatment, mosquito control, wildlife removal',
    urgencyPhrases: [
      'bees', 'wasps', 'hornets', 'yellow jackets', 'nest', 'ants everywhere', 'ant infestation',
      'cockroaches', 'roaches', 'rats', 'mice', 'bed bugs', 'bedbugs', 'termites', 'swarm',
      'swarming', 'infestation', 'can\'t sleep', 'bites all over', 'saw a rat',
    ],
    urgencyNote:
      'Active bee/wasp nests near entry points, visible rodent activity, bed bugs, or termite swarms are urgent.',
    qualifyingQuestions:
      "What kind of pest are you dealing with? Where are you seeing them — inside, outside, or both? How long has this been going on, and how severe does it seem?",
    pricingContext:
      'Initial general pest treatment $150–$350 depending on pest type and home size. Termite inspection $75–$150. Monthly/quarterly plans $40–$80 per visit. Bed bug treatment $500–$1,500. Rodent exclusion $300–$800.',
    bookingInfo:
      'Ask: what type of pest, property address, and approximate home size. Treatment approach depends on pest type.',
  },

  Exterminator: {
    commonJobs:
      'ant treatment, general pest control, rodent exclusion/trapping, cockroach treatment, bed bug inspection and treatment, termite inspection/treatment, bee and wasp removal, spider treatment, flea treatment, wildlife removal',
    urgencyPhrases: [
      'bees', 'wasps', 'hornets', 'yellow jackets', 'nest', 'ants everywhere', 'ant infestation',
      'cockroaches', 'roaches', 'rats', 'mice', 'bed bugs', 'bedbugs', 'termites', 'swarm',
      'swarming', 'infestation', 'can\'t sleep', 'bites all over', 'saw a rat',
    ],
    urgencyNote:
      'Active bee/wasp nests near entry points, visible rodent activity, bed bugs, or termite swarms are urgent.',
    qualifyingQuestions:
      "What kind of pest are you dealing with? Where are you seeing them — inside, outside, or both? How long has this been going on?",
    pricingContext:
      'Initial general pest treatment $150–$350. Termite inspection $75–$150. Monthly/quarterly plans $40–$80/visit. Bed bug treatment $500–$1,500. Rodent exclusion $300–$800.',
    bookingInfo:
      'Ask: what type of pest, property address, and approximate home size.',
  },

  'House Cleaner': {
    commonJobs:
      'standard cleaning, deep cleaning, move-in/move-out cleaning, post-construction cleaning, recurring weekly/biweekly/monthly service, Airbnb/short-term rental turnovers, office cleaning, carpet cleaning, window cleaning',
    urgencyPhrases: [
      'guests tonight', 'guests tomorrow', 'party tonight', 'party tomorrow', 'move-out tomorrow',
      'move out today', 'inspection today', 'inspection tomorrow', 'showing today', 'showing tomorrow',
      'airbnb guest checking in', 'tonight', 'asap', 'emergency clean',
    ],
    urgencyNote:
      'Same-day or next-day needs for events, move-outs, or rental turnovers are urgent — check schedule and notify owner.',
    qualifyingQuestions:
      "How many bedrooms and bathrooms? Is this a one-time clean (standard or deep) or are you looking for recurring service? Any specific areas of focus like oven, fridge, or windows?",
    pricingContext:
      'Standard clean: 1BR/1BA $90–$120, 2BR $130–$160, 3BR $160–$210. Deep cleans are 1.5–2× standard. Move-in/out: $200–$450 depending on size. Recurring service gets a 10–20% discount.',
    bookingInfo:
      'Ask: number of bedrooms/bathrooms, type of clean needed, and property address.',
  },

  Mover: {
    commonJobs:
      'local move, long-distance move, packing and unpacking service, furniture-only move, storage unit move, office/commercial move, single large item (piano, safe, hot tub), junk removal, labor-only move (you provide truck)',
    urgencyPhrases: [
      'tomorrow', 'this weekend', 'last minute', 'move-out deadline', 'eviction',
      'lease ending', 'lease up', 'got evicted', 'need to be out by', 'moving in two days',
      'date is this week',
    ],
    urgencyNote:
      'Short-notice moves (1–3 days out) need immediate availability confirmation — flag to owner right away.',
    qualifyingQuestions:
      "What is the move date? Are you moving locally (same city) or long distance? How large is the home — studio, 1BR, 2BR, 3BR, or full house? Any specialty items like a piano, gun safe, or hot tub?",
    pricingContext:
      'Local moves: typically $100–$160/hr for a 2-person crew, 2–3 hour minimum. Most 1–2BR local moves are $350–$700. Long-distance is priced by weight and mileage. Packing service adds $50–$100/hr. Piano moves typically $300–$600.',
    bookingInfo:
      'Ask: move date, move-from and move-to addresses (or general area for long-distance), home size, and any specialty items.',
  },

  'Garage Door': {
    commonJobs:
      'spring replacement (torsion or extension), cable replacement, garage door opener install/replace, door panel replacement, track repair/alignment, full new door install, weatherstripping, keypad/remote programming, tune-up and lubrication',
    urgencyPhrases: [
      'stuck', 'won\'t open', 'car stuck in garage', 'car stuck', 'broken spring',
      'won\'t close', 'snapped cable', 'fell off track', 'opener not working', 'door fell',
      'can\'t get out', 'can\'t get in', 'security risk',
    ],
    urgencyNote:
      'Car stuck inside, door that won\'t close (security risk), or broken spring on the primary entry — these are urgent.',
    qualifyingQuestions:
      "What's happening — won't open, won't close, making a loud noise, or something else? Is it the opener (motor unit) or the door itself? How old is the door/opener?",
    pricingContext:
      'Spring replacement $150–$325. Opener install $250–$500. Service/diagnostic call $75–$100. Cable replacement $150–$250. New door install $800–$2,500 depending on size and style.',
    bookingInfo:
      'Ask: what is happening and what is the address? Most garage door jobs are same-day.',
  },

  Painter: {
    commonJobs:
      'interior room painting, full interior repaint, exterior painting, cabinet painting and refinishing, deck/fence staining, garage floor epoxy, trim and door painting, popcorn ceiling removal, drywall texture/repair, commercial painting',
    urgencyPhrases: [
      'hoa deadline', 'hoa violation', 'listing my house', 'going on market', 'showing this week',
      'closing next week', 'landlord deadline',
    ],
    urgencyNote:
      'Homes going on the market or HOA violations with hard deadlines are time-sensitive.',
    qualifyingQuestions:
      "Interior, exterior, or both? How many rooms (or roughly how many sq ft)? Do the walls need patching or any prep work beyond painting?",
    pricingContext:
      'Interior per room: $200–$450 depending on size and ceiling height. Full interior (3BR home): $2,500–$6,000. Exterior (2,000 sq ft home): $3,000–$6,500. Cabinets: $1,500–$4,500. Deck staining: $600–$2,000.',
    bookingInfo:
      'Ask: interior or exterior, approximate scope, and address. An estimate visit may be needed for larger projects.',
  },

  'Pool Service': {
    commonJobs:
      'weekly pool maintenance, chemical balancing and testing, pool vacuuming and brushing, filter cleaning, equipment repair (pump, filter, heater, salt cell), green pool recovery, pool opening/closing, plaster/tile repair, leak detection, automatic cleaner service',
    urgencyPhrases: [
      'green pool', 'pool is green', 'cloudy water', 'pump not working', 'pump broke',
      'party this weekend', 'event this weekend', 'can\'t swim', 'pool turned green overnight',
      'equipment alarm', 'water level dropping',
    ],
    urgencyNote:
      'Green or cloudy pool before an event, broken pump, or rapidly dropping water level (leak) are urgent.',
    qualifyingQuestions:
      "What's going on — water chemistry issue, green or cloudy water, or equipment problem? Is the pool in-ground or above-ground? Are you looking for ongoing weekly service or a one-time visit?",
    pricingContext:
      'Weekly service: $100–$200/month. Green pool treatment: $200–$500. Equipment repairs vary by part and labor. Opening/closing: $200–$400. Filter cleaning: $75–$150.',
    bookingInfo:
      'Ask: what is the issue and what is the address?',
  },

  'General Contractor': {
    commonJobs:
      'kitchen remodel, bathroom remodel, home addition, basement finish, ADU/accessory dwelling unit, deck and patio build, window and door install, flooring install, drywall, structural repair, foundation repair, fire/water damage restoration, code violation repairs',
    urgencyPhrases: [
      'water damage', 'flood damage', 'storm damage', 'roof leak came through',
      'structural issue', 'foundation crack', 'code violation', 'ceiling collapsed',
      'wall caved', 'permit deadline', 'tenant complaint',
    ],
    urgencyNote:
      'Active water damage, structural concerns, or code violations require prompt response — every day of delay increases repair cost.',
    qualifyingQuestions:
      "What type of project is this — repair, remodel, or new construction? Rough size and scope? Do you have plans, permits, or designs in place already? What's your target start date?",
    pricingContext:
      'Kitchen remodel: $20,000–$80,000+. Bathroom remodel: $8,000–$35,000. Basement finish: $25,000–$65,000. Deck build: $8,000–$25,000. Smaller repairs quoted per scope. Always schedule a site visit before providing a firm number.',
    bookingInfo:
      'Ask: what is the project type, property address, and preferred time for a consultation/estimate visit.',
  },
};

function resolveTradeContext(trade) {
  if (!trade) return null;
  const t = trade.toLowerCase().trim();

  // Exact key match first
  for (const [key, val] of Object.entries(TRADE_CONTEXT)) {
    if (t === key.toLowerCase()) return val;
  }
  // Substring match
  for (const [key, val] of Object.entries(TRADE_CONTEXT)) {
    if (t.includes(key.toLowerCase()) || key.toLowerCase().includes(t)) return val;
  }
  // Common aliases
  if (/plumb/.test(t)) return TRADE_CONTEXT['Plumber'];
  if (/hvac|heat|cool|air.?cond|furnace/.test(t)) return TRADE_CONTEXT['HVAC'];
  if (/electri/.test(t)) return TRADE_CONTEXT['Electrician'];
  if (/roof/.test(t)) return TRADE_CONTEXT['Roofer'];
  if (/landscap|lawn|yard|mow/.test(t)) return TRADE_CONTEXT['Landscaper'];
  if (/pest|exterminat|bug|rodent|termite/.test(t)) return TRADE_CONTEXT['Pest Control'];
  if (/clean/.test(t)) return TRADE_CONTEXT['House Cleaner'];
  if (/mov(ing|er)|reloc/.test(t)) return TRADE_CONTEXT['Mover'];
  if (/garage/.test(t)) return TRADE_CONTEXT['Garage Door'];
  if (/paint/.test(t)) return TRADE_CONTEXT['Painter'];
  if (/pool|spa/.test(t)) return TRADE_CONTEXT['Pool Service'];
  if (/contrac|remodel|construct|build/.test(t)) return TRADE_CONTEXT['General Contractor'];
  return null;
}

// ─── Format services for prompt ──────────────────────────────────────────────
function formatServicesForPrompt(services) {
  if (!services || services.length === 0)
    return 'No specific services configured yet — use your trade knowledge to give helpful estimates, then book the appointment.';

  return services.map(svc => {
    if (typeof svc === 'string') return `• ${svc}`;

    const name = svc.name;
    const pt = svc.pricing_type;

    if (pt === 'free_estimate') {
      return `• ${name}: Free on-site estimate — never quote a number over text. Say: "We'd need to take a look first — free visit, no obligation."`;
    }

    const low = svc.price_low;
    const high = svc.price_high;
    const min = svc.min_charge;

    let unitStr = '';
    let mathInstruction = '';
    if (pt === 'per_sq_ft') {
      unitStr = '/sq ft';
      mathInstruction = `\n  → MATH: If customer gives sq footage, calculate: ${low}×qty to ${high}×qty. Example: 200 sq ft = $${Math.round(low * 200).toLocaleString()}–$${Math.round(high * 200).toLocaleString()}.`;
    } else if (pt === 'per_linear_ft') {
      unitStr = '/linear ft';
      mathInstruction = `\n  → MATH: If customer gives footage, calculate: ${low}×qty to ${high}×qty.`;
    } else if (pt === 'per_unit') {
      const unit = svc.unit || 'unit';
      unitStr = `/${unit}`;
      mathInstruction = `\n  → MATH: If customer gives quantity, multiply: ${low}×qty to ${high}×qty.`;
    } else if (pt === 'hourly') {
      unitStr = '/hour';
    }

    let priceStr =
      pt === 'starting_at'
        ? `Starting at $${low}`
        : high
        ? `$${low}–$${high}${unitStr}`
        : `$${low}${unitStr}`;

    if (min) priceStr += ` (min $${min})`;

    let line = `• ${name}: ${priceStr}`;
    if (svc.notes) line += `\n  → ${svc.notes}`;
    if (mathInstruction) line += mathInstruction;

    return line;
  }).join('\n\n');
}

// ─── Format FAQs for prompt ───────────────────────────────────────────────────
function formatFAQs(faqs) {
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) return null;
  const lines = faqs
    .filter(f => f.question && f.answer)
    .map(f => `Q: ${f.question}\nA: ${f.answer}`);
  return lines.length > 0 ? lines.join('\n\n') : null;
}

// ─── Build system prompt ──────────────────────────────────────────────────────
function buildSystemPrompt(business, availableSlots) {
  const ownerName = business.owner_name || business.ownerName || 'the owner';

  const slotsText =
    availableSlots && availableSlots.length > 0
      ? availableSlots.map(s => `- ${s.date} at ${s.time}`).join('\n')
      : `No open slots right now — let the customer know someone will call them back to confirm a time.`;

  const servicesText = formatServicesForPrompt(business.services);
  const faqText = formatFAQs(business.faqs);
  const tradeCtx = resolveTradeContext(business.trade);

  // Tone guidance
  const toneMap = {
    professional: 'Speak professionally and precisely. Formal but warm. No slang.',
    friendly:     'Speak in a friendly, conversational tone. Approachable and warm, like a helpful team member.',
    casual:       'Keep it relaxed and natural. Short, direct messages. Like texting a trusted local pro.',
    formal:       'Strictly professional. No colloquialisms. Precise language only.',
  };
  const toneKey = (business.tone || 'friendly').toLowerCase();
  const toneInstruction = toneMap[toneKey] || toneMap.friendly;

  const appointmentDuration = business.appointment_duration
    ? `Jobs are typically scheduled as ${business.appointment_duration}-minute appointments.`
    : '';

  // Trade-specific intelligence block
  let tradeBlock = '';
  if (tradeCtx) {
    const urgencyList = tradeCtx.urgencyPhrases.map(p => `"${p}"`).join(', ');
    tradeBlock = `
TRADE KNOWLEDGE — ${business.trade}:
Common job types: ${tradeCtx.commonJobs}

Emergency / Urgency indicators (if customer mentions any of these, treat as urgent): ${urgencyList}
→ Urgency action: ${tradeCtx.urgencyNote}

Key qualifying questions to ask (choose the most relevant — don't ask all at once):
${tradeCtx.qualifyingQuestions}

Industry pricing context (use ONLY if owner has not configured a specific price for that service):
${tradeCtx.pricingContext}

Booking info: ${tradeCtx.bookingInfo}`;
  }

  // FAQ block
  const faqBlock = faqText
    ? `\nCOMMON QUESTIONS & ANSWERS (use these to answer customer questions accurately):\n${faqText}`
    : '';

  // Service area block
  const serviceAreaBlock = business.service_base_address
    ? `SERVICE AREA:
- Operating out of: ${business.service_base_address}
- Service radius: ${business.service_radius_miles || 25} miles
- Always collect the customer's job address before confirming any appointment. Tag it: [ADDRESS: full address]`
    : 'SERVICE AREA: No restrictions configured — no need to ask for address unless relevant to the job.';

  return `You are the AI receptionist for "${business.name}", a ${business.trade} business. You are responding via SMS text on behalf of ${ownerName}.

TONE: ${toneInstruction}
${appointmentDuration}

SERVICES & PRICING:
${servicesText}
${tradeBlock}
${faqBlock}

AVAILABLE APPOINTMENT SLOTS:
${slotsText}

${serviceAreaBlock}

YOUR CORE JOB:
1. Understand exactly what the customer needs
2. Ask 1 qualifying question at a time if more info is needed — never bombard with multiple questions
3. Answer price questions with real numbers from SERVICES above, or fallback to TRADE KNOWLEDGE pricing if no service is configured for it
4. Do the math for the customer when they give dimensions/quantities — show your work briefly
5. If it is an emergency or urgent situation: say you are notifying ${ownerName} immediately and they will be in touch very soon. Use [URGENT] tag.
6. Otherwise: offer available time slots and confirm the booking

PRICING RULES:
- Give real dollar ranges — never dodge a price question with "it depends" without explaining WHAT it depends on
- Always give a range (low–high), never one exact number (market variation is real)
- For per-unit/sq ft/linear ft jobs: do the math if the customer gives a quantity
- For "free estimate" services: invite them in, never guess
- After pricing, always guide toward booking

CONVERSATION RULES:
- Keep messages SHORT — 1–3 sentences. This is texting, not email.
- Never reveal you are an AI — you are the front desk for ${business.name}
- Never greet with "Hi", "Hey", or "Hello" on follow-up messages — only on the first response
- If the customer says "thanks", "got it", "ok", "sounds good", "see you then", or anything that closes the conversation — respond warmly and confirm the next step, then stop. Do not ask more questions.
- Vary your language across messages — do not repeat the same sentence structures
- If a customer asks something you don't know: "${ownerName} will get back to you with that detail."
- No emojis
- Collect the customer's name naturally if they haven't provided it
${business.service_base_address ? '- Before confirming any booking, ask for the job address. Tag it: [ADDRESS: full street address, city, state zip]' : ''}

CONTROL TAGS — always include in your reply when applicable (they are stripped before sending to customer):
[BOOKED: YYYY-MM-DD HH:MM]   ← When an appointment is confirmed. Use 24-hour time.
[URGENT]                      ← When an emergency is detected. Include in the reply text.
[NAME: First Last]            ← First time the customer gives their name
[ADDRESS: full address]       ← When customer provides job address`;
}

// ─── History management ───────────────────────────────────────────────────────
function getOrSeedHistory(cacheKey, dbMessages) {
  if (!conversationCache.has(cacheKey) && dbMessages && dbMessages.length > 0) {
    // Rebuild from DB — only user/assistant roles (not system)
    const seeded = dbMessages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .map(m => ({ role: m.role, content: m.content }));
    conversationCache.set(cacheKey, seeded);
  }
  if (!conversationCache.has(cacheKey)) {
    conversationCache.set(cacheKey, []);
  }
  return conversationCache.get(cacheKey);
}

function pruneHistory(history) {
  // Keep at most 20 messages. When pruning, preserve the FIRST 2 (context anchor)
  // and remove messages from position 2 onward to stay under limit.
  if (history.length <= 20) return;
  const anchor = history.slice(0, 2);
  const recent = history.slice(-(18));
  history.splice(0, history.length, ...anchor, ...recent);
}

// ─── Main AI function ─────────────────────────────────────────────────────────
async function getAIResponse(phoneNumber, customerMessage, business, availableSlots, dbMessages = []) {
  const cacheKey = `${business.id}:${phoneNumber}`;
  const history = getOrSeedHistory(cacheKey, dbMessages);

  history.push({ role: 'user', content: customerMessage });

  const systemPrompt = buildSystemPrompt(business, availableSlots);

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    system: systemPrompt,
    messages: history,
  });

  const aiMessage = response.content[0].text;

  history.push({ role: 'assistant', content: aiMessage });
  pruneHistory(history);

  return aiMessage;
}

function clearConversation(phoneNumber, businessId) {
  const cacheKey = businessId ? `${businessId}:${phoneNumber}` : phoneNumber;
  conversationCache.delete(cacheKey);
  // Also try legacy key format
  conversationCache.delete(phoneNumber);
}

module.exports = { getAIResponse, clearConversation };
