import { PropsWithChildren, useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { clearToken, isAuthenticated } from '../../lib/auth'
import '../../styles/global.css'

const SIDEBAR_HIDDEN_KEY = 'dlv-sidebar-hidden'

export function AppLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate()
  const authed = isAuthenticated()
  const [sidebarHidden, setSidebarHidden] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_HIDDEN_KEY)
    // Default to false (show sidebar) if no saved value
    return saved === 'true'
  })

  useEffect(() => {
    localStorage.setItem(SIDEBAR_HIDDEN_KEY, String(sidebarHidden))
  }, [sidebarHidden])

  function logout() {
    clearToken()
    navigate('/login')
  }

  function toggleSidebar() {
    setSidebarHidden(prev => !prev)
  }
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">⎈</div>
          <div>
            <div className="app-title">DLV</div>
            <div className="app-subtle" style={{ fontSize: 12 }}>Data Lineage Visualizer</div>
          </div>
        </div>
        <div className="spacer" />
        <div className="header-actions">
          <span className="pill">MVP 1.0</span>
          {!authed ? (
            <NavLink className="sidebar-link" to="/login" style={{ padding: '6px 10px' }}>Sign in</NavLink>
          ) : (
            <button className="btn-primary" onClick={logout} style={{ padding: '6px 10px' }}>Logout</button>
          )}
          <div className="avatar" title="User" />
        </div>
      </header>
      <div className="app-body" style={{ gridTemplateColumns: sidebarHidden ? '1fr' : '260px 1fr' }}>
        {!sidebarHidden && (
          <aside className="app-sidebar">
            <div className="sidebar-section">
              <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span>Navigation</span>
                <button
                  onClick={toggleSidebar}
                  className="icon-btn"
                  style={{
                    width: 24,
                    height: 24,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                  title="Hide navigation"
                >
                  ✕
                </button>
              </div>
              <NavLink to="/dashboards" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                <span className="icon">📊</span>
                <span>Dashboards</span>
              </NavLink>
              <NavLink to="/nodes" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
                <span className="icon">🧩</span>
                <span>Nodes</span>
              </NavLink>
            </div>
          </aside>
        )}
        <main className="app-content" style={{ position: 'relative' }}>
          {sidebarHidden && (
            <button
              onClick={toggleSidebar}
              className="icon-btn"
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                zIndex: 11,
                width: 32,
                height: 32,
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-surface)',
                border: '1px solid rgba(255,255,255,.08)',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,.3), 0 2px 4px rgba(0,0,0,.2)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,.4), 0 2px 6px rgba(0,0,0,.3)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.3), 0 2px 4px rgba(0,0,0,.2)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              title="Show navigation"
            >
              ☰
            </button>
          )}
          {children}
        </main>
      </div>
    </div>
  )
}
