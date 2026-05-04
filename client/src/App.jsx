import React, { useState, useEffect } from 'react'
import DashboardLayout from './components/DashboardLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardHome from './pages/DashboardHome'
import MissedCallsPage from './pages/MissedCallsPage'
import ConversationsPage from './pages/ConversationsPage'
import ConversationDetail from './pages/ConversationDetail'
import AppointmentsPage from './pages/AppointmentsPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const [hash, setHash] = useState(window.location.hash || '#/')

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash || '#/')
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (hash === '#/' || hash === '') return <LandingPage />
  if (hash === '#/login') return <LoginPage />
  if (hash === '#/signup') return <SignupPage />
  if (hash === '#/onboarding') return <OnboardingPage />

  const renderDashboardContent = () => {
    if (hash === '#/dashboard') return <DashboardHome />
    if (hash === '#/dashboard/calls') return <MissedCallsPage />
    if (hash === '#/dashboard/conversations') return <ConversationsPage />
    if (hash.startsWith('#/dashboard/conversations/')) return <ConversationDetail />
    if (hash === '#/dashboard/appointments') return <AppointmentsPage />
    if (hash === '#/dashboard/analytics') return <AnalyticsPage />
    if (hash === '#/dashboard/settings') return <SettingsPage />
    return <DashboardHome />
  }

  if (hash.startsWith('#/dashboard')) {
    return (
      <DashboardLayout currentHash={hash}>
        {renderDashboardContent()}
      </DashboardLayout>
    )
  }

  return <LandingPage />
}
