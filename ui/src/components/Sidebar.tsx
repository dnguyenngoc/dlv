import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const location = useLocation()

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/lineage', label: 'Lineage View', icon: '🔗' },
    { path: '/search', label: 'Search', icon: '🔍' },
  ]

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <h3>DLV</h3>
        <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '←' : '→'}
        </button>
      </div>
      {isOpen && (
        <div className="sidebar-content">
          <nav className="sidebar-nav">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </aside>
  )
}
