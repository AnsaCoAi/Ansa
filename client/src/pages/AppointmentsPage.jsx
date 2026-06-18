import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Clock, User, Tag, Eye, XCircle, CheckCircle, AlertTriangle, CalendarCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  return phone;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function isUpcoming(apt) {
  return (apt.status === 'confirmed' || apt.status === 'pending') && new Date(apt.scheduled_at) >= new Date();
}

function isPast(apt) {
  return apt.status === 'completed' || (new Date(apt.scheduled_at) < new Date() && apt.status !== 'cancelled');
}

const statusConfig = {
  confirmed: { label: 'Scheduled', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  pending:   { label: 'Pending',   color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  completed: { label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

const filterTabs = ['Upcoming', 'Past', 'Cancelled'];

const styles = {
  page:         { padding: '32px', maxWidth: 1200, margin: '0 auto' },
  filters:      { display: 'flex', gap: 6, marginBottom: 24 },
  filterBtn:    (active) => ({ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid', background: active ? '#3b82f6' : 'transparent', borderColor: active ? '#3b82f6' : '#333', color: active ? '#fff' : '#aaa' }),
  grid:         { display: 'flex', flexDirection: 'column', gap: 10 },
  card:         { background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: '20px 24px', transition: 'all 0.15s' },
  cardTop:      { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  cardLeft:     { display: 'flex', alignItems: 'center', gap: 14 },
  avatar:       { width: 44, height: 44, borderRadius: '50%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  customerName: { fontSize: 15, fontWeight: 600, color: '#fff' },
  customerPhone:{ fontSize: 12, color: '#666', marginTop: 2 },
  badge:        (status) => { const c = statusConfig[status] || statusConfig.confirmed; return { display: 'inline-block', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, color: c.color, background: c.bg }; },
  cardBody:     { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 14 },
  detail:       { display: 'flex', alignItems: 'center', gap: 8 },
  detailLabel:  { fontSize: 12, color: '#666' },
  detailValue:  { fontSize: 13, color: '#ccc', fontWeight: 500 },
  actions:      { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  actionBtn:    (primary) => ({ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: primary ? 'rgba(59,130,246,0.15)' : 'transparent', border: primary ? '1px solid rgba(59,130,246,0.3)' : '1px solid #333', color: primary ? '#3b82f6' : '#888' }),
  empty:        { padding: 60, textAlign: 'center', color: '#666', fontSize: 14 },
  confirmBox:   { marginTop: 12, padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  confirmText:  { fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 6 },
  confirmBtns:  { display: 'flex', gap: 8 },
};

export default function AppointmentsPage() {
  const { business } = useAuth();
  const [filter, setFilter] = useState('Upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelStep, setCancelStep] = useState('confirm'); // 'confirm' | 'notify'
  const [cancelMsg, setCancelMsg] = useState('');

  const startCancel = (apt) => {
    const dt = new Date(apt.scheduled_at);
    const dateStr = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    setCancelMsg(`Hi ${apt.customer_name || 'there'} — we need to cancel your appointment scheduled for ${dateStr} at ${timeStr}. We apologize for the inconvenience. Please call or text us to reschedule.`);
    setCancelTarget(apt.id);
    setCancelStep('confirm');
  };

  const cancelAppointment = async (notify, message) => {
    setCancelling(true);
    try {
      await api.cancelAppointmentWithNotify(cancelTarget, notify, message);
      setAppointments(prev => prev.map(a => a.id === cancelTarget ? { ...a, status: 'cancelled' } : a));
      setCancelTarget(null);
      setCancelStep('confirm');
    } catch (_) {
      alert('Failed to cancel appointment. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const confirmAppointment = async (id) => {
    try {
      await api.updateAppointment(id, { status: 'confirmed' });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    } catch (_) {
      alert('Failed to confirm appointment. Please try again.');
    }
  };

  useEffect(() => {
    if (!business?.id) return;
    api.getAppointments(business.id)
      .then(data => setAppointments(data || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [business?.id]);

  const filtered = useMemo(() => {
    if (filter === 'Upcoming')  return appointments.filter(isUpcoming);
    if (filter === 'Past')      return appointments.filter(isPast);
    if (filter === 'Cancelled') return appointments.filter(a => a.status === 'cancelled');
    return appointments;
  }, [filter, appointments]);

  return (
    <div style={styles.page}>
      <div style={styles.filters}>
        {filterTabs.map(f => (
          <button key={f} style={styles.filterBtn(filter === f)} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      <div style={styles.grid}>
        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ ...styles.empty, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <CalendarCheck size={32} color="#333" />
            <div style={{ fontSize: 15, fontWeight: 600, color: '#555' }}>
              {filter === 'Upcoming' ? 'No upcoming appointments' : filter === 'Past' ? 'No past appointments' : 'No cancelled appointments'}
            </div>
            <div style={{ fontSize: 13, color: '#444' }}>
              {filter === 'Upcoming' ? 'Appointments booked by Ansa will appear here.' : 'Switch to Upcoming to see scheduled jobs.'}
            </div>
          </div>
        ) : filtered.map(apt => (
          <div key={apt.id} style={styles.card}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; }}>
            <div style={styles.cardTop}>
              <div style={styles.cardLeft}>
                <div style={styles.avatar}><User size={18} color="#888" /></div>
                <div>
                  <div style={styles.customerName}>{apt.customer_name || formatPhone(apt.customer_phone)}</div>
                  <div style={styles.customerPhone}>{formatPhone(apt.customer_phone)}</div>
                </div>
              </div>
              <span style={styles.badge(apt.status)}>{(statusConfig[apt.status] || statusConfig.confirmed).label}</span>
            </div>

            <div style={styles.cardBody}>
              <div style={styles.detail}>
                <Tag size={14} color="#3b82f6" />
                <div>
                  <div style={styles.detailLabel}>Service</div>
                  <div style={styles.detailValue}>{apt.service_description || '—'}</div>
                </div>
              </div>
              <div style={styles.detail}>
                <Calendar size={14} color="#22c55e" />
                <div>
                  <div style={styles.detailLabel}>Date</div>
                  <div style={styles.detailValue}>{formatDate(apt.scheduled_at)}</div>
                </div>
              </div>
              <div style={styles.detail}>
                <Clock size={14} color="#f59e0b" />
                <div>
                  <div style={styles.detailLabel}>Time</div>
                  <div style={styles.detailValue}>{formatTime(apt.scheduled_at)}</div>
                </div>
              </div>
            </div>

            <div style={styles.actions}>
              <button
                disabled={!apt.conversation_id}
                style={{ ...styles.actionBtn(!!apt.conversation_id), opacity: apt.conversation_id ? 1 : 0.4, cursor: apt.conversation_id ? 'pointer' : 'not-allowed' }}
                onClick={() => { if (apt.conversation_id) window.location.hash = `#/dashboard/conversations/${apt.conversation_id}`; }}
                title={apt.conversation_id ? 'View conversation' : 'No conversation linked'}>
                <Eye size={13} /> View Details
              </button>
              {apt.status === 'pending' && (
                <button style={{ ...styles.actionBtn(true), background: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.3)', color: '#22c55e' }} onClick={() => confirmAppointment(apt.id)}>
                  <CheckCircle size={13} /> Confirm
                </button>
              )}
              {(apt.status === 'confirmed' || apt.status === 'pending') && cancelTarget !== apt.id && (
                <button style={styles.actionBtn(false)} onClick={() => startCancel(apt)}>
                  <XCircle size={13} /> Cancel
                </button>
              )}
            </div>

            {cancelTarget === apt.id && cancelStep === 'confirm' && (
              <div style={styles.confirmBox}>
                <div style={styles.confirmText}>
                  <AlertTriangle size={14} /> Cancel this appointment?
                </div>
                <div style={styles.confirmBtns}>
                  <button style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid #333', color: '#888' }}
                    onClick={() => setCancelTarget(null)}>Keep</button>
                  <button style={{ padding: '5px 14px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
                    onClick={() => setCancelStep('notify')}>
                    Yes, Cancel
                  </button>
                </div>
              </div>
            )}
            {cancelTarget === apt.id && cancelStep === 'notify' && (
              <div style={{ marginTop: 12, padding: '16px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 10 }}>Notify the customer?</div>
                <textarea
                  value={cancelMsg}
                  onChange={e => setCancelMsg(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '8px 12px', background: '#141414', border: '1px solid #333', borderRadius: 8, color: '#ccc', fontSize: 12, lineHeight: 1.5, resize: 'vertical', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button style={{ padding: '6px 16px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent', border: '1px solid #333', color: '#888' }}
                    onClick={() => cancelAppointment(false, '')} disabled={cancelling}>
                    {cancelling ? '...' : 'Skip — Don\'t Notify'}
                  </button>
                  <button style={{ padding: '6px 16px', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: cancelling ? 'not-allowed' : 'pointer', background: '#3b82f6', border: 'none', color: '#fff' }}
                    onClick={() => cancelAppointment(true, cancelMsg)} disabled={cancelling}>
                    {cancelling ? 'Sending...' : 'Send & Cancel'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
