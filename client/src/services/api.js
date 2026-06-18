const BASE_URL = import.meta.env.VITE_API_URL || 'https://ansa-production.up.railway.app';

async function get(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function patch(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function del(path) {
  const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getStats: (businessId) => get(`/api/stats?businessId=${businessId}`),
  getConversations: (businessId) => get(`/api/conversations?businessId=${businessId}`),
  getConversation: (id) => get(`/api/conversations/${id}`),
  getAppointments: (businessId) => get(`/api/appointments?businessId=${businessId}`),
  getBusiness: (id) => get(`/api/businesses/${id}`),
  updateBusiness: (id, data) => patch(`/api/businesses/${id}`, data),
  updateConversation: (id, data) => patch(`/api/conversations/${id}`, data),
  updateAppointment: (id, data) => patch(`/api/appointments/${id}`, data),
  sendMessage: (conversationId, message) => post(`/api/conversations/${conversationId}/send`, { message }),
  deleteConversation: (id) => del(`/api/conversations/${id}`),
  getConversationAppointment: (conversationId) => get(`/api/conversations/${conversationId}/appointment`),
  cancelAppointmentWithNotify: (id, notifyCustomer, cancellationMessage) =>
    patch(`/api/appointments/${id}`, { status: 'cancelled', notify_customer: notifyCustomer, cancellation_message: cancellationMessage }),
};
