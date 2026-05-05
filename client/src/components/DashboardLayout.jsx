import React, { useState } from 'react'
import {
  LayoutDashboard, PhoneMissed, MessageSquare, CalendarCheck,
  BarChart3, Settings, Bell, LogOut, Menu, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, hash: '#/dashboard' },
  { label: 'Missed Calls', icon: PhoneMissed, hash: '#/dashboard/calls' },
  { label: 'Conversations', icon: MessageSquare, hash: '#/dashboard/conversations' },
  { label: 'Appointments', icon: CalendarCheck, hash: '#/dashboard/appointments' },
  { label: 'Analytics', icon: BarChart3, hash: '#/dashboard/analytics' },
  { label: 'Settings', icon: Settings, hash: '#/dashboard/settings' },
]

function getPageTitle(hash) {
  const item = navItems.find((n) => n.hash === hash)
  if (item) return item.label
  if (hash.startsWith('#/dashboard/conversations/')) return 'Conversation'
  return 'Dashboard'
}

const TRIAL_DAYS = 30

function trialDaysLeft(createdAt) {
  if (!createdAt) return null
  const end = new Date(createdAt).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000
  const left = Math.ceil((end - Date.now()) / (24 * 60 * 60 * 1000))
  return left > 0 ? left : 0
}

export default function DashboardLayout({ children, currentHash }) {
  const { business, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const daysLeft = trialDaysLeft(business?.created_at)
  const showTrialBanner = daysLeft !== null && daysLeft <= TRIAL_DAYS

  const isActive = (hash) => {
    if (hash === '#/dashboard') return currentHash === '#/dashboard'
    if (hash === '#/dashboard/conversations') {
      return currentHash === '#/dashboard/conversations' || currentHash.startsWith('#/dashboard/conversations/')
    }
    return currentHash === hash
  }

  const bizName = business?.name || 'Your Business'
  const bizInitial = bizName.charAt(0).toUpperCase()
  const ownerInitials = (business?.owner_name || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div style={styles.wrapper}>
      {sidebarOpen && <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />}
      <aside data-ansa-sidebar="" style={{ ...styles.sidebar, ...(sidebarOpen ? styles.sidebarOpen : {}) }}>
        <div style={styles.logoContainer}>
          <a href="#/dashboard" style={styles.logo} onClick={() => setSidebarOpen(false)}>
            ansa<span style={styles.logoDot}>.</span>
          </a>
        </div>
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.hash)
            return (
              <a key={item.hash} href={item.hash} onClick={() => setSidebarOpen(false)}
                style={{ ...styles.navItem, ...(active ? styles.navItemActive : {}) }}>
                <Icon size={20} style={{ color: active ? '#3b82f6' : '#888', flexShrink: 0 }} />
                <span>{item.label}</span>
              </a>
            )
          })}
        </nav>
        <div style={styles.sidebarBottom}>
          <div style={styles.businessInfo}>
            <div style={styles.businessAvatar}>{bizInitial}</div>
            <div style={styles.businessText}>
              <div style={styles.businessName}>{bizName}</div>
              <div style={styles.businessPlan}>Pro plan</div>
            </div>
          </div>
          <button style={styles.logoutBtn} onClick={() => { setSidebarOpen(false); signOut(); }}>
            <LogOut size={16} /><span>Log out</span>
          </button>
        </div>
      </aside>
      <div data-ansa-main="" style={styles.main}>
        <header style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <button data-ansa-hamburger="" style={styles.hamburger}
              onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 style={styles.pageTitle}>{getPageTitle(currentHash)}</h1>
          </div>
          <div style={styles.topBarRight}>
            <button style={styles.bellButton} aria-label="Notifications">
              <Bell size={20} />
            </button>
            <div style={styles.userAvatar}>{ownerInitials}</div>
          </div>
        </header>
        {showTrialBanner && (
          <div style={{ background: daysLeft === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.08)', borderBottom: `1px solid ${daysLeft === 0 ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.2)'}`, padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: daysLeft === 0 ? '#ef4444' : '#93c5fd' }}>
            <span>{daysLeft === 0 ? 'Your free trial has ended.' : `Free trial: ${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining.`}</span>
            <a href="#/dashboard/settings" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>Upgrade to Pro →</a>
          </div>
        )}
        <main style={styles.content}>{children}</main>
      </div>
      <style>{`
        @media (min-width: 768px) {
          [data-ansa-sidebar] { transform: translateX(0) !important; }
          [data-ansa-main] { margin-left: 260px !important; }
          [data-ansa-hamburger] { display: none !important; }
        }
      `}</style>
    </div>
  )
}

const styles = {
  wrapper: { display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#e5e5e5', fontFamily: "'Inter', -apple-system, sans-serif" },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 },
  sidebar: { width: 260, background: '#111111', borderRight: '1px solid #1e1e1e', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 50, transition: 'transform 0.2s ease', transform: 'translateX(-100%)' },
  sidebarOpen: { transform: 'translateX(0)' },
  logoContainer: { padding: '24px 20px 16px', borderBottom: '1px solid #1e1e1e' },
  logo: { fontSize: 28, fontWeight: 800, color: '#ffffff', textDecoration: 'none', letterSpacing: '-0.02em' },
  logoDot: { color: '#3b82f6' },
  nav: { flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, color: '#999', textDecoration: 'none', fontSize: 14, fontWeight: 500, transition: 'all 0.15s' },
  navItemActive: { background: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  sidebarBottom: { padding: '16px 14px', borderTop: '1px solid #1e1e1e' },
  businessInfo: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  businessAvatar: { width: 36, height: 36, borderRadius: 8, background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 },
  businessText: { overflow: 'hidden' },
  businessName: { fontSize: 13, fontWeight: 600, color: '#e5e5e5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  businessPlan: { fontSize: 11, color: '#666' },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: 8, color: '#666', background: 'none', border: 'none', fontSize: 13, padding: '6px 4px', cursor: 'pointer', width: '100%' },
  main: { flex: 1, marginLeft: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  topBar: { height: 64, borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#0a0a0a', position: 'sticky', top: 0, zIndex: 30 },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  hamburger: { background: 'none', border: 'none', color: '#e5e5e5', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  pageTitle: { fontSize: 18, fontWeight: 600, color: '#ffffff', margin: 0 },
  topBarRight: { display: 'flex', alignItems: 'center', gap: 16 },
  bellButton: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  userAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#999', border: '2px solid #333' },
  content: { flex: 1, overflowY: 'auto' },
}
