import { useEffect, useState } from 'react';
import { Phone, MessageCircle, CalendarCheck, DollarSign, ArrowUpRight, ChevronRight, MessageSquare, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatPhone(p) {
  const d = p.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return p;
}

const statusColors = {
  active: { label: 'Active', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  booked: { label: 'Booked', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  closed: { label: 'Closed', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ color: '#888', fontSize: 12, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => <div key={i} style={{ color: p.color, fontSize: 13, fontWeight: 500 }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

function buildWeeklyData(convs) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
      responses: dayConvs.filter(c => c.status !== 'closed' || (c.messages || []).length > 0).length,
      bookings: dayConvs.filter(c => c.status === 'booked').length,
    };
  });
}

export default function DashboardHome() {
  const { business } = useAuth();
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

  const ownerFirst = business?.owner_name?.split(' ')[0] || 'there';
  const activeCount = convs.filter(c => c.status === 'active').length;
  const bookedCount = convs.filter(c => c.status === 'booked').length;
  const totalCalls = stats?.totalCalls ?? convs.length;
  const bookingRate = totalCalls > 0 ? Math.round((bookedCount / totalCalls) * 100) : 0;
  const responseRate = stats?.responseRate ?? 0;
  const weeklyData = buildWeeklyData(convs);
  const recentConvs = [...convs].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).slice(0, 5);

  const statCards = [
    { icon: Phone, color: '#3b82f6', value: stats?.callsToday ?? 0, label: 'Missed Calls Today' },
    { icon: MessageCircle, color: '#8b5cf6', value: `${responseRate}%`, label: 'Response Rate' },
    { icon: CalendarCheck, color: '#22c55e', value: `${bookingRate}%`, label: 'Booking Rate' },
    { icon: DollarSign, color: '#f59e0b', value: `${bookedCount}`, label: 'Jobs Booked' },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>{getGreeting()}, {ownerFirst}</h1>
      <p style={{ fontSize: 15, color: '#888', marginTop: 4, marginBottom: 32 }}>Here's what happened while you were on the job.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map(({ icon: Icon, color, value, label }) => (
          <div key={label} style={{ background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{loading ? '—' : value}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2, marginTop: 4, color: '#22c55e' }}>
                <ArrowUpRight size={14} /> Live data
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: 24, marginBottom: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>This Week's Activity</div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={weeklyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="gCalls" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="100%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
              <linearGradient id="gResp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="100%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
              <linearGradient id="gBook" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="100%" stopColor="#22c55e" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="day" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
            <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="missedCalls" name="Missed Calls" stroke="#3b82f6" fill="url(#gCalls)" strokeWidth={2} />
            <Area type="monotone" dataKey="responses" name="Responses" stroke="#8b5cf6" fill="url(#gResp)" strokeWidth={2} />
            <Area type="monotone" dataKey="bookings" name="Bookings" stroke="#22c55e" fill="url(#gBook)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Recent Activity</div>
        {recentConvs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#555', fontSize: 14, background: '#141414', borderRadius: 10, border: '1px solid #1e1e1e' }}>
            No activity yet — calls will appear here as they come in.
          </div>
        ) : recentConvs.map(conv => {
          const cfg = statusColors[conv.status] || statusColors.closed;
          return (
            <div key={conv.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#141414', borderRadius: 10, border: '1px solid #1e1e1e', marginBottom: 8, cursor: 'pointer' }}
              onClick={() => window.location.hash = `#/dashboard/conversations/${conv.id}`}
              onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
              onMouseLeave={e => e.currentTarget.style.background = '#141414'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <Phone size={16} color="#666" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{formatPhone(conv.customer_phone)}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{timeAgo(conv.updated_at || conv.created_at)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                <ChevronRight size={16} color="#444" />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {[
          { icon: Phone, label: 'View All Calls', hash: '#/dashboard/calls', badge: null },
          { icon: MessageSquare, label: 'Active Conversations', hash: '#/dashboard/conversations', badge: activeCount || null },
          { icon: Calendar, label: 'Appointments', hash: '#/dashboard/appointments', badge: null },
        ].map(({ icon: Icon, label, hash, badge }) => (
          <button key={label} onClick={() => window.location.hash = hash}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: '#141414', border: '1px solid #1e1e1e', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}>
            <Icon size={16} /> {label}
            {badge !== null && badge > 0 && <span style={{ background: '#3b82f6', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, marginLeft: 4 }}>{badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
