const now = new Date('2026-04-08T14:30:00');

function hoursAgo(h) {
  return new Date(now.getTime() - h * 3600000).toISOString();
}
function daysAgo(d, hour = 10) {
  const date = new Date(now);
  date.setDate(date.getDate() - d);
  date.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return date.toISOString();
}

export const currentBusiness = {
  id: 'biz_001',
  name: "Mike's Plumbing",
  owner: 'Mike Rodriguez',
  email: 'mike@mikesplumbing.com',
  phone: '+13105550142',
  address: '4821 Sepulveda Blvd, Los Angeles, CA 90230',
  timezone: 'America/Los_Angeles',
  plan: 'pro',
  services: ['Emergency Plumbing', 'Drain Cleaning', 'Water Heater Repair', 'Pipe Repair', 'Sewer Line Service', 'Fixture Installation'],
  businessHours: {
    mon: { open: '07:00', close: '18:00' },
    tue: { open: '07:00', close: '18:00' },
    wed: { open: '07:00', close: '18:00' },
    thu: { open: '07:00', close: '18:00' },
    fri: { open: '07:00', close: '18:00' },
    sat: { open: '08:00', close: '14:00' },
    sun: null,
  },
  autoReplyDelay: 30,
  createdAt: '2025-11-15T08:00:00Z',
};

export const missedCalls = [
  { id: 'mc_001', callerName: 'Sarah Chen', callerPhone: '+13105559821', timestamp: hoursAgo(0.5), duration: 12, status: 'responded', conversationId: 'conv_001' },
  { id: 'mc_002', callerName: 'Unknown', callerPhone: '+13235550847', timestamp: hoursAgo(1.2), duration: 8, status: 'pending', conversationId: null },
  { id: 'mc_003', callerName: 'James Wilson', callerPhone: '+14245551234', timestamp: hoursAgo(2.5), duration: 15, status: 'responded', conversationId: 'conv_002' },
  { id: 'mc_004', callerName: 'Maria Lopez', callerPhone: '+13105553456', timestamp: hoursAgo(3.8), duration: 6, status: 'booked', conversationId: 'conv_003' },
  { id: 'mc_005', callerName: 'David Park', callerPhone: '+18185557890', timestamp: hoursAgo(5), duration: 20, status: 'responded', conversationId: 'conv_004' },
  { id: 'mc_006', callerName: 'Unknown', callerPhone: '+13105551111', timestamp: daysAgo(1, 16), duration: 10, status: 'no_response', conversationId: null },
  { id: 'mc_007', callerName: 'Lisa Nguyen', callerPhone: '+13235552222', timestamp: daysAgo(1, 14), duration: 9, status: 'booked', conversationId: 'conv_005' },
  { id: 'mc_008', callerName: 'Robert Taylor', callerPhone: '+14245553333', timestamp: daysAgo(1, 11), duration: 18, status: 'responded', conversationId: 'conv_006' },
  { id: 'mc_009', callerName: 'Jennifer Adams', callerPhone: '+13105554444', timestamp: daysAgo(2, 9), duration: 7, status: 'booked', conversationId: 'conv_007' },
  { id: 'mc_010', callerName: 'Carlos Ramirez', callerPhone: '+18185555555', timestamp: daysAgo(2, 15), duration: 14, status: 'responded', conversationId: 'conv_008' },
  { id: 'mc_011', callerName: 'Unknown', callerPhone: '+13105556666', timestamp: daysAgo(3, 8), duration: 5, status: 'no_response', conversationId: null },
  { id: 'mc_012', callerName: 'Patricia Brown', callerPhone: '+13235557777', timestamp: daysAgo(4, 13), duration: 22, status: 'booked', conversationId: null },
  { id: 'mc_013', callerName: "Kevin O'Brien", callerPhone: '+14245558888', timestamp: daysAgo(5, 10), duration: 11, status: 'responded', conversationId: null },
  { id: 'mc_014', callerName: 'Angela Foster', callerPhone: '+13105559999', timestamp: daysAgo(6, 17), duration: 16, status: 'booked', conversationId: null },
];

