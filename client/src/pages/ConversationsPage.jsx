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

export default function ConversationsPage() {
  const { business } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!business?.id) return;
    api.getConversations(business.id)
      .then(data => setConversations(data || []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
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

  return (
    <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, marginBottom: 24 }}>Conversations</h1>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#141414', borderRadius: 10, padding: 4, width: 'fit-content' }}>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#666', fontSize: 14 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#666', fontSize: 14 }}>No conversations found.</div>
        ) : filtered.map(conv => {
          const sc = statusColors[conv.status] || statusColors.closed;
          return (
            <div key={conv.id}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', cursor: 'pointer' }}
              onClick={() => window.location.hash = `#/dashboard/conversations/${conv.id}`}
              onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#2a2a2a'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#141414'; e.currentTarget.style.borderColor = '#1e1e1e'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={18} color="#888" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>{formatPhone(conv.customer_phone)}</span>
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
