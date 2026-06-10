import React, { useState, useMemo, useEffect } from 'react';
import { MessageSquare, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

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
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const tabs = [
  { key: 'all', label: 'All', dot: null },
  { key: 'active', label: 'Active', dot: '#3b82f6' },
  { key: 'booked', label: 'Booked', dot: '#22c55e' },
  { key: 'closed', label: 'Closed', dot: '#6b7280' },
];

const statusColors = {
  active: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  booked: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  closed: { color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

const cache = { data: null, bizId: null };

function getViewed() {
  try { return JSON.parse(localStorage.getItem('ansa_viewed') || '{}'); } catch { return {}; }
}
function markViewed(id) {
  const v = getViewed(); v[id] = Date.now(); localStorage.setItem('ansa_viewed', JSON.stringify(v));
}
function isUnread(conv) {
  const viewed = getViewed();
  if (!viewed[conv.id]) return true;
  return new Date(conv.updated_at).getTime() > viewed[conv.id];
}

export default function ConversationsPage() {
  const { business } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [conversations, setConversations] = useState(cache.bizId === business?.id ? cache.data || [] : []);
  const [loading, setLoading] = useState(cache.bizId !== business?.id);

  useEffect(() => {
    if (!business?.id) return;
    const load = () => api.getConversations(business.id)
      .then(data => { cache.data = data || []; cache.bizId = business.id; setConversations(data || []); })
      .catch(() => {});
    load().finally(() => setLoading(false));
    const poll = setInterval(load, 5000);
    return () => clearInterval(poll);
  }, [business?.id]);

  const filtered = useMemo(
    () => activeTab === 'all' ? conversations : conversations.filter(c => c.status === activeTab),
    [activeTab, conversations]
  );

  const getLastMessage = (conv) => {
    const msgs = conv.messages;
    if (!msgs || msgs.length === 0) return 'No messages yet';
    return msgs[msgs.length - 1].content;
  };

  const getMsgCount = (conv) => {
    return (conv.messages || []).filter(m => m.role !== 'system').length;
  };

  const getTimestamp = (conv) => conv.updated_at || conv.created_at;

  const unread = conversations.filter(isUnread);

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      <style>{`
        .conv-row { background: #141414; border: 1px solid #1e1e1e; transition: background 0.15s; }
        .conv-row:hover { background: #1a1a1a !important; border-color: #2a2a2a !important; }
        .conv-row.conv-unread { border-color: #3b82f6 !important; }
        .conv-row.conv-unread:hover { border-color: #3b82f6 !important; }
      `}</style>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, marginBottom: 24 }}>Conversations</h1>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 4, background: '#141414', borderRadius: 10, padding: 4 }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', background: activeTab === tab.key ? '#222' : 'transparent', color: activeTab === tab.key ? '#fff' : '#888', border: 'none' }}>
            {tab.dot && <span style={{ width: 8, height: 8, borderRadius: '50%', background: tab.dot }} />}
            {tab.label}
            <span style={{ color: '#555', fontSize: 12, marginLeft: 2 }}>
              ({tab.key === 'all' ? conversations.length : conversations.filter(c => c.status === tab.key).length})
            </span>
          </button>
        ))}
        </div>
        <button
          onClick={unread.length > 0 ? () => { markViewed(unread[0].id); window.location.hash = `#/dashboard/conversations/${unread[0].id}`; } : undefined}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: unread.length > 0 ? '#3b82f6' : '#1a1a1a', border: `1px solid ${unread.length > 0 ? '#3b82f6' : '#2a2a2a'}`, borderRadius: 8, color: unread.length > 0 ? '#fff' : '#555', fontSize: 13, fontWeight: 600, cursor: unread.length > 0 ? 'pointer' : 'default' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: unread.length > 0 ? '#fff' : '#444' }} />
          {unread.length > 0 ? `${unread.length} unread — open latest` : 'All caught up'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#666', fontSize: 14 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#666', fontSize: 14 }}>No conversations found.</div>
        ) : filtered.map(conv => {
          const sc = statusColors[conv.status] || statusColors.closed;
          return (
            <div key={conv.id}
              className={`conv-row${isUnread(conv) ? ' conv-unread' : ''}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderRadius: 12, cursor: 'pointer' }}
              onClick={() => { markViewed(conv.id); window.location.hash = `#/dashboard/conversations/${conv.id}`; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={18} color="#888" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {isUnread(conv) && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', flexShrink: 0 }} />}
                    <span style={{ fontSize: 15, fontWeight: 600, color: isUnread(conv) ? '#fff' : '#ccc' }}>{formatPhone(conv.customer_phone)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 500 }}>{getLastMessage(conv)}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20, color: sc.color, background: sc.bg, textTransform: 'capitalize' }}>{conv.status}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={12} /> {getMsgCount(conv)} msgs</span>
                    <span style={{ fontSize: 12, color: '#555' }}><Clock size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />{timeAgo(getTimestamp(conv))}</span>
                  </div>
                </div>
                <ChevronRight size={18} color="#444" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