export const conversations = [
  { id: 'conv_001', callerName: 'Sarah Chen', callerPhone: '+13105559821', status: 'active', service: 'Drain Cleaning', startedAt: hoursAgo(0.4), lastMessageAt: hoursAgo(0.1), unread: 2 },
  { id: 'conv_002', callerName: 'James Wilson', callerPhone: '+14245551234', status: 'active', service: 'Water Heater Repair', startedAt: hoursAgo(2.4), lastMessageAt: hoursAgo(1), unread: 0 },
  { id: 'conv_003', callerName: 'Maria Lopez', callerPhone: '+13105553456', status: 'booked', service: 'Emergency Plumbing', startedAt: hoursAgo(3.7), lastMessageAt: hoursAgo(2), unread: 0 },
  { id: 'conv_004', callerName: 'David Park', callerPhone: '+18185557890', status: 'active', service: 'Pipe Repair', startedAt: hoursAgo(4.9), lastMessageAt: hoursAgo(3), unread: 1 },
  { id: 'conv_005', callerName: 'Lisa Nguyen', callerPhone: '+13235552222', status: 'booked', service: 'Fixture Installation', startedAt: daysAgo(1, 13), lastMessageAt: daysAgo(1, 15), unread: 0 },
  { id: 'conv_006', callerName: 'Robert Taylor', callerPhone: '+14245553333', status: 'closed', service: 'Drain Cleaning', startedAt: daysAgo(1, 10), lastMessageAt: daysAgo(1, 12), unread: 0 },
  { id: 'conv_007', callerName: 'Jennifer Adams', callerPhone: '+13105554444', status: 'booked', service: 'Sewer Line Service', startedAt: daysAgo(2, 8), lastMessageAt: daysAgo(2, 10), unread: 0 },
  { id: 'conv_008', callerName: 'Carlos Ramirez', callerPhone: '+18185555555', status: 'closed', service: 'Water Heater Repair', startedAt: daysAgo(2, 14), lastMessageAt: daysAgo(2, 16), unread: 0 },
];

