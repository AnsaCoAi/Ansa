import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard } from 'lucide-react';

export default function BillingPage() {
  const { business } = useAuth();
  const [loading, setLoading] = useState(false);

  const openStripe = async () => {
    const params = new URLSearchParams(window.location.search);
    const businessId = business?.id || params.get('b');
    if (!businessId) return;
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'https://ansa-production.up.railway.app';
    const res = await fetch(`${apiUrl}/api/stripe/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '420px', backgroundColor: '#111', borderRadius: '16px', border: '1px solid #222', padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: '700', color: '#fff', marginBottom: '32px' }}>
          ansa<span style={{ color: '#3b82f6' }}>.</span>
        </div>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <CreditCard size={32} color="#3b82f6" />
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#fff', margin: '0 0 12px 0' }}>Complete your setup</h1>
        <p style={{ fontSize: '15px', color: '#888', lineHeight: '1.6', margin: '0 0 32px 0' }}>
          Add a payment method to activate your 30-day free trial. You won't be charged until your trial ends.
        </p>
        <button onClick={openStripe} disabled={loading} style={{ width: '100%', padding: '13px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Loading...' : 'Add payment method'}
        </button>
        <p style={{ fontSize: '13px', color: '#555', marginTop: '16px' }}>No charge for 30 days. Cancel anytime.</p>
      </div>
    </div>
  );
}
