import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Bot, User, Phone, Calendar, Clock, Tag, CheckCircle, XCircle, Zap } from 'lucide-react';
import { conversations, messages as allMessages, appointments } from '../data/mockData';

function formatPhone(p) {
  const d = p.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return p;
}

function formatTime(ts) { return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
function formatDate(ts) { return new Date(ts).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); }

const statusColors = {
  active: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', label: 'Active' },
  booked: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', label: 'Booked' },
  closed: { color: '#6b7280', bg: 'rgba(107,114,128,0.15)', label: 'Closed' },
};

export default function ConversationDetail() {
  const hash = window.location.hash;
  const convId = hash.split('/').pop();
  const conv = conversations.find(c => c.id === convId);
  const msgs = allMessages[convId] || [];
  const apt = appointments.find(a => a.conversationId === convId);
  const [aiMode, setAiMode] = useState(true);
  const [inputVal, setInputVal] = useState('');
  const [localMsgs, setLocalMsgs] = useState(msgs);
  const bottomRef = useRef(null);

  useEffect(() => { setLocalMsgs(allMessages[convId] || []); }, [convId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [localMsgs]);

  if (!conv) return (
    <div style={{ padding: '24px 32px' }}>
      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 16 }}
        onClick={() => window.location.hash = '#/dashboard/conversations'}>
        <ArrowLeft size={16} /> Back to Conversations
      </button>
      <div style={{ padding: 60, textAlign: 'center', color: '#666' }}>Conversation not found.</div>
    </div>
  );

  const handleSend = () => {
    if (!inputVal.trim()) return;
    setLocalMsgs([...localMsgs, { role: 'assistant', content: inputVal, sent_at: new Date().toISOString() }]);
    setInputVal('');
  };

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
            {localMsgs.map((msg, i) => {
              if (msg.role === 'system') return <div key={i} style={{ textAlign: 'center', fontSize: 12, color: '#555', padding: '8px 0' }}>{msg.content}</div>;
              const isUser = msg.role === 'user';
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: isUser ? 'flex-start' : 'flex-end' }}>
                    <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: 14, fontSize: 14, lineHeight: 1.5, background: isUser ? '#222' : '#1a365d', color: '#e5e5e5', borderBottomLeftRadius: isUser ? 4 : 14, borderBottomRightRadius: isUser ? 14 : 4 }}>
                      {msg.content}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 4, textAlign: isUser ? 'left' : 'right' }}>{formatTime(msg.sent_at)}</div>
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
            { icon: User, label: 'Name', value: conv.callerName },
            { icon: Phone, label: 'Phone', value: formatPhone(conv.callerPhone) },
            { icon: Clock, label: 'First Contact', value: `${formatDate(conv.startedAt)} at ${formatTime(conv.startedAt)}` },
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
              <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, color: sc.color, background: sc.bg }}>{conv.status}</span>
            </div>
          </div>
          {conv.service && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Tag size={16} color="#888" />
              <div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Service Requested</div>
                <div style={{ fontSize: 14, color: '#ddd', fontWeight: 500 }}>{conv.service}</div>
              </div>
            </div>
          )}

          <div style={{ borderTop: '1px solid #1e1e1e', margin: '20px 0' }} />

          {apt ? (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Appointment</div>
              <div style={{ background: '#1a1a1a', borderRadius: 10, padding: 16, border: '1px solid #222' }}>
                {[
                  { icon: Calendar, label: 'Date', value: new Date(apt.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }) },
                  { icon: Clock, label: 'Time', value: apt.timeSlot },
                  { icon: Tag, label: 'Service', value: apt.service },
                  { icon: User, label: 'Technician', value: apt.technician },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Icon size={14} color="#3b82f6" />
                    <span style={{ fontSize: 12, color: '#666' }}>{label}:</span>
                    <span style={{ fontSize: 13, color: '#ccc' }}>{value}</span>
                  </div>
                ))}
                {apt.estimatedCost && <div style={{ fontSize: 12, color: '#666', marginLeft: 22 }}>Est. Cost: ${apt.estimatedCost}</div>}
              </div>
            </>
          ) : (
            <button onClick={() => {}}
              style={{ display: 'block', width: '100%', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: '#3b82f6', color: '#fff', border: 'none', marginBottom: 8 }}>
              <Calendar size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Book Appointment
            </button>
          )}
          {conv.status !== 'closed' && (
            <button onClick={() => {}}
              style={{ display: 'block', width: '100%', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#aaa', border: '1px solid #333', marginTop: 8 }}>
              <XCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Mark as Closed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
