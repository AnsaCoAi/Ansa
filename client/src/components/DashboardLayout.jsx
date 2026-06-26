import React, { useState } from 'react'
import {
  LayoutDashboard, PhoneMissed, MessageSquare, CalendarCheck,
  BarChart3, Settings, LogOut, Headphones,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { label: 'Overview',      short: 'Home',     icon: LayoutDashboard, hash: '#/dashboard' },
  { label: 'Missed Calls',  short: 'Calls',    icon: PhoneMissed,     hash: '#/dashboard/calls' },
  { label: 'Conversations', short: 'Messages', icon: MessageSquare,   hash: '#/dashboard/conversations' },
  { label: 'Appointments',  short: 'Jobs',     icon: CalendarCheck,   hash: '#/dashboard/appointments' },
  { label: 'Analytics',     short: 'Analytics',icon: BarChart3,       hash: '#/dashboard/analytics' },
  { label: 'Settings',      short: 'Settings', icon: Settings,        hash: '#/dashboard/settings' },
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
  const showTrialBanner = daysLeft !== null && daysLeft <= 7 && business?.subscription_status !== 'active'

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
      {/* Desktop sidebar */}
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
              <div style={styles.businessPlan}>
                {business?.subscription_status === 'active'
                  ? 'Pro plan'
                  : business?.subscription_status === 'trialing'
                  ? (daysLeft !== null ? `Trial · ${daysLeft}d left` : 'Trial')
                  : 'Inactive'}
              </div>
            </div>
          </div>
          <a href="mailto:hello@ansaco.ai" style={styles.logoutBtn}>
            <Headphones size={16} /><span>Contact support</span>
          </a>
          <button style={styles.logoutBtn} onClick={() => { setSidebarOpen(false); signOut(); }}>
            <LogOut size={16} /><span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div data-ansa-main="" style={styles.main}>
        <header style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <a href="#/dashboard" className="ansa-mobile-logo" style={styles.mobileLogo}>
              ansa<span style={styles.logoDot}>.</span>
            </a>
            <h1 className="ansa-page-title" style={styles.pageTitle}>{getPageTitle(currentHash)}</h1>
          </div>
          <div style={styles.topBarRight}>
            <div style={styles.userAvatar}>{ownerInitials}</div>
          </div>
        </header>
        {showTrialBanner && (
          <div style={{ background: daysLeft === 0 ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.08)', borderBottom: `1px solid ${daysLeft === 0 ? 'rgba(239,68,68,0.3)' : 'rgba(59,130,246,0.2)'}`, padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: daysLeft === 0 ? '#ef4444' : '#93c5fd' }}>
            <span>{daysLeft === 0 ? 'Your free trial has ended.' : `Free trial: ${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining.`}</span>
            <a href="#/dashboard/settings" style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'none' }}>Upgrade to Pro →</a>
          </div>
        )}
        <main style={styles.content}>
          <div className="ansa-page">{children}</div>
        </main>
      </div>

      {/* Mobile bottom navigation bar */}
      <nav data-ansa-bottom-nav="" style={styles.bottomNav}>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.hash)
          return (
            <a key={item.hash} href={item.hash}
              style={{ ...styles.bottomNavItem, ...(active ? styles.bottomNavItemActive : {}) }}>
              <Icon size={22} style={{ color: active ? '#3b82f6' : '#555', marginBottom: 3 }} />
              <span style={{ fontSize: 9.5, fontWeight: active ? 600 : 500, color: active ? '#3b82f6' : '#555', letterSpacing: '0.2px' }}>
                {item.short}
              </span>
            </a>
          )
        })}
      </nav>

      <style>{`
        /* Desktop: show sidebar, hide bottom nav */
        @media (min-width: 769px) {
          [data-ansa-sidebar] { transform: translateX(0) !important; }
          [data-ansa-main] { margin-left: 260px !important; }
          [data-ansa-bottom-nav] { display: none !important; }
          [data-ansa-mobile-logo] { display: none !important; }
        }
        /* Mobile: hide sidebar, show bottom nav, show logo */
        @media (max-width: 768px) {
          [data-ansa-sidebar] { display: none !important; }
          [data-ansa-bottom-nav] { display: flex !important; }
          [data-ansa-main] { margin-left: 0 !important; }
          [data-ansa-main] main { padding-bottom: 72px; }
          .ansa-mobile-logo { display: inline-block !important; }
          .ansa-page-title { display: none !important; }
        }
        .ansa-page { animation: ansa-fade 0.15s ease; }
        @keyframes ansa-fade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        button, a { transition: opacity 0.15s, background 0.15s, color 0.15s, border-color 0.15s !important; }
        button:active, a:active { opacity: 0.7 !important; }
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
  mobileLogo: { fontSize: 22, fontWeight: 800, color: '#ffffff', textDecoration: 'none', letterSpacing: '-0.02em', display: 'none' },
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
  logoutBtn: { display: 'flex', alignItems: 'center', gap: 8, color: '#666', background: 'none', border: 'none', fontSize: 13, padding: '6px 4px', cursor: 'pointer', width: '100%', textDecoration: 'none' },
  main: { flex: 1, marginLeft: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  topBar: { height: 56, borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#0a0a0a', position: 'sticky', top: 0, zIndex: 30 },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  pageTitle: { fontSize: 17, fontWeight: 600, color: '#ffffff', margin: 0 },
  topBarRight: { display: 'flex', alignItems: 'center', gap: 16 },
  userAvatar: { width: 34, height: 34, borderRadius: '50%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#999', border: '2px solid #333' },
  content: { flex: 1, overflowY: 'auto', overflowX: 'hidden' },
  bottomNav: {
    display: 'none',
    position: 'fixed', bottom: 0, left: 0, right: 0,
    height: 60,
    background: '#111111',
    borderTop: '1px solid #1e1e1e',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    zIndex: 50,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  bottomNavItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    flex: 1, textDecoration: 'none', padding: '6px 4px', gap: 0,
  },
  bottomNavItemActive: {},
}
