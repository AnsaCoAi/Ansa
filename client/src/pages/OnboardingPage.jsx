import React, { useState, useRef, useEffect } from 'react';
import { Building2, MapPin, Phone, FileText, MessageSquare, Plus, Trash2, Calendar, CreditCard, CheckCircle2, ChevronLeft, ChevronRight, Rocket, PhoneCall } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

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
        onChange={e => { setQuery(e.target.value); onChange(''); setOpen(true); }}
        onFocus={e => { e.target.style.borderColor='#3b82f6'; setOpen(true); }}
        onBlur={e => e.target.style.borderColor='#333'}
        style={{ width:'100%',padding:'12px 12px 12px 40px',backgroundColor:'#141414',border:'1px solid #333',borderRadius:'10px',color:'#ffffff',fontSize:'14px',outline:'none',boxSizing:'border-box' }}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <div style={{ position:'absolute',top:'calc(100% + 4px)',left:0,right:0,backgroundColor:'#1a1a1a',border:'1px solid #333',borderRadius:'10px',zIndex:100,overflow:'hidden' }}>
          {matches.map(city => (
            <div key={city} onMouseDown={() => select(city)}
              style={{ padding:'10px 14px',color:'#fff',fontSize:'14px',cursor:'pointer' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor='#2a2a2a'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const BUSINESS_TYPES = ['Plumbing','HVAC','Electrical','Roofing','Landscaping','General Contractor','Other'];
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
    { q:'Do you handle emergency plumbing?', a:'Yes, we offer 24/7 emergency plumbing services.' },
    { q:'What areas do you serve?', a:'We serve the greater metro area within a 30-mile radius.' },
    { q:'Do you provide free estimates?', a:'Yes! We offer free estimates for all plumbing jobs.' },
  ],
  default: [
    { q:'What are your hours?', a:'We are available Monday through Friday, 8 AM to 6 PM.' },
    { q:'Do you provide free estimates?', a:'Yes! We offer free estimates for all jobs.' },
    { q:'What areas do you serve?', a:'We serve the greater metro area within a 30-mile radius.' },
  ],
};

const inp = { width:'100%',padding:'12px 12px 12px 40px',backgroundColor:'#141414',border:'1px solid #333',borderRadius:'10px',color:'#ffffff',fontSize:'14px',outline:'none',boxSizing:'border-box' };
const inpNP = { ...inp, paddingLeft:'12px' };

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

export default function OnboardingPage() {
  const { business } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [businessName, setBusinessName] = useState(business?.name || '');
  const [businessType, setBusinessType] = useState(business?.trade || '');
  const [serviceArea, setServiceArea] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(business?.owner_phone || '');
  const [description, setDescription] = useState('');
  const [schedule, setSchedule] = useState(DAYS.map((day,i) => ({ day, enabled: i < 5, start:'8:00 AM', end:'6:00 PM' })));
  const [greeting, setGreeting] = useState('');
  const [faqs, setFaqs] = useState(DEFAULT_FAQS.default);
  const [tone, setTone] = useState('Friendly');

  const hf = e => e.target.style.borderColor='#3b82f6';
  const hb = e => e.target.style.borderColor='#333';
  const getGreeting = () => `Hey, this is ${businessName || '[Business Name]'}! Sorry we missed your call — we're currently on a job. How can we help you?`;

  const canContinue = () => {
    if (step === 1) return !!serviceArea;
    if (step === 2) return schedule.some(s => s.enabled);
    return true;
  };

  async function handleLaunch() {
    if (!business?.id) { window.location.hash = '#/dashboard'; return; }
    setSaving(true);
    try {
      const business_hours = {};
      schedule.forEach((s, i) => {
        business_hours[DAY_KEYS[i]] = s.enabled
          ? { open: timeStringToHHMM(s.start), close: timeStringToHHMM(s.end) }
          : null;
      });
      await api.updateBusiness(business.id, {
        name: businessName || business.name,
        services: description ? [description] : undefined,
        business_hours,
        greeting: greeting || getGreeting(),
      });
    } catch (_) {
      // Non-fatal — dashboard still loads
    } finally {
      setSaving(false);
      window.location.hash = '#/dashboard';
    }
  }

  const handleContinue = () => {
    if (step === 4) { handleLaunch(); return; }
    if (step === 1 && !greeting) {
      setGreeting(getGreeting());
      setFaqs(DEFAULT_FAQS[businessType] || DEFAULT_FAQS.default);
    }
    setStep(step + 1);
  };

  return (
    <div style={{ minHeight:'100vh',backgroundColor:'#0a0a0a',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'40px 20px' }}>
      <div style={{ width:'100%',maxWidth:'560px' }}>
        <div style={{ textAlign:'center',marginBottom:'24px',fontSize:'28px',fontWeight:'700',color:'#fff' }}>ansa<span style={{ color:'#3b82f6' }}>.</span></div>

        <div style={{ marginBottom:'32px' }}>
          <div style={{ display:'flex',justifyContent:'space-between',marginBottom:'8px' }}>
            <span style={{ fontSize:'13px',color:'#999' }}>Step {step} of 4</span>
            <span style={{ fontSize:'13px',color:'#999' }}>{Math.round((step/4)*100)}%</span>
          </div>
          <div style={{ width:'100%',height:'4px',backgroundColor:'#222',borderRadius:'2px',overflow:'hidden' }}>
            <div style={{ width:`${(step/4)*100}%`,height:'100%',backgroundColor:'#3b82f6',borderRadius:'2px',transition:'width 0.3s ease' }} />
          </div>
        </div>

        <div style={{ backgroundColor:'#111111',borderRadius:'16px',border:'1px solid #222',boxShadow:'0 25px 50px rgba(0,0,0,0.5)',padding:'32px',marginBottom:'24px' }}>
          {step === 1 && (
            <div>
              <h2 style={{ fontSize:'22px',fontWeight:'600',color:'#fff',margin:'0 0 8px 0' }}>Almost there!</h2>
              <p style={{ fontSize:'14px',color:'#888',margin:'0 0 24px 0' }}>Just a couple more details to set up your account.</p>
              <div style={{ marginBottom:'16px' }}>
                <label style={{ display:'block',fontSize:'14px',color:'#999',marginBottom:'6px' }}>Service area *</label>
                <CityAutocomplete value={serviceArea} onChange={setServiceArea} />
              </div>
              <div>
                <label style={{ display:'block',fontSize:'14px',color:'#999',marginBottom:'6px' }}>Business description</label>
                <div style={{ position:'relative' }}>
                  <FileText size={18} color="#666" style={{ position:'absolute',left:'12px',top:'14px' }} />
                  <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell us about your services..." rows={3} style={{ ...inp,resize:'vertical' }} onFocus={hf} onBlur={hb} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize:'22px',fontWeight:'600',color:'#fff',margin:'0 0 8px 0' }}>Set your availability</h2>
              <p style={{ fontSize:'14px',color:'#888',margin:'0 0 24px 0' }}>When should Ansa handle your missed calls?</p>
              <div style={{ display:'flex',flexDirection:'column',gap:'10px' }}>
                {schedule.map((s,i) => (
                  <div key={s.day} style={{ backgroundColor:'#111111',borderRadius:'12px',border:'1px solid #222',padding:'14px 16px',display:'flex',alignItems:'center',gap:'12px',opacity:s.enabled?1:0.5 }}>
                    <button onClick={() => setSchedule(prev => prev.map((x,j) => j===i?{...x,enabled:!x.enabled}:x))}
                      style={{ width:'40px',height:'22px',borderRadius:'11px',border:'none',backgroundColor:s.enabled?'#3b82f6':'#333',cursor:'pointer',position:'relative',flexShrink:0 }}>
                      <div style={{ width:'18px',height:'18px',borderRadius:'50%',backgroundColor:'#fff',position:'absolute',top:'2px',left:s.enabled?'20px':'2px',transition:'left 0.2s' }} />
                    </button>
                    <span style={{ fontSize:'14px',color:'#fff',width:'36px',fontWeight:'500' }}>{s.day}</span>
                    {s.enabled && (
                      <div style={{ display:'flex',alignItems:'center',gap:'8px',marginLeft:'auto' }}>
                        <select value={s.start} onChange={e => setSchedule(prev => prev.map((x,j) => j===i?{...x,start:e.target.value}:x))}
                          style={{ padding:'6px 8px',backgroundColor:'#141414',border:'1px solid #333',borderRadius:'6px',color:'#fff',fontSize:'13px',outline:'none' }}>
                          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span style={{ color:'#666',fontSize:'13px' }}>to</span>
                        <select value={s.end} onChange={e => setSchedule(prev => prev.map((x,j) => j===i?{...x,end:e.target.value}:x))}
                          style={{ padding:'6px 8px',backgroundColor:'#141414',border:'1px solid #333',borderRadius:'6px',color:'#fff',fontSize:'13px',outline:'none' }}>
                          {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize:'22px',fontWeight:'600',color:'#fff',margin:'0 0 8px 0' }}>Customize your AI assistant</h2>
              <p style={{ fontSize:'14px',color:'#888',margin:'0 0 24px 0' }}>Configure how Ansa responds to your missed calls</p>
              <div style={{ marginBottom:'24px' }}>
                <label style={{ display:'block',fontSize:'14px',color:'#999',marginBottom:'6px' }}>AI greeting message</label>
                <textarea value={greeting || getGreeting()} onChange={e => setGreeting(e.target.value)} rows={3} style={{ ...inpNP,resize:'vertical' }} onFocus={hf} onBlur={hb} />
              </div>
              <div style={{ marginBottom:'24px' }}>
                <label style={{ display:'block',fontSize:'14px',color:'#999',marginBottom:'10px' }}>AI tone</label>
                <div style={{ display:'flex',gap:'10px' }}>
                  {['Professional','Friendly','Casual'].map(t => (
                    <label key={t} style={{ flex:1,padding:'12px',backgroundColor:tone===t?'rgba(59,130,246,0.15)':'#141414',border:`1px solid ${tone===t?'#3b82f6':'#333'}`,borderRadius:'10px',cursor:'pointer',textAlign:'center' }}>
                      <input type="radio" name="tone" value={t} checked={tone===t} onChange={() => setTone(t)} style={{ display:'none' }} />
                      <span style={{ fontSize:'14px',color:tone===t?'#3b82f6':'#ccc',fontWeight:'500' }}>{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ display:'block',fontSize:'14px',color:'#999',marginBottom:'10px' }}>Frequently Asked Questions</label>
                <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
                  {faqs.map((faq,i) => (
                    <div key={i} style={{ backgroundColor:'#111111',borderRadius:'12px',border:'1px solid #222',padding:'16px',position:'relative' }}>
                      <button onClick={() => setFaqs(faqs.filter((_,j) => j!==i))}
                        style={{ position:'absolute',top:'10px',right:'10px',background:'none',border:'none',cursor:'pointer',padding:'4px' }}>
                        <Trash2 size={15} color="#666" />
                      </button>
                      <input type="text" value={faq.q} onChange={e => setFaqs(faqs.map((f,j) => j===i?{...f,q:e.target.value}:f))} placeholder="Question" style={{ ...inpNP,marginBottom:'8px',fontWeight:'500' }} onFocus={hf} onBlur={hb} />
                      <textarea value={faq.a} onChange={e => setFaqs(faqs.map((f,j) => j===i?{...f,a:e.target.value}:f))} placeholder="Answer" rows={2} style={{ ...inpNP,resize:'vertical' }} onFocus={hf} onBlur={hb} />
                    </div>
                  ))}
                </div>
                <button onClick={() => setFaqs([...faqs,{q:'',a:''}])}
                  style={{ display:'flex',alignItems:'center',gap:'6px',marginTop:'12px',background:'none',border:'1px dashed #333',borderRadius:'10px',padding:'10px 16px',color:'#3b82f6',fontSize:'14px',cursor:'pointer',width:'100%',justifyContent:'center' }}>
                  <Plus size={16} /> Add FAQ
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 style={{ fontSize:'22px',fontWeight:'600',color:'#fff',margin:'0 0 8px 0' }}>Connect your tools</h2>
              <p style={{ fontSize:'14px',color:'#888',margin:'0 0 24px 0' }}>These can all be configured later in Settings</p>
              <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
                {[
                  { Icon:Calendar, title:'Google Calendar', desc:'Sync your availability and let Ansa book appointments', href: business?.id ? `https://ansa-production.up.railway.app/auth/google?businessId=${business.id}` : null },
                  { Icon:PhoneCall, title:'Phone Number', desc: business?.twilio_number ? `Provisioned: ${business.twilio_number}` : 'Auto-provisioned on signup', done: !!business?.twilio_number },
                  { Icon:CreditCard, title:'Billing (Stripe)', desc:'Coming soon — add a payment method for your subscription', href: null },
                ].map(({ Icon, title, desc, href, done }) => (
                  <div key={title} style={{ backgroundColor:'#111111',borderRadius:'12px',border:'1px solid #222',padding:'20px',display:'flex',alignItems:'center',gap:'16px' }}>
                    <div style={{ width:'44px',height:'44px',borderRadius:'10px',backgroundColor: done ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                      {done ? <CheckCircle2 size={22} color="#22c55e" /> : <Icon size={22} color="#3b82f6" />}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'15px',fontWeight:'500',color:'#fff',marginBottom:'2px' }}>{title}</div>
                      <div style={{ fontSize:'13px',color:'#888' }}>{desc}</div>
                    </div>
                    {href && (
                      <a href={href} style={{ padding:'8px 16px',backgroundColor:'#3b82f6',color:'#fff',border:'none',borderRadius:'8px',fontSize:'13px',fontWeight:'500',cursor:'pointer',whiteSpace:'nowrap',textDecoration:'none' }}>
                        Connect
                      </a>
                    )}
                    {done && <CheckCircle2 size={20} color="#22c55e" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display:'flex',justifyContent:'space-between',gap:'12px' }}>
          {step > 1 ? (
            <button onClick={() => setStep(step-1)}
              style={{ padding:'12px 24px',backgroundColor:'transparent',color:'#999',border:'1px solid #333',borderRadius:'10px',fontSize:'14px',fontWeight:'500',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px' }}
              onMouseEnter={e => e.currentTarget.style.borderColor='#555'} onMouseLeave={e => e.currentTarget.style.borderColor='#333'}>
              <ChevronLeft size={16} /> Back
            </button>
          ) : <div />}
          <button onClick={handleContinue} disabled={!canContinue() || saving}
            style={{ padding:step===4?'14px 32px':'12px 24px',backgroundColor:canContinue()?'#3b82f6':'#1e3a5f',color:canContinue()?'#fff':'#666',border:'none',borderRadius:'10px',fontSize:step===4?'16px':'14px',fontWeight:'600',cursor:canContinue()?'pointer':'not-allowed',display:'flex',alignItems:'center',gap:'8px' }}>
            {step === 4 ? (saving ? 'Saving...' : <><Rocket size={18} /> Launch Ansa</>) : <>Continue <ChevronRight size={16} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
