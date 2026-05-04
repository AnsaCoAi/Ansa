import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardHome from './pages/DashboardHome';
import MissedCallsPage from './pages/MissedCallsPage';
import ConversationsPage from './pages/ConversationsPage';
import ConversationDetail from './pages/ConversationDetail';
import AppointmentsPage from './pages/AppointmentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

function Router() {
  const [hash, setHash] = useState(window.location.hash || '#/');
  const { user, loading } = useAuth();

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#888', fontSize: '14px' }}>Loading...</div>
    </div>
  );

  if (hash === '#/' || hash === '') return <LandingPage />;
  if (hash === '#/login') return <LoginPage />;
  if (hash === '#/signup') return <SignupPage />;

  // Protected routes
  if (!user) {
    window.location.hash = '#/login';
    return null;
  }

  if (hash === '#/onboarding') return <OnboardingPage />;

  const renderDashboardContent = () => {
    if (hash === '#/dashboard') return <DashboardHome />;
    if (hash === '#/dashboard/calls') return <MissedCallsPage />;
    if (hash === '#/dashboard/conversations') return <ConversationsPage />;
    if (hash.startsWith('#/dashboard/conversations/')) return <ConversationDetail />;
    if (hash === '#/dashboard/appointments') return <AppointmentsPage />;
    if (hash === '#/dashboard/analytics') return <AnalyticsPage />;
    if (hash === '#/dashboard/settings') return <SettingsPage />;
    return <DashboardHome />;
  };

  if (hash.startsWith('#/dashboard')) {
    return (
      <DashboardLayout currentHash={hash}>
        {renderDashboardContent()}
      </DashboardLayout>
    );
  }

  return <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
}
