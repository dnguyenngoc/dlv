import { Link } from 'react-router-dom'
import './Header.css'

export function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="header-logo">
          <span className="logo-icon">🔍</span>
          <span className="logo-text">DLV</span>
        </Link>
        <nav className="header-nav">
          <Link to="/" className="nav-link">Lineage</Link>
          <Link to="/search" className="nav-link">Search</Link>
        </nav>
      </div>
    </header>
  )
}