export const messages = {
  conv_001: [
    { role: 'system', content: 'Missed call from Sarah Chen (+1 310-555-9821) at 2:00 PM', sent_at: hoursAgo(0.4) },
    { role: 'assistant', content: "Hi Sarah! This is Mike's Plumbing. Sorry we missed your call. How can we help you today?", sent_at: hoursAgo(0.38) },
    { role: 'user', content: "Hi! My kitchen sink is draining really slowly. It's been getting worse over the past week.", sent_at: hoursAgo(0.3) },
    { role: 'assistant', content: "I'm sorry to hear that! Slow drains are usually caused by buildup in the pipes. We can have one of our technicians come out to take a look. Would you prefer a morning or afternoon appointment?", sent_at: hoursAgo(0.28) },
    { role: 'user', content: 'Morning would be great. Do you have anything available tomorrow?', sent_at: hoursAgo(0.15) },
    { role: 'assistant', content: "Let me check our schedule. We have an opening tomorrow between 9-11 AM. Our drain cleaning service starts at $149. Would you like me to book that for you?", sent_at: hoursAgo(0.1) },
  ],
  conv_002: [
    { role: 'system', content: 'Missed call from James Wilson (+1 424-555-1234) at 12:00 PM', sent_at: hoursAgo(2.4) },
    { role: 'assistant', content: "Hi James! Thanks for calling Mike's Plumbing. We're sorry we couldn't answer. What can we help you with?", sent_at: hoursAgo(2.38) },
    { role: 'user', content: "My water heater is making a weird popping noise and the water isn't getting as hot as it used to.", sent_at: hoursAgo(2.2) },
    { role: 'assistant', content: "That popping sound often indicates sediment buildup in the tank. How old is your water heater?", sent_at: hoursAgo(2.18) },
    { role: 'user', content: "I think it's about 8 years old. Is that something you can fix?", sent_at: hoursAgo(1.5) },
    { role: 'assistant', content: "Absolutely! We can flush the tank and inspect the unit. If it needs repair or replacement, we'll give you options. Our diagnostic visit is $89. When works best for you?", sent_at: hoursAgo(1) },
  ],
  conv_003: [
    { role: 'system', content: 'Missed call from Maria Lopez (+1 310-555-3456) at 10:42 AM', sent_at: hoursAgo(3.7) },
    { role: 'assistant', content: "Hi Maria! This is Mike's Plumbing. Sorry we missed your call. How can we help?", sent_at: hoursAgo(3.68) },
    { role: 'user', content: "I have a burst pipe in my garage! There's water everywhere!", sent_at: hoursAgo(3.5) },
    { role: 'assistant', content: "Oh no! First, please locate your main water shut-off valve and turn it off to stop the water flow. It's usually near your water meter. We can dispatch an emergency technician right away.", sent_at: hoursAgo(3.48) },
    { role: 'user', content: 'Ok I found it and turned it off. How soon can someone get here?', sent_at: hoursAgo(3.3) },
    { role: 'assistant', content: "Great job shutting off the water! I've booked an emergency visit for you. Our technician Marco will be there within the hour. Your address is on file — is that correct?", sent_at: hoursAgo(3.28) },
    { role: 'user', content: 'Yes that is correct. Thank you so much!', sent_at: hoursAgo(2) },
  ],
  conv_004: [
    { role: 'system', content: 'Missed call from David Park (+1 818-555-7890) at 9:30 AM', sent_at: hoursAgo(4.9) },
    { role: 'assistant', content: "Hi David! Mike's Plumbing here. Sorry we missed your call — what can we help you with?", sent_at: hoursAgo(4.88) },
    { role: 'user', content: 'I noticed a wet spot on my ceiling below the upstairs bathroom. I think there might be a leaking pipe.', sent_at: hoursAgo(4.5) },
    { role: 'assistant', content: "That does sound like it could be a pipe leak behind the wall or under the floor. We should inspect that before it causes more damage. Can you describe the size of the wet spot?", sent_at: hoursAgo(4.48) },
    { role: 'user', content: "It's about the size of a dinner plate and it seems to be getting bigger slowly.", sent_at: hoursAgo(3.5) },
    { role: 'assistant', content: "I'd recommend we come out soon before it worsens. We have availability this afternoon between 2-4 PM or tomorrow morning. Which would you prefer?", sent_at: hoursAgo(3) },
  ],
  conv_005: [
    { role: 'system', content: 'Missed call from Lisa Nguyen (+1 323-555-2222) at 1:00 PM', sent_at: daysAgo(1, 13) },
    { role: 'assistant', content: "Hi Lisa! This is Mike's Plumbing. Sorry we missed your call today. How can we help?", sent_at: daysAgo(1, 13) },
    { role: 'user', content: "I'd like to get a new kitchen faucet installed. I already bought the faucet.", sent_at: daysAgo(1, 13.5) },
    { role: 'assistant', content: "Great! We'd be happy to install it for you. Our fixture installation fee is $175. When would be a good time?", sent_at: daysAgo(1, 14) },
    { role: 'user', content: 'How about Friday morning?', sent_at: daysAgo(1, 14.5) },
    { role: 'assistant', content: "Friday morning works! I've booked you for 10 AM - 12 PM on Friday, April 10th. Our technician will give you a call 30 minutes before arrival. See you then!", sent_at: daysAgo(1, 15) },
  ],
  conv_006: [
    { role: 'system', content: 'Missed call from Robert Taylor (+1 424-555-3333) at 10:00 AM', sent_at: daysAgo(1, 10) },
    { role: 'assistant', content: "Hi Robert! Mike's Plumbing here. Sorry we couldn't pick up. What do you need help with?", sent_at: daysAgo(1, 10) },
    { role: 'user', content: 'Just wanted to say thanks — your guy did a great job on the drain last week. All good now!', sent_at: daysAgo(1, 11) },
    { role: 'assistant', content: "That's wonderful to hear, Robert! We're glad everything is working well. Don't hesitate to call if you ever need anything. Have a great day!", sent_at: daysAgo(1, 12) },
  ],
  conv_007: [
    { role: 'system', content: 'Missed call from Jennifer Adams (+1 310-555-4444) at 9:00 AM', sent_at: daysAgo(2, 9) },
    { role: 'assistant', content: "Hi Jennifer! This is Mike's Plumbing. Sorry we missed your call. How can we assist you?", sent_at: daysAgo(2, 9) },
    { role: 'user', content: "We've been having sewage backups in our basement. It's happened twice this month.", sent_at: daysAgo(2, 9.3) },
    { role: 'assistant', content: "That's definitely something we need to address right away. Recurring backups usually indicate a main sewer line issue. We can do a camera inspection to identify the problem. Would you like to schedule that?", sent_at: daysAgo(2, 9.5) },
    { role: 'user', content: 'Yes please. What does that cost?', sent_at: daysAgo(2, 9.8) },
    { role: 'assistant', content: "Our sewer camera inspection is $199, and if any work is needed, that fee gets applied to the repair cost. I've booked you for Thursday at 8 AM. We'll get to the bottom of this!", sent_at: daysAgo(2, 10) },
  ],
  conv_008: [
    { role: 'system', content: 'Missed call from Carlos Ramirez (+1 818-555-5555) at 2:00 PM', sent_at: daysAgo(2, 14) },
    { role: 'assistant', content: "Hi Carlos! Mike's Plumbing here. Sorry we missed you. What can we do for you?", sent_at: daysAgo(2, 14) },
    { role: 'user', content: "My tankless water heater is showing an error code. It says E1.", sent_at: daysAgo(2, 14.5) },
    { role: 'assistant', content: "An E1 error typically indicates an ignition failure. This could be a gas supply issue or a faulty igniter. We specialize in tankless water heater repair. Want us to come take a look?", sent_at: daysAgo(2, 15) },
    { role: 'user', content: "Actually I just checked and the gas valve was turned off accidentally. It's working now. Sorry to bother you!", sent_at: daysAgo(2, 15.5) },
    { role: 'assistant', content: "No bother at all! Glad it was a simple fix. Feel free to reach out anytime if you need help in the future. Have a great day!", sent_at: daysAgo(2, 16) },
  ],
};

