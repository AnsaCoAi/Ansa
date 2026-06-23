import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Bot, User, Phone, Clock, Tag, XCircle, Zap, MapPin, AlertTriangle, Trash2, CalendarCheck } from 'lucide-react';
import { api } from '../services/api';
import supabase from '../services/supabase';

function formatPhone(p) {
  const d = p.replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return p;
}

function formatTime(ts) { return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
function formatDate(ts) { return new Date(ts).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }); }

const statusConfig = {
  active: { label: 'AI Active',  color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  booked: { label: 'Booked',     color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  closed: { label: 'Closed',     color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
};

export default function ConversationDetail() {
  const convId = window.location.hash.split('/').pop();
  const [conv, setConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiMode, setAiMode] = useState(true);
  const [togglingMode, setTogglingMode] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [sendError, setSendError] = useState('');
  const [closing, setClosing] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showLeaveWarning, setShowLeaveWarning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [linkedAppointment, setLinkedAppointment] = useState(null);
  const bottomRef = useRef(null);
  const chatRef = useRef(null);

  const handleBack = () => {
    if (!aiMode) { setShowLeaveWarning(true); return; }
    window.location.hash = '#/dashboard/conversations';
  };

  useEffect(() => {
    try { const v = JSON.parse(localStorage.getItem('ansa_viewed') || '{}'); v[convId] = Date.now(); localStorage.setItem('ansa_viewed', JSON.stringify(v)); } catch {}
    api.getConversation(convId)
      .then(data => { setConv(data); if (data?.manual_mode) setAiMode(false); })
      .catch(() => setConv(null))
      .finally(() => setLoading(false));

    const channel = supabase
      .channel(`messages:${convId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
        (payload) => { setConv(c => c ? { ...c, messages: [...(c.messages || []), payload.new] } : c); }
      )
      .subscribe();

    api.getConversationAppointment(convId).then(apt => setLinkedAppointment(apt)).catch(() => {});

    const poll = setInterval(() => {
      api.getConversation(convId).then(data => setConv(data)).catch(() => {});
    }, 3000);

    return () => { supabase.removeChannel(channel); clearInterval(poll); };
  }, [convId]);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (nearBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages]);

  const handleToggleMode = async () => {
    const next = !aiMode;
    setTogglingMode(true);
    try {
      await api.updateConversation(convId, { manual_mode: !next });
      setAiMode(next);
    } catch (_) {
      // revert on failure — UI stays at current state
    } finally {
      setTogglingMode(false);
    }
  };

  const handleSend = async () => {
    if (!inputVal.trim() || aiMode) return;
    const msg = inputVal;
    setInputVal('');
    setSendError('');
    const optimistic = { role: 'assistant', content: msg, created_at: new Date().toISOString() };
    setConv(c => ({ ...c, messages: [...(c.messages || []), optimistic] }));
    try {
      await api.sendMessage(convId, msg);
    } catch (_) {
      setConv(c => ({ ...c, messages: (c.messages || []).filter(m => m !== optimistic) }));
      setSendError('Failed to send — check your connection and try again.');
    }
  };

  const handleClose = async () => {
    setClosing(true);
    setShowCloseConfirm(false);
    try {
      await api.updateConversation(convId, { status: 'closed' });
      setConv(c => ({ ...c, status: 'closed' }));
    } catch (_) {
      alert('Failed to close conversation. Please try again.');
    } finally {
      setClosing(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteConversation(convId);
      window.location.hash = '#/dashboard/conversations';
    } catch (_) {
      alert('Failed to delete conversation. Please try again.');
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) return <div style={{ padding: '24px 32px', color: '#666' }}>Loading...</div>;

  if (!conv) return (
    <div style={{ padding: '24px 32px' }}>
      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 16 }}
        onClick={handleBack}>
        <ArrowLeft size={16} /> Back to Conversations
      </button>
      <div style={{ padding: 60, textAlign: 'center', color: '#666' }}>Conversation not found.</div>
    </div>
  );

  const msgs = conv.messages || [];
  const sc = (conv.manual_mode && conv.status === 'active')
    ? { label: 'Needs Reply', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' }
    : (statusConfig[conv.status] || statusConfig.closed);

  return (
    <div className="ansa-detail-wrap" style={{ padding: '24px 32px', maxWidth: 1300, margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>

      {/* Leave warning modal */}
      {showLeaveWarning && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="ansa-modal-box" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: 28, maxWidth: 420, width: '100%' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Leave this conversation?</div>
            <div style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6, marginBottom: 24 }}>You took over this conversation — <span style={{ color: '#f59e0b', fontWeight: 600 }}>the AI will not respond</span> while you're in control. The customer won't get a reply unless you come back and send one.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowLeaveWarning(false)}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#aaa', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
                Stay
              </button>
              <button onClick={() => window.location.hash = '#/dashboard/conversations'}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#000', fontSize: 14, cursor: 'pointer', fontWeight: 700 }}>
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="ansa-modal-box" style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 14, padding: 28, maxWidth: 420, width: '100%' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Delete this conversation?</div>
            <div style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6, marginBottom: 24 }}>This will permanently delete all messages and cannot be undone. Use this for spam or wrong numbers.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDeleteConfirm(false)}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #333', background: 'transparent', color: '#aaa', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: 14, cursor: deleting ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                {deleting ? 'Deleting...' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', padding: 0, marginBottom: 16, fontWeight: 500 }}
        onClick={handleBack}>
        <ArrowLeft size={16} /> Back to Conversations
      </button>

      <div className="ansa-detail-panels" style={{ display: 'flex', gap: 20, flex: 1, minHeight: 0 }}>
        {/* Chat Panel */}
        <div className="ansa-detail-chat" style={{ flex: 7, display: 'flex', flexDirection: 'column', background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: aiMode ? 'rgba(59,130,246,0.08)' : 'rgba(245,158,11,0.08)', borderBottom: '1px solid #1e1e1e' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: aiMode ? '#3b82f6' : '#f59e0b', fontWeight: 500 }}>
              {aiMode ? <><Bot size={15} /> AI is handling this conversation</> : <><User size={15} /> You are in control</>}
            </span>
            <button onClick={handleToggleMode} disabled={togglingMode}
              style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: togglingMode ? 'not-allowed' : 'pointer', border: '1px solid', background: aiMode ? 'transparent' : '#f59e0b', borderColor: aiMode ? '#3b82f6' : '#f59e0b', color: aiMode ? '#3b82f6' : '#000', opacity: togglingMode ? 0.6 : 1 }}>
              {togglingMode ? '...' : aiMode ? 'Take Over' : 'Let AI Handle'}
            </button>
          </div>

          <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {msgs.length === 0 && (
              <div style={{ textAlign: 'center', color: '#555', fontSize: 13, padding: '40px 0' }}>No messages yet.</div>
            )}
            {msgs.map((msg, i) => {
              if (msg.role === 'system') return <div key={i} style={{ textAlign: 'center', fontSize: 12, color: '#555', padding: '8px 0' }}>{msg.content}</div>;
              const isUser = msg.role === 'user';
              const msgDate = new Date(msg.created_at).toDateString();
              const prevDate = i > 0 ? new Date(msgs[i - 1].created_at).toDateString() : null;
              const showSeparator = msgDate !== prevDate;
              const today = new Date().toDateString();
              const yesterday = new Date(Date.now() - 86400000).toDateString();
              const dateLabel = msgDate === today ? 'Today' : msgDate === yesterday ? 'Yesterday' : new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
              return (
                <div key={i}>
                  {showSeparator && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '8px 0' }}>
                      <div style={{ flex: 1, height: 1, background: '#222' }} />
                      <span style={{ fontSize: 11, color: '#555', whiteSpace: 'nowrap' }}>{dateLabel}</span>
                      <div style={{ flex: 1, height: 1, background: '#222' }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: isUser ? 'flex-start' : 'flex-end' }}>
                    <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: 14, fontSize: 14, lineHeight: 1.5, background: isUser ? '#2a2a2a' : '#1e3a5f', color: '#e5e5e5', borderBottomLeftRadius: isUser ? 4 : 14, borderBottomRightRadius: isUser ? 14 : 4, border: isUser ? '1px solid #333' : '1px solid rgba(59,130,246,0.2)' }}>
                      {msg.content}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 4, textAlign: isUser ? 'left' : 'right' }}>{formatTime(msg.created_at)}</div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {sendError && <div style={{ padding: '8px 20px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 12 }}>{sendError}</div>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 20px', borderTop: '1px solid #1e1e1e', background: '#111' }}>
            <input
              style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 16px', color: '#fff', fontSize: 14, outline: 'none', caretColor: '#3b82f6', opacity: aiMode ? 0.5 : 1 }}
              placeholder={aiMode ? 'Take over to send a message...' : 'Type a message...'}
              value={inputVal} onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              disabled={aiMode}
            />
            <button onClick={handleSend} disabled={aiMode || !inputVal.trim()}
              style={{ width: 40, height: 40, borderRadius: 10, background: '#3b82f6', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: aiMode || !inputVal.trim() ? 'not-allowed' : 'pointer', flexShrink: 0, opacity: aiMode || !inputVal.trim() ? 0.4 : 1 }}>
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="ansa-detail-info" style={{ flex: 3, background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Caller Info</div>
          {[
            conv.customer_name  ? { icon: User,   label: 'Name',          value: conv.customer_name } : null,
            { icon: Phone,        label: 'Phone',         value: formatPhone(conv.customer_phone) },
            conv.customer_address ? { icon: MapPin, label: 'Job Address',   value: conv.customer_address } : null,
            { icon: Clock,        label: 'First Contact',  value: `${formatDate(conv.created_at)} at ${formatTime(conv.created_at)}` },
          ].filter(Boolean).map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
              <Icon size={16} color="#888" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 14, color: '#ddd', fontWeight: 500 }}>{value}</div>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
            <Zap size={16} color="#888" style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>Status</div>
              <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, color: sc.color, background: sc.bg }}>{sc.label}</span>
            </div>
          </div>

          {linkedAppointment && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16, padding: '12px 14px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10 }}>
              <CalendarCheck size={16} color="#22c55e" style={{ marginTop: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, marginBottom: 3 }}>
                  {linkedAppointment.status === 'confirmed' ? 'Scheduled' : linkedAppointment.status === 'pending' ? 'Pending Approval' : linkedAppointment.status === 'cancelled' ? 'Cancelled' : 'Appointment'}
                </div>
                <div style={{ fontSize: 13, color: '#ddd', fontWeight: 500 }}>
                  {new Date(linkedAppointment.scheduled_at).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {new Date(linkedAppointment.scheduled_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </div>
                {linkedAppointment.service_description && (
                  <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>{linkedAppointment.service_description}</div>
                )}
              </div>
            </div>
          )}

          <div style={{ flex: 1 }} />
          <div style={{ borderTop: '1px solid #1e1e1e', paddingTop: 20 }}>
            {conv.status !== 'closed' && !showCloseConfirm && (
              <button onClick={() => setShowCloseConfirm(true)}
                style={{ display: 'block', width: '100%', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#aaa', border: '1px solid #333', marginBottom: 8 }}>
                <XCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />Mark as Closed
              </button>
            )}
            {showCloseConfirm && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 14, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#fca5a5', marginBottom: 12 }}>
                  <AlertTriangle size={14} /> Close this conversation?
                </div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 1.5 }}>The AI will stop responding. This cannot be undone.</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowCloseConfirm(false)}
                    style={{ flex: 1, padding: '7px', borderRadius: 7, border: '1px solid #333', background: 'transparent', color: '#888', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                    Keep Open
                  </button>
                  <button onClick={handleClose} disabled={closing}
                    style={{ flex: 1, padding: '7px', borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 12, cursor: closing ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                    {closing ? 'Closing...' : 'Yes, Close'}
                  </button>
                </div>
              </div>
            )}
            <button onClick={() => setShowDeleteConfirm(true)}
              style={{ display: 'block', width: '100%', padding: '9px 16px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: 'transparent', color: '#555', border: '1px solid #222', marginTop: showCloseConfirm ? 0 : 0 }}>
              <Trash2 size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />Delete Conversation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
