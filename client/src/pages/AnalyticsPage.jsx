import { useState, useEffect, useMemo } from 'react';
import { Phone, MessageCircle, CalendarCheck, DollarSign } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const timeRanges = ['7 days', '30 days', '90 days'];

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

function filterByRange(convs, range) {
  const now = new Date();
  const days = range === '30 days' ? 30 : range === '90 days' ? 90 : 7;
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return convs.filter(c => new Date(c.created_at) >= cutoff);
}

function filterPriorPeriod(convs, range) {
  const now = new Date();
  const days = range === '30 days' ? 30 : range === '90 days' ? 90 : 7;
  const periodEnd = new Date(now);
  periodEnd.setDate(now.getDate() - days);
  periodEnd.setHours(0, 0, 0, 0);
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodEnd.getDate() - days);
  return convs.filter(c => { const t = new Date(c.created_at); return t >= periodStart && t < periodEnd; });
}

function trendBadge(current, prior) {
  if (prior === 0 && current === 0) return null;
  if (prior === 0) return { label: 'New', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' };
  const pct = Math.round(((current - prior) / prior) * 100);
  if (pct === 0) return null;
  const up = pct > 0;
  return { label: `${up ? '+' : ''}${pct}%`, color: up ? '#22c55e' : '#ef4444', bg: up ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' };
}

function buildChartData(convs, range) {
  const days = range === '30 days' ? 30 : range === '90 days' ? 90 : 7;
  const now = new Date();
  const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MON_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  if (days <= 7) {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const dayConvs = convs.filter(c => { const t = new Date(c.created_at); return t >= d && t < next; });
      return {
        label: DAY_NAMES[d.getDay()],
        missedCalls: dayConvs.length,
        responses: dayConvs.filter(c => (c.messages || []).length > 0).length,
        bookings: dayConvs.filter(c => c.status === 'booked').length,
      };
    });
  }

  // 30 or 90 days: group by week
  const weeks = days === 30 ? 4 : 13;
  return Array.from({ length: weeks }, (_, i) => {
    const end = new Date(now);
    end.setDate(now.getDate() - i * 7);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(end.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    const wConvs = convs.filter(c => { const t = new Date(c.created_at); return t >= start && t <= end; });
    const label = `${MON_NAMES[start.getMonth()]} ${start.getDate()}`;
    return {
      label,
      missedCalls: wConvs.length,
      responses: wConvs.filter(c => (c.messages || []).length > 0).length,
      bookings: wConvs.filter(c => c.status === 'booked').length,
    };
  }).reverse();
}

function buildHourlyData(convs) {
  const counts = Array(24).fill(0);
  convs.forEach(c => { counts[new Date(c.created_at).getHours()]++; });
  // Only show hours that have any data, defaulting to 6am–9pm range minimum
  return counts.map((v, h) => {
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? 'am' : 'pm';
    return { hour: `${hour12}${ampm}`, calls: v };
  }).filter((_, h) => h >= 6 && h <= 21);
}

const styles = {
  page:         { padding: '32px', maxWidth: 1200, margin: '0 auto' },
  header:       { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  rangeToggle:  { display: 'flex', gap: 4, background: '#141414', borderRadius: 8, padding: 3 },
  rangeBtn:     (active) => ({ padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: active ? '#3b82f6' : 'transparent', color: active ? '#fff' : '#888' }),
  statsRow:     { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 },
  statCard:     { background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 },
  iconCircle:   (color) => ({ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, flexShrink: 0 }),
  statValue:    { fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1 },
  statLabel:    { fontSize: 12, color: '#888', marginTop: 2 },
  chartCard:    { background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: 24, marginBottom: 20 },
  chartTitle:   { fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 },
  chartsGrid:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 },
  funnelSection:{ background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: 24, marginBottom: 20 },
  funnelRow:    { marginBottom: 16 },
  funnelLabel:  { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  funnelName:   { fontSize: 14, color: '#ddd', fontWeight: 500 },
  funnelValue:  { fontSize: 14, color: '#888' },
  funnelBarOuter: { width: '100%', height: 28, background: '#1a1a1a', borderRadius: 8, overflow: 'hidden' },
  funnelBarInner: (pct, color) => ({ height: '100%', width: `${pct}%`, background: color, borderRadius: 8, transition: 'width 0.6s ease' }),
};

export default function AnalyticsPage() {
  const { business } = useAuth();
  const [range, setRange] = useState('7 days');
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!business?.id) return;
    api.getConversations(business.id)
      .then(c => { setConvs(c || []); setLoadError(false); })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [business?.id]);

  const rangeConvs = useMemo(() => filterByRange(convs, range), [convs, range]);
  const priorConvs = useMemo(() => filterPriorPeriod(convs, range), [convs, range]);

  const totalCalls  = rangeConvs.length;
  const bookedCount = rangeConvs.filter(c => c.status === 'booked').length;
  const responded   = rangeConvs.filter(c => (c.messages || []).some(m => m.role === 'user')).length;
  const responseRate = totalCalls > 0 ? Math.round((responded / totalCalls) * 100) : 0;
  const bookingRate  = totalCalls > 0 ? Math.round((bookedCount / totalCalls) * 100) : 0;
  const avgJobValue  = business?.avg_job_value || 400;
  const revenueRecovered = bookedCount * avgJobValue;

  const priorTotal    = priorConvs.length;
  const priorBooked   = priorConvs.filter(c => c.status === 'booked').length;
  const priorResponded = priorConvs.filter(c => (c.messages || []).some(m => m.role === 'user')).length;
  const priorResponseRate = priorTotal > 0 ? Math.round((priorResponded / priorTotal) * 100) : 0;
  const priorBookingRate  = priorTotal > 0 ? Math.round((priorBooked / priorTotal) * 100) : 0;
  const priorRevenue = priorBooked * avgJobValue;

  const chartData  = useMemo(() => buildChartData(rangeConvs, range), [rangeConvs, range]);
  const hourlyData = useMemo(() => buildHourlyData(rangeConvs), [rangeConvs]);

  const funnelData = [
    { label: 'Missed Calls',     value: rangeConvs.length, color: '#3b82f6' },
    { label: 'AI Replied',       value: rangeConvs.filter(c => (c.messages || []).length > 0).length, color: '#8b5cf6' },
    { label: 'Customer Replied', value: rangeConvs.filter(c => (c.messages || []).some(m => m.role === 'user')).length, color: '#f59e0b' },
    { label: 'Booked',           value: bookedCount, color: '#22c55e' },
  ];
  const maxFunnel = funnelData[0].value || 1;

  const chartLabel = range === '7 days' ? 'Last 7 Days' : range === '30 days' ? 'Last 30 Days' : 'Last 90 Days';

  return (
    <div style={styles.page}>
      {loadError && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 18px', marginBottom: 20, fontSize: 13, color: '#fca5a5' }}>
          Unable to load analytics data. Check your connection and refresh.
        </div>
      )}
      <div style={styles.header}>
        <div style={styles.rangeToggle}>
          {timeRanges.map(r => (
            <button key={r} style={styles.rangeBtn(range === r)} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      <div style={styles.statsRow}>
        {[
          { icon: Phone,        color: '#3b82f6', value: loading ? '—' : totalCalls,                                            label: 'Missed Calls',      trend: trendBadge(totalCalls, priorTotal) },
          { icon: MessageCircle,color: '#8b5cf6', value: loading ? '—' : (totalCalls > 0 ? `${responseRate}%` : '—'),           label: 'Response Rate',     trend: trendBadge(responseRate, priorResponseRate) },
          { icon: CalendarCheck,color: '#22c55e', value: loading ? '—' : (totalCalls > 0 ? `${bookingRate}%` : '—'),            label: 'Booking Rate',      trend: trendBadge(bookingRate, priorBookingRate) },
          { icon: DollarSign,   color: '#f59e0b', value: loading ? '—' : `$${revenueRecovered >= 1000 ? (revenueRecovered/1000).toFixed(1)+'k' : revenueRecovered}`, label: 'Revenue Recovered', trend: trendBadge(revenueRecovered, priorRevenue) },
        ].map(({ icon: Icon, color, value, label, trend }) => (
          <div key={label} style={styles.statCard}>
            <div style={styles.iconCircle(color)}><Icon size={18} color={color} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={styles.statValue}>{value}</div>
                {!loading && trend && (
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 20, color: trend.color, background: trend.bg }}>{trend.label}</span>
                )}
              </div>
              <div style={styles.statLabel}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.chartCard}>
        <div style={styles.chartTitle}>Calls vs Responses vs Bookings — {chartLabel}</div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="aGradCalls" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
              <linearGradient id="aGradResp"  x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
              <linearGradient id="aGradBook"  x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="100%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="label" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
            <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="missedCalls" name="Missed Calls" stroke="#3b82f6" fill="url(#aGradCalls)" strokeWidth={2} />
            <Area type="monotone" dataKey="responses"   name="Responses"   stroke="#8b5cf6" fill="url(#aGradResp)"  strokeWidth={2} />
            <Area type="monotone" dataKey="bookings"    name="Bookings"    stroke="#22c55e" fill="url(#aGradBook)"  strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Bookings by Day</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="label" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="bookings" name="Bookings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Calls by Hour of Day</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" />
              <XAxis dataKey="hour" stroke="#888" tick={{ fill: '#888', fontSize: 11 }} />
              <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="calls" name="Calls" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={styles.funnelSection}>
        <div style={styles.chartTitle}>Conversion Funnel — {chartLabel}</div>
        {funnelData.map((step, i) => (
          <div key={step.label} style={styles.funnelRow}>
            <div style={styles.funnelLabel}>
              <span style={styles.funnelName}>{step.label}</span>
              <span style={styles.funnelValue}>
                {step.value}
                {i > 0 && funnelData[i-1].value > 0 && (
                  <span style={{ color: '#555', marginLeft: 8, fontSize: 12 }}>
                    ({Math.round((step.value / funnelData[i-1].value) * 100)}%)
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
