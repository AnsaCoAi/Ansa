import React, { useState, useEffect, useRef } from 'react';
import { Building2, Bot, Plug, CreditCard, Save, Plus, Trash2, Phone, Clock, Wifi, WifiOff, Check, User, MapPin, Ban } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import supabase from '../services/supabase';

const tabConfig = [
  { key: 'account', label: 'Account', icon: User },
  { key: 'business', label: 'Business Info', icon: Building2 },
  { key: 'ai', label: 'AI Assistant', icon: Bot },
  { key: 'integrations', label: 'Integrations', icon: Plug },
  { key: 'billing', label: 'Billing', icon: CreditCard },
];

const toneOptions = ['Friendly', 'Professional', 'Casual', 'Formal'];

const PRICING_TYPES = [
  { value: 'flat_rate',      label: 'Flat Rate' },
  { value: 'per_sq_ft',     label: 'Per Sq Ft' },
  { value: 'per_linear_ft', label: 'Per Linear Ft' },
  { value: 'per_unit',      label: 'Per Unit' },
  { value: 'hourly',        label: 'Per Hour' },
  { value: 'starting_at',   label: 'Starting At' },
  { value: 'free_estimate', label: 'Free Estimate' },
];

function newService() {
  return { id: Date.now().toString() + Math.random(), name: '', pricing_type: 'flat_rate', unit: '', price_low: '', price_high: '', min_charge: '', notes: '' };
}

function loadServices(raw) {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map(s => typeof s === 'string'
    ? { id: Date.now().toString() + Math.random(), name: s, pricing_type: 'free_estimate', unit: '', price_low: '', price_high: '', min_charge: '', notes: '' }
    : { id: s.id || Date.now().toString() + Math.random(), name: s.name || '', pricing_type: s.pricing_type || 'flat_rate', unit: s.unit || '', price_low: s.price_low ?? '', price_high: s.price_high ?? '', min_charge: s.min_charge ?? '', notes: s.notes || '' }
  );
}

