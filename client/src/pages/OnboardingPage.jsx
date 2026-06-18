import { useState, useRef, useEffect } from 'react';
import { MapPin, FileText, Plus, Trash2, Calendar, CreditCard, CheckCircle2, ChevronLeft, ChevronRight, Rocket, PhoneCall, Clock, MessageSquare, Zap, Phone, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const US_CITIES = [
  'Atlanta, GA','Austin, TX','Baltimore, MD','Boston, MA','Charlotte, NC','Chicago, IL',
  'Cincinnati, OH','Cleveland, OH','Columbus, OH','Dallas, TX','Denver, CO','Detroit, MI',
  'El Paso, TX','Fort Worth, TX','Fresno, CA','Houston, TX','Indianapolis, IN','Jacksonville, FL',
  'Kansas City, MO','Las Vegas, NV','Long Beach, CA','Los Angeles, CA','Louisville, KY',
  'Memphis, TN','Mesa, AZ','Miami, FL','Milwaukee, WI','Minneapolis, MN','Nashville, TN',
  'New Orleans, LA','New York, NY','Oakland, CA','Oklahoma City, OK','Omaha, NE','Orlando, FL',
  'Philadelphia, PA','Phoenix, AZ','Pittsburgh, PA','Portland, OR','Raleigh, NC','Richmond, VA',
  'Sacramento, CA','San Antonio, TX','San Diego, CA','San Francisco, CA','San Jose, CA',
  'Seattle, WA','St. Louis, MO','Tampa, FL','Tucson, AZ','Virginia Beach, VA','Washington, DC',
];

function CityAutocomplete({ value, onChange }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const matches = query.length >= 2
    ? US_CITIES.filter(c => c.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const handleClick = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const select = city => { setQuery(city); onChange(city); setOpen(false); };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <MapPin size={18} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
      <input
        type="text" value={query} placeholder="Los Angeles, CA"
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={e => { e.target.style.borderColor='#3b82f6'; setOpen(true); }}
        onBlur={e => { e.target.style.borderColor='#2a2a2a'; onChange(query); }}
        style={{ width:'100%',padding:'13px 13px 13px 40px',backgroundColor:'#0f0f0f',border:'1px solid #2a2a2a',borderRadius:'10px',color:'#fff',fontSize:'15px',outline:'none',boxSizing:'border-box',transition:'border-color .15s' }}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <div style={{ position:'absolute',top:'calc(100% + 4px)',left:0,right:0,backgroundColor:'#1a1a1a',border:'1px solid #2a2a2a',borderRadius:'10px',zIndex:100,overflow:'hidden' }}>
          {matches.map(city => (
            <div key={city} onMouseDown={() => select(city)}
              style={{ padding:'11px 14px',color:'#fff',fontSize:'14px',cursor:'pointer',transition:'background .1s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor='#242424'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAY_KEYS = ['mon','tue','wed','thu','fri','sat','sun'];
const HOURS = [];
for (let h = 0; h < 24; h++) {
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  HOURS.push(`${hour}:00 ${suffix}`);
  HOURS.push(`${hour}:30 ${suffix}`);
}

const DEFAULT_FAQS = {
  Plumbing: [
    { q:'Do you handle emergency calls?', a:'Yes, we respond to emergencies 24/7.' },
    { q:'Do you offer free estimates?', a:'Yes! We offer free estimates for all jobs.' },
  ],
  default: [
    { q:'Do you offer free estimates?', a:'Yes! We offer free estimates for all jobs.' },
    { q:'What areas do you serve?', a:'We serve the local area — just provide your address when booking.' },
  ],
};

const TONES = [
  {
    value: 'Professional',
    label: 'Professional',
    desc: 'Formal and polished',
  },
  {
    value: 'Friendly',
    label: 'Friendly',
    desc: 'Warm and approachable',
  },
  {
    value: 'Casual',
    label: 'Casual',
    desc: 'Relaxed and real',
  },
];

const inp = { width:'100%',padding:'13px',backgroundColor:'#0f0f0f',border:'1px solid #2a2a2a',borderRadius:'10px',color:'#fff',fontSize:'14px',outline:'none',boxSizing:'border-box',transition:'border-color .15s' };

function timeStringToHHMM(str) {
  const match = str.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return '08:00';
  let h = parseInt(match[1]);
  const m = match[2];
  const period = match[3].toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2,'0')}:${m}`;
}

const STEP_META = [
  { label: 'Service Area', icon: MapPin },
  { label: 'Your Hours',   icon: Clock },
  { label: 'AI Voice',     icon: MessageSquare },
  { label: 'Launch',       icon: Rocket },
];

function SmsPreview({ businessName, greeting }) {
  const preview = greeting?.slice(0, 120) + (greeting?.length > 120 ? '…' : '');
  return (
    <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: 16, padding: '16px', marginTop: 20 }}>
      <div style={{ fontSize: 11, color: '#555', fontWeight: 600, letterSpacing: '.5px', marginBottom: 12, textTransform: 'uppercase' }}>Customer sees this SMS</div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1e1e1e', border: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 13, fontWeight: 700, color: '#fff' }}>
          {(businessName || 'B').charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 5, fontWeight: 600 }}>{businessName || 'Your Business'}</div>
          <div style={{ background: '#1e1e1e', borderRadius: '16px 16px 16px 4px', padding: '10px 14px', fontSize: 13, color: '#d1d5db', lineHeight: 1.55, maxWidth: 280 }}>
            {preview || 'Your greeting will appear here...'}
          </div>
          <div style={{ fontSize: 11, color: '#444', marginTop: 5 }}>Delivered · Just now</div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const { signUp, user } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [launchError, setLaunchError] = useState('');
  const [provisionWarning, setProvisionWarning] = useState('');
  const [animating, setAnimating] = useState(false);

  const stored = JSON.parse(localStorage.getItem('ansa_signup') || '{}');

  const [businessName] = useState(stored.businessName || '');
  const [businessType] = useState(stored.businessType || '');
  const [serviceArea, setServiceArea] = useState('');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState(DAYS.map((day,i) => ({ day, enabled: i < 5, start:'8:00 AM', end:'6:00 PM' })));
  const [greeting, setGreeting] = useState('');
  const [faqs, setFaqs] = useState(DEFAULT_FAQS.default);
  const [tone, setTone] = useState('Friendly');
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const TONE_GREETINGS = {
    Professional: `Hello, you've reached ${businessName || 'us'}. We missed your call but we're on it — how can we help you today?`,
    Friendly: `Hey! Sorry we missed your call — we're on a job right now. How can we help you? We'll get back to you fast!`,
    Casual: `Hey! Missed your call but we got you. What can we help you with?`,
  };

  const getGreeting = (t = tone) => TONE_GREETINGS[t] || TONE_GREETINGS.Friendly;

  const handleToneChange = (t) => {
    setTone(t);
    setGreeting(getGreeting(t));
  };

  const canContinue = () => {
    if (step === 1) return !!serviceArea;
    if (step === 2) return schedule.some(s => s.enabled);
    return true;
  };

  function goToStep(next) {
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 150);
  }

  async function handleLaunch() {
    const creds = JSON.parse(localStorage.getItem('ansa_signup') || '{}');
    if (!creds.email) { window.location.hash = user ? '#/dashboard' : '#/signup'; return; }

    setSaving(true);
    setLaunchError('');

    const business_hours = {};
    schedule.forEach((s, i) => {
      business_hours[DAY_KEYS[i]] = s.enabled
        ? { open: timeStringToHHMM(s.start), close: timeStringToHHMM(s.end) }
        : null;
    });

    const { error, businessId, provisionError } = await signUp({
      email: creds.email,
      password: creds.password,
      fullName: creds.fullName,
      businessName: creds.businessName,
      businessPhone: creds.businessPhone,
      businessType: creds.businessType,
      businessHours: business_hours,
      services: description ? [description] : undefined,
      greeting: greeting || getGreeting(),
    });

    if (error) {
      setSaving(false);
      setLaunchError(error.message);
      return;
    }

    localStorage.removeItem('ansa_signup');

    if (provisionError) setProvisionWarning("Your number couldn't be provisioned automatically — contact hello@ansaco.ai.");

    const apiUrl = import.meta.env.VITE_API_URL || 'https://ansa-production.up.railway.app';
    try {
      const stripeRes = await fetch(`${apiUrl}/api/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId }),
      });
      const stripeData = await stripeRes.json();
      if (stripeData.bypass) { window.location.hash = '#/dashboard'; return; }
      if (stripeData.url) { window.location.href = stripeData.url; return; }
    } catch (e) {
      console.error('Stripe checkout failed:', e);
    }

    setSaving(false);
    window.location.hash = '#/dashboard';
  }

  const handleContinue = () => {
    if (step === 4) { handleLaunch(); return; }
    if (step === 1 && !greeting) {
      setGreeting(getGreeting());
      setFaqs(DEFAULT_FAQS[businessType] || DEFAULT_FAQS.default);
    }
    goToStep(step + 1);
  };

  return (
    <div style={{ minHeight:'100vh', backgroundColor:'#0a0a0a', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start', padding:'40px 20px', fontFamily:'-apple-system,BlinkMacSystemFont,"Inter",sans-serif' }}>
      <div style={{ width:'100%', maxWidth:'540px' }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'32px', fontSize:'26px', fontWeight:'800', color:'#fff', letterSpacing:'-.5px' }}>
          ansa<span style={{ color:'#3b82f6' }}>.</span>
        </div>

        {/* Step indicators */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, marginBottom:'32px' }}>
          {STEP_META.map((meta, i) => {
            const num = i + 1;
            const done = step > num;
            const active = step === num;
            const Icon = meta.icon;
            return (
              <div key={num} style={{ display:'flex', alignItems:'center' }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                    background: done ? '#22c55e' : active ? '#3b82f6' : '#1a1a1a',
                    border: `2px solid ${done ? '#22c55e' : active ? '#3b82f6' : '#2a2a2a'}`,
                    transition: 'all .3s',
                  }}>
                    {done
                      ? <CheckCircle2 size={16} color="#fff" />
                      : <Icon size={15} color={active ? '#fff' : '#444'} />
                    }
                  </div>
                  <span style={{ fontSize:11, color: active ? '#fff' : done ? '#22c55e' : '#444', fontWeight: active ? 600 : 400, whiteSpace:'nowrap' }}>{meta.label}</span>
                </div>
                {i < STEP_META.length - 1 && (
                  <div style={{ width: 48, height: 2, background: step > num ? '#22c55e' : '#1e1e1e', margin:'0 4px', marginBottom:20, transition:'background .3s', flexShrink:0 }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(8px)' : 'translateY(0)', transition:'opacity .15s, transform .15s', backgroundColor:'#111', borderRadius:'18px', border:'1px solid #1e1e1e', boxShadow:'0 24px 60px rgba(0,0,0,0.5)', padding:'32px', marginBottom:'20px' }}>

          {/* ── STEP 1: Service Area ── */}
          {step === 1 && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:'rgba(59,130,246,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <MapPin size={18} color="#3b82f6" />
                </div>
                <h2 style={{ fontSize:'20px', fontWeight:'700', color:'#fff', margin:0 }}>Where do you work?</h2>
              </div>
              <p style={{ fontSize:'14px', color:'#666', margin:'0 0 24px 0', lineHeight:1.6 }}>
                Ansa will ask customers for their job address before booking — and automatically decline requests that are too far out.
              </p>

              <div style={{ marginBottom:20 }}>
                <label style={{ display:'block', fontSize:'13px', color:'#888', marginBottom:8, fontWeight:500 }}>Your city / service area <span style={{ color:'#ef4444' }}>*</span></label>
                <CityAutocomplete value={serviceArea} onChange={setServiceArea} />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'13px', color:'#888', marginBottom:8, fontWeight:500 }}>What type of work do you do? <span style={{ color:'#555', fontWeight:400 }}>(optional)</span></label>
                <div style={{ position:'relative' }}>
                  <FileText size={16} color="#555" style={{ position:'absolute', left:'13px', top:'14px', pointerEvents:'none' }} />
                  <textarea value={description} onChange={e => setDescription(e.target.value)}
                    placeholder="e.g. HVAC repair and installation, residential and commercial..."
                    rows={3}
                    style={{ ...inp, paddingLeft:'40px', resize:'vertical' }}
                    onFocus={e => e.target.style.borderColor='#3b82f6'}
                    onBlur={e => e.target.style.borderColor='#2a2a2a'}
                  />
                </div>
                <p style={{ fontSize:12, color:'#444', marginTop:8, lineHeight:1.5 }}>
                  The more you tell us, the better your AI can answer customer questions.
                </p>
              </div>

              <div style={{ display:'flex', gap:10, marginTop:24, padding:'14px 16px', background:'rgba(59,130,246,0.06)', borderRadius:10, border:'1px solid rgba(59,130,246,0.15)' }}>
                <Zap size={15} color="#3b82f6" style={{ flexShrink:0, marginTop:1 }} />
                <span style={{ fontSize:13, color:'#888', lineHeight:1.55 }}>
                  Ansa texts back missed calls in <strong style={{ color:'#fff' }}>under 15 seconds</strong> — while you're still on the job.
                </span>
              </div>
            </div>
          )}

          {/* ── STEP 2: Business Hours ── */}
          {step === 2 && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:'rgba(59,130,246,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Clock size={18} color="#3b82f6" />
                </div>
                <h2 style={{ fontSize:'20px', fontWeight:'700', color:'#fff', margin:0 }}>When are you open?</h2>
              </div>
              <p style={{ fontSize:'14px', color:'#666', margin:'0 0 24px 0', lineHeight:1.6 }}>
                Ansa responds to customers 24/7, but will only <strong style={{ color:'#aaa' }}>book appointments</strong> during your open hours. Toggle the days you work.
              </p>

              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {schedule.map((s,i) => (
                  <div key={s.day} style={{ backgroundColor:'#0f0f0f', borderRadius:10, border:`1px solid ${s.enabled ? '#2a2a2a' : '#1a1a1a'}`, padding:'12px 16px', display:'flex', alignItems:'center', gap:12, opacity:s.enabled?1:0.45, transition:'opacity .2s' }}>
                    <button
                      onClick={() => setSchedule(prev => prev.map((x,j) => j===i?{...x,enabled:!x.enabled}:x))}
                      style={{ width:40, height:22, borderRadius:11, border:'none', backgroundColor:s.enabled?'#3b82f6':'#2a2a2a', cursor:'pointer', position:'relative', flexShrink:0, transition:'background .2s' }}>
                      <div style={{ width:18, height:18, borderRadius:'50%', backgroundColor:'#fff', position:'absolute', top:'2px', left:s.enabled?'20px':'2px', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,.3)' }} />
                    </button>
                    <span style={{ fontSize:13, color:s.enabled?'#fff':'#555', width:32, fontWeight:600 }}>{s.day}</span>
                    {s.enabled ? (
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
                        <select value={s.start} onChange={e => setSchedule(prev => prev.map((x,j) => j===i?{...x,start:e.target.value}:x))}
                          style={{ padding:'6px 8px', backgroundColor:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:6, color:'#fff', fontSize:12, outline:'none' }}>
                          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span style={{ color:'#444', fontSize:12 }}>to</span>
                        <select value={s.end} onChange={e => setSchedule(prev => prev.map((x,j) => j===i?{...x,end:e.target.value}:x))}
                          style={{ padding:'6px 8px', backgroundColor:'#1a1a1a', border:'1px solid #2a2a2a', borderRadius:6, color:'#fff', fontSize:12, outline:'none' }}>
                          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    ) : (
                      <span style={{ marginLeft:'auto', fontSize:12, color:'#333' }}>Closed</span>
                    )}
                  </div>
                ))}
              </div>

              <div style={{ marginTop:16, padding:'12px 16px', background:'#0f0f0f', borderRadius:10, border:'1px solid #1e1e1e', fontSize:13, color:'#555', lineHeight:1.55 }}>
                You can update your hours anytime in <strong style={{ color:'#666' }}>Settings → Business Info</strong>.
              </div>
            </div>
          )}

          {/* ── STEP 3: AI Voice ── */}
          {step === 3 && (
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:'rgba(59,130,246,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <MessageSquare size={18} color="#3b82f6" />
                </div>
                <h2 style={{ fontSize:'20px', fontWeight:'700', color:'#fff', margin:0 }}>How should Ansa sound?</h2>
              </div>
              <p style={{ fontSize:'14px', color:'#666', margin:'0 0 20px 0', lineHeight:1.6 }}>
                Pick a tone for your AI. The first message your customer gets sets the whole vibe — choose what fits your business.
              </p>

              <div style={{ display:'flex', gap:10, marginBottom:20 }}>
                {TONES.map(t => (
                  <button key={t.value}
                    onClick={() => handleToneChange(t.value)}
                    style={{ flex:1, padding:'14px 10px', background:tone===t.value?'rgba(59,130,246,0.12)':'#0f0f0f', border:`1px solid ${tone===t.value?'#3b82f6':'#2a2a2a'}`, borderRadius:12, cursor:'pointer', textAlign:'center', transition:'all .15s' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:tone===t.value?'#fff':'#aaa', marginBottom:2 }}>{t.label}</div>
                    <div style={{ fontSize:11, color:'#555' }}>{t.desc}</div>
                  </button>
                ))}
              </div>

              <SmsPreview businessName={businessName} greeting={greeting || getGreeting()} />

              <div style={{ marginTop:20 }}>
                <label style={{ display:'block', fontSize:13, color:'#888', marginBottom:8, fontWeight:500 }}>
                  Edit your greeting <span style={{ color:'#555', fontWeight:400 }}>(optional)</span>
                </label>
                <textarea
                  value={greeting || getGreeting()}
                  onChange={e => setGreeting(e.target.value)}
                  rows={3}
                  style={{ ...inp, resize:'vertical' }}
                  onFocus={e => e.target.style.borderColor='#3b82f6'}
                  onBlur={e => e.target.style.borderColor='#2a2a2a'}
                />
                <p style={{ fontSize:12, color:'#444', marginTop:6, lineHeight:1.5 }}>
                  This is the first text your customer receives. Keep it short and human.
                </p>
              </div>

              <div style={{ marginTop:20 }}>
                <label style={{ display:'block', fontSize:13, color:'#888', marginBottom:10, fontWeight:500 }}>Common questions your AI will know how to answer</label>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {faqs.map((faq, i) => (
                    <div key={i} style={{ background:'#0f0f0f', borderRadius:10, border:'1px solid #2a2a2a', padding:'14px', position:'relative' }}>
                      <button onClick={() => setFaqs(faqs.filter((_,j) => j!==i))}
                        style={{ position:'absolute', top:10, right:10, background:'none', border:'none', cursor:'pointer', padding:4, opacity:.6 }}
                        onMouseEnter={e=>e.currentTarget.style.opacity=1} onMouseLeave={e=>e.currentTarget.style.opacity=.6}>
                        <Trash2 size={14} color="#666" />
                      </button>
                      <input type="text" value={faq.q}
                        onChange={e => setFaqs(faqs.map((f,j) => j===i?{...f,q:e.target.value}:f))}
                        placeholder="Question"
                        style={{ ...inp, marginBottom:8, fontWeight:500 }}
                        onFocus={e => e.target.style.borderColor='#3b82f6'}
                        onBlur={e => e.target.style.borderColor='#2a2a2a'}
                      />
                      <textarea value={faq.a}
                        onChange={e => setFaqs(faqs.map((f,j) => j===i?{...f,a:e.target.value}:f))}
                        placeholder="Answer" rows={2}
                        style={{ ...inp, resize:'vertical' }}
                        onFocus={e => e.target.style.borderColor='#3b82f6'}
                        onBlur={e => e.target.style.borderColor='#2a2a2a'}
                      />
                    </div>
                  ))}
                </div>
                <button onClick={() => setFaqs([...faqs, { q:'', a:'' }])}
                  style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, background:'none', border:'1px dashed #2a2a2a', borderRadius:10, padding:'10px 16px', color:'#3b82f6', fontSize:13, cursor:'pointer', width:'100%', justifyContent:'center' }}>
                  <Plus size={15} /> Add a question
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Launch ── */}
          {step === 4 && (
            <div>
              <div style={{ textAlign:'center', marginBottom:28 }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(59,130,246,0.12)', border:'1px solid rgba(59,130,246,0.25)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <Rocket size={28} color="#3b82f6" />
                </div>
                <h2 style={{ fontSize:'22px', fontWeight:'800', color:'#fff', margin:'0 0 8px 0' }}>You're ready to launch</h2>
                <p style={{ fontSize:'14px', color:'#666', margin:0, lineHeight:1.6 }}>
                  Here's exactly what happens when you click the button below.
                </p>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
                {[
                  { icon: Phone, color: '#3b82f6', title: 'Your Ansa number is provisioned', desc: 'A dedicated phone number is created for your business. Forward your calls to it and Ansa handles the rest.' },
                  { icon: MessageSquare, color: '#8b5cf6', title: 'Your AI goes live immediately', desc: 'Ansa starts responding to missed calls within seconds — using the tone and hours you just set.' },
                  { icon: Calendar, color: '#22c55e', title: 'You get a 30-day free trial', desc: 'No charge today. Your card is billed after 30 days. Cancel anytime before then and you won\'t be charged.' },
                  { icon: CreditCard, color: '#f59e0b', title: 'Stripe checkout opens next', desc: 'We\'ll open a secure payment page. Add your card to activate the trial — nothing is charged now.' },
                ].map(({ icon: Icon, color, title, desc }) => (
                  <div key={title} style={{ display:'flex', gap:14, padding:'14px 16px', background:'#0f0f0f', borderRadius:12, border:'1px solid #1e1e1e', alignItems:'flex-start' }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                      <Icon size={18} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:'#fff', marginBottom:3 }}>{title}</div>
                      <div style={{ fontSize:13, color:'#555', lineHeight:1.55 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 16px', background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.15)', borderRadius:10 }}>
                <CheckCircle2 size={16} color="#22c55e" style={{ flexShrink:0 }} />
                <span style={{ fontSize:13, color:'#888', lineHeight:1.5 }}>
                  Your settings are saved. You can change everything later in <strong style={{ color:'#aaa' }}>Settings</strong>.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {launchError && (
          <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:10, padding:'12px 16px', color:'#ef4444', fontSize:13, marginBottom:16, lineHeight:1.5 }}>
            {launchError}
          </div>
        )}
        {provisionWarning && (
          <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:10, padding:'12px 16px', color:'#f59e0b', fontSize:13, marginBottom:16, lineHeight:1.5 }}>
            {provisionWarning}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
          {step > 1 ? (
            <button onClick={() => goToStep(step - 1)}
              style={{ padding:'13px 24px', backgroundColor:'transparent', color:'#888', border:'1px solid #2a2a2a', borderRadius:10, fontSize:14, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'border-color .15s, color .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#444'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#2a2a2a'; e.currentTarget.style.color='#888'; }}>
              <ChevronLeft size={16} /> Back
            </button>
          ) : showBackConfirm ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'14px 16px' }}>
              <div style={{ fontSize:13, color:'#fca5a5', fontWeight:600 }}>Leave setup? Your progress will be lost.</div>
              <div style={{ display:'flex', gap:8 }}>
                <button onClick={() => setShowBackConfirm(false)} style={{ flex:1, padding:'8px', borderRadius:8, border:'1px solid #333', background:'transparent', color:'#aaa', fontSize:13, cursor:'pointer', fontWeight:500 }}>Cancel</button>
                <button onClick={() => { localStorage.removeItem('ansa_signup'); window.location.hash = user ? '#/dashboard' : '#/'; }} style={{ flex:1, padding:'8px', borderRadius:8, border:'none', background:'#ef4444', color:'#fff', fontSize:13, cursor:'pointer', fontWeight:700 }}>Leave</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowBackConfirm(true)}
              style={{ padding:'13px 24px', backgroundColor:'transparent', color:'#888', border:'1px solid #2a2a2a', borderRadius:10, fontSize:14, fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:6, transition:'border-color .15s, color .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='#444'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='#2a2a2a'; e.currentTarget.style.color='#888'; }}>
              <ChevronLeft size={16} /> Back to home
            </button>
          )}

          <button
            onClick={handleContinue}
            disabled={!canContinue() || saving}
            style={{
              flex: step === 4 ? 1 : 0,
              padding: step === 4 ? '15px 32px' : '13px 28px',
              backgroundColor: !canContinue() ? '#1a2a40' : step === 4 ? '#3b82f6' : '#3b82f6',
              color: !canContinue() ? '#3a5a7a' : '#fff',
              border: 'none', borderRadius: 10,
              fontSize: step === 4 ? '16px' : '14px',
              fontWeight: 700, cursor: canContinue() && !saving ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: canContinue() && step === 4 ? '0 4px 20px rgba(59,130,246,0.4)' : 'none',
              transition: 'all .2s',
            }}
            onMouseEnter={e => { if (canContinue()) e.currentTarget.style.transform='translateY(-1px)'; }}
            onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}
          >
            {step === 4
              ? saving
                ? <><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} /> Setting up your account...</>
                : <><Rocket size={18} /> Launch Ansa — Start Free Trial</>
              : <>Continue <ChevronRight size={16} /></>
            }
          </button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
