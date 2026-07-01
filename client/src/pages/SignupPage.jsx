import { useState } from 'react';
import { User, Mail, Lock, Building2, Phone, ChevronDown } from 'lucide-react';

const BUSINESS_TYPES = ['Plumbing','HVAC','Electrical','Roofing','Landscaping','General Contractor','Other'];

const inputStyle = { width: '100%', padding: '12px 12px 12px 40px', backgroundColor: '#141414', border: '1px solid #333', borderRadius: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' };

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleCreate = () => {
    if (!fullName || !email || !password || !businessName || !businessPhone || !businessType) {
      setError('Please fill in all fields.');
      return;
    }
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!emailValid) { setError('Please enter a valid email address.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    const phoneDigits = businessPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10) { setError('Please enter a valid phone number.'); return; }
    if (!agreedToTerms) { setError('Please agree to the terms to continue.'); return; }
    setError('');
    const hashQuery = window.location.hash.split('?')[1] || '';
    const plan = new URLSearchParams(hashQuery).get('plan') || 'monthly';
    localStorage.setItem('ansa_signup', JSON.stringify({ fullName, email: email.trim().toLowerCase(), password, businessName, businessPhone, businessType, plan }));
    window.location.hash = '#/onboarding';
  };

  const hf = e => e.target.style.borderColor = '#3b82f6';
  const hb = e => e.target.style.borderColor = '#333';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#111111', borderRadius: '16px', border: '1px solid #222', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px', fontSize: '32px', fontWeight: '700', color: '#ffffff' }}>ansa<span style={{ color: '#3b82f6' }}>.</span></div>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', textAlign: 'center', margin: '0 0 8px 0' }}>Start your free trial</h1>
        <p style={{ fontSize: '14px', color: '#888', textAlign: 'center', margin: '0 0 28px 0' }}>30-day free trial · Cancel anytime</p>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

        {[
          { label: 'Full name', type: 'text', val: fullName, set: setFullName, ph: 'John Smith', Icon: User },
          { label: 'Email', type: 'email', val: email, set: setEmail, ph: 'you@company.com', Icon: Mail },
          { label: 'Password', type: 'password', val: password, set: setPassword, ph: 'Create a password', Icon: Lock },
          { label: 'Business name', type: 'text', val: businessName, set: setBusinessName, ph: 'Your Business LLC', Icon: Building2 },
          { label: 'Business phone number', type: 'tel', val: businessPhone, set: setBusinessPhone, ph: '+1 (555) 000-0000', Icon: Phone },
        ].map(({ label, type, val, set, ph, Icon }) => (
          <div key={label} style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '14px', color: '#999', marginBottom: '6px' }}>{label}</label>
            <div style={{ position: 'relative' }}>
              <Icon size={18} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inputStyle} onFocus={hf} onBlur={hb} />
            </div>
          </div>
        ))}

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', color: '#999', marginBottom: '6px' }}>Business type</label>
          <div style={{ position: 'relative' }}>
            <Building2 size={18} color="#666" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
            <ChevronDown size={18} color="#666" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <select value={businessType} onChange={e => setBusinessType(e.target.value)} style={{ ...inputStyle, appearance: 'none', paddingRight: '40px', cursor: 'pointer', color: businessType ? '#fff' : '#888' }} onFocus={hf} onBlur={hb}>
              <option value="" disabled>Select your business type</option>
              {BUSINESS_TYPES.map(t => <option key={t} value={t} style={{ backgroundColor: '#141414', color: '#fff' }}>{t}</option>)}
            </select>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: '16px' }}>
          <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ marginTop: 2, accentColor: '#3b82f6', flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: '#888', lineHeight: 1.5 }}>
            I agree to the{' '}
            <a href="/#/terms" style={{ color: '#3b82f6', textDecoration: 'none' }}>Terms of Service</a>
            {' '}and{' '}
            <a href="/#/privacy" style={{ color: '#3b82f6', textDecoration: 'none' }}>Privacy Policy</a>
          </span>
        </label>
        <button onClick={handleCreate} style={{ width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '16px' }}>
          Continue
        </button>
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#999', margin: 0 }}>
          Already have an account?{' '}
          <a href="#/login" onClick={e => { e.preventDefault(); window.location.hash = '#/login'; }} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Log in</a>
        </p>
      </div>
    </div>
  );
}
