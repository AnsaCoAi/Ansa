import React, { useState } from 'react'
import {
  LayoutDashboard, PhoneMissed, MessageSquare, CalendarCheck,
  BarChart3, Settings, Bell, LogOut, Menu, X,
} from 'lucide-react'
import { currentBusiness } from '../data/mockData'

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

export default function DashboardLayout({ children, currentHash }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isActive = (hash) => {
    if (hash === '#/dashboard') return currentHash === '#/dashboard'
    if (hash === '#/dashboard/conversations') {
      return currentHash === '#/dashboard/conversations' || currentHash.startsWith('#/dashboard/conversations/')
    }
    return currentHash === hash
  }

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
            <div style={styles.businessAvatar}>{currentBusiness.name.charAt(0)}</div>
            <div style={styles.businessText}>
              <div style={styles.businessName}>{currentBusiness.name}</div>
              <div style={styles.businessPlan}>{currentBusiness.plan} plan</div>
            </div>
          </div>
          <a href="#/login" style={styles.logoutLink} onClick={() => setSidebarOpen(false)}>
            <LogOut size={16} /><span>Log out</span>
          </a>
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
              <Bell size={20} /><span style={styles.bellDot} />
            </button>
            <div style={styles.userAvatar}>MR</div>
          </div>
        </header>
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
  businessPlan: { fontSize: 11, color: '#666', textTransform: 'capitalize' },
  logoutLink: { display: 'flex', alignItems: 'center', gap: 8, color: '#666', textDecoration: 'none', fontSize: 13, padding: '6px 4px' },
  main: { flex: 1, marginLeft: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  topBar: { height: 64, borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#0a0a0a', position: 'sticky', top: 0, zIndex: 30 },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  hamburger: { background: 'none', border: 'none', color: '#e5e5e5', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' },
  pageTitle: { fontSize: 18, fontWeight: 600, color: '#ffffff', margin: 0 },
  topBarRight: { display: 'flex', alignItems: 'center', gap: 16 },
  bellButton: { background: 'none', border: 'none', color: '#888', cursor: 'pointer', position: 'relative', padding: 4, display: 'flex', alignItems: 'center' },
  bellDot: { position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' },
  userAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#999', border: '2px solid #333' },
  content: { flex: 1, padding: 24, overflowY: 'auto' },
}
