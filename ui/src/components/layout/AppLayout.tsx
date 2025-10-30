import { PropsWithChildren } from 'react'
import { NavLink } from 'react-router-dom'
import '../../styles/global.css'

export function AppLayout({ children }: PropsWithChildren) {
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
          <div className="avatar" title="User" />
        </div>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Navigation</div>
            <NavLink to="/dashboards" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span className="icon">📊</span>
              <span>Dashboards</span>
            </NavLink>
            <NavLink to="/nodes" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span className="icon">🧩</span>
              <span>Nodes</span>
            </NavLink>
            <NavLink to="/lineage" className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
              <span className="icon">🕸️</span>
              <span>Lineage</span>
            </NavLink>
          </div>
        </aside>
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
