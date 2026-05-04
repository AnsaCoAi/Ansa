import React, { useState, useMemo } from 'react';
import { Phone, Search, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { missedCalls } from '../data/mockData';

function formatPhone(p) {
  const d = p.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return p;
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

const statusConfig = {
  responded: { label: 'SMS Sent', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  booked: { label: 'Booked', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  no_response: { label: 'No Response', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

const dateFilters = ['Today', 'Yesterday', 'This Week', 'This Month', 'All'];

export default function MissedCallsPage() {
  const [dateFilter, setDateFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = useMemo(() => {
    let calls = [...missedCalls];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateFilter === 'Today') calls = calls.filter(c => new Date(c.timestamp) >= startOfToday);
    else if (dateFilter === 'Yesterday') {
      const y = new Date(startOfToday); y.setDate(y.getDate() - 1);
      calls = calls.filter(c => { const d = new Date(c.timestamp); return d >= y && d < startOfToday; });
    } else if (dateFilter === 'This Week') {
      const sw = new Date(startOfToday); sw.setDate(sw.getDate() - sw.getDay());
      calls = calls.filter(c => new Date(c.timestamp) >= sw);
    } else if (dateFilter === 'This Month') {
      calls = calls.filter(c => new Date(c.timestamp) >= new Date(now.getFullYear(), now.getMonth(), 1));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      calls = calls.filter(c => c.callerName?.toLowerCase().includes(q) || c.callerPhone?.includes(q) || formatPhone(c.callerPhone).includes(q));
    }
    return calls;
  }, [dateFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const cols = { gridTemplateColumns: '1.5fr 1fr 0.7fr 1fr 0.8fr' };

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0 }}>Missed Calls</h1>
      <p style={{ fontSize: 14, color: '#888', marginTop: 4, marginBottom: 28 }}>Track and manage incoming missed calls</p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {dateFilters.map(f => (
            <button key={f} onClick={() => { setDateFilter(f); setPage(1); }}
              style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid', fontSize: 13, fontWeight: 500, cursor: 'pointer', background: dateFilter === f ? '#3b82f6' : 'transparent', borderColor: dateFilter === f ? '#3b82f6' : '#333', color: dateFilter === f ? '#fff' : '#aaa' }}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#141414', border: '1px solid #1e1e1e', borderRadius: 8, padding: '8px 14px', minWidth: 240 }}>
          <Search size={15} color="#666" />
          <input style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13, flex: 1 }} placeholder="Search calls..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div style={{ display: 'grid', ...cols, padding: '8px 20px', marginBottom: 6 }}>
        {['Caller','Time','Duration','Status','Action'].map(h => (
          <span key={h} style={{ fontSize: 12, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</span>
        ))}
      </div>

      {paged.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>No missed calls found for this filter.</div>
      ) : paged.map(call => {
        const cfg = statusConfig[call.status] || statusConfig.no_response;
        return (
          <div key={call.id} style={{ display: 'grid', ...cols, alignItems: 'center', padding: '14px 20px', background: '#141414', borderRadius: 10, border: '1px solid #1e1e1e', marginBottom: 6 }}
            onMouseEnter={e => e.currentTarget.style.background = '#1a1a1a'}
            onMouseLeave={e => e.currentTarget.style.background = '#141414'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Phone size={15} color="#888" /></div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{call.callerName !== 'Unknown' ? call.callerName : 'Unknown Caller'}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{formatPhone(call.callerPhone)}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#aaa' }}>{timeAgo(call.timestamp)}</div>
            <div style={{ fontSize: 13, color: '#aaa' }}>{call.duration}s</div>
            <div><span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, color: cfg.color, background: cfg.bg }}>{cfg.label}</span></div>
            <div>
              {call.conversationId ? (
                <button style={{ fontSize: 13, color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, background: 'none', border: 'none' }}
                  onClick={() => window.location.hash = `#/dashboard/conversations/${call.conversationId}`}>
                  View <ExternalLink size={13} />
                </button>
              ) : <span style={{ fontSize: 13, color: '#555' }}>No conversation</span>}
            </div>
          </div>
        );
      })}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24, color: '#888', fontSize: 13 }}>
        <button onClick={() => page > 1 && setPage(page - 1)} disabled={page <= 1}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: '1px solid #333', background: 'transparent', color: page <= 1 ? '#444' : '#aaa', cursor: page <= 1 ? 'default' : 'pointer' }}>
          <ChevronLeft size={16} />
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => page < totalPages && setPage(page + 1)} disabled={page >= totalPages}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: '1px solid #333', background: 'transparent', color: page >= totalPages ? '#444' : '#aaa', cursor: page >= totalPages ? 'default' : 'pointer' }}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
