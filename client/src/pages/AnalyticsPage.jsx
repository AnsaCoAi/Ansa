import React, { useState, useMemo } from 'react';
import { Phone, MessageCircle, CalendarCheck, DollarSign, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { dashboardStats, weeklyData, hourlyData } from '../data/mockData';

const timeRanges = ['7 days', '30 days', '90 days'];

const funnelData = [
  { label: 'Missed Calls', value: 47, color: '#3b82f6' },
  { label: 'SMS Sent', value: 43, color: '#8b5cf6' },
  { label: 'Replied', value: 34, color: '#f59e0b' },
  { label: 'Booked', value: 22, color: '#22c55e' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.fill, fontSize: 13, fontWeight: 500 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const styles = {
  page: { padding: '32px', maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 },
  rangeToggle: { display: 'flex', gap: 4, background: '#141414', borderRadius: 8, padding: 3 },
  rangeBtn: (active) => ({
    padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', border: 'none',
    background: active ? '#3b82f6' : 'transparent', color: active ? '#fff' : '#888',
  }),
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 },
  statCard: {
    background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e',
    padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14,
  },
  iconCircle: (color) => ({
    width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: `${color}18`, flexShrink: 0,
  }),
  statValue: { fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1 },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  chartCard: {
    background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e',
    padding: 24, marginBottom: 20,
  },
  chartTitle: { fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 },
  funnelSection: {
    background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e',
    padding: 24, marginBottom: 20,
  },
  funnelRow: { marginBottom: 16 },
  funnelLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  funnelName: { fontSize: 14, color: '#ddd', fontWeight: 500 },
  funnelValue: { fontSize: 14, color: '#888' },
  funnelBarOuter: { width: '100%', height: 28, background: '#1a1a1a', borderRadius: 8, overflow: 'hidden' },
  funnelBarInner: (pct, color) => ({
    height: '100%', width: `${pct}%`, background: color, borderRadius: 8,
    transition: 'width 0.6s ease',
  }),
};

export default function AnalyticsPage() {
  const [range, setRange] = useState('7 days');

  const multiplier = range === '30 days' ? 4.2 : range === '90 days' ? 12.5 : 1;
  const scaledStats = {
    totalCalls: Math.round(dashboardStats.totalMissedCalls * multiplier),
    responseRate: dashboardStats.responseRate,
    bookingRate: dashboardStats.bookingRate,
    revenue: Math.round(dashboardStats.revenueRecovered * multiplier),
  };

  const maxFunnel = funnelData[0].value;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Analytics</h1>
        <div style={styles.rangeToggle}>
          {timeRanges.map(r => (
            <button key={r} style={styles.rangeBtn(range === r)} onClick={() => setRange(r)}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.statsRow}>
        <div style={styles.statCard}>
          <div style={styles.iconCircle('#3b82f6')}><Phone size={18} color="#3b82f6" /></div>
          <div>
            <div style={styles.statValue}>{scaledStats.totalCalls}</div>
            <div style={styles.statLabel}>Total Calls</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.iconCircle('#8b5cf6')}><MessageCircle size={18} color="#8b5cf6" /></div>
          <div>
            <div style={styles.statValue}>{scaledStats.responseRate}%</div>
            <div style={styles.statLabel}>Response Rate</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.iconCircle('#22c55e')}><CalendarCheck size={18} color="#22c55e" /></div>
          <div>
            <div style={styles.statValue}>{scaledStats.bookingRate}%</div>
            <div style={styles.statLabel}>Booking Rate</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.iconCircle('#f59e0b')}><DollarSign size={18} color="#f59e0b" /></div>
          <div>
            <div style={styles.statValue}>${scaledStats.revenue.toLocaleString()}</div>
            <div style={styles.statLabel}>Revenue Recovered</div>
          </div>
        </div>
      </div>

      <div style={styles.chartCard}>
        <div style={styles.chartTitle}>Calls vs Responses vs Bookings</div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="aGradCalls" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aGradResp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="aGradBook" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="day" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
            <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="missedCalls" name="Missed Calls" stroke="#3b82f6" fill="url(#aGradCalls)" strokeWidth={2} />
            <Area type="monotone" dataKey="responses" name="Responses" stroke="#8b5cf6" fill="url(#aGradResp)" strokeWidth={2} />
            <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#22c55e" fill="url(#aGradBook)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Bookings by Day of Week</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="day" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="bookings" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Top Performing Hours</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="hour" stroke="#888" tick={{ fill: '#888', fontSize: 11 }} />
              <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calls" name="Calls" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.funnelSection}>
        <div style={styles.chartTitle}>Conversion Funnel</div>
        {funnelData.map((step, i) => (
          <div key={step.label} style={styles.funnelRow}>
            <div style={styles.funnelLabel}>
              <span style={styles.funnelName}>{step.label}</span>
              <span style={styles.funnelValue}>
                {step.value}
                {i > 0 && (
                  <span style={{ color: '#555', marginLeft: 8, fontSize: 12 }}>
                    ({Math.round((step.value / funnelData[i - 1].value) * 100)}% of prev)
                  </span>
                )}
              </span>
            </div>
            <div style={styles.funnelBarOuter}>
              <div style={styles.funnelBarInner((step.value / maxFunnel) * 100, step.color)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
