import { Link, useNavigate } from 'react-router-dom'
import './Header.css'

export function Header() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')

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
        <div className="header-user">
          <span className="user-name">{user.username}</span>
          <span className="user-role">{user.role}</span>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

