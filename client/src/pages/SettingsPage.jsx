import React, { useState } from 'react';
import { Building2, Bot, Plug, CreditCard, Save, Plus, Trash2, Edit3, Check, X, Phone, Mail, MapPin, Clock, MessageSquare, Wifi, WifiOff } from 'lucide-react';
import { currentBusiness } from '../data/mockData';

const tabConfig = [
  { key: 'business', label: 'Business Info', icon: Building2 },
  { key: 'ai', label: 'AI Assistant', icon: Bot },
  { key: 'integrations', label: 'Integrations', icon: Plug },
  { key: 'billing', label: 'Billing', icon: CreditCard },
];

const toneOptions = ['friendly', 'professional', 'casual', 'formal'];

const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const dayLabels = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

const styles = {
  page: { padding: '32px', maxWidth: 1200, margin: '0 auto' },
  title: { fontSize: 24, fontWeight: 700, color: '#fff', margin: 0, marginBottom: 28 },
  tabs: { display: 'flex', gap: 4, marginBottom: 32, background: '#141414', borderRadius: 10, padding: 4, width: 'fit-content' },
  tab: (active) => ({
    display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 8,
    fontSize: 13, fontWeight: 500, cursor: 'pointer', border: 'none',
    background: active ? '#222' : 'transparent', color: active ? '#fff' : '#888',
    transition: 'all 0.15s',
  }),
  section: { background: '#141414', borderRadius: 12, border: '1px solid #1e1e1e', padding: 28 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 20 },
  formGroup: { marginBottom: 20 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#aaa', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '10px 14px', background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: 8, color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical',
    minHeight: 80, fontFamily: 'inherit', boxSizing: 'border-box',
  },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  saveBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px',
    background: '#3b82f6', border: 'none', borderRadius: 10, color: '#fff',
    fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8,
  },
  hoursRow: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10,
    padding: '8px 12px', background: '#1a1a1a', borderRadius: 8,
  },
  dayLabel: { width: 90, fontSize: 13, color: '#ccc', fontWeight: 500 },
  timeInput: {
    padding: '6px 10px', background: '#222', border: '1px solid #333', borderRadius: 6,
    color: '#fff', fontSize: 13, width: 100, outline: 'none',
  },
  closedLabel: { fontSize: 13, color: '#555', fontStyle: 'italic' },
  toneGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  toneBtn: (active) => ({
    padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
    cursor: 'pointer', border: '1px solid', textTransform: 'capitalize',
    background: active ? '#3b82f6' : 'transparent',
    borderColor: active ? '#3b82f6' : '#333',
    color: active ? '#fff' : '#aaa',
  }),
  faqList: { display: 'flex', flexDirection: 'column', gap: 10 },
  faqItem: {
    background: '#1a1a1a', borderRadius: 10, padding: 16,
    border: '1px solid #222',
  },
  faqQ: { fontSize: 14, fontWeight: 600, color: '#ddd', marginBottom: 6 },
  faqA: { fontSize: 13, color: '#888', lineHeight: 1.5 },
  faqActions: { display: 'flex', gap: 8, marginTop: 10 },
  faqBtn: {
    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
    borderRadius: 6, fontSize: 12, cursor: 'pointer', border: '1px solid #333',
    background: 'transparent', color: '#888',
  },
  addFaqBtn: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
    borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
    border: '1px dashed #333', background: 'transparent', color: '#888',
    marginTop: 12,
  },
  systemPrompt: {
    background: '#0d0d0d', border: '1px solid #222', borderRadius: 8,
    padding: 16, fontSize: 13, color: '#666', fontFamily: 'monospace',
    lineHeight: 1.6, whiteSpace: 'pre-wrap', marginTop: 8,
  },
  integrationCard: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: '#1a1a1a', borderRadius: 12, padding: '18px 22px',
    border: '1px solid #222', marginBottom: 12,
  },
  integrationLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  integrationIcon: (connected) => ({
    width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: connected ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)',
  }),
  integrationName: { fontSize: 15, fontWeight: 600, color: '#fff' },
  integrationStatus: (connected) => ({
    fontSize: 12, color: connected ? '#22c55e' : '#6b7280', marginTop: 2,
  }),
  toggleTrack: (on) => ({
    width: 44, height: 24, borderRadius: 12, cursor: 'pointer', padding: 2,
    background: on ? '#3b82f6' : '#333', display: 'flex', alignItems: 'center',
    justifyContent: on ? 'flex-end' : 'flex-start', transition: 'all 0.2s',
    border: 'none',
  }),
  toggleThumb: { width: 20, height: 20, borderRadius: '50%', background: '#fff' },
  billingCard: {
    background: '#1a1a1a', borderRadius: 12, padding: 24,
    border: '1px solid #222', marginBottom: 20,
  },
  planBadge: {
    display: 'inline-block', padding: '4px 12px', borderRadius: 20,
    background: 'rgba(59,130,246,0.15)', color: '#3b82f6',
    fontSize: 12, fontWeight: 700, marginLeft: 10,
  },
  billingRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 14 },
  billingLabel: { fontSize: 13, color: '#888' },
  billingValue: { fontSize: 14, color: '#ddd', fontWeight: 500 },
  usageBar: { width: '100%', height: 8, background: '#222', borderRadius: 4, overflow: 'hidden', marginTop: 6, marginBottom: 16 },
  usageFill: (pct, color) => ({ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 4 }),
  dangerBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px',
    borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
    border: '1px solid #333', background: 'transparent', color: '#ef4444',
  },
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [business, setBusiness] = useState({
    name: currentBusiness.name,
    phone: currentBusiness.phone,
    email: currentBusiness.email,
    address: currentBusiness.address,
    services: currentBusiness.services.join(', '),
  });
  const [hours, setHours] = useState(currentBusiness.businessHours);
  const [greeting, setGreeting] = useState("Hi! Thanks for calling Mike's Plumbing. Sorry we missed your call. How can we help you today?");
  const [tone, setTone] = useState('friendly');
  const [faqs, setFaqs] = useState([
    { id: '1', q: 'What areas do you serve?', a: 'We serve all of Los Angeles county including the metro area.' },
    { id: '2', q: 'Do you offer emergency services?', a: 'Yes! We offer 24/7 emergency plumbing services.' },
    { id: '3', q: 'What are your rates?', a: 'Our service call fee is $89, which is waived if you proceed with the repair.' },
  ]);
  const [integrations, setIntegrations] = useState({
    twilio: true,
    googleCalendar: true,
    stripe: false,
  });

  function removeFaq(id) {
    setFaqs(faqs.filter(f => f.id !== id));
  }

  function addFaq() {
    setFaqs([...faqs, { id: Date.now().toString(), q: 'New Question?', a: 'Answer here...' }]);
  }

  function renderBusinessTab() {
    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Business Information</div>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Business Name</label>
            <input style={styles.input} value={business.name} onChange={e => setBusiness({ ...business, name: e.target.value })} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <input style={styles.input} value={business.phone} onChange={e => setBusiness({ ...business, phone: e.target.value })} />
          </div>
        </div>
        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} value={business.email} onChange={e => setBusiness({ ...business, email: e.target.value })} />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Service Area / Address</label>
            <input style={styles.input} value={business.address} onChange={e => setBusiness({ ...business, address: e.target.value })} />
          </div>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>Services (comma-separated)</label>
          <input style={styles.input} value={business.services} onChange={e => setBusiness({ ...business, services: e.target.value })} />
        </div>

        <div style={{ ...styles.sectionTitle, marginTop: 28 }}>Business Hours</div>
        {daysOfWeek.map(day => (
          <div key={day} style={styles.hoursRow}>
            <span style={styles.dayLabel}>{dayLabels[day]}</span>
            {hours[day] ? (
              <>
                <input
                  type="time" style={styles.timeInput} value={hours[day].open}
                  onChange={e => setHours({ ...hours, [day]: { ...hours[day], open: e.target.value } })}
                />
                <span style={{ color: '#555' }}>to</span>
                <input
                  type="time" style={styles.timeInput} value={hours[day].close}
                  onChange={e => setHours({ ...hours, [day]: { ...hours[day], close: e.target.value } })}
                />
              </>
            ) : (
              <span style={styles.closedLabel}>Closed</span>
            )}
          </div>
        ))}

        <button style={styles.saveBtn} onClick={() => {}}>
          <Save size={16} /> Save Changes
        </button>
      </div>
    );
  }

  function renderAiTab() {
    const systemPrompt = `You are an AI assistant for ${business.name}.\nTone: ${tone}\nGreeting: ${greeting}\n\nServices: ${business.services}\n\nFAQs:\n${faqs.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}\n\nGoal: Respond to missed call texts, answer questions, and book appointments.`;

    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Greeting Message</div>
        <div style={styles.formGroup}>
          <label style={styles.label}>This is the first message sent after a missed call</label>
          <textarea style={styles.textarea} value={greeting} onChange={e => setGreeting(e.target.value)} rows={3} />
        </div>

        <div style={{ ...styles.sectionTitle, marginTop: 24 }}>AI Tone</div>
        <div style={styles.toneGrid}>
          {toneOptions.map(t => (
            <button key={t} style={styles.toneBtn(tone === t)} onClick={() => setTone(t)}>{t}</button>
          ))}
        </div>

        <div style={{ ...styles.sectionTitle, marginTop: 28 }}>FAQ Manager</div>
        <div style={styles.faqList}>
          {faqs.map(faq => (
            <div key={faq.id} style={styles.faqItem}>
              <div style={styles.faqQ}>{faq.q}</div>
              <div style={styles.faqA}>{faq.a}</div>
              <div style={styles.faqActions}>
                <button style={styles.faqBtn}><Edit3 size={12} /> Edit</button>
                <button style={{ ...styles.faqBtn, color: '#ef4444' }} onClick={() => removeFaq(faq.id)}><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
        <button style={styles.addFaqBtn} onClick={addFaq}>
          <Plus size={15} /> Add FAQ
        </button>

        <div style={{ ...styles.sectionTitle, marginTop: 28 }}>System Prompt Preview</div>
        <div style={styles.label}>This is what the AI sees (read-only)</div>
        <div style={styles.systemPrompt}>{systemPrompt}</div>

        <button style={{ ...styles.saveBtn, marginTop: 20 }} onClick={() => {}}>
          <Save size={16} /> Save Changes
        </button>
      </div>
    );
  }

  function renderIntegrationsTab() {
    const configs = [
      { key: 'twilio', name: 'Twilio', desc: integrations.twilio ? `Connected: ${currentBusiness.phone}` : 'Not connected', icon: Phone },
      { key: 'googleCalendar', name: 'Google Calendar', desc: integrations.googleCalendar ? `Connected: ${currentBusiness.email}` : 'Not connected', icon: Clock },
      { key: 'stripe', name: 'Stripe', desc: integrations.stripe ? 'Connected' : 'Not connected', icon: CreditCard },
    ];

    return (
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Connected Services</div>
        {configs.map(cfg => {
          const connected = integrations[cfg.key];
          return (
            <div key={cfg.key} style={styles.integrationCard}>
              <div style={styles.integrationLeft}>
                <div style={styles.integrationIcon(connected)}>
                  {connected ? <Wifi size={20} color="#22c55e" /> : <WifiOff size={20} color="#6b7280" />}
                </div>
                <div>
                  <div style={styles.integrationName}>{cfg.name}</div>
                  <div style={styles.integrationStatus(connected)}>{cfg.desc}</div>
                </div>
              </div>
              <button
                style={styles.toggleTrack(connected)}
                onClick={() => setIntegrations({ ...integrations, [cfg.key]: !connected })}
              >
                <div style={styles.toggleThumb} />
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  function renderBillingTab() {
    return (
      <div>
        <div style={styles.billingCard}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Pro Plan</span>
            <span style={styles.planBadge}>CURRENT</span>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 4 }}>$497<span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>/mo</span></div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Unlimited missed call text-backs, AI conversations, and appointment bookings.</div>

          <div style={styles.billingRow}>
            <span style={styles.billingLabel}>Next billing date</span>
            <span style={styles.billingValue}>May 1, 2026</span>
          </div>
          <div style={styles.billingRow}>
            <span style={styles.billingLabel}>Payment method</span>
            <span style={styles.billingValue}>Visa ending in 4242</span>
          </div>
        </div>

        <div style={styles.billingCard}>
          <div style={styles.sectionTitle}>Usage This Month</div>

          <div style={styles.billingRow}>
            <span style={styles.billingLabel}>Missed Calls Handled</span>
            <span style={styles.billingValue}>47 / 500</span>
          </div>
          <div style={styles.usageBar}>
            <div style={styles.usageFill(47 / 500 * 100, '#3b82f6')} />
          </div>

          <div style={styles.billingRow}>
            <span style={styles.billingLabel}>SMS Messages Sent</span>
            <span style={styles.billingValue}>187 / 2,000</span>
          </div>
          <div style={styles.usageBar}>
            <div style={styles.usageFill(187 / 2000 * 100, '#8b5cf6')} />
          </div>

          <div style={styles.billingRow}>
            <span style={styles.billingLabel}>Appointments Booked</span>
            <span style={styles.billingValue}>22 / Unlimited</span>
          </div>
          <div style={styles.usageBar}>
            <div style={styles.usageFill(22, '#22c55e')} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button style={styles.saveBtn} onClick={() => {}}>Change Plan</button>
          <button style={styles.dangerBtn} onClick={() => {}}>Cancel Subscription</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Settings</h1>

      <div style={styles.tabs}>
        {tabConfig.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} style={styles.tab(activeTab === tab.key)} onClick={() => setActiveTab(tab.key)}>
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
