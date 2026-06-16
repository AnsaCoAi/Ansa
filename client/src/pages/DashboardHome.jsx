import { useEffect, useState } from 'react';
import { Phone, MessageCircle, CalendarCheck, DollarSign, ArrowUpRight, ChevronRight, MessageSquare, Calendar, AlertTriangle, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
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

function hoursAgo(ts) {
  return (Date.now() - new Date(ts).getTime()) / 3600000;
}

function formatPhone(p) {
  const d = p.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return p;
}

function formatMoney(n) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `$${n}`;
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

function OnboardingChecklist({ business, convs }) {
  const steps = [
    {
      done: !!business?.twilio_number,
      label: 'Your Ansa number is provisioned',
      sub: business?.twilio_number ? `Forward missed calls to ${formatPhone(business.twilio_number)}` : 'Number not yet assigned — contact support',
    },
    {
      done: !!(business?.services?.length > 0),
      label: 'Add your services & pricing',
      sub: 'Lets the AI answer cost questions and give real estimates',
      link: '#/dashboard/settings',
    },
    {
      done: !!(business?.business_hours),
      label: 'Set your business hours',
      sub: 'AI will know when you\'re available to take bookings',
      link: '#/dashboard/settings',
    },
    {
      done: convs.length > 0,
      label: 'Receive your first missed call',
      sub: business?.twilio_number
        ? `Test it: call ${formatPhone(business.twilio_number)} and hang up`
        : 'Once your number is ready, call it and hang up to test',
    },
  ];

  const doneCount = steps.filter(s => s.done).length;
  if (doneCount === steps.length) return null;

  return (
    <div style={{ background: '#141414', border: '1px solid #1e1e1e', borderRadius: 12, padding: 24, marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 2 }}>Get started with Ansa</div>
          <div style={{ fontSize: 13, color: '#555' }}>{doneCount} of {steps.length} steps complete</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ width: 28, height: 4, borderRadius: 2, background: s.done ? '#3b82f6' : '#2a2a2a', transition: 'background .3s' }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: step.done ? 'rgba(34,197,94,0.04)' : '#1a1a1a', borderRadius: 8, border: `1px solid ${step.done ? 'rgba(34,197,94,0.15)' : '#222'}` }}>
            {step.done
              ? <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0 }} />
              : <Circle size={18} color="#333" style={{ flexShrink: 0 }} />
            }
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: step.done ? '#666' : '#fff', textDecoration: step.done ? 'line-through' : 'none' }}>{step.label}</div>
              {!step.done && <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{step.sub}</div>}
            </div>
            {step.link && !step.done && (
              <a href={step.link} style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                Go <ExternalLink size={12} />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertBanner({ staleConvs }) {
  if (!staleConvs.length) return null;
  const count = staleConvs.length;
  const oldest = staleConvs.reduce((a, b) => new Date(a.updated_at) < new Date(b.updated_at) ? a : b);
  const hrs = Math.floor(hoursAgo(oldest.updated_at || oldest.created_at));

  return (
    <div
      onClick={() => window.location.hash = '#/dashboard/conversations'}
      style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, cursor: 'pointer', transition: 'background .2s' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.12)'}
      onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,158,11,0.08)'}
    >
      <AlertTriangle size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
          {count === 1 ? '1 customer' : `${count} customers`} waiting {hrs}+ hour{hrs !== 1 ? 's' : ''} for a reply
        </span>
        <span style={{ fontSize: 13, color: '#888', marginLeft: 8 }}>Tap to review conversations →</span>
      </div>
    </div>
  );
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
  const avgJobValue = business?.avg_job_value || 400;
  const revenueRecovered = bookedCount * avgJobValue;
  const weeklyData = buildWeeklyData(convs);
  const recentConvs = [...convs].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).slice(0, 5);

  const staleActiveConvs = convs.filter(c => c.status === 'active' && hoursAgo(c.updated_at || c.created_at) >= 2);

  const isNewUser = convs.length === 0 || (business?.created_at && (Date.now() - new Date(business.created_at).getTime()) < 7 * 24 * 3600000);

  const statCards = [
    { icon: Phone, color: '#3b82f6', value: stats?.callsToday ?? 0, label: 'Missed Calls Today' },
    { icon: MessageCircle, color: '#8b5cf6', value: totalCalls > 0 ? `${responseRate}%` : '—', label: 'Response Rate' },
    { icon: CalendarCheck, color: '#22c55e', value: totalCalls > 0 ? `${bookingRate}%` : '—', label: 'Booking Rate' },
    { icon: DollarSign, color: '#f59e0b', value: loading ? '—' : formatMoney(revenueRecovered), label: 'Revenue Recovered', sub: bookedCount > 0 ? `${bookedCount} job${bookedCount !== 1 ? 's' : ''} booked` : null },
  ];

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: '#fff', margin: 0 }}>{getGreeting()}, {ownerFirst}</h1>
      <p style={{ fontSize: 15, color: '#888', marginTop: 4, marginBottom: 28 }}>Here's what happened while you were on the job.</p>

      {isNewUser && <OnboardingChecklist business={business} convs={convs} />}

      <AlertBanner staleConvs={staleActiveConvs} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {statCards.map(({ icon: Icon, color, value, label, sub }) => (
          <div key={label} style={{ background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}18`, flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{loading ? '—' : value}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{label}</div>
              {sub && <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>{sub}</div>}
              {!sub && (
                <div style={{ fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 2, marginTop: 4, color: '#22c55e' }}>
                  <ArrowUpRight size={14} /> Live
                </div>
              )}
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
          <div style={{ padding: '32px 24px', textAlign: 'center', background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e' }}>
            <Phone size={28} color="#333" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: '#555', marginBottom: 6 }}>No calls yet</div>
            {business?.twilio_number ? (
              <div style={{ fontSize: 13, color: '#444', lineHeight: 1.6 }}>
                Forward your business number to{' '}
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>{formatPhone(business.twilio_number)}</span>
                {' '}— then call that number and hang up to test Ansa.
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#444' }}>Calls will appear here as they come in.</div>
            )}
          </div>
        ) : recentConvs.map(conv => {
          const cfg = statusColors[conv.status] || statusColors.closed;
          const displayName = conv.customer_name || formatPhone(conv.customer_phone);
          const isPhone = !conv.customer_name;
          const isStale = conv.status === 'active' && hoursAgo(conv.updated_at || conv.created_at) >= 2;
          return (
            <div key={conv.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#141414', borderRadius: 10, border: `1px solid ${isStale ? 'rgba(245,158,11,0.3)' : '#1e1e1e'}`, marginBottom: 8, cursor: 'pointer', transition: 'background .15s' }}
              onClick={() => window.location.hash = `#/dashboard/conversations/${conv.id}`}
              onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
              onMouseLeave={e => e.currentTarget.style.background = '#141414'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Phone size={15} color="#555" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{displayName}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>
                    {isPhone ? '' : <span style={{ color: '#444' }}>{formatPhone(conv.customer_phone)} · </span>}
                    {timeAgo(conv.updated_at || conv.created_at)}
                    {isStale && <span style={{ color: '#f59e0b', marginLeft: 6, fontWeight: 600 }}>· Waiting</span>}
                  </div>
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

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          { icon: Phone, label: 'View All Calls', hash: '#/dashboard/calls', badge: null },
          { icon: MessageSquare, label: 'Active Conversations', hash: '#/dashboard/conversations', badge: activeCount || null },
          { icon: Calendar, label: 'Appointments', hash: '#/dashboard/appointments', badge: null },
        ].map(({ icon: Icon, label, hash, badge }) => (
          <button key={label} onClick={() => window.location.hash = hash}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: '#141414', border: '1px solid #1e1e1e', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'border-color .15s' }}
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
