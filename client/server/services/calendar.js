const { google } = require("googleapis");

// Store OAuth tokens per business
const tokens = new Map();

function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

function getAuthUrl(businessId) {
  const oauth2Client = createOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar"],
    state: businessId,
  });
}

async function handleAuthCallback(code, businessId) {
  const oauth2Client = createOAuthClient();
  const { tokens: newTokens } = await oauth2Client.getToken(code);
  tokens.set(businessId, newTokens);
  console.log(`[Calendar] Authorized for business: ${businessId}`);
  return newTokens;
}

function getAuthenticatedClient(businessId) {
  const oauth2Client = createOAuthClient();
  const businessTokens = tokens.get(businessId);
  if (!businessTokens) return null;
  oauth2Client.setCredentials(businessTokens);
  return oauth2Client;
}

async function getAvailableSlots(businessId, business, daysAhead = 5) {
  const auth = getAuthenticatedClient(businessId);
  if (!auth) {
    // Return default slots if calendar not connected
    return generateDefaultSlots(business, daysAhead);
  }

  const calendar = google.calendar({ version: "v3", auth });
  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + daysAhead);

  // Get existing events to find busy times
  const response = await calendar.events.list({
    calendarId: business.googleCalendarId || "primary",
    timeMin: now.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  const busyTimes = (response.data.items || []).map((event) => ({
    start: new Date(event.start.dateTime || event.start.date),
    end: new Date(event.end.dateTime || event.end.date),
  }));

  return generateAvailableSlots(business, daysAhead, busyTimes);
}

function generateDefaultSlots(business, daysAhead) {
  return generateAvailableSlots(business, daysAhead, []);
}

function generateAvailableSlots(business, daysAhead, busyTimes) {
  const slots = [];
  const now = new Date();
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const duration = business.appointmentDuration || 60;

  for (let d = 0; d < daysAhead; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    const dayName = days[date.getDay()];
    const hours = business.businessHours[dayName];

    if (!hours) continue;

    const [startH, startM] = hours.start.split(":").map(Number);
    const [endH, endM] = hours.end.split(":").map(Number);

    // Generate slots every hour during business hours
    for (let h = startH; h < endH; h++) {
      const slotStart = new Date(date);
      slotStart.setHours(h, 0, 0, 0);

      // Skip if slot is in the past
      if (slotStart < now) continue;

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      // Check if slot conflicts with busy times
      const isBusy = busyTimes.some(
        (busy) => slotStart < busy.end && slotEnd > busy.start
      );

      if (!isBusy) {
        const dateStr = slotStart.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        });
        const timeStr = slotStart.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
        slots.push({ date: dateStr, time: timeStr, iso: slotStart.toISOString() });
      }
    }
  }

  // Return max 8 slots to keep AI responses manageable
  return slots.slice(0, 8);
}

async function bookAppointment(businessId, business, dateTimeISO, customerName, serviceDescription) {
  const auth = getAuthenticatedClient(businessId);
  if (!auth) {
    console.log(`[Calendar] No auth — booking logged but not added to calendar`);
    return { booked: true, synced: false };
  }

  const calendar = google.calendar({ version: "v3", auth });
  const start = new Date(dateTimeISO);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + (business.appointmentDuration || 60));

  const event = await calendar.events.insert({
    calendarId: business.googleCalendarId || "primary",
    requestBody: {
      summary: `${customerName || "Customer"} — ${serviceDescription || business.trade}`,
      description: `Booked via Ansa AI\nService: ${serviceDescription}\nCustomer: ${customerName}`,
      start: { dateTime: start.toISOString() },
      end: { dateTime: end.toISOString() },
    },
  });

  console.log(`[Calendar] Booked: ${event.data.summary} at ${start}`);
  return { booked: true, synced: true, eventId: event.data.id };
}

module.exports = { getAuthUrl, handleAuthCallback, getAvailableSlots, bookAppointment };