export const appointments = [
  { id: 'apt_001', conversationId: 'conv_003', customerName: 'Maria Lopez', customerPhone: '+13105553456', service: 'Emergency Plumbing', date: '2026-04-08', timeSlot: '11:00 - 12:00', status: 'in_progress', technician: 'Marco Reyes', notes: 'Burst pipe in garage. Customer shut off main water valve.', estimatedCost: 350 },
  { id: 'apt_002', conversationId: 'conv_001', customerName: 'Sarah Chen', customerPhone: '+13105559821', service: 'Drain Cleaning', date: '2026-04-09', timeSlot: '09:00 - 11:00', status: 'confirmed', technician: 'Mike Rodriguez', notes: 'Slow kitchen sink drain. Possible buildup.', estimatedCost: 149 },
  { id: 'apt_003', conversationId: 'conv_007', customerName: 'Jennifer Adams', customerPhone: '+13105554444', service: 'Sewer Line Service', date: '2026-04-09', timeSlot: '08:00 - 10:00', status: 'confirmed', technician: 'Marco Reyes', notes: 'Recurring sewage backups. Camera inspection needed.', estimatedCost: 199 },
  { id: 'apt_004', conversationId: 'conv_005', customerName: 'Lisa Nguyen', customerPhone: '+13235552222', service: 'Fixture Installation', date: '2026-04-10', timeSlot: '10:00 - 12:00', status: 'confirmed', technician: 'Mike Rodriguez', notes: 'Customer has faucet already. Kitchen faucet install.', estimatedCost: 175 },
  { id: 'apt_005', conversationId: null, customerName: 'Patricia Brown', customerPhone: '+13235557777', service: 'Water Heater Repair', date: '2026-04-11', timeSlot: '13:00 - 15:00', status: 'pending', technician: 'Unassigned', notes: 'Annual water heater maintenance and flush.', estimatedCost: 129 },
  { id: 'apt_006', conversationId: null, customerName: 'Angela Foster', customerPhone: '+13105559999', service: 'Pipe Repair', date: '2026-04-13', timeSlot: '09:00 - 11:00', status: 'pending', technician: 'Unassigned', notes: 'Leaking pipe under bathroom sink.', estimatedCost: 225 },
  { id: 'apt_007', conversationId: 'conv_004', customerName: 'David Park', customerPhone: '+18185557890', service: 'Pipe Repair', date: '2026-04-08', timeSlot: '14:00 - 16:00', status: 'confirmed', technician: 'Marco Reyes', notes: 'Ceiling water spot — possible hidden pipe leak.', estimatedCost: 275 },
];

export const dashboardStats = {
  totalMissedCalls: 47,
  responseRate: 92,
  bookingRate: 64,
  revenueRecovered: 12850,
  callsToday: 5,
  conversationsActive: 3,
  appointmentsThisWeek: 7,
};

export const weeklyData = [
  { day: 'Mon', missedCalls: 8, responses: 7, bookings: 4 },
  { day: 'Tue', missedCalls: 6, responses: 6, bookings: 3 },
  { day: 'Wed', missedCalls: 9, responses: 8, bookings: 6 },
  { day: 'Thu', missedCalls: 5, responses: 5, bookings: 3 },
  { day: 'Fri', missedCalls: 7, responses: 7, bookings: 5 },
  { day: 'Sat', missedCalls: 4, responses: 3, bookings: 2 },
  { day: 'Sun', missedCalls: 3, responses: 2, bookings: 1 },
];

export const hourlyData = [
  { hour: '6am', calls: 2 },
  { hour: '7am', calls: 5 },
  { hour: '8am', calls: 12 },
  { hour: '9am', calls: 18 },
  { hour: '10am', calls: 15 },
  { hour: '11am', calls: 11 },
  { hour: '12pm', calls: 8 },
  { hour: '1pm', calls: 13 },
  { hour: '2pm', calls: 16 },
  { hour: '3pm', calls: 14 },
  { hour: '4pm', calls: 10 },
  { hour: '5pm', calls: 7 },
  { hour: '6pm', calls: 4 },
  { hour: '7pm', calls: 2 },
];