function ServiceCard({ svc, onChange, onRemove }) {
  const showPrice = svc.pricing_type !== 'free_estimate';
  const showHighPrice = !['starting_at'].includes(svc.pricing_type);
  const showUnit = svc.pricing_type === 'per_unit';
  const showMin = ['per_sq_ft', 'per_linear_ft', 'per_unit', 'hourly'].includes(svc.pricing_type);
  const unitSuffix = { per_sq_ft: '/ sq ft', per_linear_ft: '/ linear ft', hourly: '/ hour', per_unit: svc.unit ? `/ ${svc.unit}` : '/ unit' }[svc.pricing_type] || '';

  const inp = { padding: '8px 12px', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
  const sel = { ...inp, cursor: 'pointer', background: '#141414' };

  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: 16 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: showPrice || svc.notes !== undefined ? 10 : 0, alignItems: 'center' }}>
        <input style={{ ...inp, flex: 1 }} placeholder="Service name (e.g. Tile Installation, Drain Cleaning)" value={svc.name} onChange={e => onChange({ ...svc, name: e.target.value })} />
        <select style={{ ...sel, width: 150, flexShrink: 0 }} value={svc.pricing_type} onChange={e => onChange({ ...svc, pricing_type: e.target.value })}>
          {PRICING_TYPES.map(pt => <option key={pt.value} value={pt.value}>{pt.label}</option>)}
        </select>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 4, flexShrink: 0, display: 'flex', alignItems: 'center' }} title="Remove">
          <Trash2 size={15} />
        </button>
      </div>

      {showPrice && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12, color: '#555' }}>$</span>
            <input style={{ ...inp, width: 80 }} type="number" placeholder={svc.pricing_type === 'starting_at' ? 'Amount' : 'Low'} value={svc.price_low} onChange={e => onChange({ ...svc, price_low: e.target.value })} />
          </div>
          {showHighPrice && (
            <>
              <span style={{ color: '#444', fontSize: 13 }}>—</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 12, color: '#555' }}>$</span>
                <input style={{ ...inp, width: 80 }} type="number" placeholder="High" value={svc.price_high} onChange={e => onChange({ ...svc, price_high: e.target.value })} />
              </div>
            </>
          )}
          {unitSuffix && <span style={{ fontSize: 12, color: '#555' }}>{unitSuffix}</span>}
          {showUnit && (
            <input style={{ ...inp, width: 110 }} placeholder="unit name (e.g. window)" value={svc.unit} onChange={e => onChange({ ...svc, unit: e.target.value })} />
          )}
          {showMin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 8 }}>
              <span style={{ fontSize: 12, color: '#555' }}>min $</span>
              <input style={{ ...inp, width: 70 }} type="number" placeholder="0" value={svc.min_charge} onChange={e => onChange({ ...svc, min_charge: e.target.value })} />
            </div>
          )}
        </div>
      )}

      <textarea
        style={{ width: '100%', padding: '8px 12px', background: '#141414', border: '1px solid #2a2a2a', borderRadius: 8, color: '#ccc', fontSize: 12, outline: 'none', resize: 'vertical', minHeight: 52, fontFamily: 'inherit', boxSizing: 'border-box', lineHeight: 1.5 }}
        placeholder="AI context — what's included, what to ask before quoting, conditions (e.g. 'labor only, materials extra — ask sq footage before quoting')"
        value={svc.notes}
        onChange={e => onChange({ ...svc, notes: e.target.value })}
      />
    </div>
  );
}
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
  const { business: authBusiness, reloadBusiness, user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Account tab state
  const [accountName, setAccountName] = useState('');
  const [pwResetSent, setPwResetSent] = useState(false);

  const [bizForm, setBizForm] = useState({ name: '', owner_phone: '' });
  const [services, setServices] = useState([]);
  const [requireApproval, setRequireApproval] = useState(false);
  const [avgJobValue, setAvgJobValue] = useState(400);
  const [appointmentDuration, setAppointmentDuration] = useState(60);
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [serviceArea, setServiceArea] = useState({ base_address: '', radius_miles: 25, outside_radius_behavior: 'reject' });
  const [blockedNumbers, setBlockedNumbers] = useState([]);
  const [blockInput, setBlockInput] = useState('');
  const blockInputRef = useRef(null);
  const [hours, setHours] = useState(defaultHours);
  const [greeting, setGreeting] = useState('');
  const [tone, setTone] = useState('friendly');
  const [faqs, setFaqs] = useState([]);

  useEffect(() => {
    if (authBusiness) setAccountName(authBusiness.owner_name || '');
  }, [authBusiness]);

  useEffect(() => {
    if (!authBusiness) return;
    setBizForm({
      name: authBusiness.name || '',
      owner_phone: authBusiness.owner_phone || '',
    });
    setServices(loadServices(authBusiness.services));
    setHours(authBusiness.business_hours || defaultHours);
    setGreeting(authBusiness.greeting || '');
    setTone(authBusiness.tone || 'friendly');
    setFaqs(authBusiness.faqs || []);
    setRequireApproval(!!authBusiness.require_approval);
    setAvgJobValue(authBusiness.avg_job_value ?? 400);
    setAppointmentDuration(authBusiness.appointment_duration ?? 60);
    setTimezone(authBusiness.timezone || 'America/Los_Angeles');
    setBlockedNumbers(authBusiness.blocked_numbers || []);
    setServiceArea({
      base_address: authBusiness.service_base_address || '',
      radius_miles: authBusiness.service_radius_miles ?? 25,
      outside_radius_behavior: authBusiness.outside_radius_behavior || 'reject',
    });
  }, [authBusiness]);

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function saveBusiness() {
    if (!authBusiness?.id) { setSaveError('Business not loaded — try refreshing.'); return; }
    setSaving(true); setSaveError('');
    try {
      await api.updateBusiness(authBusiness.id, {
        name: bizForm.name,
        owner_phone: bizForm.owner_phone,
        services,
        business_hours: hours,
        require_approval: requireApproval,
        service_base_address: serviceArea.base_address || null,
        service_radius_miles: serviceArea.radius_miles ? parseInt(serviceArea.radius_miles) : 25,
        outside_radius_behavior: serviceArea.outside_radius_behavior,
        avg_job_value: avgJobValue ? parseInt(avgJobValue) : 400,
        appointment_duration: appointmentDuration ? parseInt(appointmentDuration) : 60,
        timezone,
        blocked_numbers: blockedNumbers,
      });
      await reloadBusiness();
      flash();
    } catch (e) {
      setSaveError(e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  async function saveAi() {
    if (!authBusiness?.id) { setSaveError('Business not loaded — try refreshing.'); return; }
    setSaving(true); setSaveError('');
    try {
      await api.updateBusiness(authBusiness.id, { greeting, tone, faqs });
      await reloadBusiness();
      flash();
    } catch (e) {
      setSaveError(e.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  }

  function addFaq() { setFaqs([...faqs, { id: Date.now().toString(), q: '', a: '' }]); }
  function removeFaq(id) { setFaqs(faqs.filter(f => f.id !== id)); }
  function updateFaq(id, field, value) { setFaqs(faqs.map(f => f.id === id ? { ...f, [field]: value } : f)); }

  const SaveButton = ({ onClick }) => (
    <div>
      <button style={{ ...s.saveBtn, background: saved ? '#22c55e' : '#3b82f6' }} onClick={onClick} disabled={saving}>
        {saved ? <><Check size={16} /> Saved</> : saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
      </button>
      {saveError && <div style={{ marginTop: 8, fontSize: 13, color: '#ef4444' }}>{saveError}</div>}
    </div>
  );

  function renderAccountTab() {
    const email = user?.email || '';
    const memberSince = authBusiness?.created_at
      ? new Date(authBusiness.created_at).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })
      : '—';

    const saveAccount = async () => {
      if (!authBusiness?.id) return;
      setSaving(true); setSaveError('');
      try {
        await api.updateBusiness(authBusiness.id, { owner_name: accountName });
        await reloadBusiness();
        flash();
      } catch (e) {
        setSaveError(e.message || 'Save failed.');
      } finally {
        setSaving(false);
      }
    };

    const sendPasswordReset = async () => {
      if (!email) return;
      await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://www.ansaco.ai' });
      setPwResetSent(true);
    };

    const inp = { width: '100%', padding: '10px 12px', backgroundColor: '#141414', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' };

    return (
      <div style={{ maxWidth: 560 }}>
        <div style={{ background: '#141414', borderRadius: 12, border: '1px solid #222', padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 20 }}>Profile</div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Full name</label>
            <input style={inp} value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Your name" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, color: '#888', marginBottom: 6 }}>Email</label>
            <input style={{ ...inp, color: '#666', cursor: 'not-allowed' }} value={email} readOnly />
            <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>To change your email, contact <a href="mailto:hello@ansaco.ai" style={{ color: '#3b82f6' }}>hello@ansaco.ai</a>.</div>
          </div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
            Member since <span style={{ color: '#aaa', fontWeight: 500 }}>{memberSince}</span>
          </div>
          <SaveButton onClick={saveAccount} />
        </div>

        <div style={{ background: '#141414', borderRadius: 12, border: '1px solid #222', padding: 24 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Password</div>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>We'll send a reset link to <span style={{ color: '#aaa' }}>{email}</span>.</div>
          {pwResetSent
            ? <div style={{ fontSize: 13, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 6 }}><Check size={15} /> Reset email sent — check your inbox.</div>
            : <button onClick={sendPasswordReset} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #333', borderRadius: 10, color: '#aaa', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Send password reset email</button>
          }
        </div>
      </div>
    );
  }

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
        <div style={{ ...s.sectionTitle, marginTop: 28 }}>Services & Pricing</div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 14, lineHeight: 1.5 }}>
          Add your services with pricing so the AI can answer cost questions and give real estimates mid-conversation.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {services.map((svc, idx) => (
            <ServiceCard key={svc.id} svc={svc}
              onChange={updated => setServices(services.map((sv, i) => i === idx ? updated : sv))}
              onRemove={() => setServices(services.filter((_, i) => i !== idx))} />
          ))}
        </div>
        <button style={s.addFaqBtn} onClick={() => setServices([...services, newService()])}>
          <Plus size={15} /> Add Service
        </button>

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

        <div style={{ display: 'flex', gap: 16, marginTop: 16, alignItems: 'flex-end', marginBottom: 4 }}>
          <div style={{ maxWidth: 280 }}>
            <label style={s.label}>Timezone</label>
            <select style={{ ...s.input, cursor: 'pointer' }} value={timezone} onChange={e => setTimezone(e.target.value)}>
              <option value="America/New_York">Eastern (ET)</option>
              <option value="America/Chicago">Central (CT)</option>
              <option value="America/Denver">Mountain (MT)</option>
              <option value="America/Los_Angeles">Pacific (PT)</option>
              <option value="America/Phoenix">Arizona (no DST)</option>
              <option value="America/Anchorage">Alaska (AKT)</option>
              <option value="Pacific/Honolulu">Hawaii (HST)</option>
            </select>
          </div>
        </div>

        <div style={{ ...s.sectionTitle, marginTop: 28 }}>Service Area</div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 14, lineHeight: 1.5 }}>
          Set your base location and radius. The AI will ask for the job address before booking, and the system will check if it falls within range.
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={s.label}><MapPin size={13} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }} />Base Address</label>
            <input
              style={s.input}
              placeholder="e.g. 2158 Loggia, Newport Beach CA 92660"
              value={serviceArea.base_address}
              onChange={e => setServiceArea(a => ({ ...a, base_address: e.target.value }))}
            />
          </div>
          <div style={{ width: 120 }}>
            <label style={s.label}>Radius (miles)</label>
            <input
              style={s.input}
              type="number"
              min="1"
              max="500"
              value={serviceArea.radius_miles}
              onChange={e => setServiceArea(a => ({ ...a, radius_miles: e.target.value }))}
            />
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ ...s.label, marginBottom: 10 }}>When a customer is outside the radius</label>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { value: 'pending', label: 'Hold as Pending', sub: 'AI texts "pending address confirmation" — you review and approve', color: '#f59e0b' },
              { value: 'reject',  label: 'Decline Request',  sub: 'AI texts a polite sorry message — no appointment created', color: '#ef4444' },
            ].map(opt => {
              const active = serviceArea.outside_radius_behavior === opt.value;
              return (
                <div
                  key={opt.value}
                  onClick={() => setServiceArea(a => ({ ...a, outside_radius_behavior: opt.value }))}
                  style={{ flex: 1, background: active ? `${opt.color}12` : '#1a1a1a', border: `1px solid ${active ? opt.color : '#2a2a2a'}`, borderRadius: 10, padding: '14px 16px', cursor: 'pointer', transition: 'all .15s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${active ? opt.color : '#444'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {active && <div style={{ width: 6, height: 6, borderRadius: '50%', background: opt.color }} />}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: active ? '#fff' : '#aaa' }}>{opt.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5, paddingLeft: 22 }}>{opt.sub}</div>
                </div>
              );
            })}
          </div>
          {!serviceArea.base_address && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
              Leave base address blank to disable service area checking — AI won't ask for address and all bookings are accepted.
            </div>
          )}
        </div>

        <div style={{ ...s.sectionTitle, marginTop: 28 }}>Appointment Settings</div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ maxWidth: 200 }}>
            <label style={s.label}>Appointment Duration</label>
            <select style={{ ...s.input, cursor: 'pointer' }} value={appointmentDuration} onChange={e => setAppointmentDuration(e.target.value)}>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '16px 18px', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Require approval before confirming</div>
            <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>
              When on, appointments are held as <span style={{ color: '#f59e0b', fontWeight: 600 }}>Pending</span> until you approve them in the Appointments page. Customer is told you'll confirm shortly.
            </div>
          </div>
          <button
            onClick={() => setRequireApproval(v => !v)}
            style={{
              width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', flexShrink: 0, marginLeft: 20,
              background: requireApproval ? '#3b82f6' : '#333',
              position: 'relative', transition: 'background .2s',
            }}>
            <span style={{
              position: 'absolute', top: 3, left: requireApproval ? 25 : 3,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left .2s', display: 'block',
            }} />
          </button>
        </div>

        <div style={{ ...s.sectionTitle, marginTop: 28 }}>Blocked Numbers</div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 14, lineHeight: 1.5 }}>
          Numbers added here will never receive an AI text-back after a missed call. Use this for spam callers, wrong numbers, or vendors.
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            ref={blockInputRef}
            style={{ ...s.input, flex: 1 }}
            placeholder="Enter phone number (e.g. +12135550199)"
            value={blockInput}
            onChange={e => setBlockInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                const num = blockInput.trim();
                if (num && !blockedNumbers.includes(num)) setBlockedNumbers([...blockedNumbers, num]);
                setBlockInput('');
              }
            }}
          />
          <button
            style={{ ...s.saveBtn, marginTop: 0, background: '#1e1e1e', border: '1px solid #333', color: '#aaa' }}
            onClick={() => {
              const num = blockInput.trim();
              if (num && !blockedNumbers.includes(num)) setBlockedNumbers([...blockedNumbers, num]);
              setBlockInput('');
              blockInputRef.current?.focus();
            }}>
            <Ban size={15} /> Block
          </button>
        </div>
        {blockedNumbers.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {blockedNumbers.map(num => (
              <div key={num} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 14px' }}>
                <span style={{ fontSize: 13, color: '#ccc', fontFamily: 'monospace' }}>{num}</span>
                <button onClick={() => setBlockedNumbers(blockedNumbers.filter(n => n !== num))}
                  style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        {blockedNumbers.length === 0 && (
          <div style={{ fontSize: 13, color: '#444', fontStyle: 'italic', marginBottom: 16 }}>No numbers blocked.</div>
        )}

        <div style={{ ...s.sectionTitle, marginTop: 28 }}>Revenue Tracking</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
          <div style={{ maxWidth: 200 }}>
            <label style={s.label}>Average Job Value ($)</label>
            <input
              style={s.input}
              type="number"
              min="1"
              placeholder="400"
              value={avgJobValue}
              onChange={e => setAvgJobValue(e.target.value)}
            />
          </div>
          <div style={{ fontSize: 13, color: '#555', paddingBottom: 12, lineHeight: 1.5 }}>
            Used to calculate revenue recovered on your dashboard.
          </div>
        </div>

        <SaveButton onClick={saveBusiness} />
      </div>
    );
  }

  function renderAiTab() {
    const servicesPreview = services.length === 0 ? 'No services configured yet.'
      : services.map(svc => {
          if (svc.pricing_type === 'free_estimate') return `• ${svc.name}: Free estimate`;
          const low = svc.price_low; const high = svc.price_high;
          const unit = { per_sq_ft: '/sq ft', per_linear_ft: '/linear ft', hourly: '/hr', per_unit: svc.unit ? `/${svc.unit}` : '/unit', flat_rate: '', starting_at: '' }[svc.pricing_type] || '';
          const price = svc.pricing_type === 'starting_at' ? `from $${low}` : (high ? `$${low}–$${high}${unit}` : `$${low}${unit}`);
          return `• ${svc.name}: ${price}${svc.notes ? ` — ${svc.notes}` : ''}`;
        }).join('\n');
    const systemPrompt = `Tone: ${tone}\nGreeting: "${greeting}"\n\nServices & Pricing:\n${servicesPreview}\n\nThe AI uses the pricing above to answer customer cost questions and do math mid-conversation.`;
    return (
      <div style={s.section}>
        <div style={s.sectionTitle}>Greeting Message</div>
        <div style={s.formGroup}>
          <label style={s.label}>First message sent after a missed call</label>
          <textarea style={s.textarea} value={greeting} onChange={e => setGreeting(e.target.value)} rows={3} />
        </div>

        <div style={{ ...s.sectionTitle, marginTop: 24 }}>AI Tone</div>
        <div style={s.toneGrid}>
          {toneOptions.map(t => <button key={t} style={s.toneBtn(tone?.toLowerCase() === t.toLowerCase())} onClick={() => setTone(t.toLowerCase())}>{t}</button>)}
        </div>

        <div style={{ ...s.sectionTitle, marginTop: 28 }}>FAQ Manager</div>
        <div style={s.faqList}>
          {faqs.map(faq => (
            <div key={faq.id} style={s.faqItem}>
              <input
                style={{ ...s.input, marginBottom: 8, fontSize: 13, fontWeight: 600 }}
                placeholder="Question — e.g. Do you offer free estimates?"
                value={faq.q}
                onChange={e => updateFaq(faq.id, 'q', e.target.value)}
              />
              <textarea
                style={{ ...s.textarea, minHeight: 56, fontSize: 13 }}
                placeholder="Answer — e.g. Yes, all estimates are free with no obligation."
                value={faq.a}
                onChange={e => updateFaq(faq.id, 'a', e.target.value)}
                rows={2}
              />
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
    const stripeConnected = !!authBusiness?.stripe_customer_id;
    const configs = [
      { key: 'twilio', name: 'Twilio', desc: twilioConnected ? `Number: ${authBusiness.twilio_number}` : 'No number provisioned', icon: Phone, connected: twilioConnected },
      { key: 'googleCalendar', name: 'Google Calendar', desc: calendarConnected ? 'Connected' : 'Not connected — click to connect', icon: Clock, connected: calendarConnected },
      { key: 'stripe', name: 'Stripe', desc: stripeConnected ? 'Billing active' : 'Not connected', icon: CreditCard, connected: stripeConnected },
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
            {cfg.key === 'googleCalendar' && calendarConnected && authBusiness?.id && (
              <button
                onClick={async () => {
                  try { await api.disconnectGoogle(authBusiness.id); await reloadBusiness(); }
                  catch (_) { alert('Failed to disconnect Google Calendar. Please try again.'); }
                }}
                style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'transparent', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer' }}>
                Disconnect
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  async function goToCheckout() {
    if (!authBusiness?.id) return;
    const apiUrl = import.meta.env.VITE_API_URL || 'https://ansa-production.up.railway.app';
    const res = await fetch(`${apiUrl}/api/stripe/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: authBusiness.id }),
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  async function goToBillingPortal() {
    if (!authBusiness?.id) return;
    const apiUrl = import.meta.env.VITE_API_URL || 'https://ansa-production.up.railway.app';
    const res = await fetch(`${apiUrl}/api/stripe/portal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: authBusiness.id }),
    });
    const { url, error } = await res.json();
    if (url) window.location.href = url;
    else alert(error || 'No active subscription found.');
  }

  function renderBillingTab() {
    const status = authBusiness?.subscription_status;
    const isActive = status === 'active' || status === 'trialing';

    return (
      <div>
        <div style={s.billingCard}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Pro Plan</span>
            {isActive && <span style={s.planBadge}>ACTIVE</span>}
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
            $297<span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>/mo</span>
          </div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>
            Unlimited missed call text-backs, AI conversations, and appointment bookings.
          </div>
          {isActive ? (
            <button onClick={goToBillingPortal} style={{ ...s.saveBtn, background: 'transparent', border: '1px solid #333', color: '#aaa' }}>
              Manage Billing / Cancel
            </button>
          ) : (
            <button onClick={goToCheckout} style={s.saveBtn}>
              Upgrade to Pro — $297/mo
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
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
      {activeTab === 'account' && renderAccountTab()}
      {activeTab === 'business' && renderBusinessTab()}
      {activeTab === 'ai' && renderAiTab()}
      {activeTab === 'integrations' && renderIntegrationsTab()}
      {activeTab === 'billing' && renderBillingTab()}
    </div>
  );
}
