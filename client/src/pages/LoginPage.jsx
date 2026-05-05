import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import supabase from '../services/supabase';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setError('');
    setLoading(true);
    const { error: err } = await signIn({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    window.location.hash = '#/dashboard';
  };

  const s = {
    page: { minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
    card: { width: '100%', maxWidth: '420px', backgroundColor: '#111111', borderRadius: '16px', border: '1px solid #222', boxShadow: '0 25px 50px rgba(0,0,0,0.5)', padding: '40px' },
    label: { display: 'block', fontSize: '14px', color: '#999', marginBottom: '6px' },
    wrap: { position: 'relative', marginBottom: '16px' },
    input: { width: '100%', padding: '12px 12px 12px 40px', backgroundColor: '#141414', border: '1px solid #333', borderRadius: '10px', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
    icon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' },
    btn: { width: '100%', padding: '12px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' },
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ textAlign: 'center', marginBottom: '32px', fontSize: '32px', fontWeight: '700', color: '#ffffff' }}>ansa<span style={{ color: '#3b82f6' }}>.</span></div>
        <h1 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', textAlign: 'center', margin: '0 0 32px 0' }}>Welcome back</h1>

        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#ef4444', fontSize: '13px', marginBottom: '16px' }}>{error}</div>}

        <div>
          <label style={s.label}>Email</label>
          <div style={s.wrap}>
            <Mail size={18} color="#666" style={s.icon} />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" style={s.input} onFocus={e => e.target.style.borderColor='#3b82f6'} onBlur={e => e.target.style.borderColor='#333'} onKeyDown={e => e.key === 'Enter' && handleSignIn()} />
          </div>
        </div>
        <div>
          <label style={s.label}>Password</label>
          <div style={{ ...s.wrap, marginBottom: '8px' }}>
            <Lock size={18} color="#666" style={s.icon} />
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" style={{ ...s.input, paddingRight: '40px' }} onFocus={e => e.target.style.borderColor='#3b82f6'} onBlur={e => e.target.style.borderColor='#333'} onKeyDown={e => e.key === 'Enter' && handleSignIn()} />
            <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              {showPassword ? <EyeOff size={18} color="#666" /> : <Eye size={18} color="#666" />}
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right', marginBottom: '24px' }}>
          <a href="#" onClick={async e => {
            e.preventDefault();
            if (!email) { setError('Enter your email above first.'); return; }
            setError('');
            await supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://www.ansaco.ai/#/login' });
            setResetSent(true);
          }} style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none' }}>
            {resetSent ? 'Reset email sent!' : 'Forgot password?'}
          </a>
        </div>
        <button onClick={handleSignIn} disabled={loading} style={{ ...s.btn, backgroundColor: loading ? '#1d4ed8' : '#3b82f6', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '14px', color: '#999', margin: 0 }}>
          Don't have an account?{' '}
          <a href="#/signup" onClick={e => { e.preventDefault(); window.location.hash = '#/signup'; }} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>Sign up</a>
        </p>
      </div>
    </div>
  );
}
