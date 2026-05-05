import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Bot, User, Phone, Calendar, Clock, Tag, XCircle, Zap } from 'lucide-react';
import { api } from '../services/api';

function formatPhone(p) {
  const d = p.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return p;
}

function formatTime(ts) { return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
function formatDate(ts) { return new Date(ts).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); }

const statusColors = {
  active: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  booked: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  closed: { color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

export default function ConversationDetail() {
  const convId = window.location.hash.split('/').pop();
  const [conv, setConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiMode, setAiMode] = useState(true);
  const [inputVal, setInputVal] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    api.getConversation(convId)
      .then(data => setConv(data))
      .catch(() => setConv(null))
      .finally(() => setLoading(false));
  }, [convId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conv?.messages]);

  const handleSend = () => {
    if (!inputVal.trim() || aiMode) return;
    setConv(c => ({ ...c, messages: [...(c.messages || []), { role: 'assistant', content: inputVal, created_at: new Date().toISOString() }] }));
    setInputVal('');
  };

  if (loading) return <div style={{ padding: '24px 32px', color: '#666' }}>Loading...</div>;

  if (!conv) return (
    <div style={{ padding: '24px 32px' }}>
      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 16 }}
        onClick={() => window.location.hash = '#/dashboard/conversations'}>
        <ArrowLeft size={16} /> Back to Conversations
      </button>
      <div style={{ padding: 60, textAlign: 'center', color: '#666' }}>Conversation not found.</div>
    </div>
  );

  const msgs = conv.messages || [];
  const sc = statusColors[conv.status] || statusColors.closed;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1300, margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 16, fontWeight: 500 }}
        onClick={() => window.location.hash = '#/dashboard/conversations'}>
        <ArrowLeft size={16} /> Back to Conversations
      </button>

      <div style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
        {/* Chat Panel */}
        <div style={{ flex: 7, display: 'flex', flexDirection: 'column', background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: aiMode ? 'rgba(59,130,246,0.08)' : 'rgba(245,158,11,0.08)', borderBottom: '1px solid #1e1e1e' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: aiMode ? '#3b82f6' : '#f59e0b', fontWeight: 500 }}>
              {aiMode ? <><Bot size={15} /> AI is handling this conversation</> : <><User size={15} /> You took over this conversation</>}
            </span>
            <button onClick={() => setAiMode(!aiMode)}
              style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid', background: aiMode ? 'transparent' : '#f59e0b', borderColor: aiMode ? '#3b82f6' : '#f59e0b', color: aiMode ? '#3b82f6' : '#000' }}>
              {aiMode ? 'Take Over' : 'Let AI Handle'}
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {msgs.map((msg, i) => {
              if (msg.role === 'system') return <div key={i} style={{ textAlign: 'center', fontSize: 12, color: '#555', padding: '8px 0' }}>{msg.content}</div>;
              const isUser = msg.role === 'user';
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: isUser ? 'flex-start' : 'flex-end' }}>
                    <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: 14, fontSize: 14, lineHeight: 1.5, background: isUser ? '#222' : '#1a365d', color: '#e5e5e5', borderBottomLeftRadius: isUser ? 4 : 14, borderBottomRightRadius: isUser ? 14 : 4 }}>
                      {msg.content}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 4, textAlign: isUser ? 'left' : 'right' }}>{formatTime(msg.created_at)}</div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderTop: '1px solid #1e1e1e', background: '#111' }}>
            <input
              style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 16px', color: '#fff', fontSize: 14, outline: 'none' }}
              placeholder={aiMode ? 'Take over to send a message...' : 'Type a message...'}
              value={inputVal} onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              disabled={aiMode}
            />
            <button onClick={handleSend} disabled={aiMode}
              style={{ width: 40, height: 40, borderRadius: 10, background: '#3b82f6', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: aiMode ? 0.4 : 1 }}>
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Info Panel */}
        <div style={{ flex: 3, background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: 24, overflowY: 'auto' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Caller Info</div>
          {[
            { icon: Phone, label: 'Phone', value: formatPhone(conv.customer_phone) },
            { icon: Clock, label: 'First Contact', value: `${formatDate(conv.created_at)} at ${formatTime(conv.created_at)}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Icon size={16} color="#888" />
              <div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, color: '#ddd', fontWeight: 500 }}>{value}</div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Zap size={16} color="#888" />
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Status</div>
              <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, color: sc.color, background: sc.bg, textTransform: 'capitalize' }}>{conv.status}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e1e1e', margin: '20px 0' }} />

          {conv.status !== 'closed' && (
            <button onClick={() => {}}
              style={{ display: 'block', width: '100%', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#aaa', border: '1px solid #333' }}>
              <XCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Mark as Closed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
