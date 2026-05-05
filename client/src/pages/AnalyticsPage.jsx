import { useState, useEffect } from 'react';
import { Phone, MessageCircle, CalendarCheck, TrendingUp } from 'lucide-react';
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

function buildWeeklyData(convs) {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const next = new Date(d); next.setDate(d.getDate() + 1);
    const dayConvs = convs.filter(c => {
      const t = new Date(c.created_at);
      return t >= d && t < next;
    });
    return {
      day: days[d.getDay()],
      missedCalls: dayConvs.length,
      responses: dayConvs.filter(c => (c.messages || []).length > 0).length,
      bookings: dayConvs.filter(c => c.status === 'booked').length,
    };
  });
}

function buildHourlyData(convs) {
  const counts = Array(24).fill(0);
  convs.forEach(c => { counts[new Date(c.created_at).getHours()]++; });
  return counts
    .map((v, h) => ({ hour: h % 12 === 0 ? '12' + (h < 12 ? 'am' : 'pm') : (h % 12) + (h < 12 ? 'am' : 'pm'), calls: v }))
    .filter((_, h) => h >= 7 && h <= 20);
}

const styles = {
  page: { padding: '32px', maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  title: { fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 },
  rangeToggle: { display: 'flex', gap: 4, background: '#141414', borderRadius: 8, padding: 3 },
  rangeBtn: (active) => ({ padding: '7px 14px', borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: active ? '#3b82f6' : 'transparent', color: active ? '#fff' : '#888' }),
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 },
  statCard: { background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 },
  iconCircle: (color) => ({ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, flexShrink: 0 }),
  statValue: { fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1 },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  chartCard: { background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: 24, marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 },
  chartsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 },
  funnelSection: { background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: 24, marginBottom: 20 },
  funnelRow: { marginBottom: 16 },
  funnelLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  funnelName: { fontSize: 14, color: '#ddd', fontWeight: 500 },
  funnelValue: { fontSize: 14, color: '#888' },
  funnelBarOuter: { width: '100%', height: 28, background: '#1a1a1a', borderRadius: 8, overflow: 'hidden' },
  funnelBarInner: (pct, color) => ({ height: '100%', width: `${pct}%`, background: color, borderRadius: 8, transition: 'width 0.6s ease' }),
};

export default function AnalyticsPage() {
  const { business } = useAuth();
  const [range, setRange] = useState('7 days');
  const [stats, setStats] = useState(null);
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business?.id) return;
    Promise.all([
      api.getStats(business.id),
      api.getConversations(business.id),
    ]).then(([s, c]) => {
      setStats(s);
      setConvs(c || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [business?.id]);

  const multiplier = range === '30 days' ? 4 : range === '90 days' ? 12 : 1;
  const totalCalls = Math.round((stats?.totalCalls ?? 0) * multiplier);
  const bookedCount = convs.filter(c => c.status === 'booked').length;
  const responseRate = stats?.responseRate ?? 0;
  const bookingRate = stats?.bookingRate ?? 0;

  const weeklyData = buildWeeklyData(convs);
  const hourlyData = buildHourlyData(convs);

  const funnelData = [
    { label: 'Missed Calls', value: convs.length, color: '#3b82f6' },
    { label: 'SMS Sent', value: convs.filter(c => (c.messages || []).length > 0).length, color: '#8b5cf6' },
    { label: 'Customer Replied', value: convs.filter(c => (c.messages || []).some(m => m.role === 'user')).length, color: '#f59e0b' },
    { label: 'Booked', value: bookedCount, color: '#22c55e' },
  ];
  const maxFunnel = funnelData[0].value || 1;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Analytics</h1>
        <div style={styles.rangeToggle}>
          {timeRanges.map(r => (
            <button key={r} style={styles.rangeBtn(range === r)} onClick={() => setRange(r)}>{r}</button>
          ))}
        </div>
      </div>

      <div style={styles.statsRow}>
        {[
          { icon: Phone, color: '#3b82f6', value: loading ? '—' : totalCalls, label: 'Total Calls' },
          { icon: MessageCircle, color: '#8b5cf6', value: loading ? '—' : `${responseRate}%`, label: 'Response Rate' },
          { icon: CalendarCheck, color: '#22c55e', value: loading ? '—' : `${bookingRate}%`, label: 'Booking Rate' },
          { icon: TrendingUp, color: '#f59e0b', value: loading ? '—' : bookedCount, label: 'Jobs Booked' },
        ].map(({ icon: Icon, color, value, label }) => (
          <div key={label} style={styles.statCard}>
            <div style={styles.iconCircle(color)}><Icon size={18} color={color} /></div>
            <div>
              <div style={styles.statValue}>{value}</div>
              <div style={styles.statLabel}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.chartCard}>
        <div style={styles.chartTitle}>Calls vs Responses vs Bookings (Last 7 Days)</div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="aGradCalls" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
              <linearGradient id="aGradResp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
              <linearGradient id="aGradBook" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="100%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="day" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
            <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} allowDecimals={false} />
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
        <div style={styles.chartTitle}>Conversion Funnel</div>
        {funnelData.map((step, i) => (
          <div key={step.label} style={styles.funnelRow}>
            <div style={styles.funnelLabel}>
              <span style={styles.funnelName}>{step.label}</span>
              <span style={styles.funnelValue}>
                {step.value}
                {i > 0 && funnelData[i-1].value > 0 && (
                  <span style={{ color: '#555', marginLeft: 8, fontSize: 12 }}>
                    ({Math.round((step.value / funnelData[i-1].value) * 100)}% of prev)
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
