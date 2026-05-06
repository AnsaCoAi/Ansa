import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadBusiness(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadBusiness(session.user.id);
      else setBusiness(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadBusiness(userId) {
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_auth_id', userId)
      .single();
    setBusiness(data || null);
  }

  async function signUp({ email, password, fullName, businessName, businessPhone, businessType }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) return { error };

    // Create business via backend (service role bypasses RLS)
    const apiUrl = import.meta.env.VITE_API_URL || 'https://ansa-production.up.railway.app';
    const businessId = crypto.randomUUID();
    const bizRes = await fetch(`${apiUrl}/api/create-business`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: businessId,
        owner_auth_id: data.user.id,
        name: businessName,
        owner_name: fullName,
        owner_phone: businessPhone,
        trade: businessType,
        greeting: `Hi! This is ${businessName}. Sorry we missed your call — how can we help you today?`,
      }),
    });

    const bizData = await bizRes.json();
    if (!bizRes.ok) return { error: { message: bizData.error || 'Failed to create business.' } };

    // Business row now exists — load it into context (onAuthStateChange fired before this)
    await loadBusiness(data.user.id);

    // Auto-provision a Twilio number for this business
    const areaCode = businessPhone.replace(/\D/g, '').slice(0, 3);
    try {
      await fetch(`${apiUrl}/api/provision-number`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: businessId, areaCode }),
      });
    } catch (_) {
      // Non-fatal — business is created, number can be provisioned later
    }

    return { data };
  }

  async function signIn({ email, password }) {
    return supabase.auth.signInWithPassword({ email, password });
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.hash = '#/';
  }

  return (
    <AuthContext.Provider value={{ user, business, signUp, signIn, signOut, loading: user === undefined }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
