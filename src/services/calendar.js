const { google } = require("googleapis");
const supabase = require("./supabase");

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
  const { tokens } = await oauth2Client.getToken(code);
  await supabase.from("businesses").update({ google_tokens: tokens }).eq("id", businessId);
  console.log(`[Calendar] Authorized for business: ${businessId}`);
  return tokens;
}

async function getAuthenticatedClient(businessId) {
  const { data } = await supabase.from("businesses").select("google_tokens").eq("id", businessId).single();
  if (!data?.google_tokens) return null;
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(data.google_tokens);
  return oauth2Client;
}

async function getAvailableSlots(businessId, business, daysAhead = 5) {
  const auth = await getAuthenticatedClient(businessId);
  if (!auth) return generateAvailableSlots(business, daysAhead, []);

  const calendar = google.calendar({ version: "v3", auth });
  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + daysAhead);

  const response = await calendar.events.list({
    calendarId: business.google_calendar_id || "primary",
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

function generateAvailableSlots(business, daysAhead, busyTimes) {
  const slots = [];
  const now = new Date();
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const duration = business.appointment_duration || 60;
  const hours = business.business_hours;

  for (let d = 0; d < daysAhead; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    const dayName = days[date.getDay()];
    const dayHours = hours[dayName];

    if (!dayHours) continue;

    const [startH] = dayHours.start.split(":").map(Number);
    const [endH] = dayHours.end.split(":").map(Number);

    for (let h = startH; h < endH; h++) {
      const slotStart = new Date(date);
      slotStart.setHours(h, 0, 0, 0);
      if (slotStart < now) continue;

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      const isBusy = busyTimes.some((busy) => slotStart < busy.end && slotEnd > busy.start);
      if (!isBusy) {
        slots.push({
          date: slotStart.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
          time: slotStart.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
          iso: slotStart.toISOString(),
        });
      }
    }
  }

  return slots.slice(0, 8);
}

async function bookAppointment(businessId, business, dateTimeISO, customerName, serviceDescription) {
  const auth = await getAuthenticatedClient(businessId);
  if (!auth) {
    console.log(`[Calendar] No auth — booking logged but not added to calendar`);
    return { booked: true, synced: false };
  }

  const calendar = google.calendar({ version: "v3", auth });
  const start = new Date(dateTimeISO);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + (business.appointment_duration || 60));

  const event = await calendar.events.insert({
    calendarId: business.google_calendar_id || "primary",
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
