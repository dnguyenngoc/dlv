import { PropsWithChildren } from 'react'
import '../../styles/global.css'

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-title">DLV</div>
        <div className="app-subtle">Data Lineage Visualizer</div>
      </header>
      <div className="app-body">
        <aside className="app-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Navigation</div>
            <a className="sidebar-link" href="#">Dashboards</a>
            <a className="sidebar-link" href="#">Nodes</a>
            <a className="sidebar-link" href="#">Lineage</a>
          </div>
        </aside>
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
