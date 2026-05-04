import React, { useState, useMemo } from 'react';
import { Calendar, Clock, Phone, User, Tag, FileText, List, CalendarDays, MoreVertical, Eye, XCircle } from 'lucide-react';
import { appointments } from '../data/mockData';

function formatPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function isUpcoming(apt) {
  return (apt.status === 'confirmed' || apt.status === 'pending' || apt.status === 'in_progress') && new Date(apt.date) >= new Date(new Date().toDateString());
}

function isPast(apt) {
  return apt.status === 'completed' || (new Date(apt.date) < new Date(new Date().toDateString()) && apt.status !== 'cancelled');
}

const statusConfig = {
  confirmed: { label: 'Scheduled', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  in_progress: { label: 'In Progress', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  completed: { label: 'Completed', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  scheduled: { label: 'Scheduled', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
};

const filterTabs = ['Upcoming', 'Past', 'Cancelled'];

const styles = {
  page: { padding: '32px', maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 },
  viewToggle: { display: 'flex', gap: 4, background: '#141414', borderRadius: 8, padding: 3 },
  viewBtn: (active) => ({
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 6,
    fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
    background: active ? '#222' : 'transparent', color: active ? '#fff' : '#666',
  }),
  filters: { display: 'flex', gap: 6, marginBottom: 24 },
  filterBtn: (active) => ({
    padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', border: '1px solid',
    background: active ? '#3b82f6' : 'transparent',
    borderColor: active ? '#3b82f6' : '#333',
    color: active ? '#fff' : '#aaa',
  }),
  grid: { display: 'flex', flexDirection: 'column', gap: 10 },
  card: {
    background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e',
    padding: '20px 24px', transition: 'all 0.15s',
  },
  cardTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  cardLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  avatar: {
    width: 44, height: 44, borderRadius: '50%', background: '#1e1e1e',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  customerName: { fontSize: 15, fontWeight: 600, color: '#fff' },
  customerPhone: { fontSize: 12, color: '#666', marginTop: 2 },
  badge: (status) => {
    const c = statusConfig[status] || statusConfig.confirmed;
    return {
      display: 'inline-block', fontSize: 12, fontWeight: 600, padding: '4px 12px',
      borderRadius: 20, color: c.color, background: c.bg,
    };
  },
  cardBody: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 14 },
  detail: { display: 'flex', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 12, color: '#666' },
  detailValue: { fontSize: 13, color: '#ccc', fontWeight: 500 },
  notes: { fontSize: 13, color: '#888', lineHeight: 1.5, paddingTop: 12, borderTop: '1px solid #1e1e1e', marginBottom: 12 },
  actions: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  actionBtn: (primary) => ({
    display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    background: primary ? 'rgba(59,130,246,0.15)' : 'transparent',
    border: primary ? '1px solid rgba(59,130,246,0.3)' : '1px solid #333',
    color: primary ? '#3b82f6' : '#888',
  }),
  empty: { padding: 60, textAlign: 'center', color: '#666', fontSize: 14 },
};

export default function AppointmentsPage() {
  const [filter, setFilter] = useState('Upcoming');
  const [view, setView] = useState('list');

  const filtered = useMemo(() => {
    if (filter === 'Upcoming') return appointments.filter(isUpcoming);
    if (filter === 'Past') return appointments.filter(isPast);
    if (filter === 'Cancelled') return appointments.filter(a => a.status === 'cancelled');
    return appointments;
  }, [filter]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Appointments</h1>
        <div style={styles.viewToggle}>
          <button style={styles.viewBtn(view === 'list')} onClick={() => setView('list')}>
            <List size={15} /> List
          </button>
          <button style={styles.viewBtn(view === 'calendar')} onClick={() => setView('calendar')}>
            <CalendarDays size={15} /> Calendar
          </button>
        </div>
      </div>

      <div style={styles.filters}>
        {filterTabs.map(f => (
          <button key={f} style={styles.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      <div style={styles.grid}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>No appointments found.</div>
        ) : (
          filtered.map(apt => (
            <div
              key={apt.id}
              style={styles.card}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; }}
            >
              <div style={styles.cardTop}>
                <div style={styles.cardLeft}>
                  <div style={styles.avatar}>
                    <User size={18} color="#888" />
                  </div>
                  <div>
                    <div style={styles.customerName}>{apt.customerName}</div>
                    <div style={styles.customerPhone}>{formatPhone(apt.customerPhone)}</div>
                  </div>
                </div>
                <span style={styles.badge(apt.status)}>{(statusConfig[apt.status] || statusConfig.confirmed).label}</span>
              </div>

              <div style={styles.cardBody}>
                <div style={styles.detail}>
                  <Tag size={14} color="#3b82f6" />
                  <div>
                    <div style={styles.detailLabel}>Service</div>
                    <div style={styles.detailValue}>{apt.service}</div>
                  </div>
                </div>
                <div style={styles.detail}>
                  <Calendar size={14} color="#22c55e" />
                  <div>
                    <div style={styles.detailLabel}>Date</div>
                    <div style={styles.detailValue}>{formatDate(apt.date)}</div>
                  </div>
                </div>
                <div style={styles.detail}>
                  <Clock size={14} color="#f59e0b" />
                  <div>
                    <div style={styles.detailLabel}>Time</div>
                    <div style={styles.detailValue}>{apt.timeSlot}</div>
                  </div>
                </div>
              </div>

              {apt.notes && (
                <div style={styles.notes}>
                  <FileText size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} color="#555" />
                  {apt.notes}
                </div>
              )}

              <div style={styles.actions}>
                <button style={styles.actionBtn(true)} onClick={() => { if (apt.conversationId) window.location.hash = `#/dashboard/conversations/${apt.conversationId}`; }}>
                  <Eye size={13} /> View Details
                </button>
                {(apt.status === 'confirmed' || apt.status === 'pending') && (
                  <button style={styles.actionBtn(false)} onClick={() => {}}>
                    <XCircle size={13} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
