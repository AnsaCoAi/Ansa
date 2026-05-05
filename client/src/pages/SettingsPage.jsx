import React, { useState, useEffect } from 'react';
import { Building2, Bot, Plug, CreditCard, Save, Plus, Trash2, Phone, Clock, Wifi, WifiOff, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const tabConfig = [
  { key: 'business', label: 'Business Info', icon: Building2 },
  { key: 'ai', label: 'AI Assistant', icon: Bot },
  { key: 'integrations', label: 'Integrations', icon: Plug },
  { key: 'billing', label: 'Billing', icon: CreditCard },
];

const toneOptions = ['friendly', 'professional', 'casual', 'formal'];
const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const dayLabels = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

const defaultHours = {
  mon: { open: '08:00', close: '17:00' },
  tue: { open: '08:00', close: '17:00' },
  wed: { open: '08:00', close: '17:00' },
  thu: { open: '08:00', close: '17:00' },
  fri: { open: '08:00', close: '17:00' },
  sat: null,
  sun: null,
};

const s = {
  page: { padding: '32px', maxWidth: 1200, margin: '0 auto' },
  title: { fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, marginBottom: 28 },
  tabs: { display: 'flex', gap: 4, marginBottom: 32, background: '#141414', borderRadius: 10, padding: 4, width: 'fit-content' },
  tab: (active) => ({ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none', background: active ? '#222' : 'transparent', color: active ? '#fff' : '#888' }),
  section: { background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: 28 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 },
  formGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#aaa', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 80, fontFamily: 'inherit', boxSizing: 'border-box' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  saveBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: '#3b82f6', border: 'none', borderRadius: 10, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 },
  hoursRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, padding: '8px 12px', background: '#1a1a1a', borderRadius: 8 },
  dayLabel: { width: 90, fontSize: 13, color: '#ccc', fontWeight: 500 },
  timeInput: { padding: '6px 10px', background: '#222', border: '1px solid #333', borderRadius: 6, color: '#fff', fontSize: 13, width: 100, outline: 'none' },
  closedLabel: { fontSize: 13, color: '#555', fontStyle: 'italic' },
  toneGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  toneBtn: (active) => ({ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px solid', textTransform: 'capitalize', background: active ? '#3b82f6' : 'transparent', borderColor: active ? '#3b82f6' : '#333', color: active ? '#fff' : '#aaa' }),
  faqList: { display: 'flex', flexDirection: 'column', gap: 10 },
  faqItem: { background: '#1a1a1a', borderRadius: 10, padding: 16, border: '1px solid #222' },
  faqQ: { fontSize: 14, fontWeight: 600, color: '#ddd', marginBottom: 6 },
  faqA: { fontSize: 13, color: '#888', lineHeight: 1.5 },
  faqActions: { display: 'flex', gap: 8, marginTop: 10 },
  faqBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', border: '1px solid #333', background: 'transparent', color: '#888' },
  addFaqBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', border: '1px dashed #333', background: 'transparent', color: '#888', marginTop: 12 },
  systemPrompt: { background: '#0d0d0d', border: '1px solid #222', borderRadius: 8, padding: 16, fontSize: 13, color: '#666', fontFamily: 'monospace', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginTop: 8 },
  integrationCard: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', borderRadius: 12, padding: '18px 22px', border: '1px solid #222', marginBottom: 12 },
  integrationLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  integrationIcon: (connected) => ({ width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: connected ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)' }),
  integrationName: { fontSize: 15, fontWeight: 600, color: '#fff' },
  integrationStatus: (connected) => ({ fontSize: 12, color: connected ? '#22c55e' : '#6b7280', marginTop: 2 }),
  billingCard: { background: '#1a1a1a', borderRadius: 12, padding: 24, border: '1px solid #222', marginBottom: 20 },
  planBadge: { display: 'inline-block', padding: '4px 12px', borderRadius: 20, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontSize: 12, fontWeight: 700, marginLeft: 10 },
  billingRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 14 },
  billingLabel: { fontSize: 13, color: '#888' },
  billingValue: { fontSize: 14, color: '#ddd', fontWeight: 500 },
  usageBar: { width: '100%', height: 8, background: '#222', borderRadius: 4, overflow: 'hidden', marginTop: 6, marginBottom: 16 },
  usageFill: (pct, color) => ({ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 4 }),
};

export default function SettingsPage() {
  const { business: authBusiness } = useAuth();
  const [activeTab, setActiveTab] = useState('business');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [bizForm, setBizForm] = useState({ name: '', owner_phone: '', services: '' });
  const [hours, setHours] = useState(defaultHours);
  const [greeting, setGreeting] = useState('');
  const [tone, setTone] = useState('friendly');
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    if (!authBusiness) return;
    setBizForm({
      name: authBusiness.name || '',
      owner_phone: authBusiness.owner_phone || '',
      services: Array.isArray(authBusiness.services) ? authBusiness.services.join(', ') : (authBusiness.services || ''),
    });
    setHours(authBusiness.business_hours || defaultHours);
    setGreeting(authBusiness.greeting || '');
  }, [authBusiness]);

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function saveBusiness() {
    if (!authBusiness?.id) return;
    setSaving(true);
    try {
      await api.updateBusiness(authBusiness.id, {
        name: bizForm.name,
        owner_phone: bizForm.owner_phone,
        services: bizForm.services.split(',').map(s => s.trim()).filter(Boolean),
        business_hours: hours,
      });
      flash();
    } finally {
      setSaving(false);
    }
  }

  async function saveAi() {
    if (!authBusiness?.id) return;
    setSaving(true);
    try {
      await api.updateBusiness(authBusiness.id, { greeting });
      flash();
    } finally {
      setSaving(false);
    }
  }

  function addFaq() { setFaqs([...faqs, { id: Date.now().toString(), q: 'New Question?', a: 'Answer here...' }]); }
  function removeFaq(id) { setFaqs(faqs.filter(f => f.id !== id)); }

  const SaveButton = ({ onClick }) => (
    <button style={{ ...s.saveBtn, background: saved ? '#22c55e' : '#3b82f6' }} onClick={onClick} disabled={saving}>
      {saved ? <><Check size={16} /> Saved</> : saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
    </button>
  );

  function renderBusinessTab() {
    return (
      <div style={s.section}>
        <div style={s.sectionTitle}>Business Information</div>
        <div style={s.formRow}>
          <div style={s.formGroup}>
            <label style={s.label}>Business Name</label>
            <input style={s.input} value={bizForm.name} onChange={e => setBizForm({ ...bizForm, name: e.target.value })} />
          </div>
          <div style={s.formGroup}>
            <label style={s.label}>Owner Phone</label>
            <input style={s.input} value={bizForm.owner_phone} onChange={e => setBizForm({ ...bizForm, owner_phone: e.target.value })} />
          </div>
        </div>
        <div style={s.formGroup}>
          <label style={s.label}>Services (comma-separated)</label>
          <input style={s.input} value={bizForm.services} onChange={e => setBizForm({ ...bizForm, services: e.target.value })} />
        </div>

        <div style={{ ...s.sectionTitle, marginTop: 28 }}>Business Hours</div>
        {daysOfWeek.map(day => (
          <div key={day} style={s.hoursRow}>
            <span style={s.dayLabel}>{dayLabels[day]}</span>
            {hours[day] ? (
              <>
                <input type="time" style={s.timeInput} value={hours[day].open} onChange={e => setHours({ ...hours, [day]: { ...hours[day], open: e.target.value } })} />
                <span style={{ color: '#555' }}>to</span>
                <input type="time" style={s.timeInput} value={hours[day].close} onChange={e => setHours({ ...hours, [day]: { ...hours[day], close: e.target.value } })} />
                <button style={{ ...s.faqBtn, fontSize: 11, color: '#ef4444' }} onClick={() => setHours({ ...hours, [day]: null })}>Closed</button>
              </>
            ) : (
              <>
                <span style={s.closedLabel}>Closed</span>
                <button style={{ ...s.faqBtn, fontSize: 11 }} onClick={() => setHours({ ...hours, [day]: { open: '08:00', close: '17:00' } })}>Set Hours</button>
              </>
            )}
          </div>
        ))}

        <SaveButton onClick={saveBusiness} />
      </div>
    );
  }

  function renderAiTab() {
    const systemPrompt = `You are an AI assistant for ${bizForm.name}.\nTone: ${tone}\nGreeting: ${greeting}\n\nServices: ${bizForm.services}\n\nGoal: Respond to missed call texts, answer questions, and book appointments.`;
    return (
      <div style={s.section}>
        <div style={s.sectionTitle}>Greeting Message</div>
        <div style={s.formGroup}>
          <label style={s.label}>First message sent after a missed call</label>
          <textarea style={s.textarea} value={greeting} onChange={e => setGreeting(e.target.value)} rows={3} />
        </div>

        <div style={{ ...s.sectionTitle, marginTop: 24 }}>AI Tone</div>
        <div style={s.toneGrid}>
          {toneOptions.map(t => <button key={t} style={s.toneBtn(tone === t)} onClick={() => setTone(t)}>{t}</button>)}
        </div>

        <div style={{ ...s.sectionTitle, marginTop: 28 }}>FAQ Manager</div>
        <div style={s.faqList}>
          {faqs.map(faq => (
            <div key={faq.id} style={s.faqItem}>
              <div style={s.faqQ}>{faq.q}</div>
              <div style={s.faqA}>{faq.a}</div>
              <div style={s.faqActions}>
                <button style={{ ...s.faqBtn, color: '#ef4444' }} onClick={() => removeFaq(faq.id)}><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
        <button style={s.addFaqBtn} onClick={addFaq}><Plus size={15} /> Add FAQ</button>

        <div style={{ ...s.sectionTitle, marginTop: 28 }}>System Prompt Preview</div>
        <div style={s.label}>What the AI sees (read-only)</div>
        <div style={s.systemPrompt}>{systemPrompt}</div>

        <SaveButton onClick={saveAi} />
      </div>
    );
  }

  function renderIntegrationsTab() {
    const twilioConnected = !!authBusiness?.twilio_number;
    const calendarConnected = !!authBusiness?.google_calendar_id;
    const configs = [
      { key: 'twilio', name: 'Twilio', desc: twilioConnected ? `Number: ${authBusiness.twilio_number}` : 'No number provisioned', icon: Phone, connected: twilioConnected },
      { key: 'googleCalendar', name: 'Google Calendar', desc: calendarConnected ? 'Connected' : 'Not connected — click to connect', icon: Clock, connected: calendarConnected },
      { key: 'stripe', name: 'Stripe', desc: 'Not connected', icon: CreditCard, connected: false },
    ];
    return (
      <div style={s.section}>
        <div style={s.sectionTitle}>Connected Services</div>
        {configs.map(cfg => (
          <div key={cfg.key} style={s.integrationCard}>
            <div style={s.integrationLeft}>
              <div style={s.integrationIcon(cfg.connected)}>
                {cfg.connected ? <Wifi size={20} color="#22c55e" /> : <WifiOff size={20} color="#6b7280" />}
              </div>
              <div>
                <div style={s.integrationName}>{cfg.name}</div>
                <div style={s.integrationStatus(cfg.connected)}>{cfg.desc}</div>
              </div>
            </div>
            {cfg.key === 'googleCalendar' && !calendarConnected && authBusiness?.id && (
              <a href={`https://ansa-production.up.railway.app/auth/google?businessId=${authBusiness.id}`}
                style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#3b82f6', color: '#fff', textDecoration: 'none' }}>
                Connect
              </a>
            )}
          </div>
        ))}
      </div>
    );
  }

  function renderBillingTab() {
    return (
      <div>
        <div style={s.billingCard}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Pro Plan</span>
            <span style={s.planBadge}>CURRENT</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 4 }}>$497<span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>/mo</span></div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Unlimited missed call text-backs, AI conversations, and appointment bookings.</div>
          <div style={s.billingRow}><span style={s.billingLabel}>Payment method</span><span style={s.billingValue}>—</span></div>
        </div>
        <div style={{ fontSize: 13, color: '#666' }}>Stripe billing coming soon.</div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>Settings</h1>
      <div style={s.tabs}>
        {tabConfig.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} style={s.tab(activeTab === tab.key)} onClick={() => setActiveTab(tab.key)}>
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>
      {activeTab === 'business' && renderBusinessTab()}
      {activeTab === 'ai' && renderAiTab()}
      {activeTab === 'integrations' && renderIntegrationsTab()}
      {activeTab === 'billing' && renderBillingTab()}
    </div>
  );
}
